# Casos de prueba — Request API Full

Verificación manual con `curl.exe` contra `http://localhost:3000`. Cada caso registra el
resultado **observado** (código HTTP y cuerpo), no el esperado.

## Endpoint 1 — Listar solicitudes (`GET /requests`)

| # | Caso                                          | Resultado esperado | Resultado observado  | Estado |
| - | --------------------------------------------- | ------------------ | -------------------- | ------ |
| 1 | Listar con datos iniciales                    | 200 + arreglo (3)  | 200 + arreglo (3)    | ✅ Pasa |
| 2 | Listar tras crear una solicitud               | 200 + arreglo (n+1)| 200 + arreglo (5)    | ✅ Pasa |

## Endpoint 2 — Consultar una solicitud (`GET /requests/:id`)

| # | Caso                                          | Resultado esperado | Resultado observado             | Estado |
| - | --------------------------------------------- | ------------------ | ------------------------------- | ------ |
| 3 | Consultar un id existente (`/requests/1`)     | 200 + objeto       | 200 + objeto                    | ✅ Pasa |
| 4 | Consultar un id recién creado (`/requests/5`) | 200 + objeto       | 200 + objeto                    | ✅ Pasa |
| 5 | Consultar un id inexistente (`/requests/999`) | 404 + `{"error":"Request not found"}` | 404 + `{"error":"Request not found"}` | ✅ Pasa |

## Endpoint 3 — Crear una solicitud (`POST /requests`)

| # | Caso                                          | Resultado esperado | Resultado observado                         | Estado |
| - | --------------------------------------------- | ------------------ | ------------------------------------------- | ------ |
| 6 | Crear con `title` y `description` válidos     | 201 + objeto con `id` nuevo y `status:"open"` | 201 + `{"id":5,"title":"Broken projector cable","description":"...","status":"open"}` | ✅ Pasa |
| 7 | Crear con `title` de solo espacios            | 400 + `{"error":"Title is required"}` | 400 + `{"error":"Title is required"}` | ✅ Pasa |
| 8 | Crear sin campo `title`                       | 400 + `{"error":"Title is required"}` | 400 + `{"error":"Title is required"}` | ✅ Pasa |
| 9 | Crear con campos extra (`id`, `status`)       | 201 + servidor ignora esos campos | 201 + `{"id":7,"title":"Hacked","priority":"high","status":"open"}` | ✅ Pasa |

## Reglas transversales

| # | Caso                                          | Resultado esperado | Resultado observado    | Estado |
| - | --------------------------------------------- | ------------------ | ---------------------- | ------ |
| 10| Ruta inexistente (`/nope`)                    | 404                | 404                    | ✅ Pasa |
| 11| `id` se asigna automáticamente (5, luego 7)   | Autoincremental    | 5 y 7 (no 999)         | ✅ Pasa |
| 12| `status` inicial siempre `open` en creadas    | `open`             | `open`                 | ✅ Pasa |

**Conclusión:** los 12 casos pasan. El servidor cumple el contrato HTTP definido en
`docs/http-contract.md`: listar, consultar y crear, con las reglas de error (`400`/`404`) y de
creación (`id` y `status` asignados por el servidor).
