// Application setup: middlewares and module mounting. It does not open any
// port.
//
// Order is deliberate, every piece answers a "where" and "why":
//   - requestId       FIRST of all: even a malformed JSON body or an OPTIONS
//                     preflight gets ONE identifier (src/middleware/request-id.js)
//   - corsPolicy      preflights are answered before anything else runs
//   - express.json    parses bodies; its parse errors flow to errorHandler
//   - requestLogger   one JSON log line per finished request
//   - healthRoutes    GET /health and GET /ready (public by design)
//   - notFound        a JSON answer when no route matched
//   - errorHandler    ONE place that turns errors into responses
// An error middleware only sees what happened BEFORE it in this file.
import express from 'express';
import { corsPolicy } from './middleware/cors.js';
import { requestId } from './middleware/request-id.js';
import { requestLogger } from './middleware/request-logger.js';
import { authenticate } from './middleware/authenticate.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import requestsRoutes from './modules/requests/requests.routes.js';

const app = express();

// Every request gets ONE identifier before anything else runs, so errors,
// logs and the X-Request-Id header all share a single trace id.
app.use(requestId);

// CORS: preflights must be answered before anything else runs.
app.use(corsPolicy);

// Parses incoming JSON bodies into req.body.
app.use(express.json());

// One JSON log line per finished request, whatever its outcome.
app.use(requestLogger);

// /auth mixes public routes (register, login) and one protected route
// (/me), so the module applies `authenticate` internally where needed.
app.use('/auth', authRoutes);

// Every requests route needs a trusted actor: authenticate runs first and
// builds req.auth, or answers 401 and the router never runs.
app.use('/requests', authenticate, requestsRoutes);

// Operational endpoints are public on purpose: an orchestrator probes them
// without any credential.
app.use(healthRoutes);

// After every router: only unmatched requests get here.
app.use(notFound);

// Last line of defense: ANY error thrown or rejected above becomes a
// controlled JSON response here, with the requestId attached.
app.use(errorHandler);

export default app;
