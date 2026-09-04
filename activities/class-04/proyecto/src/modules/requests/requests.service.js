// Coordination layer. It applies process rules, validates transitions and
// defines units of work. NO SQL and NO HTTP status codes here: it throws
// typed errors and the routes translate them into HTTP responses.
//   category 'contract' -> 400, 'resource' -> 404, 'domain' -> 409.

import { findAll, findById, insertRequest, updateRequest, insertStatusHistory, findHistory } from './requests.store.js';
import { isValidStatus, isTerminal, canTransition, STATUSES } from './request-status.js';
import { mapRequestRow, mapHistoryRow } from './request.mapper.js';
import { withTransaction } from '../../database/transaction.js';

export class AppError extends Error {
  constructor(category, code, message) {
    super(message);
    this.category = category;
    this.code = code;
  }
}

const PRIORITIES = ['low', 'medium', 'high'];
const UPDATABLE_FIELDS = ['title', 'description', 'priority', 'status'];

function assertExistingRequest(row) {
  if (!row) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', 'The request does not exist.');
  }
}

export async function listRequests(filters = {}) {
  const { status, priority } = filters;

  if (status !== undefined && !isValidStatus(status)) {
    throw new AppError('contract', 'INVALID_FILTER', `Unknown status "${status}". Valid values: ${STATUSES.join(', ')}.`);
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    throw new AppError('contract', 'INVALID_FILTER', `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }

  const rows = await findAll({ status, priority });
  return rows.map(mapRequestRow);
}

export async function getRequest(id) {
  const row = await findById(id);
  assertExistingRequest(row);
  return mapRequestRow(row);
}

export async function createRequest({ title, description, priority }) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new AppError('contract', 'TITLE_REQUIRED', 'A request needs a non-empty title.');
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    throw new AppError('contract', 'INVALID_PRIORITY', `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }

  const input = {
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    priority: priority ?? 'medium'
  };

  const created = await withTransaction(async (client) => {
    const row = await insertRequest(input, client);
    await insertStatusHistory(row.id, null, row.status, client);
    return row;
  });

  return mapRequestRow(created);
}

export async function patchRequest(id, body) {
  const changes = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) changes[field] = body[field];
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError('contract', 'NO_UPDATABLE_FIELDS', `The body must include at least one of: ${UPDATABLE_FIELDS.join(', ')}.`);
  }

  if (changes.title !== undefined && (typeof changes.title !== 'string' || changes.title.trim() === '')) {
    throw new AppError('contract', 'TITLE_REQUIRED', 'The title cannot be empty.');
  }

  if (changes.priority !== undefined && !PRIORITIES.includes(changes.priority)) {
    throw new AppError('contract', 'INVALID_PRIORITY', `Unknown priority "${changes.priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }

  if (changes.status !== undefined && !isValidStatus(changes.status)) {
    throw new AppError('contract', 'INVALID_STATUS', `Unknown status "${changes.status}". Valid values: ${STATUSES.join(', ')}.`);
  }

  if (changes.title !== undefined) changes.title = changes.title.trim();

  const updated = await withTransaction(async (client) => {
    const current = await findById(id, client);
    assertExistingRequest(current);

    if (isTerminal(current.status)) {
      throw new AppError('domain', 'REQUEST_IN_TERMINAL_STATUS', `Request ${current.id} is ${current.status} and can no longer be modified.`);
    }

    if (changes.status !== undefined && changes.status !== current.status && !canTransition(current.status, changes.status)) {
      throw new AppError('domain', 'INVALID_STATUS_TRANSITION', `A request cannot move from ${current.status} to ${changes.status}.`);
    }

    const row = await updateRequest(id, changes, client);

    if (changes.status !== undefined && changes.status !== current.status) {
      await insertStatusHistory(id, current.status, changes.status, client);
    }

    return row;
  });

  return mapRequestRow(updated);
}

export async function getHistory(id) {
  const row = await findById(id);
  assertExistingRequest(row);
  const rows = await findHistory(id);
  return rows.map(mapHistoryRow);
}