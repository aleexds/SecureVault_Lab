'use strict';

const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');

const env = require('./config/env');
const logger = require('./utils/logger');
const { createRateLimiters } = require('./middlewares/rateLimiters');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { healthRouter, authRouter, secretsRouter } = require('./routes');

function createApp() {
  const app = express();
  const limiters = createRateLimiters();

  app.disable('x-powered-by');
  // Detrás del proxy/edge de Render: confiar en 1 salto para leer X-Forwarded-For/Proto.
  app.set('trust proxy', env.trustProxy);

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const id = crypto.randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
      autoLogging: { ignore: (req) => req.url.startsWith('/health') },
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
    })
  );

  // Cabeceras de seguridad: HSTS, CSP restrictiva (API sin HTML), nosniff, anti-clickjacking...
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"] },
      },
      strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
      crossOriginResourcePolicy: { policy: 'same-site' },
      referrerPolicy: { policy: 'no-referrer' },
      frameguard: { action: 'deny' },
    })
  );

  // CORS restrictivo: solo los orígenes explícitos de CORS_ORIGIN.
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || env.corsOrigins.includes(origin)),
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type'],
      maxAge: 600,
    })
  );

  // Health checks antes del rate limiter (los consulta la plataforma constantemente).
  app.use('/health', healthRouter());

  app.use(limiters.global);
  app.use(express.json({ limit: '20kb' }));
  app.use(cookieParser());

  app.use('/api/auth', authRouter(limiters.auth));
  app.use('/api/secrets', secretsRouter());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
