# course-progress-evidence-01-07

Paquete de evidencia para el diagnóstico acumulativo 7 en 1.
Generado automáticamente — completa las secciones marcadas con [COMPLETAR] antes de ejecutar el prompt.

## Metadata

* studentId: [COMPLETAR — tu identificador de estudiante, sin datos personales extra]
* promptVersion: ITSU-CHECKPOINT-01-07-1.0
* rubricVersion: BACKEND-01-07-R1
* generatedAt: 2026-09-29T14:55:12.411Z (EXECUTED_NOW)
* repoRoot: backend-course
* commit: d2c3c7c (EXECUTED_NOW)
* repositorioRemoto: https://github.com/jesusflorezitsu-web/backend-course.git (EXECUTED_NOW) — verifica que sea TU repositorio antes de continuar
* modeloUtilizado: [COMPLETAR después de ejecutar el prompt]

### Contexto de git (informativo, EXECUTED_NOW)

El curso se trabaja en computadoras compartidas: el historial local puede
estar incompleto o pertenecer a otra sesión sin que falte trabajo real.
Este contexto NO es evidencia requerida — la evidencia son los archivos
del repositorio remoto del estudiante y sus respuestas. La ausencia de
commits aquí no debe interpretarse como evidencia faltante.

```text
d2c3c7c docs: registrar entregas class-06 y class-07 en el README
09a62e1 feat(class-07): OPS-703 trazabilidad completa (request id, logs, error handler, health/ready) + entregables y validacion 12/12 PASSED
edfbb31 fix(class-07): INC-701 e INC-702 resueltos con validacion de contrato y pruebas de regresion
39b1f14 chore(class-07): taller en estado entregado (baseline con los 3 incidentes reproducibles)
7463f70 feat(class-06): FEATURE-206 endpoint de historial + entregables y validacion 12/12 PASSED
2fb236b fix(class-06): BUG-106 resuelto - una coleccion filtrada vacia responde 200 con []
5f623d2 chore(class-06): taller en estado entregado (entorno listo, BUG-106 presente)
2fb641d docs: agregar README raiz para las clases 02 y 04 (indice de entregas y proceso)
```

## Evidencia por clase

Los archivos listados existen en el repositorio (FOUND). Un archivo de salida guardado, como validation-evidence.txt, es TEXTO: demuestra que se guardó, no que se ejecutó (NOT_VERIFIED como ejecución).

### Clase 01 — Fundamentos de backend

* FOUND: activities\class-01\README.md
* FOUND: activities\class-01\lab\fault-1.js
* FOUND: activities\class-01\lab\fault-2.js
* FOUND: activities\class-01\lab\fault-3.js
* FOUND: activities\class-01\lab\fault-4.js
* FOUND: activities\class-01\lab\fault-5.js
* FOUND: activities\class-01\lab\fault-6.js
* FOUND: activities\class-01\src\server.js

Extracto de activities\class-01\README.md (redactado automáticamente):

```text
# Clase 01 · El viaje de una petición

**Entrega 01 — El viaje de una petición**

## Objetivo de la actividad

Construir un servidor HTTP con el módulo nativo **`node:http`** (sin Express y sin dependencias)
que rutee según la URL, responda con el estado y el tipo de contenido correctos, y registre en
la terminal cada petición recibida. El objetivo conceptual es poder explicar el recorrido
completo de una petición: del clic del usuario hasta la respuesta y de regreso.

## Instrucciones de ejecución

```bash
# Desde la raíz del repositorio
cd activities/class-01/src
node server.js
```

El servidor queda escuchando en `http://localhost:3000`. Para detenerlo: `Ctrl + C`.

> El proceso **no** devuelve el control a la terminal a propósito: quedó escuchando. Cerrar la
> terminal o pulsar `Ctrl+C` detiene el servidor y el navegador deja de recibir respuestas.

## Solución desarrollada

`src/server.js` usando únicamente `require('node:http')`:

