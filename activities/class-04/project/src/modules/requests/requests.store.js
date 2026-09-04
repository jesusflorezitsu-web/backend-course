// Data access layer: the only place that owns SQL. It returns raw rows
// (snake_case); the service maps them to HTTP representations via the mapper.
//
//   findAll(filters, db = pool)                    -> rows[]
//   findById(id, db = pool)                        -> row | null
//   findByIdForUpdate(id, db)                      -> row | null (FOR UPDATE, uso en transaccion)
//   insertRequest({title, description, priority}, db) -> row (INSERT ... RETURNING)
//   updateRequest(id, changes, db)                 -> row | null (UPDATE ... RETURNING)
//   insertStatusHistory(requestId, prev, next, db) -> void
//   findHistory(requestId, db)                     -> rows[]
//
// Rules: parameterized queries only ($1, $2...), explicit columns, and the
// optional `db` parameter so the service can pass a transaction client.

import { pool } from "../../database/pool.js";

const TABLE_COLUMNS = "id, title, description, priority, status, created_at, updated_at";

export async function findAll(filters = {}, db = pool) {
  const { status, priority } = filters;
  const where = [];
  const params = [];

  if (status !== undefined) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (priority !== undefined) {
    params.push(priority);
    where.push(`priority = $${params.length}`);
  }

  const sql = `
    SELECT ${TABLE_COLUMNS}
    FROM requests
    ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY id ASC
  `;

  const result = await db.query(sql, params);
  return result.rows;
}

export async function findById(id, db = pool) {
  const result = await db.query(
    `SELECT ${TABLE_COLUMNS} FROM requests WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

// Locking read for use INSIDE a transaction: it re-reads the current status
// with the transactional client and locks the row so concurrent PATCHes
// cannot create stale transitions (e.g. two clients moving open -> resolved).
export async function findByIdForUpdate(id, db = pool) {
  const result = await db.query(
    `SELECT ${TABLE_COLUMNS} FROM requests WHERE id = $1 FOR UPDATE`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function insertRequest({ title, description, priority }, db = pool) {
  const result = await db.query(
    `INSERT INTO requests (title, description, priority)
     VALUES ($1, $2, $3)
     RETURNING ${TABLE_COLUMNS}`,
    [title, description, priority]
  );
  return result.rows[0];
}

export async function updateRequest(id, changes, db = pool) {
  const sets = [];
  const params = [];

  if ("title" in changes) {
    params.push(changes.title);
    sets.push(`title = $${params.length}`);
  }
  if ("description" in changes) {
    params.push(changes.description);
    sets.push(`description = $${params.length}`);
  }
  if ("priority" in changes) {
    params.push(changes.priority);
    sets.push(`priority = $${params.length}`);
  }
  if ("status" in changes) {
    params.push(changes.status);
    sets.push(`status = $${params.length}`);
  }

  if (sets.length === 0) return null;

  params.push(id);
  const result = await db.query(
    `UPDATE requests
     SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${params.length}
     RETURNING ${TABLE_COLUMNS}`,
    params
  );
  return result.rows[0] ?? null;
}

export async function insertStatusHistory(requestId, previousStatus, newStatus, db = pool) {
  await db.query(
    `INSERT INTO request_status_history (request_id, previous_status, new_status)
     VALUES ($1, $2, $3)`,
    [requestId, previousStatus, newStatus]
  );
}

export async function findHistory(requestId, db = pool) {
  const result = await db.query(
    `SELECT id, request_id, previous_status, new_status, changed_at
     FROM request_status_history
     WHERE request_id = $1
     ORDER BY changed_at ASC, id ASC`,
    [requestId]
  );
  return result.rows;
}