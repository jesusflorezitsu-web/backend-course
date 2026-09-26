// Entry point: this file only starts the process. It does not know about routes.
import app from './app.js';
import { logger } from './logging/logger.js';

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  logger.info('server_started', { port: PORT, pid: process.pid });
});
