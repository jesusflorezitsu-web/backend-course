// ============================================================================
// Use-case rules for the requests module. Every exported operation receives
// the trusted actor first (built by `authenticate`). Server-controlled fields
// are rejected explicitly; authorization runs BEFORE writing, all-or-nothing;
// the class 3-4 state machine keeps answering 409 — for every role.
// ============================================================================

import { withTransaction } from '../../database/transaction.js';
import {
  findAll,
  findById,
  insertRequest,
  updateRequest,
  insertStatusHistory,
  findHistory
} from './requests.store.js';
import { mapRequestRow, mapHistoryRow } from './request.mapper.js';
import { STATUSES, isValidStatus, isTerminal, canTransition } from './request-status.js';
import {
  canListAllRequests,
  canViewRequest,
  canCreateRequest,
  canEditContent,
  canChangePriority,
  canChangeStatus
} from './request.policy.js';
import { AppError } from '../../app-error.js';

const PRIORITIES = ['low', 'medium', 'high'];

// Fields the client may use when creating / patching a request. Anything
// outside these lists is a server-controlled field → 400 SERVER_CONTROLLED_FIELD.
const CREATE_ALLOWED = ['title', 'description', 'priority'];
const PATCH_ALLOWED = ['title', 'description', 'priority', 'status'];

function assertValidPriority(priority) {
  if (!PRIORITIES.includes(priority)) {
    throw new AppError('contract', 'INVALID_PRIORITY',
      `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }
}

function assertNoServerControlledFields(body, allowed) {
  const unexpected = Object.keys(body ?? {}).filter((field) => !allowed.includes(field));
  if (unexpected.length) {
    throw new AppError('contract', 'SERVER_CONTROLLED_FIELD',
      `The field(s) ${unexpected.join(', ')} are controlled by the server.`);
  }
}

export async function listRequests(actor, filters = {}) {
  if (filters.status !== undefined && !isValidStatus(filters.status)) {
    throw new AppError('contract', 'INVALID_FILTER',
      `Unknown status "${filters.status}". Valid values: ${STATUSES.join(', ')}.`);
  }
  if (filters.priority !== undefined && !PRIORITIES.includes(filters.priority)) {
    throw new AppError('contract', 'INVALID_FILTER',
      `Unknown priority "${filters.priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }

  // The ownership scope lives in SQL: agents see everything; requesters are
  // limited to created_by = actor.userId (legacy rows never match).
  const scope = canListAllRequests(actor)
    ? filters
    : { ...filters, createdBy: actor.userId };

  const rows = await findAll(scope);
  return rows.map(mapRequestRow);
}

export async function getRequest(actor, id) {
  const row = await findById(id);
  if (!row || !canViewRequest(actor, row)) {
    // A foreign (or legacy) request answers exactly like a missing one: the
    // response must never reveal that the resource exists.
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }
  return mapRequestRow(row);
}

export async function createRequest(actor, input) {
  // Owner and birth come from the server, never from the body.
  assertNoServerControlledFields(input, CREATE_ALLOWED);
  if (!canCreateRequest(actor)) {
    throw new AppError('forbidden', 'FORBIDDEN', 'Only requesters can create requests.');
  }

  const { title, description, priority } = input ?? {};

  if (typeof title !== 'string' || title.trim() === '') {
    throw new AppError('contract', 'TITLE_REQUIRED', 'A request needs a non-empty title.');
  }
  if (priority !== undefined) assertValidPriority(priority);

  // Creation is a unit of work: the request AND its birth history
  // (NULL -> open, attributed to the creator) happen together or not at all.
  const row = await withTransaction(async (client) => {
    const created = await insertRequest({
      title: title.trim(),
      description: typeof description === 'string' ? description : null,
      priority: priority ?? 'medium',
      createdBy: actor.userId
    }, client);
    await insertStatusHistory(created.id, null, created.status, actor.userId, client);
    return created;
  });

  return mapRequestRow(row);
}

export async function patchRequest(actor, id, body) {
  assertNoServerControlledFields(body, PATCH_ALLOWED);

  const changes = {};
  for (const field of PATCH_ALLOWED) {
    if (body?.[field] !== undefined) changes[field] = body[field];
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError('contract', 'NO_UPDATABLE_FIELDS',
      `The body must include at least one of: ${PATCH_ALLOWED.join(', ')}.`);
  }
  if (changes.title !== undefined && (typeof changes.title !== 'string' || changes.title.trim() === '')) {
    throw new AppError('contract', 'TITLE_REQUIRED', 'The title cannot be empty.');
  }
  if (changes.priority !== undefined) assertValidPriority(changes.priority);
  if (changes.status !== undefined && !isValidStatus(changes.status)) {
    throw new AppError('contract', 'INVALID_STATUS',
      `Unknown status "${changes.status}". Valid values: ${STATUSES.join(', ')}.`);
  }
  if (changes.title !== undefined) changes.title = changes.title.trim();

  // Read, authorize the WHOLE change, validate against the current state,
  // write and record history — all with the same client, one unit of work.
  const row = await withTransaction(async (client) => {
    const current = await findById(id, client);
    if (!current) {
      throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
    }
    // A requester never patches a foreign or legacy request.
    if (!canViewRequest(actor, current)) {
      throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
    }

    // Terminal states stay immutable — for every role, whatever the body says.
    if (isTerminal(current.status)) {
      throw new AppError('domain', 'REQUEST_IN_TERMINAL_STATUS',
        `Request ${id} is ${current.status} and can no longer be modified.`);
    }

    const statusChanges = changes.status !== undefined && changes.status !== current.status;
    if (statusChanges && !canTransition(current.status, changes.status)) {
      throw new AppError('domain', 'INVALID_STATUS_TRANSITION',
        `A request cannot move from ${current.status} to ${changes.status}.`);
    }

    // Authorization is all-or-nothing: if ANY requested field is out of the
    // actor's reach, the whole change is rejected and nothing is written.
    const mayEditContent = canEditContent(actor, current);
    const mayEditPriority = canChangePriority(actor);
    const mayEditStatus = canChangeStatus(actor);
    const denied = PATCH_ALLOWED.some((field) =>
      changes[field] !== undefined &&
      !(field === 'title' || field === 'description'
        ? mayEditContent
        : field === 'priority'
          ? mayEditPriority
          : mayEditStatus));
    if (denied) {
      throw new AppError('forbidden', 'FORBIDDEN',
        'This actor is not allowed to make this change.');
    }

    const updated = await updateRequest(id, changes, client);
    if (statusChanges) {
      await insertStatusHistory(id, current.status, changes.status, actor.userId, client);
    }
    return updated;
  });

  return mapRequestRow(row);
}

export async function getHistory(actor, id) {
  const request = await findById(id);
  if (!request || !canViewRequest(actor, request)) {
    // History is as private as the request itself: same 404 as a missing one.
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }
  const rows = await findHistory(id);
  return rows.map(mapHistoryRow);
}