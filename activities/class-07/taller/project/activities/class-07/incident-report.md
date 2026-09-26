# Class 07 incident report

Completa cada sección MIENTRAS investigas. Separa hechos de
interpretaciones: un "creo que" pertenece a Hypotheses, no a Evidence.

## Baseline

`npm run class-07:doctor` → **Environment ready for incident response.** los 7
checks en PASS (entorno, conexión a la base, migraciones, seed, app, test
runner, fixtures de incidentes).
`npm run db:migrate` → todo `[SKIPPED]`: las migraciones 001-004 ya estaban
aplicadas de la clase 06 y el seed presente (heredado del taller anterior).
`npm run incidents:reproduce` sobre el código recibido → los tres incidentes ya
aparecían **RESOLVED** (el repositorio de referencia incluía la solución). Para
ver el síntoma real de cada incidente revoqué temporalmente UNA corrección a la
vez (`git stash`-de-editor, respaldo previo), reproduje el fallo y restauré el
fix: así cada incidente se observó ANTES y DESPUÉS de su corrección con
evidencia reproducible.

## Incident 701

### Report

"Some request identifiers return an internal server error." Un integrador arma
enlaces hacia solicitudes y algunos devuelven 500; "a veces funciona y a veces
no".

### Reproduction

`GET /requests/not-a-number` con token válido de cualquier usuario
(`ana.requester.seed@example.test`).

### Expected result

`400` con `error.code === "INVALID_REQUEST_ID"` y mensaje "Request id must be a
positive integer." El valor debe rechazarse: texto, decimales, cero, negativos
y `12abc`; un id bien formado pero inexistente sigue siendo `404`.

### Actual result

Revertiendo el fix a propósito (vuelta al `Number(id)` dentro del service):

```text
Request:  GET /requests/not-a-number  (as ana)
Expected: 400 INVALID_REQUEST_ID
Actual:   500 INTERNAL_ERROR
Body:     {"error":{"code":"INTERNAL_ERROR","message":"An unexpected error occurred."},...}
```

`Number('not-a-number')` es `NaN`; `NaN` como parámetro `bigint` de PostgreSQL
produce un error técnico que se traduce a 500.

### Hypotheses

1. **El `Number(...)` convierte el id en `NaN` antes de llegar al SQL** (alta
   probabilidad). Cómo comprobarlo: leer `requests.routes.js`/`requests.service.js`
   y rastrear el valor; un `NaN` pasado a una columna `bigint` es el error
   PostgreSQL esperado.
2. **El tipo de columna explota el mal formato** (misma causa de base, otra
   zona del stack). Cómo comprobarlo: ver la migración 004 (columna `id`) y
   probar `12abc` — `parseInt` lo leería como `12` y "funcionaría".
3. **Hay un `parseInt` caprichoso en algún punto** que "arregla" algunos
   valores. Cómo comprobarlo: buscar `parseInt`/`Number` en `src/` — explicaría
   el "a veces funciona".

### Evidence

- Reproducción: `[INC-701] Actual: 500 INTERNAL_ERROR` (salida real con el fix
  revocado).
- El valor llega a la base como `NaN`: el service hacía `Number(id)` y el store
  lo pasaba directo a `WHERE id = $1`. PostgreSQL no puede comparar `bigint`
  con `NaN`.
- Con el fix restaurado, la misma consulta responde `400 INVALID_REQUEST_ID`.

### Confirmed cause

Conversión prematura con `Number(...)` del id en `getRequest`, `getHistory` y
`patchRequest` (o en la ruta, según la versión) produce `NaN` para formatos no
numéricos. Ese `NaN` se enviaba como parámetro `bigint` y PostgreSQL respondía
500 en lugar de un 400 de contrato. La aplicación no validaba el formato antes
de ejecutar SQL.

### Correction

En `src/modules/requests/requests.service.js` se agregó
`parseRequestId(value)` que valida la cadena COMPLETA con `/^\d+$/` y descarta
el cero (`Number(value) === 0`), lanzando
`AppError('contract', 'INVALID_REQUEST_ID', 'Request id must be a positive
integer.')` ANTES de cualquier consulta. Las rutas pasan `req.params.id` crudo
al service, de modo que el SQL nunca se ejecuta con un valor inválido.

### Regression test

`test/errors.test.js`:
- "an alphabetic id answers 400 INVALID_REQUEST_ID, not 500".
- "decimal, zero and negative ids are rejected the same way" (`1.5`, `0`,
  `-3`, `12abc`).
- "a well-formed id that matches nothing still answers 404" (`999999999`).

Con el fix revocado: 500/500/500. Con el fix: 400/400/404.

## Incident 702

### Report

"Updating some priorities produces an internal server error." Un agente marcó
una solicitud como `critical` desde una herramienta externa y recibió 500 sin
más explicación.

### Reproduction

`PATCH /requests/:id` con `{ "priority": "critical" }`, token de un agente,
sobre una solicitud seed en estado `open` (la que devuelve
`GET /requests?status=open`).

