'use strict';

const { rateLimit } = require('express-rate-limit');

function limiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
  });
}

// Se crean por instancia de la app para que cada instancia tenga su propio contador.
function createRateLimiters() {
  return {
    global: limiter({
      windowMs: 15 * 60 * 1000,
      limit: Number(process.env.RATE_LIMIT_GLOBAL) || 300,
      message: 'Demasiadas solicitudes, intenta más tarde',
    }),
    auth: limiter({
      windowMs: 15 * 60 * 1000,
      limit: Number(process.env.RATE_LIMIT_AUTH) || 10,
      message: 'Demasiados intentos de autenticación, intenta más tarde',
    }),
  };
}

module.exports = { createRateLimiters };
