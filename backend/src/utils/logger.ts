import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const isDev = env.NODE_ENV === 'development';

export const logger = winston.createLogger({
  level:       env.LOG_LEVEL,
  defaultMeta: { service: 'potupartners-api' },
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json(),
  ),
  transports: [
    // Console: pretty in dev, JSON in prod
    new winston.transports.Console({
      format: isDev
        ? combine(colorize(), simple())
        : combine(timestamp(), json()),
    }),
    // Error-only file in production
    ...(isDev ? [] : [
      new winston.transports.File({
        filename: 'logs/error.log',
        level:    'error',
        maxsize:  10 * 1024 * 1024,   // 10MB
        maxFiles: 5,
        tailable: true,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize:  20 * 1024 * 1024,
        maxFiles: 5,
        tailable: true,
      }),
    ]),
  ],
  exitOnError: false,
});

// ─── HTTP request logger (for morgan stream) ──────────────────────────────────
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
