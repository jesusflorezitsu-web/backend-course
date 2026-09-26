# Reflexión — Clase 06

> Borrador para revisar antes del commit. Cada respuesta en tus palabras.

1. **¿Qué diferencia hay entre una colección filtrada vacía (200 con `[]`) y un recurso que no existe (404)?**
   Cuando un filtro no coincide, la colección existe pero no tiene elementos: su representación es `[]`. Cuando pido un recurso por id y no hay ninguna solicitud con ese id, no existe nada que representar: es 404. "No hay filas para mostrar" no es lo mismo que "no existe lo que preguntaste".

2. **¿Por qué el endpoint de historial reutiliza la política y el formato de errores existentes?**
   Porque el contrato manda: un requester solo ve lo suyo, un agente ve todo, y una solicitud ajena responde idéntico `404` a la inexistente (no revela existencia). Reutilizar `canViewHistory`, `findHistory` y `notFound()` garantiza que el nuevo endpoint se comporte exactamente como el resto.

3. **¿Por qué las pruebas crean sus propios datos con identificadores únicos y limpian solo lo suyo?**
   Para que dos corridas (o dos developers) no colisionen: cada usuario lleva un `runId` aleatorio en el email, y al limpiar solo sus ids el seed y los datos de otros sobreviven. Un `TRUNCATE` borraría el entorno de todos.

4. **¿Qué leíste primero cuando una prueba falló y qué te dijo?**
   El resumen de conteos (`tests 0 / pass 0`). Me dijo que el problema no era la lógica sino el runner: el glob `'test/*.test.js'` no expandía en Windows, así que pasé los archivos explícitamente y corrieron los 14 tests.

5. **¿Qué decisión no le habrías delegado a la IA aunque te la ofreciera resuelta?**
   Elegir qué proyecto de Supabase conservar o borrar, y cuál credencial rotar. Son acciones destructivas sobre mi cuenta y no se deshacen; se toman con certeza, revisando yo mismo los `.env` y los README.

6. **¿Qué fue lo más difícil y qué harías distinto mañana en un backend que no conoces?**
   Moverme rápido en código ajeno: saber dónde vive cada responsabilidad sin leerlo todo. Mañana empezaría por el recorrido de una petición y el contrato de errores, y llenaría el work-log durante el trabajo, no al final.