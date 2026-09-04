# Request API v3 — Proyecto de la clase 03

API de solicitudes de mantenimiento con **recursos, estado y reglas** (clase 3).
Proyecto exclusivo de la entrega 03; no debe confundirse con el `project/` raíz, que es
el proyecto personal de fin de trimestre.

## Requisitos

- Node.js LTS (`node --version`)

## Cómo ejecutar

```sh
npm install
npm start
```

Servidor en `http://localhost:3000` (solo memoria, sin persistencia).

## Endpoints

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| `GET` | `/requests` | Lista; filtros opcionales `?status=` y `?priority=` combinables |
| `GET` | `/requests/:id` | Obtiene una solicitud por `id` |
| `POST` | `/requests` | Crea una solicitud (`title` obligatorio) |
| `PATCH` | `/requests/:id` | Actualización parcial con reglas (ver abajo) |

No existe `DELETE`: el ciclo de vida termina en los estados terminales `closed` /
`cancelled`. Ver `docs/decisions/001-cancel-instead-of-delete.md`.

## Reglas de negocio

- Estados: `open → in_progress → resolved → closed` y `open → in_progress → cancelled`
  (con reapertura `resolved → in_progress`).
- Prioridades: `low`, `medium` (default), `high`.
- Estados terminales (`closed`, `cancelled`) son inmutables → `409 REQUEST_IN_TERMINAL_STATUS`.
- Transición no permitida → `409 INVALID_STATUS_TRANSITION`.
- El servidor genera `id`, asigna `status: open` siempre, y sella `createdAt` / `updatedAt`
  (el cliente no puede escribirlos).
- Un mal `PATCH` con **solo** campos del servidor → `400 VALIDATION_ERROR`.
- Filtro con valor desconocido → `400 INVALID_FILTER_VALUE`.

Formato de error único: `{"error":{"code":"...","message":"..."}}`.

## Estructura

```txt
proyecto/
├── package.json
├── src/
│   ├── app.js                   → monta rutas, 404 y manejo de errores
│   ├── server.js               → arranque
│   └── modules/requests/
│       ├── request-status.js   → estados, transiciones, terminales
│       ├── requests.store.js   → datos en memoria + fechas
│       └── requests.routes.js  → endpoints (creación, consulta, PATCH)
└── docs/
    ├── http-contract.md       → contrato HTTP completo de la v3
    └── decisions/
        └── 001-cancel-instead-of-delete.md
```

## Verificación

Los 12 casos (8 obligatorios + 2 propios) se ejecutan y registran en
`../test-matrix.md` con `curl`, incluyendo la evidencia de las reglas protegidas (409).