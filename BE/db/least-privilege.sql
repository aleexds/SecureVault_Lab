-- Usuario de la aplicación para PRODUCCIÓN (MySQL gestionado: Aiven / Railway / TiDB).
-- Ejecutar con el usuario administrador del proveedor DESPUÉS de correr las migraciones.
-- Sustituye <PASSWORD_SEGURO> por una contraseña aleatoria de alta entropía.

CREATE USER IF NOT EXISTS 'securevault_app'@'%'
  IDENTIFIED BY '<PASSWORD_SEGURO>'
  REQUIRE SSL;                                   -- rechaza conexiones sin TLS

REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'securevault_app'@'%';

-- Solo DML sobre el esquema de la app. Sin DROP / ALTER / CREATE ni privilegios SUPER.
GRANT SELECT, INSERT, UPDATE, DELETE ON securevault_db.* TO 'securevault_app'@'%';

FLUSH PRIVILEGES;

SHOW GRANTS FOR 'securevault_app'@'%';