| Ruta | Estado | Content-Type | Cuerpo |
| ---- | ------ | ------------ | ------ |
[... 160 líneas más]
```

### Clase 02 — HTTP y contratos

* FOUND: activities\class-02\Actividad 1 API Lite\README.md
* FOUND: activities\class-02\Actividad 1 API Lite\lite-analysis.md
* FOUND: activities\class-02\Actividad 1 API Lite\package-lock.json
* FOUND: activities\class-02\Actividad 1 API Lite\package.json
* FOUND: activities\class-02\Actividad 1 API Lite\server.js
* FOUND: activities\class-02\Actividad 2 API Full\README.md
* FOUND: activities\class-02\Actividad 2 API Full\ai-usage.md
* FOUND: activities\class-02\Actividad 2 API Full\casos-de-prueba.md
* FOUND: activities\class-02\Actividad 2 API Full\comparison.md
* FOUND: activities\class-02\Actividad 2 API Full\docs\http-contract.md
* FOUND: activities\class-02\Actividad 2 API Full\package-lock.json
* FOUND: activities\class-02\Actividad 2 API Full\package.json
* … 10 archivo(s) más con el mismo patrón

Extracto de activities\class-02\Actividad 2 API Full\docs\http-contract.md (redactado automáticamente):

```text
# Contrato HTTP — Request API Full

> Este documento define la promesa que hace la API antes de implementarla. El código que sigue
> en `src/routes/requests.routes.js` es la manera de cumplir este contrato.

## Recurso

Una **solicitud** (`request`) representa una petición de mantenimiento reportada por un usuario
(ej. un proyector que no enciende, una silla rota o una caída de Wi-Fi). Cada solicitud tiene un
identificador único y numérico, un título obligatorio, una descripción opcional, un estado y una
prioridad. Este sistema es un CRUD de solo lectura y creación: solo expone listar, consultar por
id y crear.

### Forma del recurso

| Campo         | Tipo      | Obligatorio | Quién lo asigna | Notas                                             |
| ------------- | --------- | ----------- | --------------- | ------------------------------------------------- |
| `id`          | number    | Sí          | Servidor        | Generado con `generateId()`, autoeincremental.   |
| `title`       | string    | Sí          | Cliente         | Único campo que el servidor exige.                        |
| `description` | string    | No          | Cliente         | Si no llega, se omite del objeto creado.          |
| `status`      | string    | Sí          | Servidor        | No es recibido: el creado siempre nace como `'open'`.     |
| `priority`    | string    | No          | Cliente         | Si no llega, se omite del objeto creado.          |

---

## Endpoint 1 — Listar solicitudes

| Elemento              | Valor                          |
| --------------------- | ------------------------------ |
| Método                | GET                            |
[... 106 líneas más]
```

Extracto de activities\class-02\Actividad 1 API Lite\README.md (redactado automáticamente):

```text
# Request API Lite

Una API pequeña construida con Express que administra **solicitudes de mantenimiento**.
Todo vive en un solo archivo (`server.js`) y los datos se guardan en memoria: cada vez que
reinicias el servidor, la lista vuelve a su estado inicial.

Cada solicitud tiene esta forma:

```json
{
  "id": 1,
  "title": "Projector does not turn on",
  "description": "The projector in room 204 shows no image during class.",
  "status": "open",
  "priority": "high"
}
```

## Requisitos

* Node.js 18 o superior (`node --version`).
* Conexión a internet la primera vez, para instalar Express.

## Instalación

Ubícate en la carpeta del proyecto e instala las dependencias:

```bash
cd request-api-lite
npm install
[... 57 líneas más]
```

### Clase 03 — Recursos, estado y reglas

* FOUND: activities\class-03\README.md
* FOUND: activities\class-03\ai-usage.md
* FOUND: activities\class-03\cuestionario-diseno.md
* FOUND: activities\class-03\http-contract.md
* FOUND: activities\class-03\project\README.md
* FOUND: activities\class-03\project\docs\decisions\001-cancel-instead-of-delete.md
* FOUND: activities\class-03\project\docs\http-contract.md
* FOUND: activities\class-03\project\package-lock.json
* FOUND: activities\class-03\project\package.json
* FOUND: activities\class-03\project\src\app.js
* FOUND: activities\class-03\project\src\modules\requests\request-status.js
* FOUND: activities\class-03\project\src\modules\requests\requests.routes.js
* … 9 archivo(s) más con el mismo patrón

