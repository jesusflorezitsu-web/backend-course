# HTTP contract — Request API v3

> Fase 1 · se completó **antes de usar IA y antes de tocar código**.

## Formato de error (común a toda la API)

```json
{
  "error": {
    "code": "NOMBRE_DEL_CODIGO",
    "message": "Explicación breve y clara del problema."
  }
}
```

Códigos de error utilizados: `NOT_FOUND`, `VALIDATION_ERROR`, `INVALID_FILTER_VALUE`,
`INVALID_STATUS_TRANSITION`, `REQUEST_IN_TERMINAL_STATUS`.

---

## `GET /requests`

* **Intención**: obtener la lista completa de solicitudes, permitiendo filtrar por estado o
  prioridad.
* **Path**: `/requests`
* **Query**: `status` (uno de `open`, `in_progress`, `resolved`, `closed`, `cancelled`) y
  `priority` (uno de `low`, `medium`, `high`). Se pueden combinar
  (p. ej. `GET /requests?status=open&priority=high`). Sin filtros devuelve todo.
* **Body**: ninguno.
* **Respuesta exitosa**: `200 OK` con un arreglo JSON. Sin coincidencias devuelve `200 OK`
  con `[]`.
* **Errores**: `400 Bad Request` con `code: "INVALID_FILTER_VALUE"` si algún parámetro de
  filtro tiene un valor no permitido.

**Ejemplo**

```http
GET /requests?status=open&priority=high HTTP/1.1
Host: localhost:3000

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
  {
    "id": 1,
    "title": "Projector does not turn on",
    "description": "The projector in room 204 shows no image during class.",
    "status": "open",
    "priority": "high",
    "createdAt": "2026-08-29T10:00:00.000Z",
    "updatedAt": "2026-08-29T10:00:00.000Z"
  }
]
```

---

## `GET /requests/:id`

* **Intención**: consultar los detalles de una solicitud específica por su ID.
* **Path**: `/requests/:id`
* **Respuesta exitosa**: `200 OK` con el objeto JSON de la solicitud.
* **Errores**: `404 Not Found` con `code: "NOT_FOUND"` si el ID no coincide con ninguna
  solicitud.

**Ejemplo**

```http
GET /requests/999 HTTP/1.1
Host: localhost:3000

HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{
  "error": {
    "code": "NOT_FOUND",
    "message": "Request not found"
  }
}
```

---

## `POST /requests`

* **Intención**: registrar una nueva solicitud en el sistema.
* **Body**: campos aceptados del cliente: `title` (requerido), `description` (opcional),
  `priority` (opcional, por defecto `medium`). Los campos del servidor (`id`, `status`,
  `createdAt`, `updatedAt`) se **ignoran**:
  el servidor asigna sus valores por defecto. `status` siempre nace `open`.
* **Respuesta exitosa**: `201 Created` con la entidad recién creada en el body.
* **Errores**: `400 Bad Request` con `code: "VALIDATION_ERROR"` si falta el `title` o si la
  `priority` enviada no está en `low`, `medium`, `high`.

**Ejemplo**

```http
POST /requests HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Broken projector cable",
  "description": "The HDMI cable of the projector is cut.",
  "priority": "high"
}

HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": 4,
  "title": "Broken projector cable",
  "description": "The HDMI cable of the projector is cut.",
  "status": "open",
  "priority": "high",
  "createdAt": "2026-08-29T10:05:00.000Z",
  "updatedAt": "2026-08-29T10:05:00.000Z"
}
```

---

## `PATCH /requests/:id`

* **Intención**: actualizar parcialmente una solicitud (modificar datos o avanzar su estado).
* **Body**: campos modificables del cliente: `title`, `description`, `priority`, `status`.
  Campos ignorados: `id`, `createdAt`, `updatedAt`. Solo el `status` dispara una transición
  de la máquina de estados; los demás campos son de edición libre.
* **Respuesta exitosa**: `200 OK` con el objeto actualizado (con `updatedAt` renovado).
* **Errores**:

| Situación | Estado | Código de error |
| --------- | -----: | --------------- |
| PATCH sin campos modificables o campos vacíos | 400 | `VALIDATION_ERROR` |
| PATCH con valor desconocido (`status`/`priority` mal escrito) | 400 | `VALIDATION_ERROR` |
| PATCH a solicitud inexistente | 404 | `NOT_FOUND` |
| PATCH pidiendo una transición inválida | 409 | `INVALID_STATUS_TRANSITION` |
| PATCH a una solicitud en estado terminal (`closed` o `cancelled`) | 409 | `REQUEST_IN_TERMINAL_STATUS` |

**Ejemplo (éxito y ejemplo de 409)**

```http
PATCH /requests/1 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "status": "in_progress"
}

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "id": 1,
  "title": "Projector does not turn on",
  "description": "The projector in room 204 shows no image during class.",
  "status": "in_progress",
  "priority": "high",
  "createdAt": "2026-08-29T10:00:00.000Z",
  "updatedAt": "2026-08-29T10:00:05.000Z"
}
```

```http
PATCH /requests/1 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "status": "closed"
}

HTTP/1.1 409 Conflict
Content-Type: application/json; charset=utf-8

{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Transition from open to closed is not allowed"
  }
}
```

## Decisiones de diseño

* **Formato del ID**: `number` secuencial (p. ej. `4`), coherente con el esquema del starter y
  de la clase 2 (ids 1, 2, 3). `GET /requests/:id` usa `Number(req.params.id)`.
* **Campos desconocidos en el body**: se ignoran silenciosamente; solo los casos declarados
  en cada endpoint producen error.
* **`description` vacío**: se acepta `""`; no hay longitud mínima.
* **Transiciones**: el mapa completo vive en `transition-map.md` y es la única fuente de
  verdad para decidir si un `PATCH` de `status` es válido.