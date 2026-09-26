# Reflexión — Clase 07

> Borrador para revisar antes del commit. Cada respuesta en tus palabras.

1. **¿Por qué es importante reproducir un incidente antes de corregirlo?**
   Porque el síntoma (500) no revela la causa: sin reproducción no sé si el fallo es del contrato, del SQL o del entorno. Al revertir temporalmente cada fix vi el 500 real y su disparador — el `NaN` en una columna `bigint` — antes de restaurar la corrección. Reproducir separa "creo que" de "está comprobado".

2. **¿Qué diferencia hay entre `INVALID_REQUEST_ID` (400) y un 500?**
   El 400 es un error del consumidor: el contrato dice qué formato es válido y la app lo rechaza ANTES de SQL. El 500 es un error del servidor: algo interno explotó (aquí, `NaN` en una comparación `bigint`). Un fallo de entrada del cliente nunca debe verse como un fallo interno.

3. **¿Por qué el `CHECK` de PostgreSQL se conserva aunque la app valide prioridad?**
   Porque la app es la primera defensa (mensaje claro, 400) y la base la segunda (nadie se brinca la restricción, ni una app nueva ni un SQL a mano). Quitar el `CHECK` por "ya lo valida la app" eliminaría la última línea de defensa.

4. **¿Por qué el error handler central produce el mismo JSON de error en toda respuesta?**
   Un solo traductor evita que cada ruta elija su formato y que el detalle técnico se filtre: el cliente siempre ve `{ error: { code, message }, requestId }`, y el `stack`/detalles quedan solo en el log del servidor.

5. **¿Cómo pruebo que la respuesta y el log pertenecen a la misma petición?**
   El test de trazabilidad captura la consola durante una petición y verifica que existe una línea JSON cuyo `requestId` coincide con el header `X-Request-Id` de la respuesta; el script de incidentes hace lo mismo con su sonda OPS-703. Si el id no coincide, el log no sirve para investigar esa petición.

6. **¿Qué intentó romper el validador y qué limitación conserva esta solución?**
   Intentó ids inválidos, prioridades fuera del conjunto, transiciones ilegales, detalles internos filtrados, ausencia de correlación, y el estado de salud/readiness. Limitación conservada: el request-id es por petición, no por flujo de negocio; si un usuario sufre una secuencia de errores, cada petición es trazable por separado pero no hay un id de conversación que las agrupe.