Extracto de activities\class-03\resource-model.md (redactado automáticamente):

```text
# Resource model — MaintenanceRequest

> Fase 1 · se completó **antes de usar IA y antes de tocar código**.

## Nombre del recurso

**MaintenanceRequest** — el registro de una incidencia o solicitud de mantenimiento dentro
del sistema.

## Propiedades

| Propiedad    | Tipo   | Ejemplo                                   |
| ------------ | ------ | ----------------------------------------- |
| `id`         | number | `4` (secuencial, generado por el servidor)      |
| `title`      | string | `"Projector does not turn on"`           |
| `description`| string | `"The projector in room 204 shows no image."` |
| `status`     | string | `"in_progress"`                          |
| `priority`   | string | `"high"`                                 |
| `createdAt`  | string | `"2026-08-29T10:00:00.000Z"` (ISO 8601) |
| `updatedAt`  | string | `"2026-08-29T10:00:00.000Z"` (ISO 8601) |

## Campos requeridos

Únicamente **`title`**. Sin un título que describa el problema principal, la solicitud no se
puede crear.

## Campos opcionales

* **`description`**: si no se envía, se guarda como string vacío `""`.
* **`priority`**: si el cliente no la envía al crear, el servidor asigna `"medium"` por
[... 34 líneas más]
```

Extracto de activities\class-03\README.md (redactado automáticamente):

```text
# Entrega 03 · Recursos, estado y reglas

> Metodología de la clase: **diseño propio (fase 1, sin IA) → tag `class-03-design` →
> implementación asistida (fase 2) → verificación (fase 5) → tag `class-03-submission`.**

## Entregables

| Archivo | Contenido |
| ------- | --------- |
| `cuestionario-diseno.md` | Base del diseño: respuestas del estudiante antes de la IA |
| `resource-model.md` | Modelo de recursos (`MaintenanceRequest`) |
| `http-contract.md` | Contrato HTTP de la API v3 |
| `transition-map.md` | Mapa de transiciones de estados |
| `test-matrix.md` | Matriz de prueba: 8 casos obligatorios + 2 propios, con evidencia |
| `ai-usage.md` | Registro honesto del uso de IA (dónde se usó y dónde no) |
| `reflection.md` | Reflexión personal del proceso |
| `project/` | Implementación (ver su `README.md`) |

## Proyecto

La implementación vive en [`project/`](project/README.md): API de solicitudes de
mantenimiento con recursos, estado y reglas. Ver su README para ejecutar.

## Cómo fue el proceso

1. **Fase 1 (sin IA):** cuestionario de diseño respondido por el estudiante.
2. **Commit + tag `class-03-design`:** sella el diseño antes de cualquier código (sin IA).
3. **Fase 2 (con IA):** implementación en `project/` a partir del starter de la clase 3;
   se respetaron las decisiones del diseño (sin `DELETE`, filtros combinables, `PATCH`
   parcial, decisión 001).
[... 9 líneas más]
```

### Clase 04 — PostgreSQL y persistencia

* FOUND: activities\class-04\README.md
* FOUND: activities\class-04\ai-usage.md
* FOUND: activities\class-04\cuestionario-diseno.md
* FOUND: activities\class-04\http-contract.md
* FOUND: activities\class-04\project\.gitignore
* FOUND: activities\class-04\project\README.md
* FOUND: activities\class-04\project\database\migrations\001_create_requests.sql
* FOUND: activities\class-04\project\database\migrations\002_create_request_status_history.sql
* FOUND: activities\class-04\project\database\seed.sql
* FOUND: activities\class-04\project\docs\decisions\001-cancel-instead-of-delete.md
* FOUND: activities\class-04\project\docs\http-contract.md
* FOUND: activities\class-04\project\package-lock.json
* … 18 archivo(s) más con el mismo patrón

Extracto de activities\class-04\README.md (redactado automáticamente):

