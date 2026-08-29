# Test matrix — Entrega 03

> Fase 1: se declara el resultado **esperado**. Fase 5: se ejecuta cada caso con `curl`
> contra el proyecto corriendo y se registra el resultado **observado** (línea de estado
> literal y cuerpo). La columna observado se llena ejecutando, no copiando la esperada.

## Casos obligatorios

| Caso                   | Petición                      | Estado previo | Resultado esperado                    | Resultado observado |
| ---------------------- | ----------------------------- | ------------- | ------------------------------------- | ------------------- |
| Crear correctamente    | `POST /requests`              | —             | `201`                                 |                     |
| Crear sin título       | `POST /requests`              | —             | `400` (VALIDATION_ERROR)              |                     |
| Consultar inexistente  | `GET /requests/999`           | —             | `404` (NOT_FOUND)                     |                     |
| Filtrar sin resultados | `GET /requests?status=closed` | —             | `200 []`                              |                     |
| Cambiar prioridad      | `PATCH /requests/1`           | `open`        | `200` (priority cambia)               |                     |
| Transición válida      | `PATCH /requests/1`           | `open`        | `200` (status pasa a `in_progress`)   |                     |
| Transición inválida    | `PATCH /requests/1`           | `open`        | `409` (INVALID_STATUS_TRANSITION)     |                     |
| Modificar cerrada      | `PATCH /requests/1`           | `closed`      | `409` (REQUEST_IN_TERMINAL_STATUS)    |                     |

## Casos propios

| Caso                                   | Petición                             | Estado previo | Resultado esperado                                  | Resultado observado |
| -------------------------------------- | ------------------------------------ | ------------- | --------------------------------------------------- | ------------------- |
| Filtrar con valor inválido             | `GET /requests?priority=super_high`  | —             | `400` (INVALID_FILTER_VALUE)                        |                     |
| PATCH solo con campos del servidor     | `PATCH /requests/1`                  | `open`        | `400` (VALIDATION_ERROR: sin campos modificables)   |                     |

## Evidencia

_(Pendiente de ejecución en la fase 5. Se pegarán aquí las salidas de `curl -i` de al menos
los casos de transición inválida y de solicitud terminal: son la prueba de que las reglas
están protegidas.)_

```txt

```