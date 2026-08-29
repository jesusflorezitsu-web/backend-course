# Cuestionario de diseño · Entrega 03 (sin IA)

**Regla de la entrega:** completa este diseño ANTES de usar IA y ANTES de tocar código.
Con tus respuestas se generan `resource-model.md`, `http-contract.md`, `transition-map.md`
y `test-matrix.md`, se marca el commit + tag `class-03-design` y recién ahí se implementa.

**Hechos que la consigna ya fija** (úsalos como base; el resto lo decides tú):

* Sistema: solicitudes de mantenimiento (misma entidad de la clase 2).
* Creación: ID generado por el servidor, prioridad `medium` por defecto, estado inicial `open`,
  fechas `createdAt` y `updatedAt` generadas por el servidor.
* Consulta: colección e individual. Filtros por `status` y `priority`, **combinables**,
  con `400` para valores desconocidos.
* Actualización parcial con `PATCH`: campos modificables `title`, `description`, `priority`,
  `status`; campos del servidor ignorados.
* Transiciones controladas por una máquina de estados; `409` para transición inválida y para
  solicitudes en estado terminal.
* Formato de error SIEMPRE: `{ "error": { "code": "...", "message": "..." } }`.
* Sin `DELETE`, sin BD, sin validación externa, sin capas controllers/services/repositories,
  solo Express.

---

## Parte A · Modelo del recurso

1. **¿Cómo se llama la entidad y qué representa en una frase?**

2. **Lista sus propiedades con tipo** (id, title, description, status, priority, createdAt,
   updatedAt, ¿alguna otra?):

3. **¿Qué campos son requeridos** (sin los cuales no puede existir una solicitud)?

4. **¿Qué campos son opcionales** y qué valor toman si faltan?

5. **¿Qué campos genera el servidor y NO acepta del cliente** (y por qué)?

6. **¿Cuál es la lista cerrada de estados de `status`?**

7. **¿Cuál es la lista de valores válidos de `priority`?**

8. **Invariantes** — convierte esto en "promesas" del sistema (nunca existirá…) Escribe al
   menos 3:
   * nunca existirá una solicitud sin …
   * nunca existirá una solicitud con un `status` fuera de …
   * siempre que se modifique algo, …

9. **Dudas** que la consigna no responde y querrías preguntar (anotarlas es diseño):
   *

---

## Parte B · Contrato HTTP (4 endpoints)

10. **Formato de error único.** Escribe la forma JSON del cuerpo de error y la lista de
    códigos de error que usarás (sugerencia de elección: `NOT_FOUND`, `VALIDATION_ERROR`,
    `INVALID_STATUS_TRANSITION`, `REQUEST_IN_TERMINAL_STATUS`, `INVALID_FILTER_VALUE` —
    confirma o cambia los nombres):

11. **`GET /requests`**
    * Intención:
    * Query: filtros disponibles y sus valores válidos. ¿Varios filtros a la vez?
    * ¿Qué responde si no hay coincidencias?
    * Errores:

12. **`GET /requests/:id`**
    * Intención:
    * Éxito (estado + cuerpo):
    * Error (estado + código):

13. **`POST /requests`**
    * Intención:
    * Body aceptado (campos del cliente):
    * ¿Qué hace con campos que el servidor controla (`id`, `status`, fechas)?
    * Éxito (estado + cuerpo):
    * Errores (estado + código):

14. **`PATCH /requests/:id`**
    * Intención:
    * Body aceptado (campos modificables) e ignorados:
    * Éxito (estado + cuerpo):
    * Errores — llena la tabla completa:

    | Situación | Estado | Código de error |
    | --------- | ------ | --------------- |
    | PATCH sin campos modificables | | |
    | PATCH con valor desconocido (`status`/`priority` mal escrito) | | |
    | PATCH a solicitud inexistente | | |
    | PATCH pidiendo una transición inválida | | |
    | PATCH a una solicitud en estado terminal | | |

---

## Parte C · Mapa de transiciones

15. **Estados** — escribe cada estado con una frase de qué significa:

16. **Transiciones permitidas** (Desde → Hacia → qué la dispara):

    | Desde | Hacia | ¿Qué la dispara? |
    | ----- | ----- | ---------------- |

17. **Transiciones inválidas notables** (intento → por qué rechazarlo):

    | Intento | Por qué se rechaza |
    | ------- | ------------------ |

18. **Estados terminales** — cuáles no admiten salida y qué responde la API si alguien
    intenta modificar una solicitud en estado terminal:

19. **Justificación** — ¿por qué este mapa y no otro? (¿por qué `resolved` puede volver a
    `in_progress` pero `closed` no? ¿por qué se cancelan y no se borran?)

---

## Parte D · Matriz de prueba

20. **Los 8 casos obligatorios** — para cada uno indica el resultado esperado:

    | Caso | Petición | Estado previo | Esperado |
    | ---- | -------- | ------------- | ------- |
    | Crear correctamente | `POST /requests` | — | `201` |
    | Crear sin título | `POST /requests` | — | |
    | Consultar inexistente | `GET /requests/999` | — | |
    | Filtrar sin resultados | `GET /requests?status=closed` | — | |
    | Cambiar prioridad | `PATCH /requests/1` | `open` | |
    | Transición válida | `PATCH /requests/1` | `open` | |
    | Transición inválida | `PATCH /requests/1` | `open` | |
    | Modificar cerrada | `PATCH /requests/1` | `closed` | |

21. **Agrega al menos 2 casos propios** (p. ej. filtro con valor desconocido, `status`
    enviado al crear, PATCH sin campos válidos…):

    | Caso | Petición | Estado previo | Esperado |
    | ---- | -------- | ------------- | ------- |
    | | | | |
    | | | | |

---

Cuando esté completo, pásamelo respondido y yo:
1) genero los 4 documentos oficiales de `activities/class-03/` desde tus respuestas;
2) hago `commit "class-03 design"` + tag `class-03-design`;
3) recién ahí paso a la implementación en `project/` (con IA, registrada en `ai-usage.md`).