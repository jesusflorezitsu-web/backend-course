// Traceability suites for OPS-703. TODO: you will write these tests while
// building request IDs and structured logging — responses, bodies and log
// lines must share one requestId, and no secret may reach the log.

import { test } from 'node:test';

test('every response carries an X-Request-Id header', { todo: true });
test('an error body carries the same requestId as the header', { todo: true });
test('a well-formed client X-Request-Id is kept', { todo: true });
test('a suspicious client X-Request-Id is replaced, never trusted', { todo: true });
test('the log line of a request carries the same requestId as the response', { todo: true });
test('the Authorization header and the token never reach the log', { todo: true });