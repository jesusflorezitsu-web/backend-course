// Error contract suites for INC-701, INC-702 and the central error
// handler. TODO: you will write these tests as you fix the incidents —
// each one pins the contract the fix must keep.

import { test } from 'node:test';

test('an alphabetic id answers 400 INVALID_REQUEST_ID, not 500', { todo: true });
test('decimal, zero and negative ids are rejected the same way', { todo: true });
test('a well-formed id that matches nothing still answers 404', { todo: true });
test('an invalid priority answers 400 INVALID_PRIORITY before touching SQL', { todo: true });
test('a valid priority change still works after the fix', { todo: true });
test('POST with an invalid priority is rejected the same way', { todo: true });
test('an unexpected error answers a generic 500 without internal details', { todo: true });
test('every error body shares the same shape: error.code, error.message, requestId', { todo: true });