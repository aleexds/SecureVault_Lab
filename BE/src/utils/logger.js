'use strict';

// Logs estructurados en JSON hacia stdout (producción) y legibles en desarrollo.
// Se censuran credenciales, cookies, tokens y contenido de secretos.
const pino = require('pino');

const env = process.env.NODE_ENV || 'development';

const defaultLevel = env === 'test' ? 'silent' : env === 'production' ? 'info' : 'debug';

const logger = pino({
  level: process.env.LOG_LEVEL || defaultLevel,
  base: { service: 'securevault-api', env },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.content',
      '*.token',
      '*.dataEncryptionKey',
      '*.sessionSecret',
    ],
    censor: '[REDACTED]',
  },
  ...(env === 'development'
    ? { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } } }
    : {}),
});

module.exports = logger;
