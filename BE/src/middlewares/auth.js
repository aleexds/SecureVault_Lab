'use strict';

const HttpError = require('../utils/httpError');
const { COOKIE_NAME, verifySessionToken } = require('../services/session');

function requireAuth(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next(new HttpError(401, 'No autenticado'));
  try {
    const payload = verifySessionToken(token);
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new HttpError(401, 'Sesión inválida o expirada'));
  }
}

module.exports = { requireAuth };
