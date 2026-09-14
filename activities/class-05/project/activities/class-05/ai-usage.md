# AI usage

Contenido registrado después del checkpoint `class-05-access-design` (matriz +
contrato + amenazas completos).

## My design before AI

Completé el cuestionario de diseño (matriz de acceso, campos controlados por
servidor, solicitudes heredadas, contrato de autenticación, semántica
401/403/404/409, claims JWT y 15 casos adversariales) y lo transcribí a los tres
documentos oficiales: `access-matrix.md`, `auth-contract.md` y `threat-cases.md`.
El validador aprobó el stage `access-design` (3/3) antes de habilitar IA.

## What I asked

Que el backend implementara, según mi diseño: registro público sin elección de
rol, login con JWT HS256 (claims `sub`, `role`, `iss`, `aud`, `iat`, `exp`),
protección de `/requests`, `createdBy`/`changedBy` como datos de servidor,
política requester/agent con las reglas exactas de la matriz y los códigos de
error del contrato.

## What the AI proposed

- Separación `users` / `auth` / `requests` con stores, mappers, policy y service.
- `token.js` con `jose` para firmar y verificar HS256.
- Middleware `authenticate` que exige esquema `Bearer` y corta antes del router.
- `created_by`/`changed_by` resueltos desde el actor autenticado (nunca del body).
- PATCH "todo o nada": el cuerpo mixto (título+prioridad) no aplica ninguna parte.
- Mover la validación de "por quién se edita" al policy, antes del estado.

## What I accepted

La estructura de módulos, el middleware de autenticación, la resolución del
actor desde el token, el `403` para PATCH mixto y la separación de permisos.
El validador cerró 8/8 stages y 12/12 en la boss battle.

## What I rejected

- Permitir elegir rol en el registro (la matriz exige rol siempre `requester`).
- Un rol "admin": el taller solo define `requester` y `agent`.
- Aceptar `createdBy`/`role` desde el body (campos controlados por servidor).
- Los códigos libres que no coincidían con las estaciones (UNAUTHORIZED,
  WEAK_PASSWORD, ACTION_NOT_ALLOWED, RESOURCE_NOT_FOUND): se corrigieron los
  docs a `AUTHENTICATION_REQUIRED`, `INVALID_PASSWORD`, `FORBIDDEN` y
  `REQUEST_NOT_FOUND` para que documento y contrato coincidieran.

## Security mistakes I detected

- El `404` debe ser idéntico para solicitud ajena, inexistente o heredada: nunca
  revelar si el recurso existe.
- Las filas heredadas (`created_by IS NULL`) son visibles solo para `agent`.
- Los archivos `.env` con `DATABASE_URL` quedan gitignored; el validador
  confirma `No committed secrets`.
- El JWT no se usa como fuente de datos de autorización más allá de la identidad:
  los permisos se re-leen del rol del token y los dueños de las reglas del dominio.

## How I verified the implementation

`npm run db:check` contra la base (PostgreSQL 17.6), migraciones 003→004→005
aplicadas en orden, y el validador oficial por stages: setup 5/5, access-design
3/3, register 2/2, password 1/1, login 2/2, authentication 2/2, ownership 2/2,
authorization 2/2, y boss battle **12/12**. La evidencia cruda está en
`validation-evidence.md`.

## What I still do not understand

Por qué la máquina de trabajo no alcanza el pooler de sesión (5432) de Supabase
pero sí el pooler transaccional (6543); el backend quedó funcionando contra 6543
con la misma base. También quiero profundizar en cuándo conviene `403` vs `404`
cuando el recurso existe pero no es de uno.