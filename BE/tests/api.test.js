'use strict';

const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { db, createApp, resetDb } = require('./helpers');

const PASSWORD = 'Contraseña-Muy-Segura-2026';

before(resetDb);
after(() => db.sequelize.close());

describe('Health y cabeceras de seguridad', () => {
  const app = createApp();

  test('GET /health responde ok con la BD arriba', async () => {
    const res = await request(app).get('/health').expect(200);
    assert.equal(res.body.db, 'up');
  });

  test('emite cabeceras de seguridad (HSTS, CSP, nosniff, frame) y oculta Express', async () => {
    const res = await request(app).get('/health/live').expect(200);
    assert.match(res.headers['strict-transport-security'], /max-age=31536000; includeSubDomains; preload/);
    assert.match(res.headers['content-security-policy'], /default-src 'none'/);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.equal(res.headers['x-powered-by'], undefined);
    assert.ok(res.headers['x-request-id']);
  });

  test('no expone archivos sensibles (/.env, /package.json)', async () => {
    await request(app).get('/.env').expect(404);
    await request(app).get('/package.json').expect(404);
  });

  test('CORS solo permite orígenes configurados', async () => {
    const bad = await request(app).get('/health/live').set('Origin', 'https://evil.example');
    assert.equal(bad.headers['access-control-allow-origin'], undefined);
    const good = await request(app).get('/health/live').set('Origin', 'http://localhost:5173');
    assert.equal(good.headers['access-control-allow-origin'], 'http://localhost:5173');
  });

  test('JSON inválido devuelve 400 sin traza', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{malo').expect(400);
    assert.deepEqual(res.body, { error: 'JSON inválido' });
  });
});

describe('Autenticación', () => {
  const app = createApp();
  const agent = request.agent(app);

  test('registro valida datos de entrada', async () => {
    await agent.post('/api/auth/register').send({ email: 'no-es-correo', password: PASSWORD }).expect(400);
    await agent.post('/api/auth/register').send({ email: 'a@b.com', password: 'corta' }).expect(400);
  });

  test('registro crea usuario, guarda hash Argon2id y emite cookie segura', async () => {
    const res = await agent.post('/api/auth/register').send({ email: 'Alex@Example.com', password: PASSWORD }).expect(201);
    assert.equal(res.body.user.email, 'alex@example.com');
    assert.equal(res.body.user.passwordHash, undefined);

    const cookie = res.headers['set-cookie'][0];
    assert.match(cookie, /^sv_session=/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);

    const stored = await db.User.unscoped().findOne({ where: { email: 'alex@example.com' } });
    assert.match(stored.passwordHash, /^\$argon2id\$/);
  });

  test('no permite correos duplicados', async () => {
    await agent.post('/api/auth/register').send({ email: 'alex@example.com', password: PASSWORD }).expect(409);
  });

  test('login con credenciales incorrectas responde 401 genérico', async () => {
    const r1 = await request(app).post('/api/auth/login').send({ email: 'alex@example.com', password: 'incorrecta-123' }).expect(401);
    const r2 = await request(app).post('/api/auth/login').send({ email: 'nadie@example.com', password: 'incorrecta-123' }).expect(401);
    assert.deepEqual(r1.body, r2.body);
  });

  test('login correcto, /me y logout', async () => {
    await agent.post('/api/auth/login').send({ email: 'alex@example.com', password: PASSWORD }).expect(200);
    const me = await agent.get('/api/auth/me').expect(200);
    assert.equal(me.body.user.email, 'alex@example.com');
    await agent.post('/api/auth/logout').expect(204);
    await agent.get('/api/auth/me').expect(401);
  });

  test('rechaza tokens manipulados', async () => {
    await request(app).get('/api/auth/me').set('Cookie', 'sv_session=eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.').expect(401);
  });
});

