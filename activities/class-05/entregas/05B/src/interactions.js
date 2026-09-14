// ============================================================================
// Datos de las interacciones 05B. Todo ficticio: el token del inspector es
// un EJEMPLO, no una credencial real.
// ============================================================================

// -- Quiz (contenido 18) -----------------------------------------------------
export const QUIZ = [
  {
    q: 'Decodificar el payload de un JWT…',
    options: ['prueba su autenticidad', 'verifica la firma', 'solo lee el contenido en claro'],
    answer: 2,
    why: 'Decodificar es base64url, no verifica nada. La confianza exige validar la firma y los claims (RFC 7515/7519).'
  },
  {
    q: 'Un JWT firmado con HS256…',
    options: ['está cifrado y no se puede leer', 'es visible en claro y firmado', 'no se puede decodificar sin clave'],
    answer: 1,
    why: 'Firmado ≠ cifrado: cualquiera decodifica el payload; la firma solo atestigua integridad/origen.'
  },
  {
    q: 'OAuth 2.0 resuelve…',
    options: ['la identidad del usuario', 'autorización delegada', 'el almacenamiento de passwords'],
    answer: 1,
    why: 'OAuth 2 es autorización delegada; OIDC añade la capa de identidad (RFC 6749 + OIDC).'
  },
  {
    q: 'Las API keys…',
    options: ['identifican aplicaciones, no personas', 'son lo mismo que una cuenta de usuario', 'reemplazan al JWT en sesiones web'],
    answer: 0,
    why: 'Identifican consumidores (apps/máquinas). Para personas/dentro-sesiones usas tokens/cookies.'
  },
  {
    q: 'Ocultar un botón en el frontend…',
    options: ['es una medida de autorización', 'protege al backend de robots', 'no es seguridad: el backend decide'],
    answer: 2,
    why: 'El cliente es enemigo del servidor: la autorización se re-valida siempre en el backend (403).'
  },
  {
    q: 'Dos preguntas con la misma password…',
    options: ['es MFA de dos factores', 'dos passwords siguen siendo un solo factor', 'siempre es suficiente'],
    answer: 1,
    why: 'MFA exige factores independientes (saber/tener/ser); dos «sé» no son dos factores.'
  },
  {
    q: 'Un recurso ajeno responde 404 igual que uno inexistente para…',
    options: ['ahorrar código', 'no revelar la existencia de recursos', 'confundir al usuario deliberadamente'],
    answer: 1,
    why: 'Denegar sin información es un patrón de privacidad: no se declara «existe pero no es tuyo».'
  },
  {
    q: 'En una SPA con API propia (como la clase 05), el patrón común es…',
    options: ['cookies HttpOnly sin más', 'Bearer sobre HTTPS con cuidado del almacenamiento', 'enviar el password en cada petición'],
    answer: 1,
    why: 'SPA + API separada evita CSRF de cookies pero exige manejar el token: en memoria + escape estricto es una opción honesta.'
  }
];

// -- Matriz de riesgos (contenido 17) ----------------------------------------
export const RISKS = [
  {
    threat: 'Credenciales débiles o filtradas',
    example: 'La boss battle rechazó passwords < 15 caracteres.',
    mitigation: 'Política de longitud mínima, hashing con salt (scrypt/Argon2) y MFA para lo crítico.'
  },
  {
    threat: 'Escalada de rol en el registro',
    example: 'El validador envió role=agent en el body.',
    mitigation: 'Allowlist de campos; el rol lo emite el servidor (400 SERVER_CONTROLLED_FIELD).'
  },
  {
    threat: 'Tokens falsos / alterados',
    example: 'El validador envió un token inventado.',
    mitigation: 'Verificar firma (HS256), exp, iss y aud; no confiar en claims por decodificar.'
  },
  {
    threat: 'Leer solicitudes ajenas',
    example: 'Requester B leyó el ticket de A.',
    mitigation: 'Scoping SQL + 404 idéntico para ajeno/inexistente/heredado.'
  },
  {
    threat: 'Saltar transiciones de estado',
    example: 'in_progress → closed sin pasar por resolved.',
    mitigation: 'Máquina de estados en el dominio que responde 409 INVALID_STATUS_TRANSITION.'
  },
  {
    threat: 'Mutación de recursos terminales',
    example: 'PATCH sobre una solicitud cerrada.',
    mitigation: '409 REQUEST_IN_TERMINAL_STATUS para cualquier escritura posterior.'
  },
  {
    threat: 'Exfiltración del token por XSS',
    example: 'Un título malicioso que inyectara <script>.',
    mitigation: 'Escape estricto de todo el contenido (05A) y token en memoria, nunca en el DOM.'
  },
  {
    threat: 'Robo de bearer en tránsito',
    example: 'Bearer viajando por HTTP plano.',
    mitigation: 'HTTPS obligatorio; CORS restringido al origen exacto del frontend.'
  }
];

