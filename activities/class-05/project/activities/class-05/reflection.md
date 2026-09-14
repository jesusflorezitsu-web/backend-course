# Reflexión — Clase 05

> Borrador para revisar antes del commit. Cada respuesta en tus palabras.

1. **¿Qué diferencia hay entre identidad, autenticación y autorización?**
   La identidad es quién dice ser (`sub` y `role` en el JWT). La autenticación
   es probar esa identidad (registro + login + verificación del token). La
   autorización decide qué puede hacer esa identidad ya probada: el requester
   solo ve sus solicitudes y edita solo las suyas abiertas; el agent ve todas y
   puede cambiar de estado dentro de la máquina de transiciones.

2. **¿Por qué `createdBy` y `changedBy` nunca llegan desde el body?**
   Porque son datos de servidor: quien crea o cambia un ticket lo dice el token
   autenticado, no el cliente. Si vinieran del body, cualquiera podría
   atribuirse o falsear la procedencia.

3. **¿Qué diferencia hay entre `401` y `403`? ¿Y por qué a veces `404`?**
   `401` es "no sé quién eres" (falta o falla la autenticación). `403` es "sé
   quién eres pero no puedes hacer esto" (autorización insuficiente). A veces
   `404` porque no conviene revelar si un recurso existe: una solicitud ajena,
   inexistente o heredada responde idéntico `404 REQUEST_NOT_FOUND`.

4. **¿Por qué decodificar un JWT no permite confiar en él?**
   Decodificar solo lee el payload; cualquiera puede firmar. La confianza viene
   de verificar la firma con la clave secreta (HS256) y los claims
   (`iss`, `aud`, `iat`, `exp`), no de mirar el contenido.

5. **¿Por qué el `agent` sigue sujeto a la máquina de estados?**
   Porque tener más privilegios no autoriza a romper las reglas del dominio:
   cada transición debe estar permitida y guardarse en el historial con actor.
   El validador intentó transiciones inválidas y el API respondió `409`.

6. **¿Qué intentó romper el validador y qué limitación conserva esta solución?**
   Intentó escalar rol en el registro, fuerzas de password débiles, login con
   credenciales malas, requests sin token, tokens falsos, leer solicitudes
   ajenas, mezclar campos PATCH, transiciones inválidas y mutar tickets
   cerrados. Limitación conservada: la autorización depende del rol del token;
   un rol de mayor privilegio (o una política de RCU) requiere evolución del
   diseño.