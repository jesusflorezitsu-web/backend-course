# Test matrix — Entrega 04

> Matriz base definida en la fase de diseño; columna **observado** completada durante la
> verificación final (API real contra Supabase, PostgreSQL 17.6). Toda la evidencia se registró
> con `curl -i` (cabeceras y cuerpo reales), sin copiar la columna *esperado*.

## Resultado

**11/11 ✅** — todas las respuestas reales de la API coinciden con lo esperado.

## Casos obligatorios v4 (pregunta 18)

| # | Caso | Petición | Esperado | Observado (evidencia real) |
| - | ---- | -------- | -------- | -------------------------- |
| 1 | Crear correctamente | `POST /requests` | `201 Created` con el objeto creado | `201` → `{"id":1,"title":"Elevator not working","description":"Building A, floor 3","priority":"high","status":"open","createdAt":"2026-09-04T19:17:03.593Z","updatedAt":"..."}` |
| 2 | Listar con filtros válidos combinados | `GET /requests?status=open&priority=high` | `200 OK` con arreglo filtrado | `200` → `[{"id":1,...,"priority":"high","status":"open",...}]` |
| 3 | Filtrar con valor desconocido | `GET /requests?priority=urgent` | `400 Bad Request` (`INVALID_FILTER`) | `400` → `{"error":{"code":"INVALID_FILTER","message":"Unknown priority \"urgent\". Valid values: low, medium, high."}}` |
| 4 | Consultar inexistente | `GET /requests/999` | `404 Not Found` (`REQUEST_NOT_FOUND`) | `404` → `{"error":{"code":"REQUEST_NOT_FOUND","message":"The request does not exist."}}` |
| 5 | Ver historial con nacimiento | `GET /requests/1/history` | `200 OK` con 1 evento (`previousStatus: null`) | `200` → `[{"id":1,"requestId":1,"previousStatus":null,"newStatus":"open","changedAt":"..."}]` |
| 6 | Transición válida y su evento en historia | `PATCH /requests/1` (`in_progress`) | `200 OK` y nuevo registro en `GET /requests/1/history` | `200` → `status:"in_progress"`; historia pasa a 2 eventos: `null→open`, `open→in_progress` |
| 7 | Transición inválida | `PATCH /requests/1` (`open`, desde `in_progress`) | `409 Conflict` (`INVALID_STATUS_TRANSITION`) | `409` → `{"error":{"code":"INVALID_STATUS_TRANSITION","message":"A request cannot move from in_progress to open."}}` |
| 8 | Modificar cerrada | `PATCH /requests/1` (`closed`) | `409 Conflict` (`REQUEST_IN_TERMINAL_STATUS`) | tras `resolved→closed` (`200`), `409` → `{"error":{"code":"REQUEST_IN_TERMINAL_STATUS","message":"Request 1 is closed and can no longer be modified."}}` |
| 9 | Sobrevive al reinicio | `POST` → restart del proceso → `GET /requests/<id>` | `200 OK` devolviendo los datos persistidos | `POST` id 2; proceso detenido/levantado (log + PID 9736→13036); `GET /requests/2` → `200` con los mismos datos (`createdAt` previo al reinicio) |

## Casos adicionales propios (pregunta 19)

| # | Caso | Petición | Esperado | Observado (evidencia real) |
| - | ---- | -------- | -------- | -------------------------- |
| 10 | Historial de recurso inexistente | `GET /requests/999/history` | `404 Not Found` (`REQUEST_NOT_FOUND`) | `404` → `{"error":{"code":"REQUEST_NOT_FOUND","message":"The request does not exist."}}` |
| 11 | Mutar con payload vacío | `PATCH /requests/1` con `{}` | `400 Bad Request` (`NO_UPDATABLE_FIELDS`) | `400` → `{"error":{"code":"NO_UPDATABLE_FIELDS","message":"The body must include at least one of: title, description, priority, status."}}` |

## Verificación del reinicio (pregunta 17) — evidencia de las tres partes

1. **Cabeceras HTTP reales**: `HTTP/1.1 200 OK` en el `GET /requests/2` posterior al reinicio.
2. **Cuerpo JSON**: `{"id":2,"title":"AC leak in office 204","description":"Water dripping from the unit","priority":"medium","status":"open","createdAt":"2026-09-04T19:17:51.684Z","updatedAt":"2026-09-04T19:17:51.684Z"}` — los mismos datos creados antes del reinicio.
3. **Logs del reinicio**: instancia anterior (PID 9736) detenida → puerto 3000 liberado → nueva
   instancia (PID 13036) con su línea `Request API is running on http://localhost:3000`; el
   GET posterior solo pudo leer los datos desde **PostgreSQL**, no del proceso.

La historia final de la solicitud 1 confirma el ciclo completo persistido:

```json
[{"id":1,"requestId":1,"previousStatus":null,"newStatus":"open","changedAt":"2026-09-04T19:17:03.593Z"},
 {"id":2,"requestId":1,"previousStatus":"open","newStatus":"in_progress","changedAt":"2026-09-04T19:17:25.895Z"},
 {"id":3,"requestId":1,"previousStatus":"in_progress","newStatus":"resolved","changedAt":"2026-09-04T19:17:40.097Z"},
 {"id":4,"requestId":1,"previousStatus":"resolved","newStatus":"closed","changedAt":"2026-09-04T19:17:40.542Z"}]
```

## Preparación de la base (ejecutada)

* `npm run db:check` → conexión OK, PostgreSQL **17.6**, base `postgres`.
* Migraciones aplicadas en orden: `001_create_requests.sql` → `002_create_request_status_history.sql`.
* Verificado en `pg_constraint`/`information_schema`: PKs, FK, CHECKs de prioridad/estado,
  `previous_status` nullable, índice `request_status_history_request_id_idx`.
* Per la pregunta 6: verificación desde **cero** (sin seed, determinista).