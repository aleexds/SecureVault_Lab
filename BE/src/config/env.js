'use strict';

require('./loadEnv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value.trim();
}

function parseTrustProxy(value) {
  if (value === undefined || value === '') return isProd ? 1 : false;
  if (value === 'true') {
    // 'true' confía en cualquier proxy y permite falsificar X-Forwarded-For.
    throw new Error('TRUST_PROXY=true es inseguro; usa el número de saltos (p. ej. 1).');
  }
  if (value === 'false') return false;
  const hops = Number(value);
  if (!Number.isInteger(hops) || hops < 0) throw new Error('TRUST_PROXY debe ser un entero >= 0');
  return hops;
}

function load() {
  const dataEncryptionKey = required('DATA_ENCRYPTION_KEY');
  if (!/^[0-9a-fA-F]{64}$/.test(dataEncryptionKey)) {
    throw new Error('DATA_ENCRYPTION_KEY debe ser una clave de 256 bits en hexadecimal (64 caracteres).');
  }

  const sessionSecret = required('SESSION_SECRET');
  if (sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET debe tener al menos 32 caracteres de alta entropía.');
  }

  if (isProd) {
    const hasDbUrl = Boolean(process.env.DATABASE_URL || process.env.MYSQL_URL);
    const hasDbIndividual = Boolean(
      (process.env.DB_HOST || process.env.MYSQLHOST) &&
      (process.env.DB_NAME || process.env.MYSQLDATABASE) &&
      (process.env.DB_USER || process.env.MYSQLUSER)
    );
    if (!hasDbUrl && !hasDbIndividual) {
      throw new Error('En producción se requiere DATABASE_URL o las variables DB_HOST, DB_NAME, DB_USER y DB_PASSWORD.');
    }
    required('CORS_ORIGIN');
  }

  const defaultCors = isProd ? '' : 'http://localhost:5173,http://localhost:3000';
  const rawCors = process.env.CORS_ORIGIN || defaultCors;
  const corsOrigins = rawCors
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (isProd && corsOrigins.some((o) => o === '*' || (!o.startsWith('https://') && !o.startsWith('http://')))) {
    throw new Error('En producción CORS_ORIGIN solo admite orígenes URL explícitos (ej. https://tu-frontend.up.railway.app).');
  }

  return {
    nodeEnv: NODE_ENV,
    isProd,
    isTest: NODE_ENV === 'test',
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
    trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
    corsOrigins,
    dataEncryptionKey,
    sessionSecret,
    sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS) || 60 * 60,
  };
}

module.exports = Object.freeze(load());
