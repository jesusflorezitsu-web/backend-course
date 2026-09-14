# Cuestionario de diseño — Clase 05 (debes responderlo SIN usar IA)

Este cuestionario es la "Estación 1" del taller. Con tus respuestas se completarán
`access-matrix.md`, `auth-contract.md` y `threat-cases.md`. El validador
(`--stage access-design`) abre el checkpoint `class-05-access-design` cuando los
tres documentos estén completos; a partir de ese momento la IA puede ayudar a
implementar. Las respuestas deben salir de lo visto en clase y del material del
taller, no de mí.

Los valores permitidos en la matriz (exactos, tal cual): `Sí` · `No` · `Propias`
· `Propia` · `Propia y abierta`. Para la columna Agent puede usarse además
`Todas`, como en la fila de ejemplo de la plantilla.

---

## 1. Matriz de acceso

Completa cada celda. (Todavía no rellenes el `.md`; responde aquí y luego se transcribe.)

| Operación | Anónimo | Requester | Agent |
| --------- | ------- | --------- | ----- |
| `POST /auth/register` | | | |
| `POST /auth/login` | | | |
| `GET /auth/me` | | | |
| `GET /requests` | | | |
| `GET /requests/:id` | | | |
| `GET /requests/:id/history` | | | |
| `POST /requests` | | | |
| Editar título/descripción | | | |
| Cambiar prioridad | | | |
| Cambiar estado | | | |

## 2. Campos controlados por el servidor

**2.1.** En `POST /auth/register`, ¿qué campos del body debe rechazar la API
(no aceptarlos jamás, aunque vengan mezclados con email/password)? Lista varios.

- Respuesta:

**2.2.** ¿Qué respuesta exacta (HTTP + `error.code`) produce enviar uno de esos
campos en el registro?

- Respuesta:

**2.3.** En `POST /requests`, ¿qué campos del body quedan controlados por el
servidor y cómo se resuelven? (piensa en `createdBy` y `status`).

- Respuesta:

## 3. Solicitudes heredadas (`created_by IS NULL`)

**3.1.** ¿Quién las ve en `GET /requests` (requester, agent, o ambos)? ¿Por qué?
**3.2.** ¿Qué responde `GET /requests/:id` sobre una heredada a un requester?
¿Y a qué responde por una solicitud de otro requester?

- Respuesta:

## 4. Contrato de autenticación

### 4.1. POST /auth/register
- ¿Público o protegido?
- Campos permitidos en el body.
- Reglas del email (¿qué se hace con mayúsculas y espacios? ¿cuándo es inválido?).
- Reglas de la password (mínimo/caracteres).
- Respuesta de éxito: escribe el código HTTP y el body COMPLETO (todos los campos).
- Errores (tabla):

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| Campo controlado por el servidor en el body | | |
| Email inválido | | |
| Password fuera de las reglas | | |
| Email ya registrado | | |

### 4.2. POST /auth/login
- ¿Público o protegido?
- Campos permitidos en el body.
- Respuesta de éxito: código + los TRES campos del body (token y sus dos acompañantes).
- ¿Por qué los tres casos de error deben responder EXACTAMENTE igual? Escribe el porqué.
- Errores (tabla; las tres filas idénticas):

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| Email inexistente | | |
| Password incorrecta | | |
| Cuenta no disponible | | |

### 4.3. GET /auth/me
- ¿Público o protegido? ¿Qué esquema de Authorization se acepta (y cuál NO)?
- ¿Qué devuelve en el body? Escribe la respuesta de éxito completa.
- ¿Qué JAMÁS devuelve?
- Errores (tabla):

| Situación | HTTP | error.code |
| --------- | ---- | ---------- |
| Sin header Authorization o sin esquema Bearer | | |
| Token inválido, alterado o expirado | | |

## 5. Semántica de errores

| Frase | Código HTTP | ¿Cuándo lo usas en esta API? |
| ----- | ----------- | ---------------------------- |
| "No sé quién eres" | | |
| "Sé quién eres; esto no" | | |
| "Para ti, no existe" | | |
| "Existe, pero choca" | | |

## 6. ¿Qué contiene el JWT? ¿Qué NO contiene nunca?

- Claims que debe llevar (y con qué valores), firma/alg, y qué material queda fuera.

## 7. Casos adversariales (≥ 8)

Escribe al menos OCHO ataques con la respuesta exacta de tu API (HTTP + `error.code`).
Deben estar, entre otros: escalada de rol en el registro, `createdBy` forjado,
acceso a un ID ajeno, token alterado en el payload, y un PATCH con body mixto.

1.
2.
3.
4.
5.
6.
7.
8.
(opcional: más casos)