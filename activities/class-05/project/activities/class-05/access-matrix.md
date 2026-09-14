# Matriz de acceso — Request API v5

Dos roles exactos: `requester` y `agent`. Sin `admin`.

**Cómo llenar:** cada celda pendiente está marcada con tres guiones bajos.
Reemplaza cada marca por UNA de estas palabras, escrita tal cual:

`Sí` · `No` · `Propias` · `Propia` · `Propia y abierta`

No borres filas ni toques la columna Operación. Ejemplo de una fila resuelta:

| `GET /example` | No | Propia | Todas |

La matriz puede discutirse en la puesta en común, pero la implementación
converge en la baseline del taller (lámina "Contrato fijo" del bloque 02).

| Operación | Anónimo | Requester | Agent |
| --------- | ------- | --------- | ----- |
| `POST /auth/register` | ___ | ___ | ___ |
| `POST /auth/login` | ___ | ___ | ___ |
| `GET /auth/me` | ___ | ___ | ___ |
| `GET /requests` | ___ | ___ | ___ |
| `GET /requests/:id` | ___ | ___ | ___ |
| `GET /requests/:id/history` | ___ | ___ | ___ |
| `POST /requests` | ___ | ___ | ___ |
| Editar título/descripción | ___ | ___ | ___ |
| Cambiar prioridad | ___ | ___ | ___ |
| Cambiar estado | ___ | ___ | ___ |

## Campos controlados por el servidor

Lista los campos que el cliente JAMÁS puede enviar (en el registro y en las
solicitudes) y qué respuesta exacta produce intentarlo:

## Solicitudes heredadas

¿Quién ve las solicitudes sin propietario (`created_by IS NULL`)? ¿Por qué?
