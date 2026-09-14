# AI usage — entrega 05A

## Especificación inicial

Convertir el starter (login de ejemplo en memoria) en una app que consume la
API **real** de la clase 05: registro + login + `/me`, vista de requester
(crear, listar solo las suyas, filtrar, detalle, historial, editar solo
propia-abierta) y vista de agent (todas, prioridad, transiciones válidas,
mostrar 409). Todos los estados de interfaz (loading/empty/success/400/401/403/
404/409/500/503/red) visibles y distintos. Sin mocks, sin cambiar el contrato,
sin desactivar auth, sin enviar `createdBy`/`role`.

## Prompts importantes

- «Campos exactos del contrato: errores `{error:{code,message}}`, estados
  `open/in_progress/resolved/closed/cancelled`, prioridades
  `low/medium/high`, PATCH de contenido requester solo `open`, transiciones
  válidas por estado de `request-status.js`.»
- «Cada estado de interfaz debe tener su propio mensaje, no un genérico.»
- «Mantén el starter: vanilla JS, token en memoria, Vite multipágina.»

## Estructura propuesta (y aceptada)

```
05A/
├── index.html          # shell + templates
├── main.js             # controlador (delegación de eventos)
├── styles.css
├── src/api.js          # cliente HTTP, errores→mensajes, política visible
├── src/views.js        # render (todo escapado)
├── src/esc.js          # escape para innerHTML
```

## Contenido aceptado

- Cliente `api()` basado en el esqueleto del starter (status 0 = sin backend).
- Rendering por template + delegación de eventos (sin framework).
- Mapa de códigos→mensajes distintos para cada estado exigido.
- Botón «Nueva solicitud» solo para requester (usabilidad; la seguridad la
  pone el backend con `403`).
- Upgraded a Vite 7 porque `vite@5` arrastra esbuild con vulnerabilidades;
  `npm audit` quedó en 0.

## Contenido rechazado

- Añadir React/Vue «para agilizar» — el starter es vanilla y la madurez pedida
  es funcional, no de framework.
- Guardar el token en `localStorage` «para que persista» — aceptaríamos
  persistencia solo si documentamos el costo XSS; elegimos memoria y lo
  documentamos por escrito.
- Mostrar el listado de prioridades/estados como selects libres: rechazado en
  favor de mostrar únicamente las transiciones válidas del estado actual.
- Fallback a mocks cuando la API daba `404` (un id inexistente): rechazado —
  esos `404` son el contrato, y la UI debe decirlos como tales.

## Errores o simplificaciones detectadas

- En un primer render, el botón de crear no respetaba el rol del agente real:
  se corrigió leyendo `/auth/me` (rol del servidor), no variables locales.
- `textarea` con `value` escapado: el escape de atributo comía los saltos de
  línea; se ajustó renderizando la descripción con `white-space: pre-wrap`.
- Vite 5.4.8 devolvía `2 vulnerabilities` (esbuild <0.25); se subió a Vite 7
  (0 vulnerabilidades) manteniendo el mismo `vite.config.js`.

## Fuentes utilizadas

- Contrato real de la clase 05: `src/modules/*`, `docs/http-contract.md`,
  `request.policy.js`, `request-status.js`, `authentication` del backend.
- Referencia de la entrega: `activity resources/entrega-05a.md` y README del
  starter oficial.

## Verificación

- `npm run build` → `dist/` sin errores.
- Harness smoke contra la API real (34 escenarios del contrato) → 34/34 PASS
  (registro/duplicado/role, login, 401/403/404/409, aislamiento requester,
  transiciones de agent, `changedBy`, CORS con `Origin: 5173`).
- Revisión manual por persona: matrices de estado visibles, edición condicionada
  y mensajes por código.

## Decisiones visuales

- Badges de estado/prioridad con color propio (distinguibles incluso
  dalton-friendly por la forma y el texto sobre el color).
- `.feedback.is-loading` punteado y gris para que «cargando» no parezca error.
- Layout responsive a una columna en pantallas pequeñas.