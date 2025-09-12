import { Request, Response, NextFunction } from 'express';
import config from '../config/config';
import { AppError, ForbiddenError, UnauthorizedError } from './error';

export const authForRead = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!config.apiKeyReadToken) {
    return next();
  }

  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid token');
  }

  const token = authHeader.split(' ')[1];

  if (token !== config.apiKeyReadToken) {
    throw new ForbiddenError();
  }

  next();
};

export const authForWrite = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid token');
  }

  const token = authHeader.split(' ')[1];

  if (token !== config.apiKeyWriteToken) {
    throw new ForbiddenError();
  }

  next();
};
