# SecureVault Frontend (FE)

Interfaz web moderna y segura para interactuar con la API de SecureVault.

## Tecnologías

- **React 18** + **Vite 6**
- **Lucide React** (iconografía de seguridad y criptografía)
- **Tema Cyberpunk / Obsidian Dark Mode** (diseño a medida con CSS variables y micro-interacciones)
- **Proxy inverso de desarrollo** (resuelve el manejo de cookies `SameSite=Strict` sin problemas de CORS en localhost)

## Funcionalidades implementadas

1. **Autenticación segura:**
   - Inicio de sesión y registro de usuario.
   - Validación cliente de contraseñas de al menos 12 caracteres (indicador de fortaleza visual).
   - Gestión de sesión mediante cookie `sv_session` (`HttpOnly`).
   - Cierre de sesión y verificación de sesión al recargar la página.
2. **Bóveda de Secretos:**
   - Listado en tiempo real con filtrado y buscador dinámico.
   - Creación de secretos con cifrado AES-256-GCM y AAD en el servidor.
   - Visualización descifrada con interruptor Ocultar / Revelar y botón de copia rápida al portapapeles.
   - Edición de títulos y re-cifrado de contenido con nuevo IV.
   - Eliminación con confirmación modal.
3. **Monitor de Salud y Estado:**
   - Verificación continua de conectividad con el backend (`/health`) y estado de la base de datos MySQL.
4. **Guía de Arquitectura de Seguridad:**
   - Modal explicativo con los detalles de la Fase 0 (AES-256-GCM, Argon2id, AAD, mínimo privilegio en BD).

## Ejecución local

```bash
cd FE
npm install
npm run dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).
