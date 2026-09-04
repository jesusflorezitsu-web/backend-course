# Request API — Entrega 04 (backend persistente)

Request API persistente en **PostgreSQL (Supabase)**: el array en memoria de la entrega 03
fue reemplazado por las tablas `requests` y `request_status_history` sin romper el
contrato HTTP de la clase 3. Cada transición queda registrada en el historial dentro de la
misma transacción.

## Estado de la entrega

Todo lo que el starter v4 dejaba "como tu trabajo" está **completado** y verificado
(11/11 en `activities/class-04/test-matrix.md`):

| Pieza | Estado |
| ----- | ------ |
| `src/database/pool.js` | Completo |
| `scripts/check-database.js` (`db:check`) | Completo |
| `database/migrations/001_create_requests.sql` | Completa |
| `database/migrations/002_create_request_status_history.sql` | Completa (+ índice `request_status_history_request_id_idx`) |
| `database/seed.sql` | Completo (opcional; la verificación arranca desde cero) |
| `src/database/transaction.js` | Completo (`withTransaction`) |
| `src/modules/requests/requests.store.js` | Completo (SQL parametrizado, `db` opcional, `findByIdForUpdate`) |
| `src/modules/requests/requests.service.js` | Completo (5 casos de uso + unidades de trabajo) |
| `src/modules/requests/request.mapper.js` | Completo (`camelCase`, `description ?? ''`, history con `id`/`requestId`) |
| `src/modules/requests/requests.routes.js` | Completo (async, `GET /requests/:id/history`, 400/404/409/503/500) |
| `src/modules/requests/request-status.js` | Completo — sin cambios |

## Puesta en marcha

```bash
# requiere: el archivo .env con DATABASE_URL (Session pooler, puerto 5432)
npm install
npm run db:check   # imprime base y versión — nunca la URL
npm start          # Request API en http://localhost:3000
```

El esquema (migraciones `001` + `002`) ya fue aplicado a la base de datos de la entrega.

## La prueba que define la entrega

```bash
curl -i -X POST http://localhost:3000/requests -H "Content-Type: application/json" \
  -d '{ "title": "Survives restarts" }'
# reiniciar el proceso (Ctrl+C, npm start) y…
curl -i http://localhost:3000/requests/<id>   # 200: los datos sobrevivieron
```

Verificado con evidencia del reinicio (cambio de PID y logs) en
`activities/class-04/test-matrix.md`, caso 9.

## Diseño y reglas

* Documentos oficiales: `activities/class-04/` (`resource-model.md`, `http-contract.md`,
  `transition-map.md`, `test-matrix.md`; `ai-usage.md` y `reflection.md`).
* Consultas **parametrizadas** siempre; un solo pool; clientes liberados en `finally`.
* La transacción usa **un solo cliente** (nunca `pool.query()` dentro de la unidad).
* La transición se valida releyendo el estado con `SELECT ... FOR UPDATE` (cliente
  transaccional), evitando lecturas obsoletas.
* Respuestas en camelCase vía mapper; el historial expone `{ id, requestId,
  previousStatus, newStatus, changedAt }` ordenado cronológicamente.
* `.env` fuera del repositorio; evidencia sin la URL completa.
* Contrato de la clase 3 intacto; `DELETE` sigue sin existir (decisión 001).
* Sin ORM, sin `supabase-js`, sin acceso desde el frontend.