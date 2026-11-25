// Cliente API para comunicarse con SecureVault Backend
// Soporta peticiones relativas (/api, /health) a través del proxy de Vite
// y peticiones con credenciales (cookies HttpOnly sv_session).

const API_BASE = '';

async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    // Esencial para transmitir y recibir la cookie sv_session (HttpOnly)
    credentials: 'include',
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);

    // 204 No Content (logout, delete)
    if (res.status === 204) {
      return { success: true };
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.error || `Error ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      err.message = 'No se pudo conectar con el servidor backend. ¿Está corriendo en http://localhost:3000?';
    }
    throw err;
  }
}

// Health checks
export const checkHealth = () => request('/health', { method: 'GET' });
export const checkLiveness = () => request('/health/live', { method: 'GET' });

// Auth
export const register = (email, password) =>
  request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const login = (email, password) =>
  request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  request('/api/auth/logout', {
    method: 'POST',
  });

export const getMe = () =>
  request('/api/auth/me', {
    method: 'GET',
  });

// Secrets
export const getSecrets = () =>
  request('/api/secrets', {
    method: 'GET',
  });

export const getSecretDetail = (id) =>
  request(`/api/secrets/${id}`, {
    method: 'GET',
  });

export const createSecret = ({ title, content }) =>
  request('/api/secrets', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });

export const updateSecret = (id, changes) =>
  request(`/api/secrets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });

export const deleteSecret = (id) =>
  request(`/api/secrets/${id}`, {
    method: 'DELETE',
  });
