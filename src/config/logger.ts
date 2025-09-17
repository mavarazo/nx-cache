import winston from 'winston';
import config from './config';

export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] ${level}: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