describe('Bóveda de secretos cifrados', () => {
  const app = createApp();
  const alice = request.agent(app);
  const bob = request.agent(app);
  let secretId;

  before(async () => {
    await alice.post('/api/auth/register').send({ email: 'alice@example.com', password: PASSWORD }).expect(201);
    await bob.post('/api/auth/register').send({ email: 'bob@example.com', password: PASSWORD }).expect(201);
  });

  test('requiere autenticación', async () => {
    await request(app).get('/api/secrets').expect(401);
  });

  test('crea un secreto y lo guarda cifrado en la BD', async () => {
    const res = await alice.post('/api/secrets').send({ title: 'Banco', content: 'PIN 4321' }).expect(201);
    secretId = res.body.secret.id;
    assert.equal(res.body.secret.content, undefined);

    const row = await db.Secret.findByPk(secretId);
    assert.ok(!row.ciphertext.includes('PIN 4321'));
    assert.notEqual(Buffer.from(row.ciphertext, 'base64').toString('utf8'), 'PIN 4321');
    assert.ok(row.iv && row.authTag);
  });

  test('lista sin contenido y obtiene el detalle descifrado', async () => {
    const list = await alice.get('/api/secrets').expect(200);
    assert.equal(list.body.secrets.length, 1);
    assert.equal(list.body.secrets[0].content, undefined);

    const one = await alice.get(`/api/secrets/${secretId}`).expect(200);
    assert.equal(one.body.secret.content, 'PIN 4321');
  });

  test('aislamiento: otro usuario no puede ver, editar ni borrar', async () => {
    await bob.get(`/api/secrets/${secretId}`).expect(404);
    await bob.patch(`/api/secrets/${secretId}`).send({ title: 'x' }).expect(404);
    await bob.delete(`/api/secrets/${secretId}`).expect(404);
    const list = await bob.get('/api/secrets').expect(200);
    assert.equal(list.body.secrets.length, 0);
  });

  test('un criptograma copiado a otro usuario no se puede descifrar (AAD)', async () => {
    const created = await bob.post('/api/secrets').send({ title: 'Bob', content: 'original' }).expect(201);
    const source = await db.Secret.findByPk(secretId);
    await db.Secret.update(
      { ciphertext: source.ciphertext, iv: source.iv, authTag: source.authTag },
      { where: { id: created.body.secret.id } }
    );
    const res = await bob.get(`/api/secrets/${created.body.secret.id}`).expect(500);
    assert.deepEqual(res.body, { error: 'Error interno del servidor' });
  });

  test('actualiza re-cifrando con un IV nuevo', async () => {
    const before = await db.Secret.findByPk(secretId);
    await alice.patch(`/api/secrets/${secretId}`).send({ content: 'PIN 9999' }).expect(200);
    const after = await db.Secret.findByPk(secretId);
    assert.notEqual(after.iv, before.iv);
    const one = await alice.get(`/api/secrets/${secretId}`).expect(200);
    assert.equal(one.body.secret.content, 'PIN 9999');
  });

  test('valida entrada y ids', async () => {
    await alice.post('/api/secrets').send({ title: '', content: 'x' }).expect(400);
    await alice.post('/api/secrets').send({ title: 'x' }).expect(400);
    await alice.get('/api/secrets/no-es-uuid').expect(404);
  });

  test('elimina el secreto', async () => {
    await alice.delete(`/api/secrets/${secretId}`).expect(204);
    await alice.get(`/api/secrets/${secretId}`).expect(404);
  });
});

describe('Rate limiting', () => {
  const app = createApp();

  test('devuelve 429 tras demasiados intentos de login', async () => {
    let last;
    for (let i = 0; i < 12; i += 1) {
      last = await request(app).post('/api/auth/login').send({ email: 'x@example.com', password: 'incorrecta-123' });
    }
    assert.equal(last.status, 429);
    assert.ok(last.headers['ratelimit-policy'] || last.headers.ratelimit);
  });
});
