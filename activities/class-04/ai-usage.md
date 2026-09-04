# AI Usage — Entrega 04

Registro honesto de dónde y cómo se usó IA en la clase 04, siguiendo la regla del curso:
**primero diseño propio (sin IA) y después implementación asistida, documentada.**

## Fase 1 — Base del starter v4 (con IA, autorizada por el estudiante)

- El estudiante decidió basar la clase 4 en el **starter oficial v4**
  (`request-api-v4-starter`) en lugar de reutilizar por completo los recursos de la clase 3
  (decisión de continuidad documentada durante el armado).
- La IA se limitó a: copiar el starter a `activities/class-04/proyecto/`, completar la
  migración `002` (historial), implementar `withTransaction`, el `request.mapper.js`, el
  `requests.store.js` sobre SQL parametrizado, el `requests.service.js` con los 5
  casos de uso y el `requests.routes.js` async con `GET /requests/:id/history` y la
  traducción de errores (`contract→400`, `resource→404`, `domain→409`, `infra→503`,
  `rest→500`). El estudiante revisó y aceptó esta base.
- Cronología honesta: la base del starter se armó **antes** del cuestionario de diseño de
  la clase 4; por eso los documentos oficiales se escribieron después y el análisis del
  estudiante refinó ese código (ver Fase 2). Es la segunda clase en la que el orden
  deseado "diseño → código" se aplicó con matices; ver `reflection.md`.

## Fase 2 — Diseño (sin IA)

- El estudiante respondió el cuestionario de 19 preguntas (`cuestionario-diseno.md`):
  modelo persistente, CHECKs, índice, `FOR UPDATE`, atomicidad, contrato v4 y matriz.
- La IA **no** tomó decisiones de diseño: transcribió las respuestas a
  `resource-model.md`, `http-contract.md`, `transition-map.md` y `test-matrix.md`.
- Las decisiones del análisis que **se aplicaron al código** (preguntas 4, 11 y 15):
  índice `request_status_history_request_id_idx`, lectura con `SELECT ... FOR UPDATE`
  dentro de la transición, y el evento de historial enriquecido con `id`/`requestId`
  (aditivo sobre el contrato del starter). Commit + tag `class-04-design`.

## Fase 3 — Implementación (con IA, autorizada)

- En realidad la implementación ya existía como base del starter (Fase 1). Tras el diseño
  se aplicaron solo los refinamientos del análisis. No hubo código generado "sobre la
  marcha": todo lo que se tocó responde a una decisión documentada del estudiante.

## Fase 4 — Verificación (con herramientas de terminal, no decisiones de IA)

- `npm run db:check` (conexión real a Supabase, sin exponer la cadena).
- Migraciones `001` y `002` aplicadas en orden y verificadas contra `information_schema`
  y `pg_constraint`.
- Los **11 casos** de la matriz se ejecutaron con `curl -i` contra la API real y el
  resultado observado quedó registrado en `test-matrix.md`, incluida la prueba definitoria
  "sobrevive al reinicio" con evidencia de las tres partes (cabeceras, cuerpo y logs con
  el cambio de PID del proceso).

## Resumen

| Fase | ¿IA? | Producto |
| ---- | ---- | -------- |
| Base starter v4 | Sí (autorizada) | código inicial en `proyecto/` |
| Diseño | No | `cuestionario-diseno.md` + documentos oficiales + refinamientos (índice, `FOR UPDATE`, history) |
| Implementación | Sí (refinamientos del análisis) | ajustes a migración/store/mapper |
| Verificación | No (terminal) | evidencia 11/11 en `test-matrix.md` |