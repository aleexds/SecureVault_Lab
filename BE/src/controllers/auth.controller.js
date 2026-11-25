'use strict';

const { User } = require('../../models');
const HttpError = require('../utils/httpError');
const { hashPassword, verifyPassword, needsRehash, verifyAgainstDummy } = require('../utils/password');
const { issueSession, clearSession } = require('../services/session');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCredentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!EMAIL_RE.test(email) || email.length > 254) throw new HttpError(400, 'Correo electrónico inválido');
  return { email, password };
}

async function register(req, res) {
  const { email, password } = parseCredentials(req.body);
  if (password.length < 12 || password.length > 128) {
    throw new HttpError(400, 'La contraseña debe tener entre 12 y 128 caracteres');
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) throw new HttpError(409, 'El correo ya está registrado');

  const user = await User.create({ email, passwordHash: await hashPassword(password) });
  issueSession(res, user);
  res.status(201).json({ user });
}

async function login(req, res) {
  const { email, password } = parseCredentials(req.body);
  if (!password || password.length > 128) throw new HttpError(401, 'Credenciales inválidas');

  const user = await User.unscoped().findOne({ where: { email } });
  const valid = user ? await verifyPassword(user.passwordHash, password) : await verifyAgainstDummy(password);
  if (!valid) throw new HttpError(401, 'Credenciales inválidas');

  if (needsRehash(user.passwordHash)) {
    await user.update({ passwordHash: await hashPassword(password) });
  }

  issueSession(res, user);
  res.json({ user });
}

function logout(_req, res) {
  clearSession(res);
  res.status(204).end();
}

async function me(req, res) {
  const user = await User.findByPk(req.user.id);
  if (!user) throw new HttpError(401, 'Sesión inválida o expirada');
  res.json({ user });
}

module.exports = { register, login, logout, me };