```text
# Clase 04 · De SQL al backend persistente

> Metodología de la clase: **diseño propio (fase 1, sin IA) → tag
> `class-04-design` → implementación asistida (fase 2) → verificación (fase 5)
> → tag `class-04-submission`.**
>
> Estudiante: jesusflorez.itsu@gmail.com

## Entregables

| Archivo | Contenido |
| ------- | --------- |
| `cuestionario-diseno.md` | Base del diseño: respuestas del estudiante antes de la IA |
| `resource-model.md` | Modelo de recursos persistente (`requests`, historial) |
| `http-contract.md` | Contrato HTTP de la API v4 |
| `transition-map.md` | Mapa de transiciones de estados |
| `test-matrix.md` | Matriz de prueba: **11/11 con evidencia en Supabase** |
| `ai-usage.md` | Registro honesto del uso de IA |
| `reflection.md` | Reflexión personal del proceso |
| `project/` | Implementación persistente (ver su `README.md`) |

## Proyecto

La implementación vive en [`project/`](project/README.md): Request API persistente
sobre **PostgreSQL (Supabase)** con transacciones e historial. Ver su README para
la puesta en marcha (`db:check`, migraciones `001`/`002`).

## Cómo fue el proceso

1. **Fase 1 (sin IA):** cuestionario de diseño respondido por el estudiante.
[... 17 líneas más]
```

### Clase 05 — Autenticación y autorización

* FOUND: activities\class-05\entregas\05A\.gitignore
* FOUND: activities\class-05\entregas\05A\README.md
* FOUND: activities\class-05\entregas\05A\ai-usage.md
* FOUND: activities\class-05\entregas\05A\index.html
* FOUND: activities\class-05\entregas\05A\main.js
* FOUND: activities\class-05\entregas\05A\package-lock.json
* FOUND: activities\class-05\entregas\05A\package.json
* FOUND: activities\class-05\entregas\05A\src\api.js
* FOUND: activities\class-05\entregas\05A\src\esc.js
* FOUND: activities\class-05\entregas\05A\src\views.js
* FOUND: activities\class-05\entregas\05A\styles.css
* FOUND: activities\class-05\entregas\05A\vite.config.js
* … 56 archivo(s) más con el mismo patrón

Extracto de activities\class-05\project\activities\class-05\auth-contract.md (redactado automáticamente):

```text
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
[... 92 líneas más]
```

Extracto de activities\class-05\project\activities\class-05\validation-evidence.md (redactado automáticamente):

```text
# Evidencia de validación — Clase 05

Resultados reales del validador oficial (`scripts/validate-class-05.js`) al
cerrar cada estación. No contiene secretos.

Nota de infraestructura: la máquina de trabajo no alcanza el pooler de sesión
(5432) de Supabase, pero sí el pooler transaccional (6543), por lo que
`DATABASE_URL` apunta a `:6543`. Las migraciones `003_create_users.sql`,
`004_add_request_ownership.sql` y `005_add_history_actor.sql` se aplicaron en
orden con `OK` para cada archivo; la instancia es PostgreSQL 17.6.

## stage setup

```
CLASS 05 VALIDATION — stage: setup

✓ Database connection
✓ Previous schema
✓ Authentication migrations
✓ Existing request endpoints
✓ No committed secrets

RESULT: 5/5
```

## stage access-design

```
Validado 3/3 (matriz de acceso, contrato de autenticación y casos de amenaza)
```
[... 87 líneas más]
```

### Clase 06 — Onboarding y pruebas

* FOUND: activities\class-06\taller\project\.gitignore
* FOUND: activities\class-06\taller\project\README.md
* FOUND: activities\class-06\taller\project\activities\class-06\README.md
* FOUND: activities\class-06\taller\project\activities\class-06\ai-usage.md
* FOUND: activities\class-06\taller\project\activities\class-06\reflection.md
* FOUND: activities\class-06\taller\project\activities\class-06\validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-06\taller\project\activities\class-06\work-log.md
* FOUND: activities\class-06\taller\project\database\migrations\001_create_users.sql
* FOUND: activities\class-06\taller\project\database\migrations\002_create_requests.sql
* FOUND: activities\class-06\taller\project\database\migrations\003_create_request_history.sql
* FOUND: activities\class-06\taller\project\database\migrations\004_add_constraints_and_indexes.sql
* FOUND: activities\class-06\taller\project\package-lock.json
* … 44 archivo(s) más con el mismo patrón

