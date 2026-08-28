# Clase 01 · El viaje de una petición

**Entrega 01 — El viaje de una petición**

## Objetivo de la actividad

Construir un servidor HTTP con el módulo nativo **`node:http`** (sin Express y sin dependencias)
que rutee según la URL, responda con el estado y el tipo de contenido correctos, y registre en
la terminal cada petición recibida. El objetivo conceptual es poder explicar el recorrido
completo de una petición: del clic del usuario hasta la respuesta y de regreso.

## Instrucciones de ejecución

```bash
# Desde la raíz del repositorio
cd activities/class-01/src
node server.js
```

El servidor queda escuchando en `http://localhost:3000`. Para detenerlo: `Ctrl + C`.

> El proceso **no** devuelve el control a la terminal a propósito: quedó escuchando. Cerrar la
> terminal o pulsar `Ctrl+C` detiene el servidor y el navegador deja de recibir respuestas.

## Solución desarrollada

`src/server.js` usando únicamente `require('node:http')`:

| Ruta | Estado | Content-Type | Cuerpo |
| ---- | ------ | ------------ | ------ |
| `GET /` | `200` | `text/plain; charset=utf-8` | Texto de bienvenida |
| `GET /health` | `200` | `application/json` | `{"status":"ok"}` |
| `GET /api/info` | `200` | `application/json` | Datos de la app y rutas disponibles |
| Cualquier otra | `404` | `application/json` | `{"error":"Not Found"}` |

Además, cada petición se registra en la terminal con método y URL:

```txt
Servidor escuchando en http://localhost:3000
GET /
GET /health
GET /api/info
GET /no-existe
```

## Evidencia reproducible

```txt
$ curl -i http://localhost:3000/health
HTTP/1.1 200 OK
Content-Type: application/json

{"status":"ok"}

$ curl -i http://localhost:3000/no-existe
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error":"Not Found"}
```

## Diagrama del recorrido de una petición

```
┌─────────┐  1. URL    ┌───────────────┐  2. petición HTTP   ┌───────────────┐
│Usuario  │ ─────────► │  Navegador    │ ──────────────────► │  localhost    │
│         │            │  (frontend)   │                     │  :3000        │
└─────────┘            └───────────────┘                     └──────┬────────┘
                                                                    │ 3. llega al puerto
                                                                    ▼
                                                          ┌─────────────────────┐
                                                          │ Proceso de Node.js  │
                                                          │ 4. recibe petición  │
                                                          │ 5. inspecciona URL  │
                                                          │ 6. decide respuesta │
                                                          │ 7. completa respuesta│
                                                          └─────────────────────┘
                                                                    │
              8. navegador recibe y presenta  ◄─────────────────────┘
              ┌───────────────┐
              │  Frontend     │
              └───────────────┘
```

**Dirección y propósito de cada pieza:**

* **Dirección:** `http://localhost:3000` — la máquina donde está el proceso que responde.
* **Puerto:** `3000` — la "puerta" numerada donde ese proceso espera.
* **URL/ruta:** la parte que sigue al host (`/health`, `/api/info`) — sobre qué se pide.
* **Backend:** el proceso de Node que permanece activo, escucha y decide qué responder.
* **Respuesta:** la información que viaja de vuelta; debe cerrarse explícitamente (`end()`) para
  que el navegador la considere completa.

**Ideas clave del recorrido:**

* El navegador (cliente) **siempre inicia** la conversación; el servidor responde.
* Cada paso puede fallar por separado (petición que no llega ≠ llegó y falló ≠ llegó bien y la
  interfaz hizo otra cosa).
* Un `404` es una respuesta correcta del servidor: informa que el recurso no existe; no es un
  servidor caído.

## Falla diagnosticada (del laboratorio de fallas)

**Falla elegida:** `fault-2.js` — la ruta de salud escrita como `/helth`.

1. **Comportamiento observado:** el servidor arranca normal, la terminal muestra la línea de
   inicio y las peticiones sí llegan (aparecen en el log). Al visitar `/health` se recibe una
   respuesta rápida con estado `404` y el cuerpo `{"error":"Not Found"}`.
2. **Hipótesis inicial:** "el servidor está mal ruteado": algo no coincide en la comparación de
   la ruta de salud.
3. **Evidencia revisada:** el log registra la petición `GET /health`; el servidor responde
   `404`, es decir, ningún `if` coincidió. Probé otras rutas (`/`, `/api/info`) y responden
   bien, lo que descarta un problema general del proceso.
4. **Causa encontrada:** la ruta declarada en el código es `'/helth'` (falta la `a`), por lo
   que la comparación exacta `url === '/helth'` nunca se cumple para `/health` y cae en el
   `404` final.
