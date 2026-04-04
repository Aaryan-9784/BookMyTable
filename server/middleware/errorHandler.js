/**
 * Centralized error handling — consistent JSON errors; hides stack in production.
 */
export function notFound(_req, res, _next) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const body = {
    message: err.message || 'Internal Server Error',
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack;
  }
  res.status(status).json(body);
}