Extracto de activities\class-06\taller\project\activities\class-06\work-log.md (redactado automáticamente):

```text
# Class 06 work log

## Environment

What did I configure?
Which command confirmed that it worked?

- Copié `.env.example` a `.env` y completé `DATABASE_URL` (session pooler de
  Supabase, puerto 5432) y `JWT_SECRET` generado con `npm run generate:secret`.
- `npm install` + `npm run class-06:doctor` (primera vez: 5/5 PASS, faltaban
  esquema y seed) + `npm run db:migrate` (aplicó 001→004; segunda ejecución
  todo `[SKIPPED]`) + `npm run db:seed` (2 requesters, 1 agent, 6 solicitudes,
  15 eventos de historial).
- Confirmado con `npm run class-06:doctor` → `Environment ready.` y 10/10 PASS.

## Request flow

Where does the request enter?
Where is authentication checked?
Where is authorization checked?
Where is PostgreSQL accessed?

- Entra por `src/app.js`: CORS → `express.json()` → routers.
- `/requests` está montada en `app.js` detrás del middleware `authenticate`
  (src/middleware/authenticate.js), que valida el JWT y construye `req.auth`;
  sin token válido responde 401 y el router nunca corre.
- Autorización: `request.policy.js` (agente ve todo; requester solo lo propio),
  invocada desde `requests.service.js`. Para la nueva ruta se reutiliza
  `canViewHistory` (misma política de «view»).
- PostgreSQL: solo `requests.store.js` (queries parametrizadas); cada operación
[... 93 líneas más]
```

Extracto de activities\class-06\taller\project\activities\class-06\validation-evidence.txt (redactado automáticamente):

```text
CLASS 06 FINAL VALIDATION

Environment
[01/12] Database is reachable .............. PASS
[02/12] Migrations are complete ............ PASS
[03/12] Seed data is available ............. PASS

Regression
[04/12] Valid empty collection returns 200 .. PASS
[05/12] Empty collection returns [] ........ PASS

History endpoint
[06/12] Authentication is required ......... PASS
[07/12] Owner can read history ............. PASS
[08/12] Stranger cannot read history ....... PASS
[09/12] Agent can read history ............. PASS
[10/12] Missing request returns 404 ........ PASS
[11/12] Events are ordered correctly ....... PASS
[12/12] Sensitive information is hidden .... PASS

Cleanup
Temporary validation data removed successfully.

FINAL RESULT: PASSED
```

### Clase 07 — Diagnóstico y errores

* FOUND: activities\class-07\taller\project\.gitignore
* FOUND: activities\class-07\taller\project\README.md
* FOUND: activities\class-07\taller\project\activities\class-07\README.md
* FOUND: activities\class-07\taller\project\activities\class-07\ai-usage.md
* FOUND: activities\class-07\taller\project\activities\class-07\incident-report.md
* FOUND: activities\class-07\taller\project\activities\class-07\reflection.md
* FOUND: activities\class-07\taller\project\activities\class-07\validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-07\taller\project\database\migrations\001_create_users.sql
* FOUND: activities\class-07\taller\project\database\migrations\002_create_requests.sql
* FOUND: activities\class-07\taller\project\database\migrations\003_create_request_history.sql
* FOUND: activities\class-07\taller\project\database\migrations\004_add_constraints_and_indexes.sql
* FOUND: activities\class-07\taller\project\incidents\INC-701-invalid-request-id.md
* … 54 archivo(s) más con el mismo patrón

Extracto de activities\class-07\taller\project\activities\class-07\incident-report.md (redactado automáticamente):

