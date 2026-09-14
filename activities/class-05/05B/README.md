# Entrega 05B — «El mundo de la autenticación»

Guía interactiva de 20 contenidos sobre identidad, autenticación, autorización,
sesiones, tokens y delegación. Vanilla JS sobre Vite, sin secretos ni tokens
reales: todos los ejemplos son ficticios y declarados como tales.

## Cómo verla

```bash
cd activities/class-05/05B
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción (verificado)
```

No requiere backend ni `.env`: es material estático.

## Los 20 contenidos

1. Identidad digital · 2. Autenticación · 3. Autorización · 4. Auditoría ·
5. Passwords · 6. Sesiones · 7. Cookies · 8. Bearer tokens · 9. JWT ·
10. API keys · 11. OAuth 2 · 12. OpenID Connect · 13. MFA · 14. Passkeys ·
15. Proveedores de identidad · 16. Authn propia frente a gestionada ·
17. Riesgos comunes · 18. Casos de uso · 19. Árbol de decisión · 20. Fuentes.

Las aclaraciones que el enunciado pedía dejar claras están en cada tarjeta
(`<aside class="clarify">`): JWT es un formato, decodificar no verifica,
firmado ≠ cifrado, OAuth es autorización delegada, OIDC añade identidad, las
API keys identifican aplicaciones, autenticación ≠ autorización, ocultar
botones no protege el backend y no siempre conviene construir auth propia.

## Interactividad (cinco interacciones significativas)

| Interacción | Contenido | Qué transforma |
| ----------- | --------- | -------------- |
| **Inspector de JWT ficticio** | 9 | Muestra que decodificar ≠ verificar y firmado ≠ cifrado. |
| **Matriz de riesgos** | 17 | Amenaza → mitigación; cada fila modela algo que intentó el validador. |
| **Quiz de lectura** | 18 | 8 preguntas con retroalimentación que remite a las tarjetas. |
| **Árbol de decisión** | 19 | Recorrido «¿construyo o delego la autenticación?» con resultado por rama. |
| **Mapa de fuentes** | 20 | Agrega y deduplica las referencias citadas a lo largo de toda la guía. |

Ninguna es hover ni decoración: cada una cambia la respuesta a una pregunta.

## Investigación y honestidad

- Cada contenido marca explícitamente **dato · interpretación ·
  recomendación · mi decisión** (etiquetas de color).
- Cada afirmación importante tiene su fuente (RFCs, W3C, OpenID Foundation,
  OWASP, NIST, MDN) en el desplegable «Fuentes de este tema» de su tarjeta; el
  contenido 20 agrega el mapa deduplicado.
- Los conceptos se escribieron primero desde la documentación oficial y el
  contrato real de la clase 05; la IA asistió solo en redacción y estructura,
  siempre re-verificada contra las fuentes. Ver `ai-usage.md`.
- Regla de oro: si no se puede rastrear, no se dice. Sin blogs como fuente
  única de una afirmación de seguridad.

## Seguridad del material

- Token de laboratorio con `alg: NONE`, `sub: u-0001`, issuer y audiencia
  falsos y expirado: **no es una credencial**.
- Passwords de ejemplo: solo `SmokePassword-270906` (cuenta ficticia del
  taller 05A). No hay datos sensibles reales.
- No se construyen herramientas ofensivas; las mitigaciones son las que ya
  implementa el backend de la clase 05.

## Evidencia

- `npm run build` → `dist/` sin errores; `npm audit` reporta 0 vulnerabilidades.
- Revisión manual del contenido frente al enunciado (20/20 contenidos, 5
  interacciones, clarificaciones pedidas, tags dato/interpretación/recomendación/
  decisión) y cruce de cada afirmación con su fuente.