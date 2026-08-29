# Comparación — Proyecto Lite vs Full

Comparación de las dos formas de construir la misma API de **solicitudes de mantenimiento**:
el proyecto **Lite** (comprender antes de generar, sin IA en la primera fase) y el proyecto
**Full** (construir con IA sin delegar el criterio).

## Lo que comparten

* Mismo recurso: **solicitudes de mantenimiento** (`request`).
* Mismos tres endpoints: `GET /requests`, `GET /requests/:id`, `POST /requests`.
* Mismos códigos de error y reglas de creación (`id` y `status` los asigna el servidor).
* Sin base de datos (memoria), sin autenticación, sin TypeScript, sin frontend.

## Diferencias

| Aspecto                    | Proyecto Lite                                                                 | Proyecto Full                                                              |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Objetivo**               | Leer una API ajena y reconstruir su contrato, detectar inconsistencias.       | Construir la API propia a partir de una especificación y un contrato.      |
| **Rol de la IA**           | Prohibida en la primera fase (análisis).                                      | Permitida, pero la decisión y la verificación son humanas.               |
| **Documento central**      | `lite-analysis.md` (análisis del servidor ajeno).                             | `docs/http-contract.md` (contrato definido antes del código).              |
| **Organización**           | Un solo `server.js` con toda la lógica.                                       | Separación por responsabilidad: `app.js`, `server.js`, `routes/`, `data/`. |
| **Punto de partida**       | Servidor dado con defectos que había que descubrir.                           | Andamiaje 501 que había que implementar.                                   |
| **Persistencia**           | En memoria.                                                                   | En memoria (misma limitación).                                            |
| **Lo que se evalúa**       | Capacidad de leer un contrato ajeno y encontrar incoherencias.                | Capacidad de definir contrato, implementarlo y verificarlo críticamente.   |

## Mi conclusión

El Lite entrena a **leer y criticar** un contrato que otro escribió: entender métodos, estados
y por qué una respuesta puede contradecir al código. El Full entrena a **escribir y defender**
el propio contrato antes de que exista una sola línea de código. En ambos el criterio humano es
el que decide; en el Full, la IA acelera la implementación pero la verificación con `curl` y el
contrato escrito a mano son lo que garantizan que el resultado sea correcto.
