'use strict';

// Configuración de Sequelize (usada por la app y por sequelize-cli).
// - La app usa un usuario con permisos mínimos (solo DML).
// - Las migraciones (DB_ROLE=admin) usan un usuario con permisos DDL.
require('../src/config/loadEnv');

const isAdmin = process.env.DB_ROLE === 'admin';

function sslOptions(force) {
  if (!force && process.env.DB_SSL !== 'true') return {};
  const ssl = { rejectUnauthorized: true, minVersion: 'TLSv1.2' };
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

module.exports = {
  development: {
    ...base,
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'securevault',
    username: isAdmin ? process.env.DB_ADMIN_USER : process.env.DB_USER,
    password: isAdmin ? process.env.DB_ADMIN_PASSWORD : process.env.DB_PASSWORD,
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
    // TLS obligatorio con verificación del certificado del servidor.
    use_env_variable: isAdmin ? 'MIGRATION_DATABASE_URL' : 'DATABASE_URL',
    dialectOptions: sslOptions(true),
  },
};
