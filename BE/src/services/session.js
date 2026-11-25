'use strict';

// Sesión sin estado: JWT HS256 firmado con SESSION_SECRET, entregado en una cookie
// HttpOnly + SameSite=Strict (+ Secure en producción).
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const COOKIE_NAME = 'sv_session';
const ISSUER = 'securevault';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    path: '/',
  };
}

function issueSession(res, user) {
  const token = jwt.sign({ sub: user.id }, env.sessionSecret, {
    algorithm: 'HS256',
    expiresIn: env.sessionTtlSeconds,
    issuer: ISSUER,
  });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: env.sessionTtlSeconds * 1000 });
}

function clearSession(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

function verifySessionToken(token) {
  return jwt.verify(token, env.sessionSecret, { algorithms: ['HS256'], issuer: ISSUER });
}

module.exports = { COOKIE_NAME, issueSession, clearSession, verifySessionToken };
