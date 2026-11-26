'use strict';

// Configuración de Sequelize (usada por la app y por sequelize-cli).
// - La app usa un usuario con permisos mínimos (solo DML).
// - Las migraciones (DB_ROLE=admin) usan un usuario con permisos DDL.
require('../src/config/loadEnv');

const isAdmin = process.env.DB_ROLE === 'admin';

function sslOptions(force) {
  // Si explícitamente se desactiva con DB_SSL=false, no se usa SSL
  if (process.env.DB_SSL === 'false') return {};
  // Si no se fuerza y no está DB_SSL=true, tampoco
  if (!force && process.env.DB_SSL !== 'true') return {};

  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
  const ssl = { rejectUnauthorized, minVersion: 'TLSv1.2' };
  if (process.env.DB_SSL_CA) {
    // Certificado CA del proveedor (PEM). Se admiten saltos de línea escapados.
    ssl.ca = process.env.DB_SSL_CA.replace(/\\n/g, '\n');
  }
  return { ssl };
}

const base = {
  dialect: 'mysql',
  logging: false,
  define: { underscored: true },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};

// Resuelve parámetros individuales de conexión (admite DB_* y variables automáticas de Railway MYSQL*)
const host = process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306;
const database = process.env.DB_NAME || process.env.MYSQLDATABASE || 'securevault';
const username = isAdmin
  ? (process.env.DB_ADMIN_USER || process.env.MYSQLUSER || 'root')
  : (process.env.DB_USER || process.env.MYSQLUSER || 'securevault_app');
const password = isAdmin
  ? (process.env.DB_ADMIN_PASSWORD || process.env.MYSQLPASSWORD || '')
  : (process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '');

// En producción usa DATABASE_URL si está presente; en caso contrario recurre a los parámetros individuales
const prodUrlVar = isAdmin
  ? (process.env.MIGRATION_DATABASE_URL ? 'MIGRATION_DATABASE_URL' : (process.env.DATABASE_URL ? 'DATABASE_URL' : null))
  : (process.env.DATABASE_URL ? 'DATABASE_URL' : (process.env.MYSQL_URL ? 'MYSQL_URL' : null));

module.exports = {
  development: {
    ...base,
    host,
    port,
    database,
    username,
    password,
    dialectOptions: sslOptions(false),
  },
  test: {
    ...base,
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_TEST_NAME || 'securevault_test',
    username: process.env.DB_ADMIN_USER || 'root',
    password: process.env.DB_ADMIN_PASSWORD || 'root',
    dialectOptions: sslOptions(false),
  },
  production: {
    ...base,
    ...(prodUrlVar
      ? { use_env_variable: prodUrlVar }
      : { host, port, database, username, password }),
    // Si se pasa DB_SSL=true, DB_SSL_CA o se conecta a host externo con DB_SSL!=false, habilita SSL
    dialectOptions: sslOptions(process.env.DB_SSL === 'true' || Boolean(process.env.DB_SSL_CA)),
  },
};

