'use strict';

// Hashing de contraseñas con Argon2id (parámetros mínimos recomendados por OWASP:
// m=19 MiB, t=2, p=1). La sal aleatoria va incluida en el hash resultante.
const argon2 = require('argon2');

const ARGON2_OPTIONS = Object.freeze({
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
});

let dummyHashPromise;

function hashPassword(password) {
  return argon2.hash(password, ARGON2_OPTIONS);
}

async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

function needsRehash(hash) {
  return argon2.needsRehash(hash, ARGON2_OPTIONS);
}

// Verificación contra un hash ficticio cuando el usuario no existe, para que el
// tiempo de respuesta no revele qué correos están registrados.
async function verifyAgainstDummy(password) {
  dummyHashPromise ||= hashPassword('securevault-dummy-password');
  await verifyPassword(await dummyHashPromise, password);
  return false;
}

module.exports = { hashPassword, verifyPassword, needsRehash, verifyAgainstDummy, ARGON2_OPTIONS };
