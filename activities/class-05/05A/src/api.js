// ---------------------------------------------------------------------------
// Client HTTP hacia la API real de la clase 05.
// Contrato (ver activities/class-05/auth-contract.md y docs/http-contract.md):
//   `{ error: { code, message } }` con status 400/401/403/404/409/500/503.
// ---------------------------------------------------------------------------
import { esc } from './esc.js';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// DECISIÓN DOCUMENTADA DEL TOKEN.
// El token vive en memoria del módulo: se pierde al recargar la página. Es una
// limitación honesta (la sesión no sobrevive a F5), pero es la opción con menor
// superficie de ataque: ningún script pode leerlo de localStorage/sessionStorage
// después de la sesión, y no queda persistido en disco. Riesgo XSS aceptado:
// mientras el token esté en memoria, un payload XSS en esta SPA mal
// escondido podría exfiltrarlo durante la sesión — por eso TODO contenido
// proveniente de la API se escapa al renderizar (ver esc.js).
let accessToken = null;

// Para evitar descuidos, el cliente exporta setter/getter, no el valor crudo.
export function setToken(token) { accessToken = token; }
export function getToken() { return accessToken; }
export function clearToken() { accessToken = null; }

export function apiHeaders(extra = {}) {
  const headers = { ...extra };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return headers;
}

// Un solo cliente para toda la app: agrega el token y separa "sin backend"
// (status 0) de "la API respondió un error del contrato".
export async function api(method, path, body) {
  const headers = apiHeaders();
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    // Red caída, CORS fallido o servidor apagado: no hay respuesta HTTP.
    return { status: 0, body: null };
  }

  const text = await response.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { /* no-json */ }
  return { status: response.status, body: parsed };
}

const ERROR_TEXT = {
  INVALID_EMAIL: 'El email no tiene un formato válido.',
  INVALID_PASSWORD: 'La password no cumple las reglas (15–128 caracteres).',
  SERVER_CONTROLLED_FIELD: 'Enviaste un campo que controla el servidor (p. ej. role o createdBy). El body solo acepta lo que el contrato permite.',
  ACCOUNT_CANNOT_BE_CREATED: 'No se pudo crear la cuenta con esos datos (posiblemente ese email ya está registrado).',
  INVALID_CREDENTIALS: 'Email o password incorrectos.',
  AUTHENTICATION_REQUIRED: 'Necesitas iniciar sesión: no llegó un token válido.',
  INVALID_TOKEN: 'Tu sesión no es válida o expiró. Vuelve a entrar.',
  FORBIDDEN: 'Tu rol no permite esta operación.',
  REQUEST_NOT_FOUND: 'Esa solicitud no existe (o no es tuya).',
  INVALID_STATUS_TRANSITION: 'Ese cambio de estado no está permitido desde el estado actual.',
  REQUEST_IN_TERMINAL_STATUS: 'La solicitud está cerrada/cancelada y ya no se puede modificar.',
  TITLE_REQUIRED: 'La solicitud necesita un título.' ,
  INVALID_PRIORITY: 'Prioridad inválida (low, medium, high).',
  INVALID_STATUS: 'Estado inválido.',
  INVALID_FILTER: 'Filtro inválido para estado o prioridad.',
  NO_UPDATABLE_FIELDS: 'El body debe incluir al menos un campo actualizable.',
  DATABASE_UNAVAILABLE: 'El servidor no puede alcanzar su base de datos.'
};

// Cada situación de interfaz tiene un mensaje distinto porque es distinta:
// verificacional (400) ≠ credenciales (401) ≠ permiso (403) ≠ ausencia (404)
// ≠ conflicto de estado (409) ≠ interno (500) ≠ infraestructura (503/red).
export function describeError(status, body) {
  const code = body?.error?.code;
  if (status === 0) {
    return 'No se pudo contactar al backend (¿está encendido? ¿CORS permite este origen?).';
  }
  if (status === 401) {
    return code === 'INVALID_CREDENTIALS'
      ? 'Email o password incorrectos. Revisa e intenta de nuevo.'
      : 'Tu sesión no es válida o expiró. Vuelve a entrar.';
  }
  if (code && ERROR_TEXT[code]) return ERROR_TEXT[code];
  if (status === 400) return body?.error?.message ?? 'La petición no cumplió el contrato.';
  if (status === 403) return body?.error?.message ?? 'Tu rol no permite esta operación.';
  if (status === 404) return body?.error?.message ?? 'Esa solicitud no existe (o no es tuya).';
  if (status === 409) return body?.error?.message ?? 'Conflicto con el estado actual.';
  if (status === 503) return body?.error?.message ?? 'El servicio no tiene base de datos disponible (503).';
  if (status >= 500) return 'El servidor tuvo un problema interno (500). Intenta de nuevo.';
  return body?.error?.message ?? 'Respuesta inesperada de la API.';
}

// Reutilizadas por las vistas.
export { esc };
export const PRIORITIES = ['low', 'medium', 'high'];
export const STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];

// Derivadas del policy de la clase 05 (request.policy.js): el client SOLO usa
// esto para decidir qué mostrar; la autorización real vive en el backend.
export const TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved: ['in_progress', 'closed'],
  closed: [],
  cancelled: []
};
export const TERMINAL_STATUSES = ['closed', 'cancelled'];
export const isTerminal = (s) => TERMINAL_STATUSES.includes(s);

export function canEditContentUser(role, request, userId) {
  return role === 'requester' && request?.createdBy === userId && request?.status === 'open';
}

export function isCurrentUserTheOwner(request, userId) {
  return request?.createdBy === userId;
}