'use strict';

// Crea las bases de desarrollo y pruebas (si no existen) con el usuario administrador.
require('../src/config/loadEnv');
const mysql = require('mysql2/promise');

const IDENT_RE = /^[A-Za-z0-9_]+$/;

async function main() {
  const names = [process.env.DB_NAME || 'securevault', process.env.DB_TEST_NAME || 'securevault_test'];
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_ADMIN_USER,
    password: process.env.DB_ADMIN_PASSWORD,
  });
  try {
    for (const name of names) {
      if (!IDENT_RE.test(name)) throw new Error(`Nombre de base inválido: ${name}`);
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`Base de datos lista: ${name}`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