// -- Inspector JWT ficticio (contenido 9) ------------------------------------
export const FAKE_TOKEN = {
  header: { alg: 'NONE' },
  payload: {
    sub: 'u-0001',
    role: 'agent',
    iss: 'fake-issuer',
    aud: 'fake-client',
    iat: 1700000000,
    exp: 1700003600
  },
  reference: 'clase-05/token.js'
};

// -- Árbol de decisión (contenido 19) ---------------------------------------
// Cada nodo: { question, options: [{ label, next }] }
// Cada hoja: { leaf: true, verdict, kind, text, ref }
export const TREE = {
  question: '¿Necesitas autenticación para PERSONAS (login)?',
  options: [
    {
      label: 'Sí, personas que inician sesión',
      next: {
        question: '¿Debes cumplir regulaciones (por ejemplo HIPAA/GDPR) o exigir control total del proceso de login?',
        options: [
          {
            label: 'Sí, cumplimiento o control total',
            next: {
              question: '¿El equipo tiene experiencia real en protocolos de seguridad?',
              options: [
                {
                  label: 'Sí, hay expertos disponibles',
                  next: {
                    leaf: true,
                    verdict: 'Construir, pero con estándares y auditoría',
                    kind: 'recomendación',
                    text: 'Construir tu propia autenticación solo es razonable cuando hay obligación demostrable y gente preparada. Usa librerías probadas (OWASP), OIDC/JWT de referencia, pruebas de penetración y revisión de pares.',
                    ref: 'OWASP — Authentication Cheat Sheet'
                  }
                },
                {
                  label: 'No hay equipo especializado',
                  next: {
                    leaf: true,
                    verdict: 'Delegar en un IdP maduro',
                    kind: 'recomendación',
                    text: 'Sin equipo especializado, un IdP gestionado (vía OIDC) reduce el riesgo y libera ingeniería. Cumplimiento se conserva con la configuración del proveedor.',
                    ref: 'OWASP — Authentication Cheat Sheet'
                  }
                }
              ]
            }
          },
          {
            label: 'No, sin regulación estricta',
            next: {
              question: '¿Es una aplicación interna/corporativa que necesita SSO entre varias apps?',
              options: [
                {
                  label: 'Sí, quiero SSO corporativo',
                  next: {
                    leaf: true,
                    verdict: 'IdP gestionado vía OIDC/SAML',
                    kind: 'dato',
                    text: 'SSO = un solo login adoptado por muchas apps. OIDC (identidad) + SAML (empresas legacy) son los protocolos habituales; un IdP central lo hace mantenible.',
                    ref: 'OpenID Connect — How it works'
                  }
                },
                {
                  label: 'No, una sola app',
                  next: {
                    question: '¿Control total del proceso de usuario (reset, bloqueo, MFA) es un diferenciador del producto?',
                    options: [
                      {
                        label: 'Sí, es parte del producto',
                        next: {
                          leaf: true,
                          verdict: 'Build con estándares y auditoría',
                          kind: 'mi decisión',
                          text: 'Si la identidad es tu producto, construye sobre estándares (OIDC/JWT), no protocolos propios; con MFA, revocación y auditoría desde el día uno.',
                          ref: 'OWASP'
                        }
                      },
                      {
                        label: 'No, no es diferenciador',
                        next: {
                          leaf: true,
                          verdict: 'Delegar en un IdP gestionado (opción por defecto)',
                          kind: 'recomendación',
                          text: 'La regla práctica: si un estándar ya resuelve el caso, ese es el camino por defecto. Un IdP gestionado cubre login, MFA, recuperación y rate limiting por ti.',
                          ref: 'OWASP — Authentication Cheat Sheet'
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      label: 'No, son servicios/máquinas',
      next: {
        leaf: true,
        verdict: 'API keys u OAuth 2 client credentials',
        kind: 'dato',
        text: 'Para servicios↔servicios no hay persona que «loguee»: se usa OAuth 2 client credentials o API keys con rotación y scopes mínimos.',
        ref: 'RFC 6749 · OWASP REST'
      }
    }
  ]
};