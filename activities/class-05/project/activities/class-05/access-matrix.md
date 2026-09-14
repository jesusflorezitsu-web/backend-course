# Matriz de acceso — Request API v5

Dos roles exactos: `requester` y `agent`. Sin `admin`.

Los valores de la matriz se limitan a: `Sí` · `No` · `Propias` · `Propia` ·
`Propia y abierta`. En la columna Agent, "Todas" significa acceso sobre la
colección completa (incluidas las solicitudes heredadas). La implementación
converge en la baseline del taller.

| Operación | Anónimo | Requester | Agent |
| --------- | ------- | --------- | ----- |
| `POST /auth/register` | Sí | No | No |
| `POST /auth/login` | Sí | No | No |
| `GET /auth/me` | No | Sí | Todas |
| `GET /requests` | No | Propias | Todas |
| `GET /requests/:id` | No | Propia | Todas |
| `GET /requests/:id/history` | No | Propia | Todas |
| `POST /requests` | No | Sí | No |
| Editar título/descripción | No | Propia y abierta | No |
| Cambiar prioridad | No | No | Todas |
| Cambiar estado | No | No | Todas |

Notas de la matriz:

- `GET /auth/me` siempre responde la identidad de quien llama (cada rol accede a
  su propia cuenta; "Todas" en Agent no implica devolver cuentas ajenas).
- Un requester solo ve/se edita sus propias solicitudes mientras estén `open`;
  las ajenas o sin dueño no existen para él.
- Cambiar prioridad y cambiar estado son operaciones de workflow exclusivas del
  agent, y siguen la máquina de estados (clase 03): validan transiciones, nunca
  se saltan el modelo.

## Campos controlados por el servidor

Campos que el cliente JAMÁS puede enviar, ni siquiera mezclados con los
permitidos. Intentarlo produce **`400 SERVER_CONTROLLED_FIELD`**:

- En `POST /auth/register`: `role`, `isAdmin`, `isAgent`, `id`, `passwordHash`,
  `createdAt`, `updatedAt`, `status`, `verified`, `createdBy`, y cualquier otro
  que no sea `email` o `password`.
- En `POST /requests`: `createdBy`, `status`, `id`, `createdAt`, `updatedAt`.
  La solicitud nace en `open` y su propietario sale del token, no del body.
- En `PATCH /requests/:id`: `changedBy`, `createdBy`, `id`, `createdAt`,
  `updatedAt`. `status` sí es un campo legítimo de edición, pero solo lo emite
  un agent y debe ser una transición válida de la máquina de estados.

## Solicitudes heredadas

Las solicitues sin propietario (`created_by IS NULL`, creadas antes de la
clase 05) las ve **únicamente el agent** (en el listado y por id).

Un requester nunca las ve: no aparecen en su `GET /requests` y un
`GET /requests/:id` sobre una responde **`404 REQUEST_NOT_FOUND`**, idéntica a
un id inexistente. Razón: el alcance del requester es `created_by = usuario`;
una fila sin dueño no le pertenece a nadie y no debe revelarse (privacidad y
aislamiento de datos).