```text
# Class 07 incident report

Completa cada sección MIENTRAS investigas. Separa hechos de
interpretaciones: un "creo que" pertenece a Hypotheses, no a Evidence.

## Baseline

`npm run class-07:doctor` → **Environment ready for incident response.** los 7
checks en PASS (entorno, conexión a la base, migraciones, seed, app, test
runner, fixtures de incidentes).
`npm run db:migrate` → todo `[SKIPPED]`: las migraciones 001-004 ya estaban
aplicadas de la clase 06 y el seed presente (heredado del taller anterior).
`npm run incidents:reproduce` sobre el código recibido → los tres incidentes ya
aparecían **RESOLVED** (el repositorio de referencia incluía la solución). Para
ver el síntoma real de cada incidente revoqué temporalmente UNA corrección a la
vez (`git stash`-de-editor, respaldo previo), reproduje el fallo y restauré el
fix: así cada incidente se observó ANTES y DESPUÉS de su corrección con
evidencia reproducible.

## Incident 701

### Report

"Some request identifiers return an internal server error." Un integrador arma
enlaces hacia solicitudes y algunos devuelven 500; "a veces funciona y a veces
no".

### Reproduction

`GET /requests/not-a-number` con token válido de cualquier usuario
[... 309 líneas más]
```

Extracto de activities\class-07\taller\project\activities\class-07\validation-evidence.txt (redactado automáticamente):

```text
CLASS 07 INCIDENT VALIDATION
Generated by jesus (jesusflorez.itsu@gmail.com) against the real Supabase project.
Commands executed from activities/class-07/taller/project.

--------------------------------------------------------------------------
1. ENVIRONMENT CHECK   (npm run class-07:doctor)
--------------------------------------------------------------------------

> class-07-request-api@7.0.0 class-07:doctor
> node scripts/check-environment.js

CLASS 07 ENVIRONMENT CHECK

[01/07] Environment configured ............... PASS
[02/07] Database connection established ...... PASS
[03/07] Migrations available ................. PASS
[04/07] Seed data available .................. PASS
[05/07] Application can be imported .......... PASS
[06/07] Test runner available ................ PASS
[07/07] Incident fixtures available .......... PASS

Environment ready for incident response.

--------------------------------------------------------------------------
2. INCIDENT REPRODUCTION AFTER FIXES   (npm run incidents:reproduce)
--------------------------------------------------------------------------

> class-07-request-api@7.0.0 incidents:reproduce
> node scripts/reproduce-incidents.js

[... 80 líneas más]
```

## Estado previo a la clase 8

* Validadores disponibles (clases 1-7): activities\class-05\project\scripts\validate-class-05.js, activities\class-06\taller\project\scripts\validate-class-06.js, activities\class-07\taller\project\scripts\validate-class-06.js, activities\class-07\taller\project\scripts\validate-class-07.js, class-08-starter\scripts\validate-class-06.js, class-08-starter\scripts\validate-class-07.js
* Carpetas de pruebas: NOT_FOUND
* Último commit antes del taller: d2c3c7c

## Cuestionario diagnóstico (responde aquí, 3-6 líneas cada una)

Sé específico: cita archivos o rutas concretas de TU proyecto cuando puedas. La extensión no suma.

### Pregunta clase 01

Describe qué ocurre desde que una petición llega al backend hasta que sale una respuesta y explica por qué el servidor debe permanecer activo.

Respuesta: [COMPLETAR]

### Pregunta clase 02

Elige un endpoint del proyecto y explica cómo método, ruta, body y status forman su contrato.

Respuesta: [COMPLETAR]

### Pregunta clase 03

Explica, usando una solicitud del proyecto, la diferencia entre representación, dato inválido y transición incompatible con el estado actual.

Respuesta: [COMPLETAR]

### Pregunta clase 04

Explica la diferencia entre migración, seed y transacción, e indica dónde aparece cada concepto en el proyecto.

Respuesta: [COMPLETAR]

### Pregunta clase 05

Explica la diferencia entre autenticación y autorización y por qué un JWT decodificado todavía debe verificarse.

Respuesta: [COMPLETAR]

### Pregunta clase 06

Elige una prueba del proyecto, identifica preparación, acción y comprobación, y explica qué regresión protege.

Respuesta: [COMPLETAR]

### Pregunta clase 07

Describe un fallo investigado distinguiendo síntoma, hipótesis y causa; luego indica qué señal correspondería a health o readiness.

Respuesta: [COMPLETAR]

---
Nota de seguridad: este paquete fue generado excluyendo .env y redactando
posibles secretos. Revisa una vez más antes de pegarlo en un modelo:
si ves una credencial real, reemplázala por [REDACTED] y avisa al docente.
