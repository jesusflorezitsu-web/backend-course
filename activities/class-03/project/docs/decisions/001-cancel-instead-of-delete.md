# Decisión 001 — Cancelar en lugar de eliminar

**Fecha:** 2026-08-29
**Estado:** Aceptada
**Decidida por:** estudiante (fase 1, sin IA)
**Ámbito:** Request API v3 · `activities/class-03/proyecto/`

## Contexto

En la clase 2 el contrato analizaba tablas de *requests* donde la operación de borrado
dejaba a medias el historial de mantenimiento de los equipos. Para la clase 3 debía
definirse cómo termina el ciclo de vida de una solicitud y si existe un `DELETE`.

Una solicitud de mantenimiento es **evidencia**: quién la pidió, cuándo, qué se atendió y
cómo se resolvió. Si se elimina, la información desaparece y no queda trazabilidad de los
equipos ni de los tiempos de atención. Además, permitir borrar obliga a decidir qué pasa
con los datos asociados y abre la puerta a errores irreversibles.

## Decisión

La API v3 **no expone `DELETE /requests/:id`**. El ciclo de vida se termina únicamente a
través de los estados terminales:

- `closed` → la solicitud fue atendida y cerrada.
- `cancelled` → la solicitud queda sin efecto (dejó de tener sentido).

Una vez en estado terminal la solicitud es inmutable: cualquier `PATCH` sobre ella
responde `409 REQUEST_IN_TERMINAL_STATUS`. La regla la protege el servidor, no la
costumbre del cliente.

## Consecuencias

### Positivas

- Se conserva el historial completo para auditoría y reportes.
- El estado terminal deja un trazo semántico (cerrada vs. cancelada) que un `DELETE` no
  permitiría distinguir.
- El modelo es más simple: una sola forma de modificar (`PATCH` parcial) con transiciones
  validadas por la máquina de estados.
- La inmutabilidad terminal evita ediciones accidentales sobre información ya resuelta.

### Negativas

- Una solicitud creada por error no puede borrarse; debe encaminarse a `cancelled`.
- Al no existir `DELETE`, cualquier dato erróneo permanece registrado (mitigable
  corrigiendo los campos editables antes del estado terminal).

## Alternativas consideradas

| Alternativa | Decisión |
| ----------- | -------- |
| `DELETE /requests/:id` | Rechazada: pierde trazabilidad, agrega complejidad de referencias y rompe la semántica de un log de mantenimiento. |
| `Destruir` como estado más del ciclo | Rechazada: se confunde con `cancelled`; `cancelled` responde a la intención del solicitante, `destruir` sería redundante. |