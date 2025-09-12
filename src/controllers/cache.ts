import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import path from 'path';
import fs from 'fs';
import config from '../config/config';
import { recordCache } from '../config/cache';
import { AppError, ConflictError, NotFoundError } from '../middlewares/error';

export const getRecord = (req: Request, res: Response, next: NextFunction) => {
  try {
    const hash = req.params.hash;

    const cached = recordCache.get(hash);
    if (cached) {
      logger.debug(`Record with hash '${hash}' served from memory cache`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.status(200).send(cached);
      return next();
    }

    const filePath = path.join(config.cacheDir, hash);
    if (!fs.existsSync(filePath)) {
      logger.debug(`Record with hash ${hash} not found`);
      throw new NotFoundError(`Record with hash '${hash}' not found`);
    }

    logger.debug(`Record with hash '${hash}' served from storage`);
    const buffer = fs.readFileSync(filePath);
    recordCache.set(hash, buffer);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export const saveRecord = (req: Request, res: Response, next: NextFunction) => {
  try {
    const hash = req.params.hash;

    const filePath = path.join(config.cacheDir, hash);
    logger.debug(`>>> ${filePath}`);
    if (recordCache.get(hash) || fs.existsSync(filePath)) {
      logger.debug(`Record with hash ${hash} already exists`);
      throw new ConflictError(`Record with hash '${hash}' already exists`);
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);

      recordCache.set(hash, buffer);

      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          logger.error(`Write error: ${err}`);
          throw new AppError(`Unable to save record with hash '${hash}'`);
        }

        logger.debug(`Record with hash '${hash}' saved to disk and cached`);
        res.status(202).json({ message: `Record with hash '${hash}' saved` });
      });
    });

    req.on('error', () => {
      throw new AppError(`Unable to save record with hash '${hash}'`);
    });
  } catch (error) {
    next(error);
  }
};
