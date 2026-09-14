// ============================================================================
// 05B · «El mundo de la autenticación» — render e interactividad.
// Vanilla JS. Las interacciones (inspector, matriz, quiz, árbol) son
// transformaciones conceptuales, no decoración.
// ============================================================================
import { CONTENTS, INDEX_LABEL } from './src/contents.js';
import { QUIZ, RISKS, FAKE_TOKEN, TREE } from './src/interactions.js';

const esc = (v) => String(v ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function renderIndex() {
  const nav = $('#index');
  nav.innerHTML = CONTENTS.map((c) => `
    <button type="button" class="pill" data-target="${c.id}">
      ${INDEX_LABEL(c.id)} · ${esc(c.title)}
    </button>`).join('');
  nav.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    $$('.pill').forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    document.getElementById(`content-${pill.dataset.target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function sourcesHtml(sources) {
  return `<ul class="sources">${sources.map(([label, url]) => `
    <li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a></li>`).join('')}</ul>`;
}

function tagsHtml(tags) {
  return `<div class="tags">${tags.map(([kind, text]) => `
    <div class="tag tag--${esc(kind.replace(/[^a-z]/gi, ''))}">
      <span class="tag__kind">${esc(kind)}</span>
      <span>${esc(text)}</span>
    </div>`).join('')}</div>`;
}

function bodyHtml(body) {
  return body.map((p) => `<p>${p}</p>`).join('');
}

function renderCards() {
  const main = $('#cards');
  main.innerHTML = CONTENTS.map((c) => `
    <article id="content-${c.id}" class="card">
      <header class="card__head">
        <span class="card__num">${INDEX_LABEL(c.id)}</span>
        <div>
          <p class="card__sub">${esc(c.subtitle)}</p>
          <h2>${esc(c.title)}</h2>
        </div>
      </header>
      <p class="card__tldr">${esc(c.tldr)}</p>
      <div class="card__body">${bodyHtml(c.body)}</div>
      ${c.cls.length ? `<aside class="clarify"><strong>Aclaración:</strong> ${c.cls.join(' · ')}</aside>` : ''}
      ${c.interactive ? `<div class="interactive" data-interactive="${c.interactive}" id="inter-${c.interactive}"></div>` : ''}
      ${tagsHtml(c.tags)}
      <details class="foot"><summary>Fuentes de este tema</summary>${sourcesHtml(c.sources)}</details>
    </article>`).join('');
}

// ---------------------------------------------------------------------------
// Interacción 1 · Inspector JWT ficticio (decode ≠ verify)
// ---------------------------------------------------------------------------

function initInspector() {
  const mount = $('#inter-inspectorJWT');
  const fake = b64url(JSON.stringify(FAKE_TOKEN.header)) + '.' + b64url(JSON.stringify(FAKE_TOKEN.payload)) + '.FIRMA-FALSA';

  mount.innerHTML = `
    <h3>Inspector de JWT (ejemplo 100% ficticio)</h3>
    <p class="muted">Este token no existe en ningún sistema: es un laboratorio.</p>
    <code class="token">${esc(fake)}</code>
    <p class="muted"><strong>Nota:</strong> <code>alg: NONE</code> a propósito — entre los saboteos del validador estaba un token sin firma válida.</p>
    <div class="row">
      <button type="button" data-insp="decode">Decodificar</button>
      <button type="button" data-insp="verify">Verificar (y criticar)</button>
      <button type="button" data-insp="reset">Reiniciar</button>
    </div>
    <div id="insp-out" class="insp-out" aria-live="polite"></div>`;

  const out = $('#insp-out', mount);
  const show = (html, cls) => { out.innerHTML = html; out.className = `insp-out ${cls ?? ''}`; };

  const decodeHtml = `
    <h4>1 · Decodificar</h4>
    <p>El header y el payload son <b>base64url</b>: cualquiera puede leerlos sin clave alguna.</p>
    <pre>HEADER\n${esc(JSON.stringify(FAKE_TOKEN.header, null, 2))}</pre>
    <pre>PAYLOAD (visible en claro)\n${esc(JSON.stringify(FAKE_TOKEN.payload, null, 2))}</pre>
    <p class="warning-box">Decodificar <b>NO verifica nada</b>. Quitas el base64 y lees: nada más.</p>`;

  const verifyHtml = `
    <h4>2 · Verificar (con criterio)</h4>
    <p>Verificar de verdad obliga a comprobar, en orden:</p>
    <ul>
      <li><b>Algoritmo aceptable</b>: aquí <code>alg: NONE</code> — se rechaza de entrada (ningún algoritmo = ninguna firma).</li>
      <li><b>Firma válida</b> con la clave correcta: <code>FIRMA-FALSA</code> no supera nada.</li>
      <li><b><code>exp</code></b>: el token está vencido (<code>${FAKE_TOKEN.payload.exp}</code> ya pasó).</li>
      <li><b><code>iss</code> y <code>aud</code></b>: issuer y audiencia esperados por TU aplicación.</li>
    </ul>
    <div class="verdict verdict--bad">
      Veredicto: <b>NO confiar</b>. Leer el contenido jamás equivale a aceptar la firma.
      Firmado ≠ cifrado: el payload de un JWT HS256 sigue siendo legible por cualquiera.
    </div>
    <p class="muted">Referencia: token.js real de la clase 05 valida firma con <code>jose</code> y claims iss/aud/exp antes de construir <code>req.auth</code>.</p>`;

  mount.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-insp]');
    if (!btn) return;
    if (btn.dataset.insp === 'decode') show(decodeHtml, '');
    if (btn.dataset.insp === 'verify') show(verifyHtml, '');
    if (btn.dataset.insp === 'reset') show('<p class="muted">Pulsa «Decodificar» o «Verificar».</p>', '');
  });
  show('<p class="muted">Pulsa «Decodificar» o «Verificar».</p>', '');
}

const b64url = (json) => btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// ---------------------------------------------------------------------------
// Interacción 2 · Matriz de riesgos (amenaza → mitigación)
// ---------------------------------------------------------------------------

function initRiskMatrix() {
  const mount = $('#inter-riskMatrix');
  mount.innerHTML = `
    <h3>Matriz de riesgos: amenaza → mitigación</h3>
    <p class="muted">Pulsa una tarjeta para ver su mitigación. Cada fila modela una cosa que el validador intentó romper.</p>
    <div class="matrix" id="matrix-grid">
      ${RISKS.map((r, i) => `
        <button type="button" class="matrix-card" data-index="${i}">
          <strong>${esc(r.threat)}</strong>
          <span class="matrix-card__example">${esc(r.example)}</span>
          <span class="matrix-card__mit hidden">→ <em>${esc(r.mitigation)}</em></span>
        </button>`).join('')}
    </div>`;
  $('#matrix-grid', mount).addEventListener('click', (e) => {
    const card = e.target.closest('.matrix-card');
    if (!card) return;
    const mit = $('.matrix-card__mit', card);
    const wasHidden = mit.classList.contains('hidden');
    $$('.matrix-card__mit', mount).forEach((m) => m.classList.add('hidden'));
    if (wasHidden) mit.classList.remove('hidden');
  });
}

// ---------------------------------------------------------------------------
// Interacción 3 · Quiz
// ---------------------------------------------------------------------------

function initQuiz() {
  const mount = $('#inter-quiz');
  mount.innerHTML = `
    <h3>Quiz de lectura</h3>
    <p class="muted">Ocho preguntas sobre lo que acabas de leer. Responder no cuenta como verificación: los detalles vuelven a cada tarjeta.</p>
    <div class="quiz" id="quiz-grid">
      ${QUIZ.map((item, i) => `
        <div class="quiz-item" data-index="${i}">
          <p class="quiz-item__q"><b>${i + 1}.</b> ${esc(item.q)}</p>
          ${item.options.map((opt, j) => `
            <label class="quiz-opt">
              <input type="radio" name="quiz-${i}" value="${j}"> ${esc(opt)}
            </label>`).join('')}
          <button type="button" class="quiz-check" data-index="${i}">Comprobar</button>
          <p class="quiz-item__out" role="status"></p>
        </div>`).join('')}
    </div>`;

  $('#quiz-grid', mount).addEventListener('click', (e) => {
    const btn = e.target.closest('.quiz-check');
    if (!btn) return;
    const item = QUIZ[btn.dataset.index];
    const card = btn.closest('.quiz-item');
    const chosen = card.querySelector('input:checked');
    const out = $('.quiz-item__out', card);
    if (!chosen) { out.textContent = 'Elige una opción primero.'; return; }
    const ok = Number(chosen.value) === item.answer;
    out.className = 'quiz-item__out is-' + (ok ? 'ok' : 'bad');
    out.innerHTML = (ok ? '✔ Correcto. ' : '✘ Revisa la tarjeta. ') + esc(item.why)
      + (ok ? '' : ' → indicador de tarjeta: ' + esc(item.why));
  });
}

// ---------------------------------------------------------------------------
// Interacción 4 · Árbol de decisión
// ---------------------------------------------------------------------------

function initTree() {
  const mount = $('#inter-tree');
  const step = (node, history) => {
    if (node.leaf) {
      mount.innerHTML = `
        <h3>Árbol de decisión — resultado</h3>
        <div class="tree-path">${history.map((h) => `<span>→ ${esc(h)}</span>`).join('')}</div>
        <div class="verdict verdict--${esc((node.kind || 'dato').replace(/[^a-z]/gi, ''))}">
          <b>${esc(node.verdict)}</b>
          <p>${esc(node.text)}</p>
          <p class="muted">Fuente: ${esc(node.ref)}</p>
        </div>
        <button type="button" id="tree-reset">Reiniciar</button>`;
      $('#tree-reset', mount).addEventListener('click', () => step(TREE, []));
      return;
    }
    mount.innerHTML = `
      <h3>Árbol de decisión: ¿construyo o delego la autenticación?</h3>
      ${history.length ? `<div class="tree-path">${history.map((h) => `<span>→ ${esc(h)}</span>`).join('')}</div>` : ''}
      <p class="tree-q">${esc(node.question)}</p>
      <div class="row">
        ${node.options.map((opt, i) => `<button type="button" data-opt="${i}">${esc(opt.label)}</button>`).join('')}
      </div>`;
    $$('button[data-opt]', mount).forEach((b) => {
      b.addEventListener('click', () => {
        const opt = node.options[Number(b.dataset.opt)];
        step(opt.next, [...history, opt.label]);
      });
    });
  };
  step(TREE, []);
}

// ---------------------------------------------------------------------------
// Interacción 5 · Listado agregado de fuentes
// ---------------------------------------------------------------------------

function initSources() {
  const mount = $('#inter-sourcesList');
  const seen = new Set();
  const all = [];
  for (const c of CONTENTS) {
    for (const [label, url] of c.sources) {
      if (seen.has(url)) continue;
      seen.add(url);
      all.push([label, url]);
    }
  }
  mount.innerHTML = `
    <h3>Mapa de fuentes (deduplicado)</h3>
    <ul class="sources sources--all">
      ${all.map(([label, url]) => `<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a></li>`).join('')}
    </ul>`;
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

const INTERACTIVE = {
  inspectorJWT: initInspector,
  riskMatrix: initRiskMatrix,
  quiz: initQuiz,
  tree: initTree,
  sourcesList: initSources
};

renderIndex();
renderCards();
for (const [name, init] of Object.entries(INTERACTIVE)) {
  if ($(`#inter-${name}`)) init();
}

// Contador visible de contenidos.
$('#count').textContent = new Date().getFullYear();