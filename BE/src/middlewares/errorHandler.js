'use strict';

const env = require('../config/env');
const HttpError = require('../utils/httpError');

function notFound(req, _res, next) {
  next(new HttpError(404, 'Recurso no encontrado'));
}

// En producción nunca se devuelven trazas ni detalles internos: solo un mensaje
// genérico. El detalle completo queda en los logs.
function errorHandler(err, req, res, _next) {
  let status = err.status || err.statusCode || 500;
  let message = err.expose ? err.message : 'Error interno del servidor';

  if (err.type === 'entity.parse.failed') message = 'JSON inválido';
  if (err.type === 'entity.too.large') message = 'El cuerpo de la solicitud es demasiado grande';
  if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'El recurso ya existe';
  }

  if (status >= 500) {
    status = 500;
    message = 'Error interno del servidor';
    (req.log || console).error({ err }, 'Error no controlado');
  }

  const body = { error: message };
  if (env.nodeEnv === 'development' && status >= 500) body.stack = err.stack;

  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
