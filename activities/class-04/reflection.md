# Reflexión — Entrega 04

La clase 4 (persistencia con PostgreSQL/Supabase) deja aprendizajes distintos a los de la
clase 3: allí el reto era el contrato en memoria; aquí el reto fue **hacer que la base de
datos garantice lo que el código antes garantizaba por costumbre**.

## ¿Qué funcionó?

- Trasladar las invariantes al esquema: `CHECK` de prioridad/estado, `title NOT NULL`,
  `previous_status` nullable (el nacimiento) y CHECK sobre los cinco estados cerraron en
  la BD lo que en clase 3 era código en memoria. La base ahora rechaza sola los datos
  inválidos, sin importar cómo lleguen.
- La decisión del **índice** de historial salió del análisis (no "por si acaso"): el
  endpoint nuevo filtra por `request_id` y el historial crece con cada transición; quedó
  justificado en el documento y verificado en `pg_indexes`.
- **Leer el estado con `FOR UPDATE` dentro de la transacción**: valido la transición sobre
  el estado actual y concurrente, no sobre una copia obsoleta. Es la diferencia entre
  "parece válido" y "es válido".
- La prueba **"sobrevive al reinicio"** como prueba definitoria: cambia el eje del
  verificador — ya no importa solo la respuesta correcta, importa que los datos no se
  pierdan. Evidenciar el reinicio con el cambio de PID del proceso y los logs fue la forma
  de demostrarlo sin acoplar la evidencia a la columna de lo esperado.
- `db:check` que imprime base y versión pero jamás la cadena: el secreto se quedó solo en
  `.env` (ignorado por git) durante toda la verificación.

## ¿Qué costó o no resultó?

- El **orden del flujo** quedó matizado: la base del starter v4 se armó con IA antes del
  análisis de diseño (decisión del estudiante de continuar desde el starter). Los
  documentos oficiales llegaron después y refinaron el código. Funcionó, pero fue la
  segunda clase en la que el ideal "diseño primero" se aplica con permiso del material del
  curso; conviene ser consciente del trade-off (documentado en `ai-usage.md`).
- **Un servidor fantasma**: había otra instancia del mismo proyecto (una copia anterior en
  OneDrive/DBE) ocupando el puerto 3000; ante el primer `curl` respondió esa instancia y
  no la nuestra, con una ruta de stacktrace distinta. Costó detective work: identificar el
  PID, confirmar su ruta con `Win32_Process` y detenerlo. Lección: **verificar qué proceso
  está escuchando el puerto antes de validar** — el mismo tipo de suposición que en la
  clase 3 (ubicación de la entrega), ahora sobre el entorno de ejecución.
- **Comillas de PowerShell con `curl`**: mandar JSON inline con `"` dentro de un argumento
  se rompía (mangling de PowerShell hacia `curl.exe`). La solución fue escribir los
  cuerpos en archivos y usar `--data "@archivo"`. Pequeño, pero real.
- La cadena de conexión contiene **apóstrofes en la contraseña** (`Jesus'Florez'270906`).
  Funciona, pero es una señal de higiene: convendría rotarla o usar caracteres sin
  necesidad de escape en URIs.

## Evaluación del contrato v4

- Los códigos del starter (`INVALID_FILTER`, `NO_UPDATABLE_FIELDS`, etc.) más los nuevos
  `DATABASE_UNAVAILABLE`/`INTERNAL_ERROR` dan un mapa de error completo: el cliente
  distingue qué hizo mal (400/404/409) de cuándo el servidor o la base tienen problemas
  (503/500).
- El historial como tabla separada (no un array en memoria) hizo que cada transición
  quedara **evidenciable**: `GET /requests/1/history` mostró el ciclo de vida completo
  (nace `open`, avanza, se resuelve y se cierra) tras el reinicio.
- La ausencia de `DELETE` se mantuvo (decisión 001): con el historial, "cancelar" es más
  poderoso que "borrar" porque conserva el rastro.

## Próximos pasos para el proyecto del trimestre

- Aplicar en el `project/` final el patrón ganador de esta clase: esquema con CHECKs e
  índice para las lecturas, transacciones con lectura bloqueante y verificación que
  incluya pruebas de persistencia y de indisponibilidad de la base.
- Probar también el escenario `503 DATABASE_UNAVAILABLE` en la verificación final (fuera
  de la matriz de la clase 4, como caso extra opcional).