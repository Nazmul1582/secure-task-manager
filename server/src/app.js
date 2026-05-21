import express from 'express';

const app = express();

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'secure-task-manager-api',
  });
});

export default app;

