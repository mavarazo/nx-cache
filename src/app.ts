import express from 'express';
import expressWinston from 'express-winston';
import { errorHandler } from './middlewares/error';
import cache from './routes/cache';
import logger from './config/logger';

const app = express();

// request logger
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorize: true,
    expressFormat: true,
  }),
);

// routes
app.use('/v1/cache', cache);

// global error handler
app.use(errorHandler);

export default app;
