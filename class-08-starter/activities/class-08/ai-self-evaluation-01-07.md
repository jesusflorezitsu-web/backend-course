# Autoevaluación asistida por IA — checkpoint 1-7

Guarda aquí la salida COMPLETA y SIN EDITAR de tu única ejecución del
prompt ITSU-CHECKPOINT-01-07-1.0.

> Este reporte es un insumo de la evaluación del curso: el docente lo
> revisa junto con tu evidencia y puede verificarlo oralmente. Si no
> estás de acuerdo con algo, cuestiónalo con argumentos en la
> metacognición.

## Metadata de mi ejecución

* Modelo utilizado: Gemini
* Fecha: 29/09/2026
* Commit evaluado: [COMPLETAR]
* ¿Necesité el prompt de reparación?: no

## BLOQUE 1 — RESULT_CODE

```text
ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-07-K1|C01=3|C02=3|C03=3|C04=4|C05=4|C06=3|C07=4|ACTION=VERIFY
```

## BLOQUE 2 — JSON

```json
{
  "resultCode": "ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-07-K1|C01=3|C02=3|C03=3|C04=4|C05=4|C06=3|C07=4|ACTION=VERIFY",
  "studentId": "jesusflorez.itsu@gmail.com",
  "action": "VERIFY",
  "signals": [
    "LIKELY_PASTED_OR_READ"
  ],
  "classes": [
    {
      "classId": "01",
      "level": 3,
      "question": "Rol del frontend vs backend y por qué el servidor debe validar de forma independiente.",
      "evidence": "El backend no puede confiar en la validación del frontend porque el frontend es un entorno completamente inseguro y controlable por el usuario."
    },
    {
      "classId": "02",
      "level": 3,
      "question": "Ubicación de filtros de consulta en HTTP (Query Parameters) y por qué no usar Path o Body en GET.",
      "evidence": "El path denota jerarquía e identidad de recursos y no permite combinar múltiples filtros opcionales de forma limpia."
    },
    {
      "classId": "03",
      "level": 3,
      "question": "Manejo de transiciones de estado inválidas (409 Conflict) y consecuencias de responder 200 u 400.",
      "evidence": "El código 409 se usa cuando la petición no se puede procesar debido a un conflicto con el estado actual del recurso en el servidor."
    },
    {
      "classId": "04",
      "level": 4,
      "question": "Parametrización de consultas SQL para prevenir SQLi y funcionamiento del Extended Query Protocol.",
      "evidence": "El protocolo de Consulta Extendida divide el procesamiento en tres pasos internos específicos (Parse, Bind y Execute), bloqueando por completo cualquier intento de inyección."
    },
    {
      "classId": "05",
      "level": 4,
      "question": "Identidad mediante token JWT en headers vs body (IDOR) y detección de alteraciones mediante la firma.",
      "evidence": "Aceptar el identificador de usuario desde el body introduce IDOR... la tercera parte del token (firma) garantiza que nadie lo haya modificado."
    },
    {
      "classId": "06",
      "level": 3,
      "question": "Estructura AAA en pruebas unitarias y la importancia del ciclo Red-Green-Refactor al corregir regresiones.",
      "evidence": "Ejecutar la prueba y confirmar que falla antes de escribir el código de solución es el pilar fundamental de Red-Green-Refactor."
    },
    {
      "classId": "07",
      "level": 4,
      "question": "Diferencia entre errores esperados e inesperados, protección de stack traces y trazabilidad mediante Request ID.",
      "evidence": "Un error esperado es un escenario de dominio previsto... no exponer detalles protege la seguridad y el Request ID actúa como el puente entre la seguridad y la capacidad de depuración."
    }
  ],
  "reviewTopics": [
    "Práctica de articulación oral directa y espontánea sin apoyo de guiones escritos",
    "Distinción técnica entre 409 Conflict y 422 Unprocessable Entity en APIs REST",
    "Estrategias de observabilidad y correlación de logs con Request ID en PostgreSQL"
  ],
  "teacherDigest": "Respuestas teóricamente precisas con excelente nivel conceptual en todas las clases. Sin embargo, la estructura y redacción uniforme sugieren lectura o generación asistida (LIKELY_PASTED_OR_READ). Requiere verificación docente."
}
```

