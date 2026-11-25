# SecureVault API (BE)

API Node.js/Express para gestión segura de datos sensibles: cifrado **AES-256-GCM** y contraseñas con **Argon2id**.

## Puesta en marcha local

```bash
npm install
cp .env.example .env      # y completa los valores (npm run gen:secrets genera las claves)
npm run db:create         # crea securevault y securevault_test (usuario admin)
npm run db:migrate        # crea las tablas (usuario admin, DDL)
npm run db:app-user       # crea securevault_app con permisos SOLO DML
npm run dev               # http://localhost:3000
```

| Script | Descripción |
| --- | --- |
| `npm start` / `npm run dev` | Servidor (producción / con recarga) |
| `npm test` | Pruebas unitarias + integración (`node:test` + supertest, BD `securevault_test`) |
| `npm run lint` | ESLint |
| `npm run db:migrate` / `db:migrate:undo` | Migraciones con el usuario administrador |
| `npm run db:app-user` | Usuario de mínimo privilegio para la app |
| `npm run gen:secrets` | Genera `DATA_ENCRYPTION_KEY` y `SESSION_SECRET` |

## Endpoints

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/health` | – | Estado + conexión a MySQL (503 si la BD cae) |
| GET | `/health/live` | – | Liveness |
| POST | `/api/auth/register` | – | `{ email, password }` (12–128 caracteres) |
| POST | `/api/auth/login` | – | Emite cookie `sv_session` (HttpOnly, SameSite=Strict, Secure en prod) |
| POST | `/api/auth/logout` | – | Borra la cookie |
| GET | `/api/auth/me` | ✔ | Usuario actual |
| GET | `/api/secrets` | ✔ | Lista (solo títulos) |
| POST | `/api/secrets` | ✔ | `{ title, content }` – el contenido se cifra antes de guardarse |
| GET | `/api/secrets/:id` | ✔ | Detalle descifrado |
| PATCH | `/api/secrets/:id` | ✔ | Actualiza título y/o contenido (re-cifra con IV nuevo) |
| DELETE | `/api/secrets/:id` | ✔ | Elimina |

## Seguridad implementada

- AES-256-GCM con IV aleatorio por operación y AAD `usuario:secreto` (un criptograma copiado a otra fila no se descifra).
- Argon2id (m=19 MiB, t=2, p=1), rehash automático y verificación ficticia contra enumeración por tiempo.
- Helmet: HSTS (1 año, preload), CSP `default-src 'none'`, `X-Frame-Options: DENY`, nosniff, sin `X-Powered-By`.
- Rate limiting global (300/15 min) y de autenticación (10/15 min) → 429.
- CORS restringido a `CORS_ORIGIN`; `trust proxy = 1` en producción.
- Logs JSON con pino a stdout, con censura de cookies, contraseñas y contenido.
- Errores genéricos en producción (sin trazas); validación estricta de variables de entorno al arrancar.
- MySQL: usuario de la app solo DML; TLS obligatorio con verificación de certificado en producción.

## Producción (Render)

`render.yaml` define el servicio. Variables en el panel de Render: `DATABASE_URL`, `MIGRATION_DATABASE_URL`,
`DB_SSL_CA`, `DATA_ENCRYPTION_KEY`, `SESSION_SECRET`, `CORS_ORIGIN`. El usuario de producción se crea con
[`db/least-privilege.sql`](db/least-privilege.sql). GitHub Actions (`.github/workflows/ci-cd.yml`) ejecuta audit,
lint y pruebas, y dispara el Deploy Hook (`RENDER_DEPLOY_HOOK_URL`) solo si todo pasa en `main`.
