import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import path from 'path';
import fs from 'fs';
import config from '../config/config';
import { recordCache } from '../config/cache';
import { AppError, ConflictError, NotFoundError } from '../middlewares/error';

export const getRecord = (req: Request, res: Response, next: NextFunction) => {
  const hash = req.params.hash;

  try {
    const cached = recordCache.get(hash);
    if (cached) {
      logger.debug(`Record with hash '${hash}' served from memory cache`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.status(200).send(cached);
      return;
    }

    const filePath = path.join(config.cacheDir, hash);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        logger.debug(`Record with hash '${hash}' not found`);
        return next(new NotFoundError(`Record with hash '${hash}' not found`));
      }

      const stream = fs.createReadStream(filePath);
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => chunks.push(chunk as Buffer));

      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        recordCache.set(hash, buffer);
        logger.debug(`Record with hash '${hash}' served from storage`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.status(200).send(buffer);
        return;
      });

      stream.on('error', (err) => {
        logger.error(`Read stream error: ${err}`);
        return next(new AppError(`Unable to read record with hash '${hash}'`));
      });
    });
  } catch (error) {
    next(error);
  }
};

export const saveRecord = (req: Request, res: Response, next: NextFunction) => {
  const hash = req.params.hash;
  const filePath = path.join(config.cacheDir, hash);
  const tempPath = filePath + '.tmp';

  try {
    if (recordCache.get(hash) || fs.existsSync(filePath)) {
      logger.debug(`Record with hash '${hash}' already exists`);
      return next(
        new ConflictError(`Record with hash '${hash}' already exists`),
      );
    }

    const chunks: Buffer[] = [];
    const writeStream = fs.createWriteStream(tempPath);

    req.on('data', (chunk) => {
      chunks.push(chunk as Buffer);
      writeStream.write(chunk);
    });

    req.on('end', () => {
      writeStream.end();
      writeStream.on('finish', () => {
        fs.rename(tempPath, filePath, (err) => {
          if (err) {
            logger.error(`Rename error: ${err}`);
            return next(
              new AppError(`Unable to save record with hash '${hash}'`),
            );
          }

          const buffer = Buffer.concat(chunks);
          recordCache.set(hash, buffer);

          logger.debug(`Record with hash '${hash}' saved to disk and cached`);
          res.status(202).json({ message: `Record with hash '${hash}' saved` });
          return;
        });
      });
    });

    req.on('error', (err) => {
      logger.error(`Request stream error: ${err}`);
      writeStream.destroy();
      return next(new AppError(`Unable to save record with hash '${hash}'`));
    });

    writeStream.on('error', (err) => {
      logger.error(`Write stream error: ${err}`);
      return next(new AppError(`Unable to save record with hash '${hash}'`));
    });
  } catch (error) {
    next(error);
  }
};
