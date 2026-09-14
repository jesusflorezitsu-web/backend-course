# Casos adversariales — Request API v5

Ocho o más ataques que la implementación debe resistir. Formato: qué envía el
atacante → respuesta exacta (código HTTP + `error.code`).

1. Escalada de rol en el registro: envía `{ "email": "...", "password": "...", "role": "agent" }` → **400 SERVER_CONTROLLED_FIELD**. El rol lo decide el servidor y siempre es `requester`.
2. Forjado de `createdBy` al crear: un requester envía `{ "title": "...", "createdBy": "id_de_otro" }` → **400 SERVER_CONTROLLED_FIELD**. El dueño sale del token, no del body.
3. Lectura de ticket ajeno: un requester hace `GET /requests/:id` con el id de otro requester → **404 REQUEST_NOT_FOUND**, idéntico a un id inexistente. Nunca se revela si el recurso existe.
4. Token alterado en el payload: se edita el claim `role` del JWT en Base64 sin refirmar → **401 INVALID_TOKEN**. Decodificar no verifica; la firma manda.
5. PATCH con body mixto: un requester envía `{ "title": "Nuevo", "priority": "high" }` sobre su propia solicitud → **403 FORBIDDEN** y NO se aplica el título (todo-o-nada).
6. Edición de contenido fuera de "abierta": el dueño patchea el título de su solicitud en otro estado → **403 FORBIDDEN** (`canEditContent` exige `open`).
7. Sin credencial o con Bearer vacío: `GET /requests` sin header `Authorization` (o `Bearer ` vacío) → **401 AUTHENTICATION_REQUIRED**. El middleware corta antes de que llegue al router.
8. Inyección de campos de auditoría al editar: `{ "title": "...", "createdAt": "2020-01-01" }` en un PATCH → **400 SERVER_CONTROLLED_FIELD**.
9. Token expirado con firma válida: un JWT vencido firmado con el secreto real → **401 INVALID_TOKEN** (`exp` se hace cumplir en cada verificación).
10. Enumeración por login: probar con email inexistente y comparar con una contraseña incorrecta → ambas **401 INVALID_CREDENTIALS** con respuesta idéntica byte a byte.
11. Registro de un email ya existente → **409 ACCOUNT_CANNOT_BE_CREATED**, sin confirmar que la cuenta existe.
12. Salto de estados: un agent intenta `open → closed` → **409 INVALID_STATUS_TRANSITION**. Los roles nunca se saltan la máquina de estados.
13. Actor forjado en el historial: PATCH con `changedBy` en el body → **400 SERVER_CONTROLLED_FIELD**. El actor del historial sale del token.
14. Mutación sobre solicitud cerrada: cambiar prioridad/estado/contenido en una solicitud terminal (cualquier rol) → **409 REQUEST_IN_TERMINAL_STATUS**. Los estados terminales son inmutables.
15. Cabecera de autorización rara: `Authorization: Basic dXNlcjpwYXNz` → **401 AUTHENTICATION_REQUIRED**. Solo el esquema Bearer acredita identidad aquí.