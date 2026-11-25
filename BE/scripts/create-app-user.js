'use strict';

// Principio de mínimo privilegio: crea (o sincroniza) el usuario de la aplicación con
// permisos exclusivamente DML (SELECT, INSERT, UPDATE, DELETE) sobre la base de la app.
// Sin DDL (DROP/ALTER/CREATE), sin GRANT OPTION y sin privilegios globales.
require('../src/config/loadEnv');
const mysql = require('mysql2/promise');

const IDENT_RE = /^[A-Za-z0-9_]+$/;

async function main() {
  const database = process.env.DB_NAME || 'securevault';
  const appUser = process.env.DB_USER;
  const appPassword = process.env.DB_PASSWORD;
  const appHosts = (process.env.DB_APP_HOSTS || 'localhost,127.0.0.1').split(',').map((h) => h.trim()).filter(Boolean);

  if (!appUser || !appPassword) throw new Error('Define DB_USER y DB_PASSWORD en el entorno');
  if (!IDENT_RE.test(database) || !IDENT_RE.test(appUser)) throw new Error('Nombre de base o usuario inválido');
  if (appUser === process.env.DB_ADMIN_USER || appUser === 'root') throw new Error('El usuario de la app no puede ser el administrador');
  if (appPassword.length < 16) throw new Error('DB_PASSWORD debe tener al menos 16 caracteres');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_ADMIN_USER,
    password: process.env.DB_ADMIN_PASSWORD,
  });

  try {
    for (const host of appHosts) {
      await conn.query('CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?', [appUser, host, appPassword]);
      await conn.query('ALTER USER ?@? IDENTIFIED BY ?', [appUser, host, appPassword]);
      await conn.query('REVOKE ALL PRIVILEGES, GRANT OPTION FROM ?@?', [appUser, host]);
      await conn.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON \`${database}\`.* TO ?@?`, [appUser, host]);
      const [grants] = await conn.query('SHOW GRANTS FOR ?@?', [appUser, host]);
      grants.forEach((row) => console.log(Object.values(row)[0]));
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
