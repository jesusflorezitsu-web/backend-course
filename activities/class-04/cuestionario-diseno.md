# Cuestionario de diseño · Entrega 04 (sin IA)

**Regla de la entrega:** completa este análisis ANTES de cerrar los documentos oficiales.
Con tus respuestas se generan `resource-model.md`, `http-contract.md`, `transition-map.md`
y `test-matrix.md` de la clase 04, se marca el commit + tag `class-04-design` y se afina la
implementación ya bosquejada sobre el starter v4.

**Hechos que la consigna/starter ya fija** (úsalos como base; el resto lo decides tú):

- Backend persistente en **PostgreSQL (Supabase)**; la API de la clase 3 deja el array en
  memoria y pasa a tablas, **sin romper el contrato HTTP v3**.
- Esquema: `requests` (id identity, title/description/priority/status/timestamps con
  restricciones CHECK) + `request_status_history` (FK a requests, previous/new_status,
  changed_at). Migraciones `001` y `002` en `database/migrations/`.
- Conexión única vía `src/database/pool.js` (Session pooler, puerto 5432); la cadena vive en
  `.env` (nunca se sube); `npm run db:check` imprime base y versión, jamás la URL.
- Unidad de trabajo con `withTransaction`: un solo cliente dedicado para la transacción.
- Consultas **parametrizadas** siempre; respuestas en camelCase vía `request.mapper.js`.
- La regla de los 5 estados y las transiciones (clase 3) no cambia: `open -> in_progress ->
  resolved -> closed` + `open -> in_progress -> cancelled`, con `resolved -> in_progress`.
- Errores tipados por categoría -> HTTP: contrato `400`, recurso `404`, dominio `409`,
  infraestructura `503 DATABASE_UNAVAILABLE`, resto `500 INTERNAL_ERROR`.
- Sin `DELETE` (decisión 001 heredada de la clase 3).

---

## Parte A · Modelo persistente (tablas y restricciones)

1. **Tabla `requests`** — revisa la migración `001`. Anota debajo cada columna con su tipo y
   por qué esa elección te parece correcta (id identity -> quien tiene la identidad ahora;
   `title VARCHAR(200) NOT NULL`; `description TEXT` nullable; `priority`/`status` con
   `DEFAULT` y `CHECK`; `created_at`/`updated_at TIMESTAMPTZ`):

2. **¿Qué invariante de la clase 3 ahora protege la base de datos y no el código?** (p. ej.,
   prioridad/estado fuera de lista, solicitud sin título). Escríbelas como restricciones:

3. **Tabla `request_status_history`** — revisa la migración `002` que completamos. Responde:
   a. ¿Por qué `previous_status` **acepta NULL**?
   b. ¿Por qué `new_status` **NO** acepta NULL?
   c. ¿Qué garantizan los dos CHECK (previous y new) sobre los cinco estados?

4. **Índice**: ¿conviene un índice sobre `request_status_history(request_id)` para que el
   historial se lea rápido? ¿Sí/no y por qué? (pistas: el endpoint nuevo es
   `GET /requests/:id/history`; la tabla crece con cada transición).

5. **Descripción en la BD**: la migración deja `description` nullable (sin DEFAULT). Pero el
   contrato dice que responde `""` si no se envía. ¿Cómo representa el mapper ese NULL?
   (¿quién garantiza la equivalencia: BD, mapper, service?)

6. **Rendimiento de pruebas**: ¿vamos a ejecutar el `seed.sql` opcional (3 solicitudes + sus
   nacimientos + 1 transición) o empezamos desde cero en la verificación?

---

## Parte B · Conexión, secreto y disponibilidad

7. **¿Por qué un único `pool` para todo el proceso y no un cliente por consulta?**

8. **¿Qué SI y qué NO debe imprimir/se guardar `db:check` y la evidencia?** (recuerda: docker
   de secretos; la URL completa con contraseña nunca debe aparecer).

9. **Si la base está caída o la cadena es inválida**, ¿qué responde la API? (categoría
   `infrastructure` -> `503 DATABASE_UNAVAILABLE` con mensaje genérico). ¿Por qué está mal
   reenviar el error crudo de pg al cliente?

