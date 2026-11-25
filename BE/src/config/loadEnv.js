'use strict';

// Carga el archivo .env SOLO fuera de producción.
// En producción los secretos se inyectan como variables de entorno del proceso
// desde el panel de la plataforma (Render), nunca desde un archivo en disco.
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });
}
