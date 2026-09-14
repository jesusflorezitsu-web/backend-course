# Entrega 05A — Interfaz gráfica para la API de solicitudes

Aplicación vanilla (sin framework) sobre Vite que consume la **API real de la
clase 05**: registro, login JWT, propiedad por usuario y permisos por rol. No
hay mocks: cada pantalla habla con `POST/GET/PATCH /auth/*` y `/requests/*`.

## Cómo probarla

El backend de la clase 05 debe estar corriendo (puerto 3000 de serie):

```bash
# backend (activities/class-05/project)
npm run db:check   # conectividad con la base
npm start          # http://localhost:3000
```

Frontend:

```bash
cd activities/class-05/entregas/05A
cp .env.example .env    # VITE_API_URL=http://localhost:3000
npm install
npm run dev             # http://localhost:5173
npm run build           # build de producción (verificado)
```

CORS: el backend solo responde al origen exacto de su `FRONTEND_ORIGIN`
(`http://localhost:5173` por defecto). Si cambias el puerto de Vite, cambia
también `FRONTEND_ORIGIN` en el `.env` del backend y reinícialo.

## Cuentas de prueba (ficticias, sin datos sensibles)

| Rol       | Email                    | Password              |
| --------- | ------------------------ | --------------------- |
| requester | smoke.aa@example.test    | SmokePassword-270906  |
| requester | smoke.bb@example.test    | SmokePassword-270906  |
| agent     | smoke.agent@example.test | SmokePassword-270906  |

La API no permite registrarse como `agent` (el rol lo pone el servidor). La
cuenta de agent se crea **por provisión directa en la base**, igual que haría
un administrador — es un buen ejemplo de «identidad gestionada» frente a
«autoregistro».

## Decisión del token (documentada)

El token vive **en memoria** (variable del módulo `src/api.js`): se pierde al
recargar la página. Es la opción con menor superficie de ataque:

- no queda persistido en disco (`localStorage`/`sessionStorage`);
- un XSS no puede «robar» un token que ya no existe después de la sesión;
- la contrapartida es nula persistencia de sesión entre recargas — una
  limitación honesta, no un bug.

Riesgo XSS aceptado por escrito: mientras la sesión está viva, un payload XSS
en la página podría leer el token de memoria y exfiltarlo. Por eso todo
contenido proveniente de la API se escapa al renderizar (`src/esc.js`), y el
token nunca aparece en el DOM. El JWT sigue siendo válido hasta su expiración:
este backend educativo no tiene revocación (el logout aquí es local).

## Página

- **Registro / login**: pestañas con errores visibles por código
  (`INVALID_EMAIL`, `INVALID_PASSWORD`, `ACCOUNT_CANNOT_BE_CREATED`,
  `INVALID_CREDENTIALS`, `SERVER_CONTROLLED_FIELD`).
- **Requester**: crea solicitudes (prioridad opcional), ve solo las suyas,
  filtra por estado/prioridad, detalle + historial, y edita título/descripción
  **solo** si la solicitud es suya y está `open`. No ve botones de agent.
- **Agent**: lista las de todos (incluidas las heredadas `created_by IS
  NULL`), cambia prioridad, cambia estado mostrando **únicamente las
  transiciones válidas** desde el estado actual (no puede saltar etapas) y
  ve los `409` de transición inválida / estado terminal.
- Los botones que se ocultan según el rol son **comodidad**, no seguridad: la
  autorización real la decide el backend en cada `PATCH`.

## Estados de interfaz (todos distinguibles)

| Estímulo | Respuesta visible |
| -------- | ----------------- |
| `loading` | mensaje «Cargando…» con estilo propio |
| `empty` | «No hay solicitudes para mostrar…» |
| `success` | listado con contador y badge de estado |
| `400` | mensaje específico del código (`TITLE_REQUIRED`, `INVALID_FILTER`,…) |
| `401` | «tu sesión no es válida» / «email o password incorrectos» (login) |
| `403` | «tu rol no permite esta operación» |
| `404` | «esa solicitud no existe (o no es tuya)» |
| `409` | «transición no permitida» / «estado terminal» |
| `500` | «problema interno del servidor» |
| `503` / red | «no se pudo contactar al backend + ¿CORS?» |

