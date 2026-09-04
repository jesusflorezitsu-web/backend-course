const now = () => new Date().toISOString();

export const requests = [
  {
    id: 1,
    title: 'Projector does not turn on',
    description: 'The projector in room 204 shows no image during class.',
    status: 'open',
    priority: 'high',
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: 2,
    title: 'Broken chair in the lab',
    description: 'One chair in the computer lab has a loose back rest.',
    status: 'in_progress',
    priority: 'medium',
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: 3,
    title: 'Wi-Fi drops in the library',
    description: 'The connection drops every few minutes on the second floor.',
    status: 'open',
    priority: 'low',
    createdAt: now(),
    updatedAt: now()
  }
];

let nextId = 4;

export function generateId() {
  const id = nextId;
  nextId = nextId + 1;
  return id;
}

export function findById(id) {
  return requests.find((item) => item.id === id);
}

export function create({ title, description = '', priority = 'medium' }) {
  const request = {
    id: generateId(),
    title,
    description,
    status: 'open',
    priority,
    createdAt: now(),
    updatedAt: now()
  };

  requests.push(request);
  return request;
}

export function list({ status, priority }) {
  return requests.filter((item) => {
    if (status !== undefined && item.status !== status) return false;
    if (priority !== undefined && item.priority !== priority) return false;
    return true;
  });
}