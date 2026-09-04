// HTTP layer of the requests module: it receives HTTP information, picks the
// operation in the service, and returns HTTP responses. No SQL, no domain
// rules here — everything is translated from the service's typed errors.
//
// Error translation: contract -> 400, resource -> 404, domain -> 409,
// infrastructure (database) -> 503 DATABASE_UNAVAILABLE, unknown -> 500.
// Raw pg errors or secrets are never forwarded to the client.

import express from 'express';
import {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
  getHistory
} from './requests.service.js';
import { AppError } from './requests.service.js';

const router = express.Router();

function errorBody(code, message) {
  return { error: { code, message } };
}

// Try to tell database connectivity failures apart before they become a 500.
function isInfrastructureError(err) {
  const code = err?.code;
  if (typeof code !== 'string') return false;
  if (code.startsWith('08')) return true; // connection_exception family
  if (code.startsWith('57')) return true; // operator_intervention / shutdown
  if (code.startsWith('ECONN') || code.startsWith('ETIMEDOUT') || code.startsWith('ENOTFOUND')) return true;
  return code === 'ECONNREFUSED' || code === '28P01' || code === '53300' || code === '53400';
}

const STATUS_BY_CATEGORY = { contract: 400, resource: 404, domain: 409 };

function respondError(res, err) {
  if (err instanceof AppError) {
    const status = STATUS_BY_CATEGORY[err.category] ?? 500;
    return res.status(status).json(errorBody(err.code, err.message));
  }

  if (isInfrastructureError(err)) {
    console.error('[requests] database error:', err.code ?? err.message);
    return res.status(503).json(errorBody(
      'DATABASE_UNAVAILABLE',
      'The database is temporarily unavailable.'
    ));
  }

  console.error('[requests] unhandled error:', err);
  return res.status(500).json(errorBody('INTERNAL_ERROR', 'Something went wrong.'));
}

const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    respondError(res, err);
  }
};

function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /requests — list the collection, with optional ?status= and ?priority=.
router.get('/', wrap(async (req, res) => {
  const items = await listRequests(req.query);
  res.status(200).json(items);
}));

// GET /requests/:id — a specific resource either exists or is a 404.
router.get('/:id', wrap(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json(errorBody('REQUEST_NOT_FOUND', `Request ${req.params.id} does not exist.`));
  }
  res.status(200).json(await getRequest(id));
}));

// GET /requests/:id/history — the status history of a single request.
router.get('/:id/history', wrap(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json(errorBody('REQUEST_NOT_FOUND', `Request ${req.params.id} does not exist.`));
  }
  res.status(200).json(await getHistory(id));
}));

// POST /requests — the server owns identity, dates, the initial status and
// the default priority. Unknown fields in the body are ignored.
router.post('/', wrap(async (req, res) => {
  const created = await createRequest(req.body ?? {});
  res.status(201).json(created);
}));

// PATCH /requests/:id — partial update of client-editable fields, protected
// by shape validation (400) and by the domain rules (409).
router.patch('/:id', wrap(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json(errorBody('REQUEST_NOT_FOUND', `Request ${req.params.id} does not exist.`));
  }
  res.status(200).json(await patchRequest(id, req.body ?? {}));
}));

export default router;