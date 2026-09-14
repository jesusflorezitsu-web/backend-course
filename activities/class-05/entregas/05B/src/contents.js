// ============================================================================
// 05B · «El mundo de la autenticación» — banco de contenido.
// Cada contenido tiene: título, resumen (tl;dr), cuerpo, etiquetas de tipo
// (dato · interpretación · recomendación · mi decisión) y fuentes autoritativas.
// Todos los ejemplos son FICTICIOS: no hay tokens, passwords ni datos reales.
// ============================================================================

export const CONTENTS = [
  {
    id: 1,
    subtitle: 'Fundamentos',
    title: 'Identidad digital',
    tldr: 'En TI la identidad son los atributos que permiten distinguir a una entidad, y el identificador que la nombra.',
    body: [
      `Una <b>identidad digital</b> es el conjunto de atributos (email, UUID, rol, nombre) que describen a un actor — una persona, un dispositivo o un servicio. El <b>identificador</b> es la referencia que usamos para nombrarla: en la clase 05, la fila en la tabla <code>users</code> y su <code>id</code>.`,
      `La <b>identificación</b> es «quién afirmas ser»; la <b>autenticación</b> es probarlo. Son momentos distintos del mismo flujo.`
    ],
    cls: ['identificación ≠ autenticación: declarar una identidad no es verificar nada.'],
    tags: [
      ['dato', 'RFC 4949 define identidad y autenticación como conceptos de seguridad separados.'],
      ['interpretación', 'El "dueño" de una solicitud en la clase 05 es una identidad: su UUID.'],
      ['mi decisión', 'Proveer la identidad desde el token verificado (user.id), nunca desde el body.']
    ],
    sources: [
      ['RFC 4949 — Internet Security Glossary', 'https://www.rfc-editor.org/rfc/rfc4949.html'],
      ['NIST SP 800-63-3 — Digital Identity Guidelines', 'https://pages.nist.gov/800-63-3/sp800-63-3.html']
    ]
  },
  {
    id: 2,
    subtitle: 'Fundamentos',
    title: 'Autenticación',
    tldr: 'Demostrar quién soy usando uno o más factores.',
    body: [
      `La autenticación verifica una afirmación de identidad con evidencia. Los <b>factores</b> clásicos son: algo que sé (password), algo que tengo (llave, OTP, passkey) y algo que soy (biometría).`,
      `En la clase 05 la autenticación es: enviar <code>email+password</code> a <code>/auth/login</code>, recibir un <code>accessToken</code> y presentarlo después como <code>Bearer</code>.`
    ],
    cls: ['Ocultar botones en el frontend NO es autenticación ni autorización: el backend es quien juzga.'],
    tags: [
      ['dato', 'OWASP Authentication Cheat Sheet: autenticar es verificar la identidad antes de confiar.'],
      ['recomendación', 'Obligar password largos y almacenar solo derivaciones (hash) con salt.'],
      ['mi decisión', 'El taller exige 15–128 caracteres y scrypt con salt aleatorio: lo adopté tal cual.']
    ],
    sources: [
      ['OWASP — Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'],
      ['NIST SP 800-63B — Authenticator and Verifier requirements', 'https://pages.nist.gov/800-63-3/sp800-63b.html']
    ]
  },
  {
    id: 3,
    subtitle: 'Fundamentos',
    title: 'Autorización',
    tldr: 'Una vez autenticado, qué operaciones puedo hacer. No es lo mismo que autenticación.',
    body: [
      `La <b>autorización</b> decide qué puede hacer una identidad <i>ya</i> probada. Puede depender del <b>rol</b> (agent cambia prioridad; requester no) y del <b>recurso y su estado</b> (el requester edita solo lo suyo y solo si está <code>open</code>).`,
      `Es el nivel donde vive <code>request.policy.js</code>: funciones puras que responden «¿puede este actor?» — y que el validador intenta violar con <code>403</code> y <code>409</code>.`
    ],
    cls: ['autenticación ≠ autorización: saber quién eres no te permite hacer cualquier cosa.'],
    tags: [
      ['dato', 'OWASP Authorization Cheat Sheet separa explícitamente decisión de autorz del mecanismo.'],
      ['mi decisión', 'Toda mutación re-verifica permisos de cero con el actor autenticado, por eso un frontend manipulado no gana.']
    ],
    sources: [
      ['OWASP — Authorization Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html'],
      ['OWASP Top 10 A01 — Broken Access Control', 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/']
    ]
  },
  {
    id: 4,
    subtitle: 'Fundamentos',
    title: 'Auditoría',
    tldr: 'Registrar quién hizo qué y cuándo, para poder responder después «¿por qué pasó esto?».',
    body: [
      `La <b>auditoría</b> produce el registro de eventos (logs, historiales) que permite reconstruir acciones. No impide que la acción ocurra: la hace <i>explicable</i>.`,
      `En la clase 05, <code>request_status_history.changed_by</code> atribuye cada transición al <code>agent</code> verificado que la ejecutó; el historial de nacimiento (<code>NULL → open</code>) registra a quien creó la solicitud.`
    ],
    cls: ['auditoría ≠ autorización: registrar con actor no es lo mismo que permitir la acción.'],
    tags: [
      ['dato', 'OWASP Logging Cheat Sheet: registros con actor, acción y resultado.'],
      ['mi decisión', 'changed_by/created_by salen del token verificado, nunca del body: el log no se puede falsear desde el cliente.']
    ],
    sources: [
      ['OWASP — Logging Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html']
    ]
  },
  {
    id: 5,
    subtitle: 'Credenciales',
    title: 'Passwords',
    tldr: 'Nunca se guardan tal cual: se guarda una derivación (hash) con salt propia por usuario.',
    body: [
      `Guardar el texto plano equivale a regalar todas las cuentas si la base se filtra. Se guarda la salida de una función unidireccional (scrypt, Argon2, bcrypt) con un <b>salt aleatorio por usuario</b>.`,
      `En el taller, <code>password.js</code> produce <code>scrypt$1$N=16384,r=8,p=1$&lt;salt&gt;$&lt;clave&gt;</code>: versión auto-descriptiva, salt de 16 bytes y comparación en tiempo constante.`
    ],
    cls: ['Hash ≠ cifrado: el hash no es reversible; los hashes idénticos para passwords iguales se evitan con el salt.'],
    tags: [
      ['dato', 'NIST SP 800-63B recomienda memoria-consuming hashing (scrypt/Argon2) para passwords.'],
      ['dato', 'OWASP Password Storage Cheat Sheet: usar salt único + función lenta (≥10k itera).'],
      ['mi decisión', 'Cambiar el formato del hash (bcrypt→scrypt) con autodescripción fue la decisión más difícil: costó re-validar login completo.']
    ],
    sources: [
      ['OWASP — Password Storage Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],
      ['NIST SP 800-63B', 'https://pages.nist.gov/800-63-3/sp800-63b.html']
    ]
  },
  {
    id: 6,
    subtitle: 'Sesiones',
    title: 'Sesiones',
    tldr: 'El estado «de quién es esta conexión» durante varias peticiones. Puede vivir en el servidor o en el token.',
    body: [
      `Una <b>sesión</b> relaciona varias peticiones del mismo actor. Hay dos estilos: <b>sesión en el servidor</b> (un id opaco que el servidor mira en su base) y <b>sessions stateless</b> (el token transporta los datos firmados, como un JWT).`,
      `El starter de 05A guarda el token en memoria: la sesión muere al recargar. Es una limitación honesta de la estrategia educativa, no un error.`
    ],
    cls: ['JWT es un formato de dato, no un mecanismo de sesión; decidir dónde vive la sesión es una decisión de diseño.'],
    tags: [
      ['dato', 'OWASP Session Management Cheat Sheet distingue session tokens de bearer tokens.'],
      ['interpretación', 'Backend stateless con JWT se escala fácil pero exige revocación pensada (nuestro taller no la tiene).'],
      ['mi decisión', 'Token en memoria en 05A + logout local documentado (el JWT sigue válido hasta expirar).']
    ],
    sources: [
      ['OWASP — Session Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html']
    ]
  },
  {
    id: 7,
    subtitle: 'Sesiones',
    title: 'Cookies',
    tldr: 'Mecanismo de transporte de estado HTTP, con flags de seguridad que cambian el riesgo.',
    body: [
      `Una <b>cookie</b> es una cabecera que el navegador guarda y reenvía. Para sesión, la cookie típicamente lleva el id (opaco) o el token y se marca: <code>HttpOnly</code> (inaccesible a JS), <code>Secure</code> (solo HTTPS) y <code>SameSite</code>.`,
      `Las cookies resuelven al CSRF benefits del navegador pero traen sus propios riesgos (CSRF, perimetros de dominio). Los flags no son opcionales decorativos.`
    ],
    cls: ['HttpOnly mitiga XSS-drain pero NO evita CSRF; SameSite es la defensa principal contra CSRF moderno.'],
    tags: [
      ['dato', 'RFC 6265 define las cookies; MDN documenta los flags.'],
      ['interpretación', 'En una SPA con API separada (CORS), los bearer tokens en memoria/quórum son el patrón común; cookies con CSRF exigen más infra.'],
      ['mi decisión', 'Este proyecto usa Bearer en memoria + SameSite-like al ser app+API separadas; las cookies quedarían para una app clásica de servidor.']
    ],
    sources: [
      ['RFC 6265 — HTTP State Management Mechanism', 'https://datatracker.ietf.org/doc/html/rfc6265'],
      ['MDN — HTTP cookies', 'https://developer.mozilla.org/es/docs/Web/HTTP/Cookies']
    ]
  },
  {
    id: 8,
    subtitle: 'Sesiones',
    title: 'Bearer tokens',
    tldr: '«Quien porta el token, actúa.» Por eso tiene que viajar cifrado y con cuidado.',
    body: [
      `Un <b>bearer token</b> es una credencial opaca que se presenta en <code>Authorization: Bearer &lt;token&gt;</code>. No necesita correlación con una sesión de servidor: su sola posesión acredita.`,
      `De ahí el nombre <code>AUTHENTICATION_REQUIRED</code> cuando falta o el esquema no es <code>Bearer</code>: el middleware corta antes del dominio.`
    ],
    cls: ['Bearer exige HTTPS: si viaja en claro, cualquiera que lo capture actúa como tú.'],
    tags: [
      ['dato', 'RFC 6750 define el esquema Bearer y sus requisitos de transporte.'],
      ['recomendación', 'Cortar el TLS del bearer con preflight CORS y cabeceras restringidas (Content-Type, Authorization).'],
      ['mi decisión', 'middleware/authenticate.js exige exactamente el esquema Bearer y responde 401 antes del router.']
    ],
    sources: [
      ['RFC 6750 — The OAuth 2.0 Authorization Framework: Bearer Token Usage', 'https://datatracker.ietf.org/doc/html/rfc6750']
    ]
  },
  {
    id: 9,
    subtitle: 'Sesiones',
    title: 'JWT (JSON Web Token)',
    tldr: 'Un formato compacto que NO es una solución completa: decodificarlo no significa verificado.',
    body: [
      `Un JWT tiene tres partes: <code>header</code> (algoritmo), <code>payload</code> (claims) y <code>firma</code>. En la clase 05: HS256, claims <code>sub</code> (usuario), <code>role</code>, <code>iss</code>, <code>aud</code>, <code>iat</code>, <code>exp</code>.`,
      `Decodificar solo lee base64url; <b>verificar</b> es validar firma (clave/secret), <code>exp</code>, <code>iss</code> y <code>aud</code>. La confianza NO sale de leer el contenido, sale de aceptar la firma y las reglas.`
    ],
    cls: [
      'JWT es un formato, no una solución de autenticación.',
      'Firmado ≠ cifrado: con HS256 se puede ver el payload con solo decodificarlo.',
      'No metas datos sensibles en el payload; el firmado no protege la confidencialidad.'
    ],
    tags: [
      ['dato', 'RFC 7519 define el registro de claims; RFC 7515 define la firma (JWS).'],
      ['interpretación', 'Un token firmado por cualquiera que conozca el secreto es válido: conservar el secret es parte del diseño.'],
      ['mi decisión', 'validar iss y aud siempre; exp-iat = TTL (3600s en el taller).']
    ],
    interactive: 'inspectorJWT',
    sources: [
      ['RFC 7519 — JSON Web Token (JWT)', 'https://datatracker.ietf.org/doc/html/rfc7519'],
      ['RFC 7515 — JSON Web Signature (JWS)', 'https://datatracker.ietf.org/doc/html/rfc7515']
    ]
  },
  {
    id: 10,
    subtitle: 'Delegación',
    title: 'API keys',
    tldr: 'Identifican aplicaciones o máquinas, no reemplazan la identidad de un usuario.',
    body: [
      `Una <b>API key</b> identifica a quien consume — normalmente una aplicación, no una persona. Por eso conviene <i>rotarla</i> (revocar y emitir), limitar sus permisos y no mezclarla con credenciales de usuario.`,
      `No es autenticación de personas ni autorización fina: es «esta clave puede consumir este servicio».`
    ],
    cls: ['Usar una API key como identificador de usuario es abusar del mecanismo; para personas y sesiones usas tokens/cookies.'],
    tags: [
      ['dato', 'OWASP REST Security Cheat Sheet: las API keys identifican apps, no personas; se protegen como secretos.'],
      ['recomendación', 'Rotación frecuente, scope mínimo y revocación inmediata al filtrarse.'],
      ['mi decisión', 'Este backend NO usa API keys: uso Bearer JWTs con una cuenta por persona.']
    ],
    sources: [
      ['OWASP — REST Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html'],
      ['Swagger — API Keys authentication', 'https://swagger.io/docs/specification/v3_0/authentication/api-keys/']
    ]
  },
  {
    id: 11,
    subtitle: 'Delegación',
    title: 'OAuth 2.0',
    tldr: 'Autorización delegada: «esta app puede hacer X en mi nombre» — no confundir con identidad.',
    body: [
      `OAuth 2.0 permite que un cliente pida acceso limitado a recursos que pertenecen a otro, mediante un <b>token de acceso</b> (normalmente Bearer). Es un protocolo de <i>autorización delegada</i>: quién puede acceder, a qué.`,
      `No resuelve «quién es el usuario»: para eso se apoya en OpenID Connect o en el flujo que añade identidad.`
    ],
    cls: ['OAuth trata sobre autorización delegada, no sobre autenticación de personas.'],
    tags: [
      ['dato', 'RFC 6749 define los grants y los roles cliente/recursos/autorización.'],
      ['interpretación', 'Un "Sign in with X" de verdad combina OAuth2 (acceso) + OIDC (identidad) en el mismo id_token.'],
      ['mi decisión', 'El taller implementa login propio; en producción elegiría un IdP (ver el árbol de decisión).']
    ],
    sources: [
      ['RFC 6749 — The OAuth 2.0 Authorization Framework', 'https://datatracker.ietf.org/doc/html/rfc6749'],
      ['OAuth 2.0 — oauth.net', 'https://oauth.net/2/']
    ]
  },
  {
    id: 12,
    subtitle: 'Delegación',
    title: 'OpenID Connect (OIDC)',
    tldr: 'Capa de identidad construida SOBRE OAuth 2.0: aporta el id_token.',
    body: [
      `OIDC extiende OAuth 2.0 añadiendo <code>id_token</code> (JWT con claims del usuario) y el endpoint <code>/userinfo</code>. El <code>iss</code>/<code>aud</code> verificados dicen quién emitió la identidad y para qué cliente.`,
      `«Iniciar sesión con Google/GitHub/…» en su forma sana es OIDC: delegar la verificación de identidad a un proveedor y recibir claims verificados.`
    ],
    cls: ['OIDC añade identidad encima de OAuth 2; sin él, OAuth solo autoriza.'],
    tags: [
      ['dato', 'OpenID Foundation documenta los flujos y el id_token.'],
      ['mi decisión', 'En 05A no hay IdP externo: registro y login locales. En un caso real, delegaría con OIDC (ver contenido 19).']
    ],
    sources: [
      ['OpenID Connect — How it works', 'https://openid.net/developers/how-connect-works/'],
      ['OpenID Foundation — Specs', 'https://openid.net/connect/']
    ]
  },
  {
    id: 13,
    subtitle: 'Delegación',
    title: 'MFA (Multi Factor Authentication)',
    tldr: 'Combinar dos o más factores independientes para que una credencial robada no baste.',
    body: [
      `El <b>primer factor</b> suele ser algo que sé (password); el <b>segundo</b>, algo que tengo (OTP/TOTP, aplicación, llave) o que soy (biometría). Un atacante que robó la password ya no basta solo.`,
      `Los factores deben ser <i>independientes</i>: si ambos viajan por el mismo canal (email+SMS al mismo teléfono), la independencia baja.`
    ],
    cls: ['MFA no es «dos passwords»: son dos categorías distintas de evidencia.'],
    tags: [
      ['dato', 'OWASP MFA Cheat Sheet: factores independientes + claves seguras de copia/respaldo.'],
      ['recomendación', 'Para sitios de alto valor, priorizar WebAuthn/passkeys sobre TOTP por resistencia a phishing.'],
      ['mi decisión', 'El taller es monofactor (password) por ser educativo; documenté que esto NO es suficiente en producción.']
    ],
    sources: [
      ['OWASP — Multifactor Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html']
    ]
  },
  {
    id: 14,
    subtitle: 'Delegación',
    title: 'Passkeys',
    tldr: 'Llaves criptográficas ligadas al dispositivo o al gestor, resistentes a phishing.',
    body: [
      `Los <b>passkeys</b> implementan WebAuthn: un par de llaves (pública/privada) donde la privada nunca sale del <i>authenticator</i> y el desafío se firma por origen del sitio. Sin password que robar ni capturas de sesión reutilizables.`,
      `Son el heredero natural del password para la mayoría de los casos de uso: fáciles para la persona y fuertes contra phishing.`
    ],
    cls: ['Passkey ≠ password copiado: la privada no viaja, por eso un phishing en otra página no puede reenviarla.'],
    tags: [
      ['dato', 'W3C WebAuthn 3 define autenticadores y desafíos; passkeys.dev hila el producto.'],
      ['interpretación', 'La frase «nunca envíes el secreto» es lo que hace resistente a phishing a los passkeys.'],
      ['mi decisión', 'No los implementé en el taller (la boss battle no los exige), pero si escalara la app, sería mi primer upgrade de authn.']
    ],
    sources: [
      ['W3C — Web Authentication: public key credential (WebAuthn)', 'https://www.w3.org/TR/webauthn-3/'],
      ['passkeys.dev', 'https://passkeys.dev/']
    ]
  },
  {
    id: 15,
    subtitle: 'Ecosistema',
    title: 'Proveedores de identidad (IdP)',
    tldr: 'Un servicio que autentica y le entrega claims verificados a tus apps (SSO, federación).',
    body: [
      `Un <b>IdP</b> concentra la verificación de identidad (login, MFA, recuperación) y emite tokens (OIDC/SAML) que tus apps confían. Esto habilita <b>SSO</b>: una sola autenticación para varias apps.`,
      `Delegar identidad reduce el código propio de seguridad y centraliza las políticas; a cambio dependes de otro servicio y de un contrato de confianza.`
    ],
    cls: ['No siempre conviene construir autenticación propia: un IdP gestionado cubre la mayoría de los casos.'],
    tags: [
      ['dato', 'OpenID Connect / SAML 2.0 son los protocolos habituales de federación de identidad.'],
      ['recomendación', 'Empezar con un IdP gestionado y solo construir a medida cuando haya necesidad demostrable.'],
      ['mi decisión', 'El taller construye auth propia a propósito (aprendizaje); el árbol del contenido 19 formaliza cuándo delegarías.']
    ],
    sources: [
      ['OpenID Connect — How it works', 'https://openid.net/developers/how-connect-works/'],
      ['OWASP — Authentication Cheat Sheet (delegar vs construir)', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html']
    ]
  },
  {
    id: 16,
    subtitle: 'Ecosistema',
    title: 'Autenticación propia frente a gestionada',
    tldr: 'Build vs buy: cuándo vale la pena escribir tu propio login y cuándo delegarlo.',
    body: [
      `Construir auth propia da control total pero reabre los problemas clásicos: hashing, sesiones, revocación, recuperación de cuenta, MFA, rate-limiting, y los errores sutiles. Gestionada (Auth0/Keycloak/Cloud Identity/…) mueve ese riesgo a un proveedor y libera tiempo.`,
      `La regla práctica: <b>no construyas lo que un estándar ya resuelve, salvo que necesites control demostrable</b> (regulaciones, offline, nicho).`
    ],
    cls: ['Construir "solo por aprender" es para laboratorios; en producción se mide con el árbol del contenido 19.'],
    tags: [
      ['dato', 'OWASP recomienda usar librerías/estándares probados en lugar de escribir protocolos de cero.'],
      ['interpretación', 'El taller es deliberadamente «build» para instalar los conceptos; eso no recomienda build en general.'],
      ['mi decisión', 'Si esta app saliera a producción hoy: IdP gestionado + OIDC, y auth propia solo como tema de laboratorio.']
    ],
    sources: [
      ['OWASP — Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'],
      ['Auth0 — Build vs Buy (documentación de producto)', 'https://auth0.com/docs/get-started/identity-fundamentals/authentication-and-authorization']
    ]
  },
  {
    id: 17,
    subtitle: 'Puesta en práctica',
    title: 'Riesgos comunes',
    tldr: 'Los fallos de identidad/autenticación aparecen en el Top 10 OWASP. Aquí la matriz: amenaza → mitigación.',
    body: [
      `OWASP Top 10 incluye <b>A01 Broken Access Control</b> y <b>A07 Identification and Authentication Failures</b>: credenciales débiles, sesiones mal protegidas, confianza en el cliente, falta de rate limiting.`,
      `El validador de la clase 05 intenta exactamente algunos: escalar rol en el registro, login con credenciales malas, tokens falsos, leer ajenos, transiciones saltadas y mutar cerradas.`
    ],
    cls: ['Ocultar botones no protege el backend: el cliente es enemigo del servidor.'],
    tags: [
      ['dato', 'OWASP Top 10 A07 enumera los fallos frecuentes de autenticación.'],
      ['recomendación', 'Time-constant comparisons, mensajes genéricos de error (404 idénticos), rate limiting y revocación.'],
      ['mi decisión', 'Adopté 404 idéntico para ajeno/inexistente y 401 genéricos de login en 05A.']
    ],
    interactive: 'riskMatrix',
    sources: [
      ['OWASP Top 10 A07 — Identification and Authentication Failures', 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/'],
      ['OWASP — Session Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html']
    ]
  },
  {
    id: 18,
    subtitle: 'Puesta en práctica',
    title: 'Casos de uso',
    tldr: 'Qué mecanismo encaja con qué contexto y en qué clases de aplicación.',
    body: [
      `<ul class="usecases">
        <li><b>Aplicación de servidor clásica</b> → sesiones por cookie (HttpOnly+SameSite).</li>
        <li><b>SPA + API propia (como este taller)</b> → Bearer sobre HTTPS; JWT si el backend es stateless o se delega.</li>
        <li><b>App para móvil</b> → tokens dispositivos + refresh seguro, sin cookies para terceros.</li>
        <li><b>Servicios ↔ servicios</b> → OAuth 2 client credentials / API keys con rotación.</li>
        <li><b>SSO corporativo</b> → OIDC o SAML con un IdP gestionado.</li>
      </ul>`
    ],
    cls: ['El mecanismo se elige por el tipo de agente (navegador, móvil, máquina) y el nivel de riesgo.'],
    tags: [
      ['dato', 'OWASP Session Management + REST Security ejemplifican estos casos.'],
      ['interpretación', 'Una SPA sin cookies ahorra CSRF, pero exige cuidar el almacenamiento del token.'],
      ['mi decisión', 'Mantuve el patrón SPA + Bearer del taller; con XSS mitigado por escape estricto y token en memoria.']
    ],
    interactive: 'quiz',
    sources: [
      ['OWASP — Session Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html'],
      ['OWASP — REST Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html']
    ]
  },
  {
    id: 19,
    subtitle: 'Puesta en práctica',
    title: 'Árbol de decisión',
    tldr: '¿Construyo autenticación propia o delego en un IdP/manejado? Un recorrido interactivo con recomendación.',
    body: [
      `Recorre preguntas simples y llega a una indicación clara. La recomendación es <i>orientativa</i>: cada equipo ajusta por cumplimiento, presupuesto de ingeniería y control exigido.`,
      `Este árbol es una síntesis docente de OWASP (usar estándares probados) y de la práctica común de SSO gestionada.`
    ],
    cls: ['No siempre conviene construir autenticación propia: si un estándar cubre tu caso, ese es el camino por defecto.'],
    tags: [
      ['dato', 'OWASP: preferir librerías/estándares probados y evitar protocolos propios.'],
      ['interpretación', 'Cumplimiento (HIPAA/GDPR) y «control total» pesan a favor de lo propio; velocidad y riesgo, en contra.'],
      ['mi decisión', 'Para el taller, construir a propósito (es la manera de aprender); para fines reales, lo que diga este árbol.']
    ],
    interactive: 'tree',
    sources: [
      ['OWASP — Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html']
    ]
  },
  {
    id: 20,
    subtitle: 'Para saber más',
    title: 'Fuentes',
    tldr: 'El mapa completo de referencias citadas (estándares y guías, no blogs).',
    body: [
      `Todas las afirmaciones importantes de esta guía se apoyan en estándares (IETF RFC), especificaciones (W3C, OpenID) o guías de referencia (OWASP, NIST, MDN). Aquí está la lista agregada.`
    ],
    cls: [],
    tags: [
      ['dato', 'Una fuente primaria es la que define la especificación (RFC/spec).'],
      ['interpretación', 'Estas guías son curadas y mantenidas por organismos, no opiniones de un blog.'],
      ['recomendación', 'Verifica cualquier implementación nueva contra la versión vigente del documento.'],
      ['mi decisión', 'Prefiero citar el documento de especificación sobre cualquier resumen de terceros.']
    ],
    interactive: 'sourcesList',
    sources: [
      ['RFC 4949 — Security Glossary', 'https://www.rfc-editor.org/rfc/rfc4949.html'],
      ['NIST SP 800-63', 'https://pages.nist.gov/800-63-3/sp800-63-3.html'],
      ['RFC 6265 — Cookies', 'https://datatracker.ietf.org/doc/html/rfc6265'],
      ['RFC 6749 — OAuth 2.0', 'https://datatracker.ietf.org/doc/html/rfc6749'],
      ['RFC 6750 — Bearer tokens', 'https://datatracker.ietf.org/doc/html/rfc6750'],
      ['RFC 7515 — JWS', 'https://datatracker.ietf.org/doc/html/rfc7515'],
      ['RFC 7519 — JWT', 'https://datatracker.ietf.org/doc/html/rfc7519'],
      ['W3C — WebAuthn 3', 'https://www.w3.org/TR/webauthn-3/'],
      ['passkeys.dev', 'https://passkeys.dev/'],
      ['OpenID Connect — docs', 'https://openid.net/developers/how-connect-works/'],
      ['OWASP — Cheat Sheets (Authn/Authz/Password/Session/MFA/REST/Logging)', 'https://cheatsheetseries.owasp.org/'],
      ['OWASP Top 10', 'https://owasp.org/Top10/'],
      ['MDN — HTTP cookies', 'https://developer.mozilla.org/es/docs/Web/HTTP/Cookies'],
      ['Swagger — API keys', 'https://swagger.io/docs/specification/v3_0/authentication/api-keys/']
    ]
  }
];

// Tocados en cada tarjeta: listado lineal del índice.
export const INDEX_LABEL = (id) => `${String(id).padStart(2, '0')}`;