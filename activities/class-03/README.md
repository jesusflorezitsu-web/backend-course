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
4. **Fase 5 (verificación):** matriz ejecutada con `curl` y evidencia registrada.
5. **Commit + tag `class-03-submission`:** entrega final, sincronizada con GitHub.

## Conclusión de la clase

- El ciclo de vida de una solicitud se protege en el servidor: estados terminales
  inmutables (`409`) y transiciones validadas por la máquina de estados.
- El `project/` raíz queda **reservado** para el proyecto personal de fin de trimestre;
  esta clase usó su carpeta propia (`project/`).