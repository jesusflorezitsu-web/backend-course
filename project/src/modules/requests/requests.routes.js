import express from 'express';
import {
  create,
  findById,
  list
} from './requests.store.js';
import {
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  canTransit,
  isTerminal
} from './request-status.js';

const router = express.Router();

const error = (code, message) => ({ error: { code, message } });

function isValidPriority(value) {
  return REQUEST_PRIORITIES.includes(value);
}

function isValidStatus(value) {
  return REQUEST_STATUSES.includes(value);
}

router.get('/', (req, res) => {
  const { status, priority } = req.query;

  if (status !== undefined && !isValidStatus(status)) {
    return res.status(400).json(error('INVALID_FILTER_VALUE', `Unknown status value '${status}'`));
  }

  if (priority !== undefined && !isValidPriority(priority)) {
    return res.status(400).json(error('INVALID_FILTER_VALUE', `Unknown priority value '${priority}'`));
  }

  const items = list({ status, priority });
  res.status(200).json(items);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = findById(id);

  if (!request) {
    return res.status(404).json(error('NOT_FOUND', 'Request not found'));
  }

  res.status(200).json(request);
});

router.post('/', (req, res) => {
  const { title, description, priority } = req.body ?? {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json(error('VALIDATION_ERROR', 'Title is required'));
  }

  if (priority !== undefined && !isValidPriority(priority)) {
    return res.status(400).json(error('VALIDATION_ERROR', `Unknown priority value '${priority}'`));
  }

  const created = create({
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    priority: priority ?? 'medium'
  });

  res.status(201).json(created);
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = findById(id);

  if (!request) {
    return res.status(404).json(error('NOT_FOUND', 'Request not found'));
  }

  if (isTerminal(request.status)) {
    return res.status(409).json({
      error: {
        code: 'REQUEST_IN_TERMINAL_STATUS',
        message: `Request is in terminal status '${request.status}' and cannot be modified`
      }
    });
  }

  const body = req.body ?? {};
  const provided = {};

  if ('title' in body) provided.title = body.title;
  if ('description' in body) provided.description = body.description;
  if ('priority' in body) provided.priority = body.priority;
  if ('status' in body) provided.status = body.status;

  if (Object.keys(provided).length === 0) {
    return res.status(400).json(error('VALIDATION_ERROR', 'No modifiable fields provided'));
  }

  if ('title' in provided) {
    if (typeof provided.title !== 'string' || provided.title.trim() === '') {
      return res.status(400).json(error('VALIDATION_ERROR', 'Title cannot be empty'));
    }
  }

  if ('priority' in provided && !isValidPriority(provided.priority)) {
    return res.status(400).json(error('VALIDATION_ERROR', `Unknown priority value '${provided.priority}'`));
  }

  if ('status' in provided) {
    if (!isValidStatus(provided.status)) {
      return res.status(400).json(error('VALIDATION_ERROR', `Unknown status value '${provided.status}'`));
    }

    if (!canTransit(request.status, provided.status)) {
      return res.status(409).json({
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `Transition from '${request.status}' to '${provided.status}' is not allowed`
        }
      });
    }
  }

  if ('title' in provided) request.title = provided.title.trim();
  if ('description' in provided) request.description = provided.description;
  if ('priority' in provided) request.priority = provided.priority;
  if ('status' in provided) request.status = provided.status;

  request.updatedAt = new Date().toISOString();

  res.status(200).json(request);
});

export default router;