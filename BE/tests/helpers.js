'use strict';

// Variables por defecto para pruebas (solo si no vienen del entorno / .env).
process.env.NODE_ENV = 'test';
require('../src/config/loadEnv');
process.env.DATA_ENCRYPTION_KEY ||= 'a'.repeat(64);
process.env.SESSION_SECRET ||= 'test-session-secret-con-mas-de-32-caracteres';

const db = require('../models');
const { createApp } = require('../src/app');

async function resetDb() {
  await db.sequelize.sync({ force: true });
}

module.exports = { db, createApp, resetDb };
