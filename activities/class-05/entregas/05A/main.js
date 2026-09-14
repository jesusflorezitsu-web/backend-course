// ---------------------------------------------------------------------------
// Controller de la app (05A). Sin framework: estado en memoria, render por
// funciones puras y un cliente único hacia la API real de la clase 05.
// ---------------------------------------------------------------------------
import { api, setToken, clearToken, describeError, esc, isTerminal } from './src/api.js';
import { setFeedback, authTemplate, listItems, detailTemplate } from './src/views.js';

const $ = (sel) => document.querySelector(sel);

const app = $('#app');
const authPanel = $('#auth-panel');
const workspace = $('#workspace');
const sessionUser = $('#session-user');
const logoutBtn = $('#logout-btn');
const listEl = $('#request-list');
const listState = $('#list-state');
const detailEl = $('#detail');
const detailTitle = $('#detail-title');
const createDialog = $('#create-dialog');

const state = { me: null, currentId: null, filters: {} };
let createBtnEl = null;

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

function showSession() {
  sessionUser.textContent = state.me ? `${state.me.email} · ${state.me.role}` : 'Sin sesión';
  authPanel.hidden = !!state.me;
  workspace.hidden = !state.me;
  logoutBtn.hidden = !state.me;
  // Usabilidad, no seguridad: el agente no crea solicitudes (el backend
  // igualmente respondería 403), así que no mostramos la acción.
  if (createBtnEl) createBtnEl.hidden = !state.me || state.me.role !== 'requester';
}

async function tryLoginFlow(email, password, feedbackEl) {
  setFeedback(feedbackEl, 'Entrando…', 'loading');
  const login = await api('POST', '/auth/login', { email, password });
  if (login.status !== 200) {
    setFeedback(feedbackEl, describeError(login.status, login.body), 'error');
    return false;
  }
  setToken(login.body.accessToken);

  const me = await api('GET', '/auth/me');
  if (me.status !== 200) {
    setFeedback(feedbackEl, describeError(me.status, me.body), 'error');
    clearToken();
    return false;
  }
  state.me = me.body;
  showSession();
  setFeedback($('#auth-feedback'), '');
  await loadList();
  return true;
}

function logout() {
  // Logout LOCAL y honesto: olvidamos el token aquí, pero el JWT sigue siendo
  // válido hasta su expiración — este backend educativo no tiene revocación.
  clearToken();
  state.me = null;
  state.currentId = null;
  showSession();
  renderAuth();
}

// ---------------------------------------------------------------------------
// Vista de autenticación
// ---------------------------------------------------------------------------

function renderAuth() {
  authPanel.replaceChildren(authTemplate());
  const feedback = $('#auth-feedback');

  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await tryLoginFlow(data.get('email'), data.get('password'), feedback);
  });

  $('#register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    e.currentTarget.querySelectorAll('.validation').forEach((n) => n.remove());
    if (data.get('password') !== data.get('password2')) {
      const err = document.createElement('p');
      err.className = 'feedback is-error validation';
      err.textContent = 'Ambas passwords deben coincidir (esto lo valida el cliente, pero la API vuelve a validar longitud).';
      e.currentTarget.append(err);
      return;
    }
    setFeedback(feedback, 'Creando cuenta…', 'loading');
    const res = await api('POST', '/auth/register', {
      email: data.get('email'),
      password: data.get('password')
    });
    if (res.status !== 201) {
      setFeedback(feedback, describeError(res.status, res.body), 'error');
      return;
    }
    // Registro exitoso → entramos con las mismas credenciales.
    await tryLoginFlow(data.get('email'), data.get('password'), feedback);
  });

  authPanel.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.tab;
      authPanel.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === id)));
      $('#login-form').hidden = id !== 'login';
      $('#register-form').hidden = id !== 'register';
      setFeedback(feedback, '');
    });
  });
}

// ---------------------------------------------------------------------------
// Listado / detalle
// ---------------------------------------------------------------------------

function firstRequestHeading() {
  const h2 = document.querySelector('#workspace .panel h2');
  if (h2) h2.textContent = state.me?.role === 'agent' ? 'Todas las solicitudes' : 'Mis solicitudes';
}

async function loadList() {
  listEl.replaceChildren();
  setFeedback(listState, 'Cargando…', 'loading');

  const params = new URLSearchParams();
  if (state.filters.status) params.set('status', state.filters.status);
  if (state.filters.priority) params.set('priority', state.filters.priority);
  const q = params.toString();

  const result = await api('GET', `/requests${q ? `?${q}` : ''}`);
  if (result.status === 401) {
    setFeedback(listState, describeError(result.status, result.body), 'error');
    logout();
    return;
  }
  if (result.status !== 200) {
    setFeedback(listState, describeError(result.status, result.body), 'error');
    return;
  }
  if (result.body.length === 0) {
    setFeedback(listState, 'No hay solicitudes para mostrar (estado vacío). Crea la primera.', 'ok');
    return;
  }
  setFeedback(listState, `${result.body.length} solicitud(es).`, 'ok');
  listEl.innerHTML = listItems(result.body);
}

