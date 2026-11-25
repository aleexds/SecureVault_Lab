'use strict';

const crypto = require('crypto');
const { Secret } = require('../../models');
const HttpError = require('../utils/httpError');
const vault = require('../services/vault');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// El AAD vincula cada criptograma con su dueño y su registro.
const aadFor = (userId, secretId) => `securevault:${userId}:${secretId}`;

function parseSecret(body, { partial = false } = {}) {
  const out = {};
  if (body?.title !== undefined || !partial) {
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title || title.length > 100) throw new HttpError(400, 'El título es obligatorio (máx. 100 caracteres)');
    out.title = title;
  }
  if (body?.content !== undefined || !partial) {
    const content = typeof body?.content === 'string' ? body.content : '';
    if (!content || content.length > 10000) throw new HttpError(400, 'El contenido es obligatorio (máx. 10000 caracteres)');
    out.content = content;
  }
  if (partial && Object.keys(out).length === 0) throw new HttpError(400, 'Nada que actualizar');
  return out;
}

async function findOwned(req) {
  if (!UUID_RE.test(req.params.id)) throw new HttpError(404, 'Secreto no encontrado');
  const secret = await Secret.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!secret) throw new HttpError(404, 'Secreto no encontrado');
  return secret;
}

function toSummary(secret) {
  return { id: secret.id, title: secret.title, createdAt: secret.createdAt, updatedAt: secret.updatedAt };
}

function toDetail(secret) {
  let content;
  try {
    content = vault.decrypt(secret, aadFor(secret.userId, secret.id));
  } catch (err) {
    err.message = `Fallo de integridad al descifrar el secreto ${secret.id}`;
    throw err;
  }
  return { ...toSummary(secret), content };
}

async function list(req, res) {
  const secrets = await Secret.findAll({
    where: { userId: req.user.id },
    attributes: ['id', 'title', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']],
  });
  res.json({ secrets: secrets.map(toSummary) });
}

async function getOne(req, res) {
  res.json({ secret: toDetail(await findOwned(req)) });
}

async function create(req, res) {
  const { title, content } = parseSecret(req.body);
  const id = crypto.randomUUID();
  const encrypted = vault.encrypt(content, aadFor(req.user.id, id));
  const secret = await Secret.create({ id, userId: req.user.id, title, ...encrypted });
  res.status(201).json({ secret: toSummary(secret) });
}

async function update(req, res) {
  const changes = parseSecret(req.body, { partial: true });
  const secret = await findOwned(req);
  const patch = {};
  if (changes.title) patch.title = changes.title;
  if (changes.content) Object.assign(patch, vault.encrypt(changes.content, aadFor(secret.userId, secret.id)));
  await secret.update(patch);
  res.json({ secret: toSummary(secret) });
}

async function remove(req, res) {
  const secret = await findOwned(req);
  await secret.destroy();
  res.status(204).end();
}

module.exports = { list, getOne, create, update, remove };
