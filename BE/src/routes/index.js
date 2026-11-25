'use strict';

const { Router } = require('express');
const health = require('../controllers/health.controller');
const auth = require('../controllers/auth.controller');
const secrets = require('../controllers/secrets.controller');
const { requireAuth } = require('../middlewares/auth');

function healthRouter() {
  const router = Router();
  router.get('/', health.ready);
  router.get('/live', health.live);
  return router;
}

function authRouter(authLimiter) {
  const router = Router();
  router.post('/register', authLimiter, auth.register);
  router.post('/login', authLimiter, auth.login);
  router.post('/logout', auth.logout);
  router.get('/me', requireAuth, auth.me);
  return router;
}

function secretsRouter() {
  const router = Router();
  router.use(requireAuth);
  router.get('/', secrets.list);
  router.post('/', secrets.create);
  router.get('/:id', secrets.getOne);
  router.patch('/:id', secrets.update);
  router.delete('/:id', secrets.remove);
  return router;
}

module.exports = { healthRouter, authRouter, secretsRouter };
