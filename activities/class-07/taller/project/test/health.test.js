// Health and readiness suites. TODO: you will write these tests while
// implementing OPS-703 — health answers without PostgreSQL, readiness
// checks the connection and never reveals connection details.

import { test } from 'node:test';

test('GET /health answers 200 ok without touching PostgreSQL', { todo: true });
test('GET /ready answers 200 when PostgreSQL responds', { todo: true });
test('GET /ready answers 503 when the database check fails', { todo: true });
test('the readiness response never reveals connection details', { todo: true });