import express from 'express';
import { requests, generateId } from '../data/requests.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json(requests);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const found = requests.find((r) => r.id === id);

  if (!found) {
    return res.status(404).json({ error: 'Request not found' });
  }

  return res.status(200).json(found);
});

router.post('/', (req, res) => {
  const { title, description, priority } = req.body || {};

  if (!title || String(title).trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const created = {
    id: generateId(),
    title: String(title).trim()
  };

  if (description !== undefined) {
    created.description = description;
  }

  if (priority !== undefined) {
    created.priority = priority;
  }

  created.status = 'open';

  requests.push(created);
  return res.status(201).json(created);
});

export default router;
