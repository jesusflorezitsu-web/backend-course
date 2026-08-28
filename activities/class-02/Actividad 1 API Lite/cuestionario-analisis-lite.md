# Cuestionario · Análisis del proyecto Lite (sin IA)

**Regla del curso:** completa esto ANTES de usar IA y ANTES de corregir el código.
Es la evidencia de tu análisis independiente.

**Método:** ejecutar → observar → registrar. Usa `curl -i` para ver la línea de estado
(no solo el cuerpo). Ninguna conclusión vale sin la respuesta que la respalda.

---

## Cómo trabajar

1. Abre una terminal en la carpeta de la Actividad 1 (`cd "Actividad 1 API Lite"`) y ejecuta:

   ```bash
   node server.js
   ```

2. Deja esa terminal abierta (el servidor queda escuchando en `http://localhost:3000`).
3. En **otra terminal** ejecuta cada uno de los `curl` de la tabla y copia la respuesta
   completa (línea de estado + encabezados + cuerpo) en la **Parte 3 · Evidencia**.
4. Recién después de observar todo, responde las partes 1, 2, 4 y 5 apoyándote en lo que viste.

> Si el puerto 3000 está ocupado, detén el otro proceso y vuelve a ejecutar `node server.js`.

---

## Parte 1 · ¿Cómo ejecuté la API?

Anota el comando exacto que usaste y lo que apareció en la terminal al arrancar:

```bash

```

Lo que mostró la terminal:

```txt

```

---

## Parte 2 · Tabla de análisis

Ejecuta estas peticiones una por una. Para cada una, registra lo que **observaste** y lo que,
según tu conocimiento del contrato HTTP, **debería** pasar.

| # | Petición que debes ejecutar | Intención (qué se supone que hace) | Respuesta actual: estado + cuerpo | Problema (qué contradice el contrato, o «Correcto») | Propuesta (cómo debería responder) |
|---|-----------------------------|-----------------------------------|-----------------------------------|-----------------------------------------------------|------------------------------------|
| 1 | `curl -i http://localhost:3000/getRequests` | | | | |
| 2 | `curl -i http://localhost:3000/requests` | | | | |
| 3 | `curl -i http://localhost:3000/requests/1` | | | | |
| 4 | `curl -i http://localhost:3000/requests/999` | | | | |
| 5 | `curl -i -X POST http://localhost:3000/requests -H "Content-Type: application/json" -d "{\"title\":\"Leaking faucet\",\"description\":\"Bathroom third floor.\",\"priority\":\"medium\"}"` | | | | |
| 6 | `curl -i -X POST http://localhost:3000/requests -H "Content-Type: application/json" -d "{\"description\":\"Roof leak.\",\"priority\":\"high\"}"` | | | | |
| 7 | (libre) agrega cualquier otra petición que quieras comprobar | | | | |

Pistas para cada columna:

* **Intención** — en una frase: ¿para qué existe esta ruta?
* **Respuesta actual** — copia el estado **y** el cuerpo tal como llegaron (ej. `200 OK  {"id":1,...}`).
* **Problema** — compara con lo aprendido: ¿el método es el correcto? ¿el estado es el
  correcto? ¿el cuerpo es lo que promete el estado? Si todo está bien, escribe «Correcto».
* **Propuesta** — qué debería cambiar (ruta, método, estado, validación), con su código.

---

## Parte 3 · Evidencia

Copia aquí cada petición con su respuesta **completa** (incluye la línea de estado):

```txt

```

---

## Parte 4 · Preguntas guía

Responde con lo que observaste, no con lo que supones.

1. **¿Qué recurso representa esta API y cómo se nombra en cada una de sus rutas?** (¿Hay
   inconsistencias en cómo se llama el mismo recurso?)

2. **¿Qué método HTTP corresponde a cada intención, y coincide con el que usa el código?**

3. **¿Qué código de estado devuelve cada respuesta y qué afirma exactamente ese código?**
   (Por ejemplo, ¿qué afirma un `200 OK` a quien lo recibe?)

4. **¿Hay alguna respuesta cuyo estado contradiga su propio cuerpo? ¿Cuál y por qué?**

5. **¿Qué entradas acepta el servidor sin comprobarlas, y qué consecuencia tiene aceptarlas?**

6. **¿Cómo distinguiría un cliente automático un éxito de un error sin leer el cuerpo?**

7. **¿Qué parte del comportamiento observado no podía deducirse leyendo solo las rutas?**

8. **Si otra persona consumiera esta API sin ver el código, ¿qué supuesto la haría fallar?**

---

## Parte 5 · Conclusión

En un párrafo: ¿cuál de los problemas encontrados es el más grave para quien consume la API,
y por qué ese y no otro?

```txt

```

---

**Cuando termines**, devuélveme este cuestionario respondido (en el chat o editando este
archivo) y con tus respuestas armaré el `lite-analysis.md` oficial para el tag
`class-02-lite-analysis`.