export const REQUEST_STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];

export const REQUEST_PRIORITIES = ['low', 'medium', 'high'];

export const TERMINAL_STATUSES = ['closed', 'cancelled'];

export const TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved: ['closed', 'in_progress'],
  closed: [],
  cancelled: []
};

export function isTerminal(status) {
  return TERMINAL_STATUSES.includes(status);
}

export function canTransit(from, to) {
  return TRANSITIONS[from]?.includes(to) ?? false;
}