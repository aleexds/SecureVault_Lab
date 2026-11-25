'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { createCipherService } = require('../src/utils/crypto');
const { hashPassword, verifyPassword } = require('../src/utils/password');

const vault = createCipherService(crypto.randomBytes(32).toString('hex'));

test('AES-256-GCM cifra y descifra (ida y vuelta)', () => {
  const enc = vault.encrypt('mi secreto ñ 🔐', 'aad');
  assert.notEqual(enc.ciphertext, 'mi secreto ñ 🔐');
  assert.equal(vault.decrypt(enc, 'aad'), 'mi secreto ñ 🔐');
});

test('cada cifrado usa un IV distinto', () => {
  const a = vault.encrypt('igual', 'aad');
  const b = vault.encrypt('igual', 'aad');
  assert.notEqual(a.iv, b.iv);
  assert.notEqual(a.ciphertext, b.ciphertext);
  assert.equal(Buffer.from(a.iv, 'base64').length, 12);
});

test('detecta manipulación del criptograma', () => {
  const enc = vault.encrypt('dato sensible', 'aad');
  const raw = Buffer.from(enc.ciphertext, 'base64');
  raw[0] ^= 0xff;
  assert.throws(() => vault.decrypt({ ...enc, ciphertext: raw.toString('base64') }, 'aad'));
});

test('rechaza un AAD distinto (criptograma movido a otro dueño/registro)', () => {
  const enc = vault.encrypt('dato sensible', 'usuario-1');
  assert.throws(() => vault.decrypt(enc, 'usuario-2'));
});

test('rechaza otra clave', () => {
  const enc = vault.encrypt('dato', 'aad');
  const other = createCipherService(crypto.randomBytes(32).toString('hex'));
  assert.throws(() => other.decrypt(enc, 'aad'));
});

test('rechaza claves que no sean de 256 bits', () => {
  assert.throws(() => createCipherService('abcd'));
});

test('Argon2id genera hashes verificables con sal aleatoria', async () => {
  const h1 = await hashPassword('Contraseña-Segura-123');
  const h2 = await hashPassword('Contraseña-Segura-123');
  assert.match(h1, /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  assert.notEqual(h1, h2);
  assert.equal(await verifyPassword(h1, 'Contraseña-Segura-123'), true);
  assert.equal(await verifyPassword(h1, 'otra'), false);
});
