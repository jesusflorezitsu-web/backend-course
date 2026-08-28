# Análisis del proyecto Lite

> Documento completado con el análisis independiente de **jesus** (sin IA) antes de usar
> herramientas de generación de código. Guardado con el tag `class-02-lite-analysis`.
> Método usado: **ejecutar, observar, registrar**.

## 1. Cómo ejecuté la API

Comando:

```bash
node server.js
```

Qué apareció en la terminal:

```txt
Request API Lite is running on http://localhost:3000
```

Observaciones:

* El servidor quedó escuchando en el puerto 3000.
* Los datos iniciales son 3 solicitudes en memoria (se pierden al reiniciar).

> **Nota sobre el entorno Windows/Microsoft PowerShell 5.1:** el comando de POST escrito para
> bash/Linux (`-d "{\"title\":...}"`) falla en PowerShell porque la shell destruye las comillas
> dobles internas y llega al servidor un JSON partido (400 de `body-parser` ANTES de tocar la
> API). Para observar el comportamiento REAL del servidor con JSON válido se usó la misma
> petición con el payload en un archivo temporal y `-d @payload.json`. Ambas evidencias están
> en la sección 3.

## 2. Tabla de análisis

| Endpoint | Intención | Entrada | Respuesta actual | Problema | Propuesta |
| -------- | --------- | ------- | ---------------- | -------- | --------- |
| `GET /getRequests` | Listar todas las solicitudes | — | `200 OK` + array JSON con 3 solicitudes (ids 1, 2, 3) | Correcto en método y estado, pero el nombre de la ruta no sigue la convención REST (verbo "get" + camelCase); el recurso debería llamarse `/requests` | `app.get('/requests', (req, res) => res.json(requests))` (con alias si se quiere retrocompatibilidad) |
| `GET /requests` | Listar todas las solicitudes | — | `404 Not Found` + HTML `Cannot GET /requests` | La ruta REST de la colección NO existe: el recurso se nombra distinto según dónde (inconsistencia de nombres) | Añadir `app.get('/requests', (req, res) => res.json(requests));` |
| `GET /requests/1` | Devolver la solicitud con id = 1 | `id=1` (existe) | `200 OK` + objeto JSON de la solicitud | Correcto. Método GET, parámetro `:id` y estado 200 con la representación del recurso | Sin cambios |
| `GET /requests/999` | Devolver la solicitud con id = 999 | `id=999` (no existe) | `200 OK` + `{"error":"Request not found"}` | CONTRADICCIÓN: 200 afirma éxito, pero el cuerpo dice que no existe; un "no encontrado" debe ser 404 | `res.status(404).json({ error: 'Request not found' });` |
| `POST /requests` · JSON válido | Crear una nueva solicitud | body `{title, description, priority}` | `200 OK` + solicitud creada (id 4) | Método y ruta correctos, pero el estado debería ser 201 Created; el 200 solo afirma "se procesó", no que se creó un recurso. Falta header `Location` | `res.status(201).json(newRequest);` (opcional: `res.set('Location', '/requests/' + newRequest.id)`) |
| `POST /requests` · sin title | Crear una solicitud omitiendo campo obligatorio | body `{description, priority}` (sin `title`) | `200 OK` + `{"id":5,"description":"Roof leak.","status":"open","priority":"high"}` (sin title) | No valida entradas: acepta datos incompletos y los responde como éxito; el recurso queda corrupto (sin título) en memoria | Validar campos (title, description, priority); si falta alguno, `res.status(400).json({ error: 'title is required' })` |
| `GET /requests/5` (libre) | Comprobar si el registro roto quedó guardado | `id=5` | `200 OK` + `{"id":5,"description":"Roof leak.","status":"open","priority":"high"}` | Confirma la consecuencia del POST sin título: el dato corrupto se sirve con 200 como si fuera válido | Al validar el POST se evita que existan registros incompletos |
| `GET /requests/abc` (libre) | Pedir una solicitud con id no numérico | `id=abc` | `200 OK` + `{"error":"Request not found"}` | `Number('abc')` = NaN: nunca coincide, pero responde 200 en vez de un 400/404 honesto; el id de la URL no se valida | Validar el parámetro: si no es entero positivo, `res.status(400).json({ error: 'Invalid id' })` |
| `POST /requests` · sin body (libre) | Crear una solicitud sin cuerpo ni Content-Type | sin body | `500 Internal Server Error` (HTML) por `TypeError: Cannot read properties of undefined (reading 'title')` en `server.js:53` | Error de servidor por no manejar un body ausente; el cliente recibe un 500 sin JSON, difícil de interpretar | Inicializar/validar `req.body` antes de leer propiedades; responder 400 con mensaje claro |

