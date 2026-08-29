# Contrato HTTP — Request API Full

> Este documento define la promesa que hace la API antes de implementarla. El código que sigue
> en `src/routes/requests.routes.js` es la manera de cumplir este contrato.

## Recurso

Una **solicitud** (`request`) representa una petición de mantenimiento reportada por un usuario
(ej. un proyector que no enciende, una silla rota o una caída de Wi-Fi). Cada solicitud tiene un
identificador único y numérico, un título obligatorio, una descripción opcional, un estado y una
prioridad. Este sistema es un CRUD de solo lectura y creación: solo expone listar, consultar por
id y crear.

### Forma del recurso

| Campo         | Tipo      | Obligatorio | Quién lo asigna | Notas                                             |
| ------------- | --------- | ----------- | --------------- | ------------------------------------------------- |
| `id`          | number    | Sí          | Servidor        | Generado con `generateId()`, autoeincremental.   |
| `title`       | string    | Sí          | Cliente         | Único campo que el servidor exige.                        |
| `description` | string    | No          | Cliente         | Si no llega, se omite del objeto creado.          |
| `status`      | string    | Sí          | Servidor        | No es recibido: el creado siempre nace como `'open'`.     |
| `priority`    | string    | No          | Cliente         | Si no llega, se omite del objeto creado.          |

---

## Endpoint 1 — Listar solicitudes

| Elemento              | Valor                          |
| --------------------- | ------------------------------ |
| Método                | GET                            |
| Ruta                  | `/requests`                    |
| Entrada               | Sin cuerpo.                    |
| Respuesta de éxito    | `200 OK` con un arreglo JSON.  |
| Respuestas de error   | Ninguna.                       |

**Ejemplo de respuesta**

```json
[
  {
    "id": 1,
    "title": "Projector does not turn on",
    "description": "The projector in room 204 shows no image during class.",
    "status": "open",
    "priority": "high"
  }
]
```

---

## Endpoint 2 — Consultar una solicitud

| Elemento              | Valor                             |
| --------------------- | --------------------------------- |
| Método                | GET                               |
| Ruta                  | `/requests/:id`                   |
| Entrada               | El `id` numérico como parámetro de ruta. |
| Respuesta de éxito    | `200 OK` con la solicitud como objeto JSON. |
| Respuestas de error   | `404 Not Found` si no existe.    |

**Ejemplo de respuesta (éxito)**

```json
{
  "id": 1,
  "title": "Projector does not turn on",
  "description": "The projector in room 204 shows no image during class.",
  "status": "open",
  "priority": "high"
}
```

**Ejemplo de respuesta (error)**

```json
{
  "error": "Request not found"
}
```

---

## Endpoint 3 — Crear una solicitud

| Elemento              | Valor                                  |
| --------------------- | -------------------------------------- |
| Método                | POST                                   |
| Ruta                  | `/requests`                            |
| Entrada               | Cuerpo JSON con al menos `title`.      |
| Respuesta de éxito    | `201 Created` con la solicitud creada. |
| Respuestas de error   | `400 Bad Request` si falta o está en blanco el `title`. |

**Ejemplo de body de la petición**

```json
{
  "title": "Broken projector cable",
  "description": "The HDMI cable of the projector is cut."
}
```

**Ejemplo de respuesta (éxito)**

```json
{
  "id": 4,
  "title": "Broken projector cable",
  "description": "The HDMI cable of the projector is cut.",
  "status": "open"
}
```

**Ejemplo de respuesta (error de validación)**

```json
{
  "error": "Title is required"
}
```

---

## Reglas transversales

1. ¿Qué `Content-Type` devuelven todas las respuestas? → `application/json; charset=utf-8` (Express lo fija al enviar objetos con `res.json()`).
2. ¿Qué estado corresponde a una ruta que no existe en esta API? → `404 Not Found`.
3. ¿Qué forma tiene siempre un cuerpo de error? → Un objeto con una única propiedad `"error"` cuyo valor es un mensaje de texto.
4. ¿Qué campos ignora el servidor si el cliente los envía en el body? → Ignora `id`, `status` y cualquier otro campo fuera de `title`, `description` y `priority`. El `id` lo asigna el servidor y el `status` siempre nace `'open'`.

## Decisiones que tomaste y por qué

* Uso `Number(req.params.id)` para comparar contra los `id` numéricos del arreglo; el parámetro de ruta llega como texto. Si convierto solo cuando hace falta, evito comparaciones de tipos diferentes.
* En `POST`, comparo `title` con una versión `trim()`: un título de solo espacios cuenta como "en blanco" y debe rechazarse, tal como indica el TODO.
* Solo incluyo en el objeto creado los campos que el contrato declara (`title`, `description` opcional, `priority` opcional). De esta forma el servidor no guarda campos no declarados que el cliente envíe de más.
