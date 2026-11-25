'use strict';

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.expose = status < 500;
  }
}

module.exports = HttpError;
