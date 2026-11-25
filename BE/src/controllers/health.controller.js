'use strict';

const { sequelize } = require('../../models');

function live(_req, res) {
  res.json({ status: 'ok' });
}

async function ready(req, res) {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'up', uptime: Math.round(process.uptime()) });
  } catch (err) {
    req.log?.error({ err }, 'Health check: base de datos no disponible');
    res.status(503).json({ status: 'error', db: 'down' });
  }
}

module.exports = { live, ready };
