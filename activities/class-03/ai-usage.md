# AI Usage — Entrega 03

Registro honesto de dónde y cómo se usó IA en la clase 03, siguiendo la regla del curso:
**primero diseño propio (sin IA) y después implementación asistida, documentada.**

## Fase 1 — Diseño (sin IA)

- El contrato HTTP, el modelo de recursos, el mapa de transiciones y la matriz de prueba
  **los decidió el estudiante** respondiendo el cuestionario de diseño
  (`cuestionario-diseno.md`), a partir de los casos de la clase 2.
- La IA **no** tomó decisiones de diseño: escribió los documentos oficiales
  (`resource-model.md`, `http-contract.md`, `transition-map.md`, `test-matrix.md`) como
  transcriptora de las respuestas del estudiante y los normalizó a las plantillas del curso.

## Fase 2 — Implementación (con IA, autorizada)

- Se reportó al estudiante que el siguiente paso sería implementar con IA; el estudiante
  lo aceptó y entregó además el starter oficial de la clase 3
  (`request-api-v3-starter`) como base.
- La IA generó la implementación completa en `activities/class-03/proyecto/`:
  máquina de estados (`request-status.js`), store en memoria (`requests.store.js`),
  rutas con reglas (`requests.routes.js`) y manejo de errores en `app.js`.
- **Qué se pidió:** generar el código según el contrato previamente acordado.
- **Qué se aceptó:** el código y la estructura `modules/requests/`.
- **Qué se rechazó:** incluir el contenido de `request-api-v3-solucion` (solución del
  profesor: se excluyó del repositorio en `.gitignore`); también se corrigió que la
  implementación **no** debía vivir en `project/` raíz (reservado al proyecto final del
  trimestre) y se reubicó en `activities/class-03/proyecto/`.

## Fase 3 — Verificación (con herramientas de terminal, no decisiones de IA)

- Los 12 casos (8 obligatorios + 2 propios) se ejecutaron con `curl` contra el proyecto
  corriendo y el resultado **observado** quedó registrado en `test-matrix.md`, junto con
  la evidencia literal de los 409 (transición inválida y solicitud terminal).

## Resumen

| Fase | ¿IA? | Producto |
| ---- | ---- | -------- |
| Diseño | No | `resource-model.md`, `http-contract.md`, `transition-map.md`, `test-matrix.md` |
| Implementación | Sí | código en `proyecto/` |
| Verificación | No (terminal) | evidencia en `test-matrix.md` |