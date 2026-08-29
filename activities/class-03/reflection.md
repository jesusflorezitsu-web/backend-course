# Reflexión — Entrega 03

Las respuestas del cuestionario y los errores propios de la implementación dejaron
algunas ideas claras sobre el proceso.

## ¿Qué funcionó?

- Diseñar el contrato **antes** de escribir código: cuando llegué a implementar, cada
  caso ya tenía una respuesta esperada y no me quedé decidiendo sobre la marcha.
- Definir la regla de errores (mismo `{"error":{code,message}}` en toda la API) antes de
  programar: redujo el número de decisiones a mitad de camino.
- La matriz de prueba como documento vivo: marqué el esperado en fase 1 y lo llené con lo
  observado en la fase 5 sin copiar la columna de al lado.

## ¿Qué costó o no resultó?

- Cambié la terminología del modelo a mitad del diseño (el `id` pasó de string a número
  para alinearse al starter) y tuve que reescribir los documentos oficiales. Mejor
  revisar el starter **antes** de fijar el contrato.
- Asumí (y el asistente también) que el entregable iba en `project/` raíz, pero ese
  directorio es el del proyecto final del trimestre. La clase 3 tiene su propio
  `proyecto/`. Costó una refactorización de rutas y documentación, y dejó la lección de
  **verificar el lugar de la entrega como parte del contrato**.
- Lo más interesante: en la clase 2 vi que evitamos confirmar cuáles eran los "métodos
  mágicos" de Express; en la clase 3 el problema fue de ubicación del proyecto. En ambos
  casos el error fue de suposición, no de código.

## Evaluación del contrato

- Los filtros combinables y el `PATCH` parcial con transiciones protegidas se sintieron
  naturales de usar con `curl`.
- El `409` para estados terminales es la regla que más protege al modelo: una vez que se
  cierra una solicitud, no hay forma de que un error de cliente la modifique.
- La falta de `DELETE` me obligó a pensarlo dos veces: se pierde la opción de "borrar,
  borré así nomás", pero se gana trazabilidad. Lo dejé documentado en la decisión 001.

## Próximos pasos para el proyecto del trimestre

- Retomar el `project/` raíz como proyecto personal (hoy reservado y sin código).
- Reutilizar la misma disciplina: contrato → matriz → implementación → evidencia, pero
  esta vez definiendo primero el alcance real del proyecto final y su ubicación exacta.