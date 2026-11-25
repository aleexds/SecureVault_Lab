import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      if (res?.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      if (res?.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Respuesta inválida del servidor' };
    } catch (err) {
      const message = err.message || 'Error al iniciar sesión';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const register = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.register(email, password);
      if (res?.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Respuesta inválida del servidor' };
    } catch (err) {
      const message = err.message || 'Error al registrar usuario';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Error al cerrar sesión:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
