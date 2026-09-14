# Contrato de autenticación — Request API v5

### Ficha de ejemplo (endpoint inventado, solo para ver el formato)

| Campo | Decisión |
| ----- | -------- |
| ¿Público o protegido? | Protegido (Bearer) |
| Body permitido | ninguno |

Respuesta de éxito:

```http
200 OK

{ "status": "brewing" }
```

Errores:

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| La tetera está ocupada | 418 | TEAPOT_BUSY |

---

## POST /auth/register

| Campo | Decisión |
| ----- | -------- |
| ¿Público o protegido? | Público |
| Campos permitidos en el body | `email`, `password` |
| Campos que producen rechazo explícito | `role`, `isAdmin`, `isAgent`, `id`, `passwordHash`, `createdAt`, `updatedAt`, `status`, `verified`, `createdBy` → `400 SERVER_CONTROLLED_FIELD` |
| Reglas del email | requerido; se normaliza con `trim()` + `toLowerCase()`; formato `usuario@dominio.tld` |
| Reglas de la password | requerida; entre **15 y 128** caracteres; los espacios están permitidos |

Respuesta de éxito (el rol es siempre `requester`, decidido por el servidor):

```http
201 Created

{
  "id": "e8b9d5f1-9c3a-4b2e-8f7a-1c2d3e4f5a6b",
  "email": "estudiante@ejemplo.com",
  "role": "requester",
  "createdAt": "2026-09-14T15:00:00.000Z"
}
```

Errores:

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| Campo controlado por el servidor en el body | 400 | SERVER_CONTROLLED_FIELD |
| Email inválido | 400 | INVALID_EMAIL |
| Password fuera de las reglas | 400 | WEAK_PASSWORD |
| Email ya registrado | 409 | ACCOUNT_CANNOT_BE_CREATED |

## POST /auth/login

| Campo | Decisión |
| ----- | -------- |
| ¿Público o protegido? | Público |
| Body permitido | `email`, `password` |

Respuesta de éxito:

```http
200 OK

{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOGI5ZDUm...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

Errores — las tres filas tienen EXACTAMENTE la misma respuesta. ¿Por qué?:
porque distinguir entre "el email no existe" y "la contraseña es incorrecta"
permitiría a un atacante enumerar qué cuentas están registradas (user
enumeration). Un único error genérico no confirma ninguna información.

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| Email inexistente | 401 | INVALID_CREDENTIALS |
| Password incorrecta | 401 | INVALID_CREDENTIALS |
| Cuenta no disponible | 401 | INVALID_CREDENTIALS |

## GET /auth/me

| Campo | Decisión |
| ----- | -------- |
| ¿Público o protegido? | Protegido. Solo se acepta el esquema `Bearer <token>`; nunca Basic, tokens sueltos ni `?token=` en la URL |
| Qué devuelve | La identidad del usuario autenticado: `id`, `email`, `role` |
| Qué JAMÁS devuelve | `password`/`password_hash` (ni derivados), ni ningún secreto del servidor |

Respuesta de éxito:

```http
200 OK

{
  "id": "e8b9d5f1-9c3a-4b2e-8f7a-1c2d3e4f5a6b",
  "email": "estudiante@ejemplo.com",
  "role": "requester"
}
```

Errores:

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| Sin header Authorization o sin esquema Bearer | 401 | UNAUTHORIZED |
| Token inválido, alterado o expirado | 401 | INVALID_TOKEN |

## Semántica de errores (el criterio, no solo ejemplos)

| Frase | Código HTTP | ¿Cuándo lo usas en esta API? |
| ----- | ----------- | ---------------------------- |
| "No sé quién eres" | 401 | No hay header Authorization, el esquema no es Bearer, el token está alterado/vencido (UNAUTHORIZED, INVALID_TOKEN) o el login falló con credenciales malas (INVALID_CREDENTIALS) |
| "Sé quién eres; esto no" | 403 | El actor está identificado pero la operación no le corresponde por rol o por estado de la solicitud (ACTION_NOT_ALLOWED) |
| "Para ti, no existe" | 404 | Un requester pide una solicitud ajena o heredada: responde idéntico a un id inexistente (RESOURCE_NOT_FOUND) |
| "Existe, pero choca" | 409 | Email ya registrado (ACCOUNT_CANNOT_BE_CREATED), transición de estado inválida (INVALID_STATUS_TRANSITION) o mutación sobre solicitud cerrada (REQUEST_IN_TERMINAL_STATUS) |