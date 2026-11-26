'use strict';

const env = require('./config/env');
const logger = require('./utils/logger');
const db = require('../models');
const { createApp } = require('./app');

// Un solo proceso Node por contenedor/instancia: la plataforma (Render) supervisa
// y reinicia el servicio, por lo que no se usa PM2. Ante un error fatal se termina
// el proceso para que el orquestador cree una instancia sana.
process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Promesa rechazada sin manejar');
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Excepción no capturada');
  process.exit(1);
});

async function start() {
  await db.sequelize.authenticate();
  logger.info('Conexión a MySQL establecida');

  const app = createApp();
  const server = app.listen(env.port, env.host, () => {
    logger.info({ port: env.port, host: env.host, env: env.nodeEnv }, 'SecureVault API escuchando');
  });

  const shutdown = (signal) => {
    logger.info({ signal }, 'Apagado ordenado iniciado');
    server.close(async () => {
      await db.sequelize.close();
      logger.info('Servidor detenido');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.fatal({ err }, 'No se pudo iniciar el servidor');
  process.exit(1);
});
