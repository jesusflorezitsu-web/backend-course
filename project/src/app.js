import express from 'express';
import requestsRoutes from './modules/requests/requests.routes.js';

const app = express();

app.use(express.json());

app.use('/requests', requestsRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Route not found' }
  });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' }
    });
  }

  res.status(err.status || 500).json({
    error: { code: 'SERVER_ERROR', message: 'Internal server error' }
  });
});

export default app;