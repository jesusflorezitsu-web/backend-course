# Resource model — Entrega 04 (persistente)

> Decidido en la fase de análisis (sin IA). La v4 representa la misma entidad de la clase 03
> (`requests`), pero su estado deja de vivir en el proceso y pasa a **PostgreSQL (Supabase)**.

## Entidad

Una **solicitud de mantenimiento** (`request`): un problema reportado que el equipo debe
atender a lo largo de un ciclo de vida controlado.

## Tabla `requests` (migración `001`)

| Columna | Tipo | Restricciones | Por qué (decisión de la entrega) |
| ------- | ---- | ------------- | -------------------------------- |
| `id` | `BIGINT GENERATED ALWAYS AS IDENTITY` | `PRIMARY KEY` | La identidad la **genera la base de datos**, ya es única y autoincremental |
| `title` | `VARCHAR(200)` | `NOT NULL` | Toda solicitud tiene título obligatorio; delimita un tamaño razonable |
| `description` | `TEXT` | nullable | Detalle largo opcional; no se obliga a enviar contenido |
| `priority` | `VARCHAR(20)` | `NOT NULL DEFAULT 'medium'` + `CHECK (IN ('low','medium','high'))` | Valor por defecto válido y dominio restringido |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'open'` + `CHECK (IN (5 estados))` | Estado inicial controlado y blindado |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Marca temporal precisa con zona horaria (auditoría) |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Marca temporal precisa con zona horaria (auditoría) |

### Invariantes que ahora protege la base de datos

* No existen solicitudes con `title` nulo (`NOT NULL`).
* `priority` y `status` solo aceptan valores del dominio (`CHECK`).
* Estado inicial `open` y prioridad `medium` garantizados por `DEFAULT`.
* La evolución de `status` solo cambia por transiciones válidas (ver `transition-map.md`);
  la restricción de CHECK protege contra valores inventados.
* Sin `DELETE` (decisión 001): el ciclo de vida termina en `closed` o `cancelled`.

## Tabla `request_status_history` (migración `002`)

| Columna | Tipo | Restricciones | Por qué |
| ------- | ---- | ------------- | ------- |
| `id` | `BIGINT GENERATED ALWAYS AS IDENTITY` | `PRIMARY KEY` | Identidad del evento |
| `request_id` | `BIGINT` | `NOT NULL` + `FOREIGN KEY → requests(id)` | Todo evento pertenece a una solicitud |
| `previous_status` | `VARCHAR(30)` | nullable + CHECK: `NULL OR IN (5 estados)` | **Acepta NULL**: el primer evento es el nacimiento; antes de nacer no existe estado previo |
| `new_status` | `VARCHAR(30)` | `NOT NULL` + CHECK: `IN (5 estados)` | **No acepta NULL**: cada evento tiene un destino obligatorio |
| `changed_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Cuándo ocurrió la transición |

### Índice (decisión del análisis, pregunta 4)

```sql
CREATE INDEX request_status_history_request_id_idx
  ON request_status_history(request_id);
```

Motivo: el historial crece linealmente con cada transición; el endpoint
`GET /requests/:id/history` filtra por `request_id`, y un `seq scan` penalizaría el
rendimiento a medida que la tabla escala.

## Mapeo fila ↔ respuesta HTTP (`request.mapper.js`)

* La BD almacena `description` como `NULL` nativo; el contrato HTTP exige `""` cuando no se
  envió. La responsabilidad de esa traducción es del **mapper**: `description: row.description ?? ''`.
* Las columnas `snake_case` de SQL se traducen a `camelCase` en la respuesta
  (`created_at → createdAt`, `updated_at → updatedAt`, `request_id → requestId`).
* El evento de historial se enriquece **de forma aditiva** con `id` y `requestId`
  (decisión de la pregunta 15).

## Consecuencia visibles para el cliente (pregunta 16)

* El `id` ya lo genera `IDENTITY`: el cliente **no puede asumir** una secuencia continua sin
  huecos. Rollbacks y operaciones internas pueden producir saltos en la numeración. El `id`
  sigue siendo `number`, solo identifica, no necesariamente en orden estricto.

## Decisiones registradas

* [001 — Cancel requests instead of deleting them](project/docs/decisions/001-cancel-instead-of-delete.md)