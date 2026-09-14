// ============================================================================
// Authorization policy: pure functions over an actor and (when relevant) a
// request row. No SQL, no HTTP. The middleware says WHO; these functions say
// WHAT is allowed; the service keeps the use-case rules.
//
// The workshop access matrix is FIXED:
//   list all requests ......... agent
//   list own requests ......... requester (scoped in SQL, requests.store)
//   view / history ............ agent: any · requester: own only
//   create .................... requester (agents do not create)
//   edit title/description .... requester, own request, while open
//   change priority ........... agent
//   change status ............. agent (the state machine still applies)
//
// Legacy requests (created_by IS NULL) belong to nobody: only agents see
// them. A requester can never match a null owner.
// ============================================================================

function isAgent(actor) {
  return actor?.role === 'agent';
}

export function canListAllRequests(actor) {
  return isAgent(actor);
}

export function canViewRequest(actor, request) {
  if (isAgent(actor)) return true;
  return request?.created_by === actor?.userId;
}

export function canViewHistory(actor, request) {
  return canViewRequest(actor, request);
}

export function canCreateRequest(actor) {
  return actor?.role === 'requester';
}

export function canEditContent(actor, request) {
  return actor?.role === 'requester' &&
    request?.created_by === actor?.userId &&
    request?.status === 'open';
}

export function canChangePriority(actor) {
  return isAgent(actor);
}

export function canChangeStatus(actor) {
  return isAgent(actor);
}