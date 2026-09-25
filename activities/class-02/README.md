# Clase 02 · HTTP como contrato

> Metodología de la clase: **análisis previo (fase 1, sin IA) → tag
> `class-02-lite-analysis` → implementación asistida (fase 2) → verificación
> (fase 5) → tag `class-02-submission`.**
>
> Estudiante: jesusflorez.itsu@gmail.com

## Entregables

La entrega 02 tiene dos partes:

| Carpeta | Contenido | Estado |
| ------- | --------- | ------ |
| [`Actividad 1 API Lite`](Actividad%201%20API%20Lite/) | Primera API con Express: rutas, estados y tipos de contenido en un solo `server.js`, datos en memoria. Incluye `lite-analysis.md` (análisis previo a la IA) y evidencia de SDK/curl. | ✅ `class-02-lite-analysis` |
| [`Actividad 2 API Full`](Actividad%202%20API%20Full/) | Segunda API: mismo recurso, pero organizada en `app.js` / `server.js` / rutas / datos, con contrato HTTP escrito antes que el código (`docs/http-contract.md`), `casos-de-prueba.md`, `comparison.md` y `ai-usage.md`. | ✅ `class-02-submission` |

## Cómo ejecutar

Cada actividad trae sus propias instrucciones dentro de su `README.md`:

```bash
# Actividad 1 — API Lite
cd "activities/class-02/Actividad 1 API Lite"
npm install && node server.js

# Actividad 2 — API Full
cd "activities/class-02/Actividad 2 API Full"
npm install && npm start
```

Ambas quedan escuchando en `http://localhost:3000`.

## Conclusión de la clase

- HTTP es un **contrato**: la misma petición debe producir siempre la misma
  respuesta observable (estado, tipo de contenido, cuerpo).
- La organización de archivos (server vs app vs rutas vs datos) prepara lo que
  después serán módulos: cada archivo debe poder defender su responsabilidad.
- La comparación entre **Lite** y **Full** (`Actividad 2 API Full/comparison.md`)
  documenta por qué se pasó de un archivo único a una estructura por
  responsabilidades.