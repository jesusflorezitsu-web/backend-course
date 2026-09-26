# AI usage — Class 06

Contenido registrado después de ejecutar el taller completo sobre la base
real de Supabase (session pooler, puerto 5432).

## My approach before AI

Configuré el entorno yo mismo (`.env` con `DATABASE_URL` real y `JWT_SECRET`
generado), corrí `class-06:doctor` (primera vez 5/5: faltaban esquema y seed),
aplicé migraciones 001→004 y el seed (2 requesters, 1 agent, 6 solicitudes,
15 eventos). Verifiqué la regresión BUG-106 con el seed antes de proponer nada.

## What I asked

Que me explicara el recorrido de una petición en este backend, la causa del
`404` en `GET /requests?status=closed`, dónde vivía la validación de permisos
(`canViewHistory`) para reutilizarla en el nuevo endpoint de historial, y qué
helper existía para el formato de errores.

## What the AI proposed

- Causal del 404 en `listRequests` (colección filtrada vacía → `throw`).
- Reutilizar `findById`/`findHistory` del store, `canViewHistory` del policy,
  `mapHistoryEventRow` y `notFound()`.
- Ruta `GET /:id/history` declarada ANTES de `GET /:id` (o Express captura
  `history` como `:id`).
- Un test de regresión con usuario de pruebas y token propio.

## What I accepted

El cambio mínimo en `listRequests` (devolver `[]` en vez de lanzar), el
servicio `getRequestHistory`, la ruta y el test de regresión.

## What I rejected

- Volver a escribir la autorización "a mi forma" en vez de reutilizar la
  política existente: habría duplicado reglas y arriesgado el contrato.
- Cambiar el `404` de solicitud ajena a `403`: el contrato existente exige no
  revelar existencia.
- Un `DELETE`/`TRUNCATE` masivo en las pruebas: se usaron datos únicos por
  corrida y limpieza solo de lo creado.

## How I verified

Reproduje el 404 con `ana` y el seed, apliqué el fix y confirmé `200 []`,
validé `401`/`404` adyacentes, corrí los 14 tests (archivos explícitos por el
glob de Windows) y `npm run validate:class-06` → `FINAL RESULT: PASSED`.

## What I still do not understand

El detalle del orden de rutas paramétricas de Express (`/:id` vs `/:id/history`)
y el porqué del glob `'test/*.test.js'` sin expandir en la terminal de Windows
(vs Node que lo expande en otros entornos).