## 3. Evidencia

Peticiones con `-i` (línea de estado + encabezados + cuerpo).

```txt
1) GET /getRequests
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 462

[{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"},{"id":2,"title":"Broken chair in the lab","description":"One chair in the computer lab has a loose back rest.","status":"in-progress","priority":"medium"},{"id":3,"title":"Wi-Fi drops in the library","description":"The connection drops every few minutes on the second floor.","status":"open","priority":"low"}]

2) GET /requests
HTTP/1.1 404 Not Found
Content-Type: text/html; charset=utf-8

Cannot GET /requests

3) GET /requests/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 150

{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"}

4) GET /requests/999
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 29

{"error":"Request not found"}

5) POST /requests (payload en archivo por Windows) → curl -i -X POST http://localhost:3000/requests -H "Content-Type: application/json" -d @payload.json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 107

{"id":4,"title":"Leaking faucet","description":"Bathroom third floor.","status":"open","priority":"medium"}

6) POST /requests sin title (payload: {"description":"Roof leak.","priority":"high"})
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 69

{"id":5,"description":"Roof leak.","status":"open","priority":"high"}

7) GET /requests/5 — el registro roto fue guardado y se sirve como válido
HTTP/1.1 200 OK

{"id":5,"description":"Roof leak.","status":"open","priority":"high"}

7b) GET /requests/abc
HTTP/1.1 200 OK

{"error":"Request not found"}

7c) POST /requests sin body ni Content-Type
HTTP/1.1 500 Internal Server Error
Content-Type: text/html; charset=utf-8

TypeError: Cannot read properties of undefined (reading 'title')
    at file:///.../server.js:53:21

-- Ejecución textual del comando del cuestionario en PowerShell (JSON roto por la shell):
HTTP/1.1 400 Bad Request

SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2)
```

## 4. Preguntas guía

1. **¿Qué recurso representa esta API y cómo se nombra en cada una de sus rutas?**
   El recurso es la "solicitud de mantenimiento". Se nombra así en las rutas:
   `GET /getRequests` (lista, camelCase + verbo "get"), `GET /requests/:id` (uno por id) y
   `POST /requests` (crea). Hay una inconsistencia: para la MISMA colección, la lista se llama
   `/getRequests` pero el resto usa `/requests`. Además, el nombre con verbo y camelCase no es
   la convención REST, que nombra la ruta por el sustantivo y deja la acción al método HTTP.
   Resultado visible: `GET /requests` responde 404, porque la ruta de la colección solo está
   registrada bajo `/getRequests`.

2. **¿Qué método HTTP corresponde a cada intención, y coincide con el que usa el código?**
   - Listar → GET → el código lo hace con `GET /getRequests` (método correcto, ruta mal
     nombrada; falta `GET /requests`).
   - Obtener uno → GET → `GET /requests/:id` (correcto).
   - Crear → POST → `POST /requests` (correcto).
   En resumen: los métodos son correctos para cada intención; fallan el nombre de la ruta de
   lista y los estados de respuesta.

3. **¿Qué código de estado devuelve cada respuesta y qué afirma exactamente ese código?**
   - `200 OK` (`GET /getRequests`, `GET /requests/1`): afirma que la petición se procesó bien
     y que el cuerpo es la representación pedida.
   - `404` (`GET /requests`): afirma que la ruta/recurso NO existe.
   - `200 OK` (`GET /requests/999`): afirma procesamiento correcto, aunque el recurso no
     existe (afirmación FALSA).
   - `200 OK` (POST): afirma que la operación se procesó, pero NO afirma que se haya creado
     nada (para eso existe `201 Created`).
   - `200 OK` (POST sin title): afirma éxito aunque creó un recurso inválido.
   - `400` (JSON roto por la shell): afirma que la petición estaba mal formada.
   - `500` (POST sin body): afirma que falló el SERVIDOR (error interno).

