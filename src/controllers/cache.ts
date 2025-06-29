import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import path from 'path';
import fs from 'fs';
import config from '../config/config';

export const getRecord = (req: Request, res: Response, next: NextFunction) => {
  try {
    const hash = req.params.hash;

    const filePath = path.join(config.cacheDir, hash);
    logger.info(`>>> ${filePath}`);
    if (!fs.existsSync(filePath)) {
      logger.warn(`record with hash ${hash} not found`);
      res.status(404).json({ error: `record with hash '${hash}' not found` });
      return;
    }

    logger.info(`record with hash '${hash}' found`);
    res.status(200).header('Content-Type', 'application/octet-stream');
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const saveRecord = (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenScope = (req as any).tokenScope;
    if (tokenScope !== 'write') {
      res.status(403).json({ error: 'forbidden' });
      return;
    }

    const hash = req.params.hash;

    const filePath = path.join(config.cacheDir, hash);
    logger.info(`>>> ${filePath}`);
    if (fs.existsSync(filePath)) {
      logger.warn(`record with hash ${hash} already exists`);
      res
        .status(409)
        .json({ error: `record with hash '${hash}' already exists` });
      return;
    }

    const writeStream = fs.createWriteStream(filePath);
    req.pipe(writeStream);

    writeStream.on('finish', () => {
      logger.info(`record with hash ${hash} added to cache`);
      res.status(202).json({ message: `record with hash '${hash}' saved` });
    });

    // error while writing
    writeStream.on('error', (err) => {
      logger.error(`Write error: ${err}`);
      res
        .status(500)
        .json({ error: `unable to save record with hash '${hash}'` });
    });

    // error while uploading
    req.on('error', () => {
      res
        .status(500)
        .json({ error: `unable to save record with hash '${hash}'` });
    });
  } catch (error) {
    next(error);
  }
};
