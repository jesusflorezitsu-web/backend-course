// Escapa cualquier string antes de inyectarlo en innerHTML. Regla de oro de
// esta app: NADA que venga de la API (títulos, descripciones, emails) se
// inserta sin pasar por aquí. Un usuario malicioso podría escribir HTML.
export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}