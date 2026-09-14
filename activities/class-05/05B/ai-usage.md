# AI usage — entrega 05B

Archivo obligatorio del enunciado: especificación inicial, prompts, estructura,
contenido aceptado/rechazado, errores detectados, fuentes, verificación y
decisiones visuales.

## Especificación inicial

Crear en `/learn` (aquí `activities/class-05/05B`) una guía interactiva «El
mundo de la autenticación» con los 20 contenidos obligatorios del enunciado.
Cada artículo debe: dejar claras las aclaraciones pedidas (JWT formato,
decode≠verify, firmado≠cifrado, OAuth=autorización delegada, OIDC=identidad,
API keys=apps, authn≠authz, ocultar botones no protege, no siempre construir),
distinguir trayectorias dato/interpretación/recomendación/decisión y citar
fuentes autoritativas. Mínimo tres interacciones significativas. Nada de tokens
ni passwords reales.

## Prompts importantes

- «Escribe el contenido del tema JWT ciñéndote a RFC 7519 y 7515; marca como
  dato lo que dicen las RFCs y como interpretación el resto.»
- «El quiz debe exigir pensar, no memorizar: opciones donde "decodificar"
  (incorrecto) compite con "verificar firma" (correcto).»
- «El árbol de decisión debe terminar siempre con una recomendación y su
  fuente, no con una frase moral.»

## Estructura propuesta (y aceptada)

```
05B/
├── index.html            # hero + índice de píldoras + tarjetas
├── main.js               # render + 5 interacciones (vanilla)
├── styles.css
└── src/
    ├── contents.js       # banco de 20 contenidos con fuentes y tags
    └── interactions.js   # quiz, matriz, inspector JWT, árbol
```

## Contenido aceptado

- Los 20 temas con su fuente por afirmación y el mapa de fuentes final.
- La regla «una fuente primaria por afirmación importante» y el rechazo de
  blogs como soporte de afirmaciones de seguridad.
- Ejemplos anclados al taller real (cómo `no-revelar-existencia` se traduce en
  `404` idéntico, `409` de transición, `AUTHENTICATION_REQUIRED`) porque la
  entrega 05B convive con la 05A y comparten laboratorio.
- Cinco interacciones (inspector, matriz, quiz, árbol, mapa de fuentes) sobre
  el mínimo de tres exigido.

## Contenido rechazado

- «Deep-dive» de exploits (dump de cookies, phishing automatizado): fuera de
  alcance y del espíritu del enunciado.
- La sugerencia de usar `localStorage` para persistir la sesión de ejemplo en
  05A — ética y riesgos documentados aparte, aquí solo se enseña el concepto.
- Añadir framework a 05B «para reutilizar 05A»: se mantuvo vanilla.
- Incluir claves o endpoints privados del laboratorio real como «ejemplo»:
  todo lo mostrado es ficticio y autodescriptivo (`alg: NONE`, credencial
  `u-0001`, issuer/audiencia falsos).

## Errores o simplificaciones detectadas

- Primer borrador del árbol mezclaba «recomendación» y «dato» en la misma
  hoja; se separaron para que las etiquetas de la guía fueran consistentes.
- Un quiz inicial preguntaba «¿qué es JWT?» con una sola opción correcta pero
  mal redactada; se reformuló para enfrentar decode vs verify (competencia
  conceptual, no vocabulario).
- La matriz de riesgos empezó como tabla pasiva; se convirtió en tarjetas que
  revelan mitigación al pulsar, para que «amenaza → mitigación» sea un gesto.
- Se eliminó una afirmación sobre cookies y CSRF atribuida desde memoria a
  MDN hasta verificarla contra RFC 6265 y la documentación actual de MDN.

## Fuentes utilizadas

- RFC 4949, 6265, 6749, 6750, 7515, 7519 (IETF).
- W3C WebAuthn (TR/webauthn-3), passkeys.dev, OpenID Foundation docs.
- OWASP Cheat Sheets (Authentication, Authorization, Password Storage,
  Session Management, Multifactor, REST Security, Logging) y OWASP Top 10.
- NIST SP 800-63.
- MDN HTTP cookies, Swagger (autenticación con API keys).
- Contrato real de la clase 05 (auth.service, request.policy, token.js) como
  referencia del «cómo» del taller.

## Verificación

- Build de producción OK (`vite build`) y `npm audit` en 0 vulnerabilidades.
- Chequeo manual de cobertura del enunciado: 20/20 contenidos, 5 interacciones
  (≥3 exigidas), clarificaciones oficiales presentes, etiquetas
  dato/interpretación/recomendación/decisión en cada tarjeta, y cada enlace de
  fuente apuntando a la referencia citada.
- Ningún token/password/URL privada real en el árbol del repo (grep de
  credenciales del laboratorio dio vacío).

## Decisiones visuales

- `alg: NONE` en el inspector: además de demostrar decode≠verify, evidencia el
  ataque de confusión de algoritmo que el taller previene.
- Etiquetas de color por tipo (dato azul, interpretación verde,
  recomendación naranja, mi decisión morado) que funcionan sin depender solo
  del color (texto en mayúsculas + bordes).
- Cabecera oscura y tarjetas claras para máxima legibilidad; píldoras de índice
  con scroll suave para navegar 20 temas sin perderse.