4. **¿Hay alguna respuesta cuyo estado contradiga su propio cuerpo?**
   Sí, dos:
   - `GET /requests/999` → `200 OK` + `{"error":"Request not found"}`. El 200 afirma éxito;
     el cuerpo afirma que no existe. Debería ser 404.
   - `POST` sin title → `200 OK` + objeto sin título. El 200 afirma éxito; el cuerpo muestra
     un recurso incompleto.
   El más directamente observable es el 999 con cuerpo de error.

5. **¿Qué entradas acepta el servidor sin comprobarlas, y qué consecuencia tiene aceptarlas?**
   - `title`, `description`, `priority`: no se validan. Un POST sin title crea el registro
     `{"id":5,...}` sin título (evidencia 6), que luego `GET /requests/5` sirve con 200 como
     si fuera válido. Consecuencia: datos corruptos persistidos en memoria.
   - `priority`: no se comprueba que sea high/medium/low.
   - `id` en la URL: no se valida; `/requests/abc` llega como NaN y responde 200 con cuerpo de
     error en lugar de 400.
   - Body ausente: si el POST no envía cuerpo ni Content-Type el servidor reventó con 500
     (TypeError leyendo `req.body.title` en server.js:53), sin dar un JSON de error.

6. **¿Cómo distinguiría un cliente automático un éxito de un error sin leer el cuerpo?**
   Debe confiar SOLO en la línea de estado: 2xx = éxito, 4xx/5xx = error. Es el contrato
   HTTP. Pero esta API lo rompe: devuelve 200 OK en casos que son error (registro no
   encontrado, creación incompleta), así que un cliente automático que respete el estándar le
   creería al 200 y trataría los errores como éxito. Para ser robusto tendría que leer el
   cuerpo, algo que no debería necesitar hacer.

7. **¿Qué parte del comportamiento observado no podía deducirse leyendo solo las rutas?**
   - El esquema del recurso (id, title, description, status, priority).
   - El estado inicial de los datos (3 registros en memoria, no una BD).
   - El autoincremento de id (nextId arranca en 4).
   - Que un "no encontrado" responde 200 con cuerpo de error.
   - Que no hay validación de entrada (se guardan registros sin título).
   - Que POST sin cuerpo revienta con 500.
   - Que la lista inicial siempre es la misma (se pierde todo al reiniciar).
   Todo eso está en `server.js`, no en el contrato de rutas.

8. **¿Qué supuesto haría fallar a otra persona que consuma esta API sin ver el código?**
   - Que `GET /requests` liste las solicitudes → obtiene 404.
   - Que un 200 OK garantice éxito → creería que `/requests/999` existe o que el POST sin
     título creó algo correcto.
   - Que POST devuelva siempre el recurso completo → el registro 5 no tiene título.
   - Que el id sea numérico → `/requests/abc` también responde 200.

## 5. Conclusión

El problema más grave es el uso de **200 OK para situaciones que son errores** (no
encontrado, creación sin validación) y, ligado a eso, la **ausencia total de validación de
entrada**. Es el más grave porque el contrato HTTP —la línea de estado— es lo único que un
cliente que no conoce el código tiene garantizado para decidir éxito o fallo: los nombres de
las rutas se aprenden leyendo la documentación, pero un 200 OK que llega con un cuerpo de
error corrompe la lógica de CUALQUIER consumidor, incluso del que ya usó la API varias veces:
si el cliente revisa solo el estado, tratará el "Request not found" como un recurso válido; si
solo lee el cuerpo, no sabrá qué estados son confiables. La falta de validación agrava todo:
el servidor garantiza con un 200 que guardó bien algo que en realidad quedó incompleto y con
datos basura persistidos en memoria. Los otros defectos (ruta `/getRequests` fuera de
convención, 500 con body ausente, id no validado) son graves pero acotados: la ruta se
descubre y se corrige una vez, mientras que un contrato de estados engañoso hace que cada
consumidor confíe en datos incorrectos, que es el peor tipo de fallo en una API.