---

## Parte C · Transacciones y consistencia (una unidad de trabajo)

10. **Crear solicitud**: la unidad de trabajo es "insertar la fila + registrar el nacimiento en
    el historial (NULL -> open)". ¿Qué pasaría si solo se insertara la fila y el historial
    fallara? ¿Por qué ambas escrituras deben ir en UNA transacción con UN solo cliente?

11. **Cambiar estado**: igual para el PATCH (actualizar la fila + insertar la transición en la
    historia). ¿Dónde se valida la transición: antes o dentro de la transacción? ¿Qué gana
    validar con el estado RELEÍDO en la misma transacción (evita lecturas obsoletas)?

12. **Comportamiento de `withTransaction`** — escribe la secuencia exacta (conectar, BEGIN,
    work, COMMIT / ROLLBACK, release) y qué garantiza el `finally`.

---

## Parte D · Contrato HTTP v4

13. **¿Qué se mantiene idéntico respecto a v3 del starter?** (recursos, estados, transiciones,
    formato de error, 4 endpoints). Anótalo:

14. **Códigos de error de la v4** — confirma la lista completa (los de la v3 del starter +
    los nuevos de infraestructura):
    `INVALID_FILTER`, `REQUEST_NOT_FOUND`, `TITLE_REQUIRED`, `INVALID_PRIORITY`,
    `INVALID_STATUS`, `NO_UPDATABLE_FIELDS`, `INVALID_STATUS_TRANSITION`,
    `REQUEST_IN_TERMINAL_STATUS`, `DATABASE_UNAVAILABLE`, `INTERNAL_ERROR`.

15. **`GET /requests/:id/history`** (nuevo):
    - Intención:
    - Éxito (estado + forma del evento):
    - Primer evento de toda solicitud (¿qué previousStatus/newStatus esperas y por qué?):
    - Error (estado + código):
    - Orden del arreglo (¿cuál?):

16. **El `id` ahora lo genera PostgreSQL (`BIGINT GENERATED ALWAYS AS IDENTITY`)**. ¿Qué cambia
    para el cliente? (¿puede asumir IDs consecutivos sin huecos?)

---

## Parte E · Matriz de prueba v4

17. **La prueba que define la entrega** (del README del starter): POST -> reiniciar el proceso
    -> GET /requests/:id -> 200 (los datos sobrevivieron). ¿Cómo la vas a registrar en la
    evidencia sin que sea un copy-paste de la columna esperada?

18. **Casos obligatorios que agrega la v4** — llena el esperado:

    | Caso | Petición | Esperado |
    | ---- | -------- | ------- |
    | Crear correctamente | `POST /requests` | `201` |
    | Listar con filtros válidos combinados | `GET /requests?status=open&priority=high` | |
    | Filtrar con valor desconocido | `GET /requests?priority=urgent` | |
    | Consultar inexistente | `GET /requests/999` | |
    | Ver historial con nacimiento | `GET /requests/1/history` | |
    | Transición válida y su evento en historia | `PATCH /requests/1` (in_progress) | |
    | Transición inválida | `PATCH /requests/1` (open, desde in_progress) | |
    | Modificar cerrada | `PATCH /requests/1` (closed) | |
    | Sobrevive al reinicio | POST -> restart -> `GET /requests/<id>` | |

19. **Agrega al menos 2 casos propios** (p. ej. PATCH con solo campos del servidor, solicitud de
    historial de inexistente, error de infraestructura):

    | Caso | Petición | Esperado |
    | ---- | -------- | ------- |
    | | | |
    | | | |

---

Cuando esté completo, pásamelo respondido y yo:
1) genero los documentos oficiales de `activities/class-04/` (`resource-model.md`,
   `http-contract.md`, `transition-map.md`, `test-matrix.md` + `ai-usage.md` y
   `reflection.md`) desde tus respuestas;
2) hago commit + tag `class-04-design`;
3) con tu cadena de Supabase ejecuto `db:check`, corremos las migraciones y la verificación
   (incluida la prueba de supervivencia) y cierro con `class-04-submission`.