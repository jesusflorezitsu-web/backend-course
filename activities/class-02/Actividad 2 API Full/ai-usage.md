# Registro de uso de IA — Request API Full

Esta entrega se construyó **con ayuda de IA** (asistente de código), siguiendo el criterio de la
clase 2: *"construir con IA sin delegar el criterio"*. El contrato se escribió primero; la IA
ayudó a redactar el documento y luego a completar los manejadores `501`; la verificación final
fue manual con `curl`.

## Qué pedí a la IA

| Tarea                          | Qué le pedí                                                                            | Uso que le di                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Contrato HTTP                  | Completar `docs/http-contract.md` a partir de los `TODO` del router y el README.       | Redactar las tablas de recurso, endpoints y reglas transversales.            |
| Implementación                | Reemplazar cada `501` siguiendo los `TODO` (estados 200, 400, 404, 201).               | Generar la lógica de los tres manejadores.                                    |
| Verificación                  | Ejecutar los casos contra `http://localhost:3000` con `curl`.                         | Probar cada endpoint y registrar el resultado observado.                     |
| Comparación y casos de prueba | Redactar `comparison.md` y `casos-de-prueba.md`.                                       | Redactar los documentos con los datos reales de la verificación.             |

## Qué rechacé de lo que la IA podría haber propuesto

Mi criterio fue **mantener el alcance mínimo del curso**. Rechacé explícitamente:

* **Agregar base de datos o persistencia.** El README excluye cualquier BD; los datos viven en
  memoria en `src/data/requests.js`. No se agregó nada.
* **Agregar `PUT` / `PATCH` / `DELETE`.** Aunque la IA podría sugerir un CRUD completo, la
  consigna solo pide listar, consultar y crear. No se agregaron.
* **Agregar capas extra** (controladores, servicios, repositorios), TypeScript o autenticación.
  Todo lo descartado está en la lista explícita "Qué queda fuera" del README.
* **Manejar `description` y `priority` como obligatorios.** El contrato los deja opcionales,
  así que solo se incluyen cuando el cliente los envía.

## Cómo evité delegar el criterio

1. Escribí el **contrato antes** de implementar: `docs/http-contract.md` define método, ruta,
   entrada, respuestas y reglas transversales.
2. La IA ayudó a completar los `501`, pero yo **decidí** los estados y el manejo de campos
   opcionales leyendo los `TODO` y el README.
3. La aceptación final no la dio la IA: la dieron los **12 casos de prueba** ejecutados con
   `curl`, con el resultado observado registrado en `casos-de-prueba.md`.