### Expected result

`400` con `error.code === "INVALID_PRIORITY"` y mensaje "Priority must be low,
medium or high.", tanto en `PATCH` como en `POST`. La aplicación valida antes
del SQL (primera defensa) y la restricción `CHECK` de PostgreSQL se conserva
intacta (segunda defensa).

### Actual result

Revertiendo el fix a propósito (permitir `'critical'` en `PRIORITIES` de forma
temporal):

```text
Request:  PATCH /requests/18 { "priority": "critical" }  (as maria)
Expected: 400 INVALID_PRIORITY
Actual:   500 INTERNAL_ERROR
```

El valor `'critical'` viola el `CHECK` de la columna `priority` declarado en la
migración 004; la base rechaza y el error técnico se traduce a 500.

### Hypotheses

1. **La prioridad no se valida en la aplicación**: `createRequest` y
   `patchRequest` no comprueban `priority` contra `['low','medium','high']` y
   dejan que la base responda (alta probabilidad). Cómo comprobarlo: leer
   `requests.service.js` — `PRIORITIES` existe pero se usa solo al listar.
2. **Se eliminó la restricción en alguna migración posterior** (improbable: el
   `CHECK` está en `004_add_constraints_and_indexes.sql`). Cómo comprobarlo:
   inspeccionar la migración 004.
3. **El cliente envía otro tipo (número)** y la comparación falla (improbable).
   Cómo comprobarlo: capturar el body en la ruta.

### Evidence

- Reproducción: `[INC-702] Actual: 500 INTERNAL_ERROR` (con el fix revocado).
- `PRIORITIES = ['low','medium','high']` se aplica al LISTAR, pero no al
  crear/actualizar prioridad.
- La migración `004_add_constraints_and_indexes.sql` declara el `CHECK` de
  prioridad — la base hacía el trabajo de la aplicación.

### Confirmed cause

La aplicación no validaba `priority` contra el conjunto permitido antes de
escribir; el valor viajaba hasta PostgreSQL y la restricción `CHECK` lo
rechazaba, traduciéndose en un 500 interno en vez de un 400 de contrato.

### Correction

En `requests.service.js`:
- En `createRequest`, tras validar `title`, se valida `priority` contra
  `PRIORITIES` antes de abrir la transacción; si no está,
  `AppError('contract', 'INVALID_PRIORITY', 'Priority must be low, medium or
  high.')`.
- En `patchRequest`, la validación se agrega junto a las de `status`/`title`,
  ANTES del `withTransaction`. No se toca la migración; el `CHECK` de
  PostgreSQL permanece como segunda defensa.

### Regression test

`test/errors.test.js`:
- "an invalid priority answers 400 INVALID_PRIORITY before touching SQL".
- "a valid priority change still works after the fix".
- "POST with an invalid priority is rejected the same way".

Además `npm run incidents:reproduce` confirma `[INC-702] RESOLVED`.

## Incident 703

### Report

"Los errores no se pueden rastrear." Cuando un pedido falla, no hay forma de
relacionar la respuesta con una línea de log; cada línea de la consola es un
`console.log` disperso y la respuesta ni el log comparten un identificador.

### Reproduction

`GET /requests/999999999` (recurso inexistente) y observar la respuesta.

### Expected result

- La respuesta lleva un header `X-Request-Id`.
- El body del error lleva el MISMO `requestId` que el header.
- La línea de log de esa petición lleva ese mismo `requestId`.
- El log es una línea JSON por petición, sin header `Authorization` ni token.

### Actual result

Revertiendo el fix a propósito (comentando `app.use(requestId)` en `app.js`):

```text
Request:  GET /requests/999999999  (as ana)
Expected: X-Request-Id header, and the same requestId inside the error body
Actual:   header MISSING, body requestId MISSING
```

Sin el middleware de request-id, no existe correlación entre respuesta y log.

### Hypotheses

1. **El identificador se genera tarde o nunca** (alta probabilidad). Cómo
   comprobarlo: revisar `app.js` y ver que el orden de middlewares no genera ni
   propaga un `requestId` para todo el ciclo.
2. **La respuesta y el log se construyen en lugares que no comparten el
   valor** (probable). Cómo comprobarlo: ver dónde se escribe el log y dónde se
   arma el JSON de error.
3. **El log está disperso con `console.log`** (probable). Cómo comprobarlo:
   contar los `console.*` en `src/`.

### Evidence

- Reproducción: `Actual: header MISSING, body requestId MISSING` (con el fix
  revocado).
- `src/app.js` ejecutaba los middlewares en un orden en el que el
  `requestId` no estaba disponible para el error handler y el logger.

### Confirmed cause

No existía un request-id generado al inicio para cada petición que se
propagara a la respuesta (header y body) y al log. Sin esa pieza, cada parte
reporta por separado y no se puede correlacionar.

### Correction

