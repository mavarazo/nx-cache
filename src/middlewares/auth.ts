import { Request, Response, NextFunction } from 'express';
import config from '../config/config';

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

  if (token !== config.apiKeyToken) {
    res.status(401).json({ error: 'forbidden' });
    return;
  }

  next();
};