## Matriz de escenarios verificada (harness contra la API real: 34/34)

| Rol | Acción | Respuesta esperada | Resultado |
| --- | ------ | ------------------ | --------- |
| cualquiera | registrar cuenta nueva | `201` rol `requester` | PASS |
| cualquiera | registrar email ya existente | `409 ACCOUNT_CANNOT_BE_CREATED` | PASS |
| cualquiera | registrar enviando `role` | `400 SERVER_CONTROLLED_FIELD` | PASS |
| cualquiera | registrar password corta | `400 INVALID_PASSWORD` | PASS |
| cualquiera | login ok | `200 {accessToken, tokenType:'Bearer', expiresIn:3600}` | PASS |
| cualquiera | login con password mal | `401 INVALID_CREDENTIALS` | PASS |
| anónimo | `GET /requests` sin token | `401 AUTHENTICATION_REQUIRED` | PASS |
| requester | `GET /auth/me` | `200 {id, email, role}` | PASS |
| requester | crear solicitud | `201` estado `open` | PASS |
| requester | listar | solo las suyas | PASS |
| requester | ver propio ticket + historial de nacimiento | `200` | PASS |
| requester | editar propio-abierto | `200` | PASS |
| requester | cambiar prioridad | `403 FORBIDDEN` | PASS |
| requester | PATCH mixto título+prioridad | `403` y **no** aplica nada | PASS |
| requester | cambiar estado | `403 FORBIDDEN` | PASS |
| requester B | ver ticket de A | `404 REQUEST_NOT_FOUND` (idéntico a inexistente) | PASS |
| requester B | ver historial de A | `404` | PASS |
| agent | login y `/me` rol agent | `200` | PASS |
| agent | listar | todas (incluye la de A) | PASS |
| agent | editar contenido | `403 FORBIDDEN` | PASS |
| agent | cambiar prioridad | `200` | PASS |
| agent | `open → in_progress` | `200` | PASS |
| agent | `in_progress → closed` (saltado) | `409 INVALID_STATUS_TRANSITION` | PASS |
| agent | `in_progress → resolved` y `resolved → closed` | `200` | PASS |
| cualquiera | mutar una cerrada | `409 REQUEST_IN_TERMINAL_STATUS` | PASS |
| agent | filtrar `?status=open` | excluye la cerrada | PASS |
| cualquiera | filtro inválido | `400 INVALID_FILTER` | PASS |
| agent | `changedBy` presente en el historial | `200` | PASS |
| navegador | petición con `Origin: 5173` | `Access-Control-Allow-Origin` correcto | PASS |
| navegador | preflight `OPTIONS` | `204` + header CORS | PASS |

## Reflexión corta sobre la integración

Lo más valioso fue darse cuenta de dónde termina el frontend y dónde empieza el
backend: la UI solo decide *qué mostrar* (según rol y estado), pero **toda** la
autorización se re-valida en cada petición; si el frontend fuera manipulado
(quitar el `disabled`, editar el HTML), el backend responde `403/409` igual.
Los estados de error del contrato no son «rutas raras»: son la forma en que la
API le habla a la interfaz, y mostrar cada uno con su mensaje hace el sistema
operable. También quedó claro que ocultar acciones no es seguridad — es UX.

## Evidencia

- Build de producción: `npm run build` → `dist/` OK (Vite 7, 0 vulnerabilidades
  reportadas por `npm audit`).
- Matriz de escenarios: 34/34 PASS contra la API real (harness efímero del
  verificación, eliminado después).
- `ai-usage.md`: uso de IA en esta entrega.