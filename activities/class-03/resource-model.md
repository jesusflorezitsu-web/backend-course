# Resource model — MaintenanceRequest

> Fase 1 · se completó **antes de usar IA y antes de tocar código**.

## Nombre del recurso

**MaintenanceRequest** — el registro de una incidencia o solicitud de mantenimiento dentro
del sistema.

## Propiedades

| Propiedad    | Tipo   | Ejemplo                                   |
| ------------ | ------ | ----------------------------------------- |
| `id`         | number | `4` (secuencial, generado por el servidor)      |
| `title`      | string | `"Projector does not turn on"`           |
| `description`| string | `"The projector in room 204 shows no image."` |
| `status`     | string | `"in_progress"`                          |
| `priority`   | string | `"high"`                                 |
| `createdAt`  | string | `"2026-08-29T10:00:00.000Z"` (ISO 8601) |
| `updatedAt`  | string | `"2026-08-29T10:00:00.000Z"` (ISO 8601) |

## Campos requeridos

Únicamente **`title`**. Sin un título que describa el problema principal, la solicitud no se
puede crear.

## Campos opcionales

* **`description`**: si no se envía, se guarda como string vacío `""`.
* **`priority`**: si el cliente no la envía al crear, el servidor asigna `"medium"` por
  defecto.

## Campos generados por el servidor

* **`id`**: lo genera el servidor para garantizar la unicidad e integridad de la clave
  primaria.
* **`status`**: se ignora si viene en el POST porque toda solicitud debe arrancar
  estrictamente en estado `open`.
* **`createdAt` y `updatedAt`**: timestamps manejados por la lógica del servidor, para
  auditoría y consistencia del historial.

## Estados permitidos

`"open"`, `"in_progress"`, `"resolved"`, `"closed"`, `"cancelled"`.

## Reglas

* Nunca existirá una solicitud sin `id`, `title`, `status`, `priority`, `createdAt` ni
  `updatedAt`.
* Nunca existirá una solicitud con un `status` fuera de `open`, `in_progress`, `resolved`,
  `closed` o `cancelled`, ni con una `priority` fuera de `low`, `medium`, `high`.
* Siempre que se modifique algo en la solicitud (vía PATCH), el servidor actualizará
  `updatedAt` con el timestamp actual.
* El campo `status` solo cambia a través de las transiciones permitidas del mapa de
  transiciones.

## Dudas

* ¿Qué comportamiento debe tener el servidor si el cliente manda en el body campos
  inventados o desconocidos (p. ej. `foo: "bar"`)? ¿Se ignoran silenciosamente o se devuelve
  un 400? — **Decisión asumida: se ignoran silenciosamente**, salvo los casos que el contrato
  declara como error.
* ¿La propiedad `description` acepta un string vacío `""` al crear o actualizar, o debe tener
  una longitud mínima? — **Decisión asumida: se acepta vacío**; no se impone longitud mínima.