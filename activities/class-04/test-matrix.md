# Test matrix — Entrega 04

> Matriz base definida en la fase de diseño. La columna **observado** se completa durante la
> verificación final (API real contra Supabase). Regla: la evidencia se registra con `curl -i`
> y/o logs reales de la respuesta — nunca copiando la columna *esperado*.

## Casos obligatorios v4 (pregunta 18)

| # | Caso | Petición | Esperado | Observado |
| - | ---- | -------- | -------- | --------- |
| 1 | Crear correctamente | `POST /requests` | `201 Created` con el objeto creado | |
| 2 | Listar con filtros válidos combinados | `GET /requests?status=open&priority=high` | `200 OK` con arreglo filtrado | |
| 3 | Filtrar con valor desconocido | `GET /requests?priority=urgent` | `400 Bad Request` (`INVALID_FILTER`) | |
| 4 | Consultar inexistente | `GET /requests/999` | `404 Not Found` (`REQUEST_NOT_FOUND`) | |
| 5 | Ver historial con nacimiento | `GET /requests/1/history` | `200 OK` con 1 evento (`previousStatus: null`) | |
| 6 | Transición válida y su evento en historia | `PATCH /requests/1` (`in_progress`) | `200 OK` y nuevo registro en `GET /requests/1/history` | |
| 7 | Transición inválida | `PATCH /requests/1` (`open`, desde `in_progress`) | `409 Conflict` (`INVALID_STATUS_TRANSITION`) | |
| 8 | Modificar cerrada | `PATCH /requests/1` (`closed`) | `409 Conflict` (`REQUEST_IN_TERMINAL_STATUS`) | |
| 9 | Sobrevive al reinicio | `POST` → restart del proceso → `GET /requests/<id>` | `200 OK` devolviendo los datos persistidos | |

## Casos adicionales propios (pregunta 19)

| # | Caso | Petición | Esperado | Observado |
| - | ---- | -------- | -------- | --------- |
| 10 | Historial de recurso inexistente | `GET /requests/999/history` | `404 Not Found` (`REQUEST_NOT_FOUND`) | |
| 11 | Mutar con payload vacío | `PATCH /requests/1` con `{}` | `400 Bad Request` (`NO_UPDATABLE_FIELDS`) | |

## Verificación del reinicio (pregunta 17)

La prueba #9 se registra evidenciando **las tres partes**:

1. Cabeceras HTTP reales de la respuesta (`curl -i`).
2. Cuerpo JSON retornado tras el levantamiento del proceso.
3. Logs que constaten que el proceso Node.js efectivamente se detuvo y volvió a
   levantarse entre el POST y el GET (datos leídos desde PostgreSQL, no desde el proceso).

## Preparación de la base

* Migraciones ejecutadas en orden: `001_create_requests.sql` → `002_create_request_status_history.sql`.
* Per la pregunta 6: la verificación arranca **desde cero** (determinista). El `seed.sql`
  opcional queda disponible solo para depuración manual local, no para la evidencia.