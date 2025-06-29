import { Request, Response, NextFunction } from 'express';
import config from '../config/config';
import logger from '../config/logger';

export const authenticate = (
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
  if (token === config.apiKeyWriteToken) {
    (req as any).tokenScope = 'write';
  } else if (token === config.apiKeyReadToken) {
    (req as any).tokenScope = 'read';
  } else {
    res.status(401).json({ error: 'forbidden' });
    return;
  }

  next();
};
