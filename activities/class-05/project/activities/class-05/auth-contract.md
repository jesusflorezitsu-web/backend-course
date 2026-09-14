# Contrato de autenticación — Request API v5

**Cómo llenar:** cada endpoint es una ficha; los campos pendientes están
marcados con tres guiones bajos. Reemplaza cada marca con tu decisión; en los
bloques de código escribe la respuesta completa.

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
| ¿Público o protegido? | ___ |
| Campos permitidos en el body | ___ |
| Campos que producen rechazo explícito | ___ |
| Reglas del email | ___ |
| Reglas de la password | ___ |

Respuesta de éxito (código + body con TODOS sus campos):

```http
___
```

Errores:

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| Campo controlado por el servidor en el body | ___ | ___ |
| Email inválido | ___ | ___ |
| Password fuera de las reglas | ___ | ___ |
| Email ya registrado | ___ | ___ |

## POST /auth/login

| Campo | Decisión |
| ----- | -------- |
| ¿Público o protegido? | ___ |
| Body permitido | ___ |

Respuesta de éxito (código + body: el token y sus dos acompañantes):

```http
___
```

Errores — atención: las tres filas deben tener EXACTAMENTE la misma respuesta.
¿Por qué?: ___

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| Email inexistente | ___ | ___ |
| Password incorrecta | ___ | ___ |
| Cuenta no disponible | ___ | ___ |

## GET /auth/me

| Campo | Decisión |
| ----- | -------- |
| ¿Público o protegido? | ___ |
| Qué devuelve | ___ |
| Qué JAMÁS devuelve | ___ |

Respuesta de éxito:

```http
___
```

Errores:

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| Sin header Authorization o sin esquema Bearer | ___ | ___ |
| Token inválido, alterado o expirado | ___ | ___ |

## Semántica de errores (el criterio, no solo ejemplos)

| Frase | Código HTTP | ¿Cuándo lo usas en esta API? |
| ----- | ----------- | ---------------------------- |
| "No sé quién eres" | ___ | ___ |
| "Sé quién eres; esto no" | ___ | ___ |
| "Para ti, no existe" | ___ | ___ |
| "Existe, pero choca" | ___ | ___ |
