import app from './src/app.js';
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';

let server;

async function shutdown(signal) {
  console.log(`${signal} received. Closing API server...`);

  if (!server) {
    await disconnectDatabase();
    process.exit(0);
  }

  server.close(async () => {
    await disconnectDatabase();
    console.log('API server closed.');
    process.exit(0);
  });
}

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      console.log(`API server listening on port ${env.PORT}`);
    });

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start API server:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

startServer();
