'use strict';

// Cifrado autenticado AES-256-GCM.
// - IV aleatorio de 96 bits por operación (nunca se reutiliza con la misma clave).
// - Etiqueta de autenticación de 128 bits: detecta cualquier manipulación.
// - AAD (datos adicionales autenticados) vincula el criptograma a su dueño y registro,
//   impidiendo copiar un criptograma válido a otra fila u otro usuario.
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function createCipherService(hexKey) {
  const key = Buffer.from(hexKey || '', 'hex');
  if (key.length !== 32) throw new Error('La clave AES-256 debe medir 32 bytes (64 caracteres hex).');

  function encrypt(plaintext, aad) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
    if (aad) cipher.setAAD(Buffer.from(aad, 'utf8'));
    const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
    return {
      ciphertext: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64'),
    };
  }

  function decrypt({ ciphertext, iv, authTag }, aad) {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'), {
      authTagLength: TAG_LENGTH,
    });
    if (aad) decipher.setAAD(Buffer.from(aad, 'utf8'));
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
  }

  return Object.freeze({ encrypt, decrypt });
}

module.exports = { createCipherService, ALGORITHM, IV_LENGTH, TAG_LENGTH };