5. **Modificación realizada:** corregí la cadena a `'/health'` y reejecuté `node fault-2.js`.
6. **Resultado:** `GET /health` devuelve ahora `200` con `{"status":"ok"}`.
7. **Explicación final:** HTTP exige coincidencia exacta: las rutas son texto y cualquier
   diferencia (ortografía, mayúsculas, barra inicial) produce una ruta distinta que no existe
   para el servidor. Por eso un `404` con evidencia (el log muestra que la petición llegó)
   apunta a la comparación de la URL, no a la conexión.

## Respuestas al ticket de salida

1. **¿Qué es el frontend y qué es el backend? ¿Cuál es la diferencia esencial?**
   Frontend es lo que se ejecuta en el navegador del usuario y presenta la interfaz; backend es
   un programa distinto que vive en otra máquina/proceso, recibe solicitudes y decide qué
   responder. La diferencia esencial es **dónde se ejecuta** y **quién controla la decisión**:
   el código del frontend está en manos del usuario; el del backend no.
2. **¿Por qué al ejecutar el archivo del servidor la terminal no vuelve?**
   Porque el servidor queda **escuchando**: `server.listen(...)` mantiene vivo el proceso a la
   espera de solicitudes. No terminó, está esperando; el cliente es quien inicia la
   interacción.
3. **Si un usuario dice "no me guarda nada", ¿qué mirarías primero?**
   La **terminal**: verificar si el proceso sigue activo y si registró la llegada de la
   petición. Eso separa "nunca llegó" (problema de conexión/dirección) de "llegó y falló"
   (problema del servidor).
4. **Ordena el recorrido de una petición.**
   URL → el navegador crea la petición → se dirige a un puerto → el proceso de Node la recibe →
   inspecciona la URL → decide qué respuesta producir → completa la respuesta → el navegador
   recibe y presenta el resultado.
5. **Si la terminal muestra el proceso activo y registró la petición, pero el navegador recibe
   404, ¿qué significa?**
   El problema está del lado del servidor: respondió, pero su decisión no coincide con lo
   pedido (ruta mal comparada). Si no hubiera proceso o no llegara nada, el problema estaría
   antes, en la conexión o en la dirección usada.

## Sección de profundización

**Recurso elegido:** *Client–Server Overview* (MDN Web Docs), el recurso esencial del bloque 02.

1. **¿Qué concepto nuevo encontraste?** Que la división cliente-servidor es una separación de
   **responsabilidades y de lugar de ejecución**, y que el servidor también tiene "lenguajes
   de lado servidor" que comparten host con el navegador; lo importante es quién provee el
   almacenamiento y la lógica común.
2. **¿Cómo se relaciona con el servidor que construiste?** Mi `server.js` es el "servidor" del
   diagrama: permanece escuchando y responde a las peticiones del navegador. La lectura explica
   por qué los datos deben vivir del lado servidor para ser compartidos, que es exactamente el
   problema del bloque 01 (el formulario que mentía).
3. **¿Qué parte todavía no comprendes?** Cómo se comporta el servidor cuando recibe muchas
   peticiones al mismo tiempo y qué pasa con una conexión que se interrumpe a mitad de la
   respuesta; la lectura lo menciona pero no con el detalle que voy a ver en clases futuras.
4. **¿Qué evidencia o experimento podrías utilizar para investigarla?** Abrir varias pestañas
   contra el mismo `server.js` (el proceso atiende varias peticiones), y usar la pestaña
   Network para comprobar cómo se agrupan y qué pasa si detengo el proceso con `Ctrl+C`
   mientras una petición está pendiente.

## AI usage

* **¿Usé IA para esta entrega?** Sí.
* **¿Para qué la usé?** Para construir el servidor, documentar la falla del laboratorio y
  redactar este README.
* **¿Qué sugerencia acepté?** La estructura de ruteo por `if`/`return` con `writeHead` +
  `end`, que mantiene el código legible sin frameworks y refleja exactamente la secuencia de
  la presentación (decisión → respuesta → corte con `return`).
* **¿Qué sugerencia rechacé o modifiqué?** La IA propuso inicialmente usar Express y devolver
  HTML en `/api/info`; lo rechacé porque el entregable exige `node:http` sin dependencias y
  porque esa ruta está pensada para otro programa (JSON). También rechacé una versión que
  devolvía `404` como `text/plain`: el `Content-Type` debe ser `application/json`.
* **¿Cómo comprobé el resultado?** Ejecuté `node server.js` y probé las cuatro rutas con
  `curl -i`, verificando la línea de estado y el cuerpo literal de cada respuesta, más los
  logs en la terminal.

## Reflexión breve

Lo que parecía mágico en la clase 1 se volvió observable: el servidor es un programa que
escucha, decide y responde, y cada petición deja rastro en la terminal y en la pestaña Network.
La distinción entre "no llegó", "llegó y falló" y "llegó bien pero la interfaz hizo otra cosa"
es la herramienta de diagnóstico que voy a usar todo el trimestre.