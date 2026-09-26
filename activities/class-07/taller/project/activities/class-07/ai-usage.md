# AI usage — Class 07

Contenido registrado después de investigar y resolver los tres incidentes
sobre la base real de Supabase (mismo proyecto de la clase 06).

## My approach before AI

Establecí el baseline yo mismo: doctor 7/7, migraciones `[SKIPPED]` (esquema
heredado de la clase 06), seed presente, y `incidents:reproduce` mostró los
tres incidentes ya RESOLVED porque el repositorio de referencia incluye la
solución. Para confirmar la comprensión de cada incidente, revoqué la
corrección una a la vez, reproduje el fallo real y restauré el fix.

## What I asked

Que me explicara por qué `Number('not-a-number')` producía el error técnico de
PostgreSQL y cómo debía validarse un id de la cadena COMPLETA, dónde validar
`priority` antes de la transacción manteniendo el `CHECK` intacto, y cómo
estructurar request-id + logger + error handler para que respuesta y log
compartan identificador sin filtrar el token.

## What the AI proposed

- `parseRequestId` que valida con `/^\d+$/` y descarta el cero, usado ANTES de
  cualquier query.
- Validación de `PRIORITIES` en `createRequest` y `patchRequest` antes del
  `withTransaction`, dejando el `CHECK` como segunda defensa.
- Orden de middlewares en `app.js`: `requestId` → `requestLogger` → routers →
  `notFound` → `errorHandler`.
- `/health` (proceso vivo, sin tocar la base) y `/ready` (disponibilidad).

## What I accepted

Los tres fixes y su orden de aplicación, los helpers `request-id`,
`request-logger` y `error-handler`, y las rutas de salud.

## What I rejected

- "Validar con parseInt y comparar > 0": aceptaría `12abc` como `12`,
  contradiciendo el contrato del INC-701.
- Silenciar el fallo validando en la ruta y dejar que la base responda: la
  validación es responsabilidad del service, antes del SQL.
- Registrar `req.body` entero o el `Authorization`: el logger usa una allowlist
  y jamas el token.

## How I verified

Revertí cada fix y capturé el síntoma real (500/500/header y body sin
requestId), restauré, ejecuté los 38 tests (archivos explícitos) y el
`npm run validate:class-07` → `FINAL RESULT: PASSED`.

## What I still do not understand

La distinción entre el detalle técnico que queda solo en el terminal y la
respuesta controlada al cliente cuando el error se genera fuera de un
`AppError`, y cómo rolarlo en un equipo para que un log nuevo no vuelva a
filtrar datos.