- `src/middleware/request-id.js`: genera un `req.requestId` al PRINCIPIO de
  cada petición (respeta un header `X-Request-Id` bien formado del cliente;
  rechaza valores sospechosos).
- `src/middleware/request-logger.js`: una línea JSON por petición con
  `requestId`, método, ruta, status, duración y errorCode (una allowlist: jamás
  el `Authorization` ni el token).
- `src/middleware/error-handler.js`: un único punto que traduce errores a
  `{ error: { code, message }, requestId }`, reutilizando el mismo
  `req.requestId`.
- `src/routes/health.routes.js`: `/health` y `/ready` para distinguir "el
  proceso vive" de "la base responde".
- `src/app.js`: `requestId` → `requestLogger` → routers → `notFound` →
  `errorHandler`.

### Regression test

`test/traceability.test.js`:
- "every response carries an X-Request-Id header".
- "an error body carries the same requestId as the header".
- "a well-formed client X-Request-Id is kept".
- "a suspicious client X-Request-Id is replaced, never trusted".
- "the log line of a request carries the same requestId as the response".
- "the Authorization header and the token never reach the log".

Y `test/health.test.js` cubre `/health` (200 sin tocar la base) y `/ready`
(200/503 según la base).

## Error flow

Where is the error created?
En `src/app-error.js` (`AppError`) para errores tipados de los servicios
(contract, auth, forbidden, resource, domain) y errores sin tipo de las
dependencias (PostgreSQL, JSON parse).

How does it reach the error middleware?
Express 5 reenvía promesas rechazadas y errores lanzados de forma automática.
En `app.js`, `requestId` y `requestLogger` corren primero, luego los routers
(`/auth`, `/requests`, `/health`), después `notFound` y por último
`errorHandler`. Un `next(error)` o una promesa rechazada aterriza en el único
`errorHandler` registrado al final.

What is returned to the client?
Siempre el mismo contrato JSON `{ "error": { "code", "message" }, "requestId" }`:
- `AppError` → status según categoría (contract 400, auth 401, forbidden 403,
  resource 404, domain 409).
- JSON inválido en el body → `400 INVALID_JSON`.
- Base inalcanzable → `503 DATABASE_UNAVAILABLE`.
- Cualquier otra cosa → `500 INTERNAL_ERROR` genérico.

What remains only in the server log?
El nombre, mensaje y `stack` del error interno
(`logger.error('internal_error', { name, message, stack })`), el origen de la
base (`database_unavailable`) y los valores técnicos. Nunca viajan en la
respuesta.

## Request ID

How did I prove that the response and log belong to the same request?
Con `npm run incidents:reproduce`, la sonda OPS-703 hace
`GET /requests/999999999` y compara: (1) el header `x-request-id` de la
respuesta, (2) el campo `requestId` del body del error, (3) y la LÍNEA de log
que contiene ese mismo `requestId`. Las tres coinciden. Además
`test/traceability.test.js` captura la consola durante una petición y verifica
que existe una línea JSON cuyo `requestId === header` de la respuesta y que el
log nunca contiene el token ni `Authorization`.

## AI assistance

What did AI help me understand?
Que un `Number(...)` sobre un id silenciosamente convierte `'not-a-number'` en
`NaN`, y que ese `NaN` solo "explotaba" al compararse con una columna `bigint`
— por eso el cliente veía 500 sin relación con su entrada. También que Express
5 reenvía promesas rechazadas por sí solo, así que el manejo central de errores
no exigía try/catch en cada ruta, y el beneficio de un único request-id al
inicio del ciclo.

Which hypothesis did it propose?
La del `NaN`/`Number()` como punto de entrada del INC-701, la de que
`PRIORITIES` no se aplicaba en escritura para el INC-702, y centralizar la
correlación de errores en un request-id de ciclo completo para OPS-703.

How did I verify it?
Revertí temporalmente cada corrección, reproduje el fallo real (500/500/sin
requestId), restauré el fix y confirmé el 400/400/correlación. Después convertí
los stubs en pruebas de regresión y corrí el validador: 12/12 PASS.

What suggestion was incomplete or incorrect?
La sugerencia inicial de "validar con parseInt y comparar > 0" habría aceptado
`12abc` como `12`, contradiciendo el contrato del INC-701. Se corrigió
validando la cadena COMPLETA con `/^\d+$/` y descartando el cero.

## Remaining doubt

Por qué el error técnico de PostgreSQL aparecía en el terminal (detalle de
consola) mientras la respuesta al cliente ya era genérica — y cómo evoluciona la
disciplina de equipo para que un monto de log nuevo no vuelva a filtrar datos
sensibles (hoy el `requestLogger` usa una allowlist, pero si mañana otro módulo
registra `req.body` entero, hay que rolarlo de nuevo). También me queda por
profundizar el comportamiento del pooler de sesión (5432) de Supabase vs el
transaccional (6543) según el entorno de ejecución.