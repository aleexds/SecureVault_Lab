'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.js'))[env];
const db = {};

let sequelize;
const envUrlVar = config.use_env_variable;
const url = envUrlVar ? process.env[envUrlVar] : null;

if (url) {
  sequelize = new Sequelize(url, config);
} else if (config.database && config.username) {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
} else {
  throw new Error('No se encontró configuración de conexión a la base de datos (DATABASE_URL o variables DB_*)');
}

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && !file.endsWith('.test.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