async function openDetail(id) {
  state.currentId = id;
  detailTitle.textContent = 'Detalle';
  detailEl.innerHTML = '<p class="feedback is-loading">Cargando detalle…</p>';

  const [request, history] = await Promise.all([
    api('GET', `/requests/${id}`),
    api('GET', `/requests/${id}/history`)
  ]);

  // Un 401 aquí destroza la sesión: volvemos a la pantalla de acceso.
  if (request.status === 401 || history.status === 401) {
    setFeedback(listState, describeError(401, request.body), 'error');
    detailEl.innerHTML = '';
    logout();
    return;
  }
  if (request.status !== 200) {
    detailEl.innerHTML = `<p class="feedback is-error">${esc(describeError(request.status, request.body))}</p>`;
    detailTitle.textContent = `Solicitud #${esc(id)} — ${request.status}`;
    return;
  }
  if (history.status !== 200) {
    detailEl.innerHTML = `<p class="feedback is-error">No se pudo cargar el historial: ${esc(describeError(history.status, history.body))}</p>`;
    return;
  }

  detailTitle.textContent = `Solicitud #${esc(id)}`;
  detailEl.innerHTML = detailTemplate(request.body, history.body, state.me);

  // Acciones de detalle (delegación).
  detailEl.querySelectorAll('form[data-action="content"], form[data-action="priority"], form[data-action="status"]')
    .forEach((form) => form.addEventListener('submit', onDetailAction));
}

async function onDetailAction(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = $('#action-feedback');
  setFeedback(feedback, 'Guardando…', 'loading');

  const data = new FormData(form);
  const body = {};
  if (form.dataset.action === 'content') {
    body.title = data.get('title');
    body.description = data.get('description');
  } else if (form.dataset.action === 'priority') {
    body.priority = data.get('priority');
  } else {
    body.status = data.get('status');
  }

  const result = await api('PATCH', `/requests/${state.currentId}`, body);
  if (result.status !== 200) {
    // 403 (permiso), 409 (transición inválida o terminal), 404 (se borró) y
    // demás aparecen aquí, legibles y específicos.
    setFeedback(feedback, describeError(result.status, result.body), 'error');
    if (result.status === 401) logout();
    return;
  }
  setFeedback(feedback, 'Cambio aplicado.', 'ok');
  await loadList();
  await openDetail(state.currentId);
}

// ---------------------------------------------------------------------------
// Crear solicitud (solo requester — el backend también lo exige)
// ---------------------------------------------------------------------------

function wireCreate() {
  $('#create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fb = $('#create-feedback');
    const data = new FormData(e.currentTarget);
    setFeedback(fb, 'Creando…', 'loading');
    const result = await api('POST', '/requests', {
      title: data.get('title'),
      description: data.get('description'),
      priority: data.get('priority')
    });
    if (result.status !== 201) {
      setFeedback(fb, describeError(result.status, result.body), 'error');
      return;
    }
    createDialog.close();
    await loadList();
    await openDetail(result.body.id);
  });
  $('#create-cancel').addEventListener('click', () => {
    createDialog.close();
    $('#create-feedback').textContent = '';
    $('#create-form').reset();
  });
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function wireGlobal() {
  logoutBtn.addEventListener('click', logout);

  $('#filters').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.filters.status = data.get('status');
    state.filters.priority = data.get('priority');
    loadList();
  });

  listEl.addEventListener('click', (e) => {
    const item = e.target.closest('.request-item');
    if (item) openDetail(item.dataset.id);
  });

  // Botón de "nueva solicitud" solo para requester (visibilidad gestionada en
  // showSession). Ocultarlo es comodidad; la autorización la pone el backend.
  const createBtn = document.createElement('button');
  createBtn.type = 'button';
  createBtn.id = 'open-create';
  createBtn.textContent = 'Nueva solicitud';
  document.querySelector('#workspace .panel h2').after(createBtn);
  createBtn.addEventListener('click', () => {
    if (!state.me) return;
    if (state.me.role !== 'requester') {
      listState.textContent = 'Solo los requesters pueden crear solicitudes.';
      listState.className = 'feedback is-error';
      return;
    }
    createDialog.showModal();
    $('#create-feedback').textContent = '';
    $('#create-form').reset();
  });
  createBtnEl = createBtn;
}

function boot() {
  firstRequestHeading();
  wireCreate();
  wireGlobal();
  renderAuth();
  showSession();
}

boot();