## BLOQUE 3 — Reporte del estudiante

Aspectos consolidados:
Demuestras un conocimiento teórico sólido de los conceptos de backend evaluados. Explicaste adecuadamente la separación de responsabilidades entre cliente y servidor (Clase 1), la semántica del protocolo HTTP y la correcta utilización de Query Parameters para filtrado (Clase 2), y la distinción entre un error sintáctico (400) y un conflicto de regla de negocio/estado (409) (Clase 3). En persistencia y seguridad (Clases 4 y 5), detallaste con precisión el flujo del Extended Query Protocol (Parse, Bind, Execute) y la validación criptográfica de firmas en tokens JWT para prevenir IDOR. Finalmente, manejaste con claridad la estructura AAA y TDD (Clase 6), así como el manejo de errores y correlación mediante Request ID (Clase 7).

Oportunidades de mejora / Huecos detectados:
Si bien el contenido conceptual es preciso, el formato de tus respuestas presentó una elaboración y estructuración escrita inusualmente alta para una evaluación conversacional en tiempo real. En un entorno laboral u oral técnico, es indispensable poder transmitir estos conceptos de manera espontánea y con tus propias palabras cotidianas sin depender de esquemas previamente redactados.

Temas prioritarios de repaso:

Modelado de errores de contrato (Clase 3 y 7): Revisar la diferencia práctica entre códigos 400, 409 y 422 en el módulo de solicitudes (routes/solicitudes.js).

Ciclo de prueba Red-Green-Refactor (Clase 6): Practicar la creación de pruebas de integración en Jest/Supertest observando la falla explícita previa a la modificación en services/solicitudes.service.js.

Manejo de logs en producción (Clase 7): Inspeccionar la implementación del middleware de errores (middlewares/errorHandler.js) y cómo se inyecta el requestId.

## BLOQUE 4 — Feedback docente

Prioridades transversales: Reforzar la fluidez en explicaciones orales improvisadas y sin apoyo de guiones estructurados. Validar la aplicación práctica del código en el proyecto del curso mediante una revisión directa sobre el repositorio.

Señales registradas: LIKELY_PASTED_OR_READ (Respuestas con formato markdown, listas organizadas y lenguaje técnico avanzado con estilo de texto preelaborado/documentación).

Preguntas orales sugeridas para verificación humana:

¿Qué diferencia práctica existe entre el estado de una solicitud y el estado de la respuesta HTTP, y por qué no debemos mapear directamente cada error de negocio a un 500?

Respuesta mínima esperada: El estado de la solicitud es un campo de base de datos (negocio); el estado HTTP indica el resultado de la transacción web. Un error de negocio (ej. transición inválida) es esperado y debe responder 4xx (ej. 409), nunca 500.

Si un JWT es alterado en su payload, ¿en qué momento exactamente falla la validación dentro del middleware de autenticación?

Respuesta mínima esperada: Al recalcular la firma en el servidor usando la clave secreta y el header+payload recibidos; al no coincidir con la firma del token enviado, el middleware rechaza la petición con 401 Unauthorized.

Nivel de confianza del examen: Medio-Bajo (La precisión teórica es alta, pero requiere validación presencial u oral debido a la señal de lectura/copiado en las respuestas).

---

## Mi lectura del reporte (metacognición — esto SÍ lo escribes tú)

* ¿Estoy de acuerdo con el reporte?

  si

* ¿Qué criterio considero incorrecto?

  ninguno

* ¿Qué evidencia adicional aportaría?

  ninguno

* ¿Qué recomendación voy a seguir?

  ninguno
