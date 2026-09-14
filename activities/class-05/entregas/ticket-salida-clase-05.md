# Ticket de salida — Clase 05 (respuestas)

> Respondidas sobre nuestra implementación real (boss battle 12/12).

1. **Clasifica cada una: (a) la fila en `users` · (b) verificar la firma del
   token · (c) `canChangePriority` devuelve false · (d) `changed_by` en el
   historial.**
   (a) **Identidad**: la fila describe al actor.
   (b) **Autenticación**: probar la identidad verificando la firma.
   (c) **Autorización**: decidir si el actor puede cambiar prioridad.
   (d) **Auditoría**: registrar quién produjo la transición.

2. **¿Qué contiene exactamente `request.auth` y de dónde sale cada dato?**
   `req.auth = { userId, role }`. Sale del **token verificado** por
   `middleware/authenticate.js`: `userId = payload.sub` y `role = payload.role`.
   Nada viene del body ni del frontend — el middleware lo construye antes del
   router y responde `401` si no hay `Authorization: Bearer` válido.

3. **¿Qué información NO debe contener un JWT y por qué?**
   Datos sensibles: passwords, datos personales, secretos. Porque un JWT
   **firmado no está cifrado**: cualquiera puede decodificar el payload en
   claro. Además las claims grandes inflan el token y su robo filtra más.

4. **¿Qué diferencia hay entre decodificar y verificar un token?**
   Decodificar es solo quitar el base64url y leer. Verificar es comprobar la
   firma con la clave correcta y los claims (`exp`, `iss`, `aud`). La confianza
   sale de verificar, nunca de leer.

5. **¿Por qué el registro no acepta el campo `role`?**
   El rol es una **decisión de servidor** (campo controlado). Si el cliente lo
   enviara, cualquiera podría registrarse como `agent` (escalada de privilegios
   por auto-atribución) — por eso responde `400 SERVER_CONTROLLED_FIELD` y el
   registro siempre crea `requester`.

6. **¿Quién establece `createdBy` y en qué momento?**
   `requests.service.createRequest` lo establece desde `actor.userId` (el actor
   verificado), en el momento del `insertRequest`, dentro de la misma
   transacción que registra el historial de nacimiento. Nunca llega del body.

7. **¿Cuándo responde tu API `401`?**
   - Sin `Authorization` o sin esquema `Bearer` → `AUTHENTICATION_REQUIRED`.
   - Token inválido/alterado/vencido → `INVALID_TOKEN`.
   - Login con credenciales malas → `INVALID_CREDENTIALS`.
   En todos los casos es «no sé quién eres».

8. **¿Cuándo responde tu API `403`?**
   Con identidad probada pero sin permiso (`FORBIDDEN`): el requester cambia
   prioridad o estado, el agent edita contenido, el agent crea solicitudes, o
   un PATCH mixto incluye un campo fuera de su alcance (todo-o-nada).

9. **¿Por qué un recurso ajeno puede devolver `404`?**
   Para no revelar que el recurso existe. Un requester que consulta la
   solicitud de otro recibe un `404 REQUEST_NOT_FOUND` idéntico al de un id
   inexistente (y también al de las heredadas sin dueño).

10. **¿Por qué el agent no puede saltar de `open` a `closed`?**
    La máquina de estados (clases 3-4) exige `open → in_progress → resolved →
    closed` (o `open/in_progress → cancelled`). `canTransition` responde falso y
    la API devuelve `409 INVALID_STATUS_TRANSITION` para cualquier rol.

11. **¿Qué comprueba el boss battle (nombra al menos cinco de las doce)?**
    Migraciones y esquema, registro público, protección contra escalada de rol,
    almacenamiento de passwords, contrato de login, verificación de JWT,
    endpoints protegidos, propiedad de `createdBy`, aislamiento del requester,
    permisos del agent, reglas de estado y protección de datos sensibles.

12. **¿Qué problema de identidad/seguridad aún NO resolvemos? Nombra dos.**
    - **Revocación**: el logout es local; el JWT stateless sigue siendo válido
      hasta su `exp` (no hay lista negra ni refresh).
    - **Abuso de credenciales**: sin rate limiting (ni bloqueo tras intentos
      fallidos) el login es vulnerable a fuerza bruta, y el `JWT_SECRET` vive en
      `.env` compartido sin rotarlo.
    (MFA y passkeys tampoco existen: la autenticación es monofactor.)