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
    res.status(401).json({ error: 'missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (token !== config.apiKeyReadToken) {
    res.status(403).json({ error: 'forbidden' });
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
    res.status(401).json({ error: 'missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (token !== config.apiKeyWriteToken) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  next();
};
