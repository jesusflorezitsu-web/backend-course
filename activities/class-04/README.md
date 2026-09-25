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
2. **Commit + tag `class-04-design`:** sella el diseño antes de cualquier código.
3. **Fase 2 (con IA):** implementación en `project/` sobre el starter v4; se
   respetaron las decisiones del diseño (historial en transacción, índice de
   historial, `FOR UPDATE` en PATCH, evento `history` con `id`/`requestId`).
4. **Fase 5 (verificación):** `test-matrix.md` ejecutado contra la base real
   (11/11) con evidencia registrada.
5. **Commit + tag `class-04-submission`:** entrega final, sincronizada con
   GitHub.

## Conclusión de la clase

- La persistencia **no rompió el contrato HTTP** de la clase 3: el mismo cuerpo
  y los mismos estados, ahora garantizados por SQL y transacciones.
- El historial de cada transición vive dentro de la **misma transacción** que
  modifica la solicitud: o se registran los dos cambios o ninguno.
- `db`, `withTransaction`, el store y el servicio están separados para poder
  inyectar un `pg` o una transacción en las pruebas.