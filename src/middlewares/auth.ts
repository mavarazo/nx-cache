import { Request, Response, NextFunction } from 'express';
import config from '../config/config';

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
    res
      .set('Content-Type', 'text/plain')
      .status(401)
      .send('error: missing or invalid token');
    return;
  }

  const token = authHeader.split(' ')[1];

  if (token !== config.apiKeyReadToken) {
    res.set('Content-Type', 'text/plain').status(403).send('error: forbidden');
    return;
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
    res
      .set('Content-Type', 'text/plain')
      .status(401)
      .send('error: missing or invalid token');
    return;
  }

  const token = authHeader.split(' ')[1];

  if (token !== config.apiKeyWriteToken) {
    res.set('Content-Type', 'text/plain').status(403).send('error: forbidden');
    return;
  }

  next();
};
