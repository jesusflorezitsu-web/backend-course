// Render helpers. Todo HTML se construye escapando los datos de la API
// (esc()) para que un título/descripción escrito por otro usuario no sea
// interpretado como markup en mi navegador.
import { esc } from './esc.js';
import { TRANSITIONS, TERMINAL_STATUSES } from './api.js';

export function setFeedback(element, text, kind) {
  element.textContent = text;
  element.className = 'feedback' + (kind ? ` is-${kind}` : '');
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

export function statusBadge(status) {
  const terminal = TERMINAL_STATUSES.includes(status) ? ' is-terminal' : '';
  return `<span class="badge badge--${esc(status)}${terminal}">${esc(status)}</span>`;
}

export function priorityBadge(priority) {
  return `<span class="badge badge--${esc(priority)}">${esc(priority)}</span>`;
}

export function authTemplate() {
  const tpl = document.getElementById('tpl-auth');
  return tpl.content.cloneNode(true);
}

export function listItems(requests) {
  return requests.map((r) => `
    <li class="request-item" data-id="${esc(r.id)}">
      <button type="button" class="request-item__open">Ver</button>
      <div class="request-item__body">
        <span class="request-item__title">${esc(r.title)}</span>
        <span class="request-item__meta">
          ${statusBadge(r.status)} ${priorityBadge(r.priority)}
          · ${esc(formatDate(r.createdAt))}
        </span>
      </div>
    </li>`).join('');
}

// Vista por rol del detalle de una solicitud + su historial.
// El frontend decide SOLO qué mostrar; el backend sigue siendo el juez.
export function detailTemplate(request, history, me) {
  const isAgent = me.role === 'agent';
  const canEdit = !isAgent &&
    request.createdBy === me.id &&
    request.status === 'open';
  const owner = isAgent
    ? `Dueño: ${request.createdBy ? esc(request.createdBy) : '<em>sin dueño (heredada)</em>'}`
    : null;

  const historyHtml = history.length
    ? `<ul class="history">${history.map((h) => `
        <li>
          <span>${esc(h.previousStatus ?? '—')} → ${esc(h.newStatus)}</span>
          <small>${esc(formatDate(h.changedAt))} · ${h.changedBy ? esc(h.changedBy.slice(0, 8)) : 'sin actor'}</small>
        </li>`).join('')}</ul>`
    : '<p class="muted">Sin historial.</p>';

  return `
    <header class="detail__header">
      <div>
        <h3>${esc(request.title)}</h3>
        <p class="muted">#${esc(request.id)} ${statusBadge(request.status)} ${priorityBadge(request.priority)}</p>
      </div>
      ${owner ? `<p class="muted detail__owner">${owner}</p>` : ''}
    </header>

    <p class="detail__description">${request.description ? esc(request.description) : '<span class="muted">Sin descripción.</span>'}</p>

    <dl class="detail__meta">
      <div><dt>Creada</dt><dd>${esc(formatDate(request.createdAt))}</dd></div>
      <div><dt>Actualizada</dt><dd>${esc(formatDate(request.updatedAt))}</dd></div>
      ${request.createdBy ? `<div><dt>createdBy</dt><dd class="mono">${esc(request.createdBy.slice(0, 8))}…</dd></div>` : ''}
    </dl>

    <div class="detail__actions">
      ${isAgent ? `
        <details class="action action--priority">
          <summary>Cambiar prioridad (agent)</summary>
          <form data-action="priority" class="row flow">
            <select name="priority">
              <option value="low"${request.priority === 'low' ? ' selected' : ''}>low</option>
              <option value="medium"${request.priority === 'medium' ? ' selected' : ''}>medium</option>
              <option value="high"${request.priority === 'high' ? ' selected' : ''}>high</option>
            </select>
            <button type="submit">Aplicar</button>
          </form>
        </details>
        <details class="action action--status">
          <summary>Cambiar estado (agent)</summary>
          <form data-action="status" class="row flow">
            ${transitionsHtml(request.status)}
          </form>
        </details>
      ` : ''}
      ${canEdit ? `
        <details class="action action--edit" data-editable>
          <summary>Editar título / descripción (propia y abierta)</summary>
          <form data-action="content" class="flow">
            <label>Título <input name="title" value="${esc(request.title)}" required maxlength="120"></label>
            <label>Descripción <textarea name="description" rows="3">${esc(request.description ?? '')}</textarea></label>
            <button type="submit">Guardar</button>
          </form>
        </details>
      ` : ''}
    </div>

    <p id="action-feedback" class="feedback" role="status"></p>

    <h4>Historial</h4>
    ${historyHtml}
  `;
}

function transitionsHtml(status) {
  const allowed = TRANSITIONS[status] ?? [];
  if (!allowed.length) {
    return '<p class="muted">No hay transiciones disponibles desde este estado (estado terminal).</p>';
  }
  return allowed.map((next) => `
    <label class="transition"><input type="radio" name="status" value="${esc(next)}"> ${esc(next)}</label>`).join('')
    + '<button type="submit">Cambiar</button>';
}