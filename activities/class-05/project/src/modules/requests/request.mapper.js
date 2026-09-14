// The single bridge between SQL rows (snake_case) and the HTTP representation
// the contract promises (camelCase). A row is not automatically the HTTP
// response. Ownership and history actors are part of the public shape since
// class 5.

export function mapRequestRow(row) {
  return {
    id: Number(row.id),
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapHistoryRow(row) {
  return {
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    changedBy: row.changed_by,
    changedAt: row.changed_at
  };
}