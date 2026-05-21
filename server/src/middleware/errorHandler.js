import { env } from '../config/env.js';

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    errors: error.errors || [],
  };

  if (env.NODE_ENV !== 'production') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

