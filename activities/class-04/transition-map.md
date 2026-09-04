# Transition map — Entrega 04

> Las reglas de dominio de la clase 03 **no cambian**. La v4 añade un hecho nuevo: cada
> transición ya no solo modifica `requests.status`; también se **registra un evento** en
> `request_status_history` dentro de la misma transacción (atomicidad total).

## Estados

| Estado | Significado |
| ------ | ----------- |
| `open` | Reportada, pendiente de asignación |
| `in_progress` | En trabajo activo |
| `resolved` | Solución propuesta / aplicada |
| `closed` | Cerrada oficialmente (informativa) |
| `cancelled` | Cancelada (no sigue el flujo normal) |

## Mapa de transiciones

| De | A | Vía | Evento en historial |
| -- | - | --- | ------------------- |
| — | `open` | **Nacimiento** (POST) | `previousStatus: null` → `newStatus: open` |
| `open` | `in_progress` | PATCH | `open` → `in_progress` |
| `open` | `cancelled` | PATCH | `open` → `cancelled` |
| `in_progress` | `resolved` | PATCH | `in_progress` → `resolved` |
| `in_progress` | `cancelled` | PATCH | `in_progress` → `cancelled` |
| `resolved` | `in_progress` | PATCH (reabrir por reapertura) | `resolved` → `in_progress` |
| `resolved` | `closed` | PATCH | `resolved` → `closed` |

### Transiciones inválidas

* `open → resolved` (falta el paso intermedio).
* `open → closed`.
* `in_progress → closed`.
* `closed → cualquier estado` (**terminal**).
* `cancelled → cualquier estado` (**terminal**).
* Cambiarse a sí mismo u otras combinaciones no listadas.

## Momento de validación (pregunta 11)

La transición se valida **dentro de la transacción**, releyendo el estado con el **cliente
transaccional** (`SELECT ... FOR UPDATE`):

1. `BEGIN`;
2. leer fila con `FOR UPDATE` (la valida es la actual, sin lecturas obsoletas);
3. si la transición no es válida → `ROLLBACK` (nada se registra);
4. si es válida → `UPDATE requests` + `INSERT` del evento en el historial;
5. `COMMIT` (o `ROLLBACK` ante cualquier error) y `release` del cliente en `finally`.

## Dead end y cancelación

* `closed` y `cancelled` son definitivos (no se reviven).
* `cancelled` reemplaza al `DELETE`: eliminación lógica con trazabilidad completa
  (decisión 001).