// ============================================================================
// Authentication middleware: establishes WHO the actor is, nothing more.
// What the actor may DO is authorization and lives in the module policies.
// This middleware never reaches the router's try/catch: it answers 401 here.
// ============================================================================
import { AppError } from '../app-error.js';
import { respondError } from '../http/respond-error.js';
import { verifyToken } from '../modules/auth/token.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const [scheme, token] = typeof header === 'string' ? header.split(' ') : [undefined, undefined];

  // Only the Bearer scheme is a trustworthy identity here: Basic, a bare
  // token or an empty Bearer answer the same missing-identity error.
  if (scheme !== 'Bearer' || !token) {
    return respondError(res, new AppError('auth', 'AUTHENTICATION_REQUIRED',
      'Authentication is required.'));
  }

  try {
    // Verify — never just decode. Altered, expired or foreign tokens land in
    // the same bucket: the response never explains which check failed.
    const payload = await verifyToken(token);
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    respondError(res, new AppError('auth', 'INVALID_TOKEN',
      'The provided token is invalid.'));
  }
}