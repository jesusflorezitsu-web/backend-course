# Transition map — ciclo de vida de una solicitud

> Fase 1 · se completó **antes de usar IA y antes de tocar código**.
> Lo que no aparece como transición permitida está prohibido: los huecos también son reglas.

## Estados

* **`open`** — solicitud recién registrada que aún no ha sido revisada ni asignada.
* **`in_progress`** — el problema se está atendiendo activamente.
* **`resolved`** — el trabajo de mantenimiento finalizó, pendiente de revisión final.
* **`closed`** — solicitud confirmada y finalizada con éxito.
* **`cancelled`** — solicitud descartada o anulada.

## Transiciones permitidas

| Desde        | Hacia          | ¿Qué la dispara?                                                            |
| ------------ | -------------- | --------------------------------------------------------------------------- |
| `open`       | `in_progress`  | Se asigna un técnico y se empieza a trabajar.                               |
| `open`       | `cancelled`    | Se descarta la solicitud antes de trabajarla.                               |
| `in_progress`| `resolved`     | El técnico termina la reparación propuesta.                                 |
| `in_progress`| `cancelled`    | Se interrumpe o descarta el trabajo en curso.                               |
| `resolved`   | `closed`       | El cliente o supervisor aprueba la solución dada.                           |
| `resolved`   | `in_progress`  | La solución no fue efectiva y reabren el problema.                          |

## Transiciones inválidas notables

| Intento                    | Por qué se rechaza                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `open` → `closed`          | No se puede cerrar directamente sin haber pasado por solución/revisión previa.     |
| `resolved` → `open`        | Una vez trabajada, si falla debe reabrirse como `in_progress`, no volver al inicio.|
| `closed` → cualquier estado| `closed` es terminal: para un problema nuevo debe crearse otro ticket.             |
| `cancelled` → cualquier estado | `cancelled` es terminal: el registro queda como historial, no se revierte.     |
| `open` → `resolved`        | Un salto directo a "resuelto" evadiría el registro del trabajo en curso.           |

## Estados terminales

Los estados terminales son **`closed`** y **`cancelled`**: no admiten salida. Si el cliente
intenta hacer un `PATCH` a un recurso en alguno de estos dos estados, la API responde
`409 Conflict` con `code: "REQUEST_IN_TERMINAL_STATUS"`, sin importar qué campos envíe.

## Justificación

Este diseño responde al flujo real del ciclo de vida de una incidencia. Permitir que
`resolved` vuelva a `in_progress` facilita el manejo de arreglos defectuosos sin perder la
trazabilidad del ticket; en cambio, `closed` representa la conformidad total de la solución y
reabrirlo complicaría la auditoría (es mejor abrir un nuevo ticket si el problema reaparece).
`cancelled` se usa en lugar de eliminar el registro (`DELETE`) para mantener un historial
completo de todas las solicitudes enviadas al sistema; esa decisión se documenta en la nota
`project/docs/decisions/001-cancel-instead-of-delete.md`.