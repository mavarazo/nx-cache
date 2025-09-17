import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import logger from '../config/logger';

export class AppError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    logger.debug('Header already sent');
    return next(err);
  }

  if (err instanceof AppError) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
      res
        .writeHead(err.status, { 'content-type': 'text/plain' })
        .end(err.message);

      return;
    } else {
      res.status(err.status).json({
        message: err.message,
      });
      return;
    }
  }

  res.status(500).json({
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
  return;
};
