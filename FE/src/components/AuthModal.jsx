import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, KeyRound, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Vacía', color: 'transparent' };
    let score = 0;
    if (pass.length >= 12) score += 40;
    if (pass.length >= 16) score += 20;
    if (/[A-Z]/.test(pass)) score += 15;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 10;

    if (pass.length < 12) return { score: Math.min(score, 30), text: 'Mínimo 12 caracteres requerido', color: '#f43f5e' };
    if (score < 60) return { score, text: 'Aceptable (>=12 caract.)', color: '#f59e0b' };
    if (score < 80) return { score, text: 'Segura', color: '#10b981' };
    return { score: 100, text: 'Muy fuerte', color: '#06b6d4' };
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (isRegister) {
      if (password.length < 12) {
        setError('Por requerimientos de seguridad, la contraseña debe tener al menos 12 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = isRegister
        ? await register(email.trim(), password)
        : await login(email.trim(), password);

      if (res.success) {
        addToast(
          isRegister
            ? 'Cuenta creada y sesión iniciada con éxito'
            : 'Sesión iniciada con éxito',
          'success'
        );
        onClose();
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Ocurrió un error');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Lock size={18} style={{ color: 'var(--accent-emerald)' }} />
            {isRegister ? 'Crear Cuenta en SecureVault' : 'Iniciar Sesión'}
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'var(--accent-rose-dim)',
                  border: '1px solid var(--accent-rose)',
                  color: '#fecdd3',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder={isRegister ? 'Mínimo 12 caracteres' : '••••••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {isRegister && password && (
                <div>
                  <div className="password-meter">
                    <div
                      className="password-meter-fill"
                      style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                    />
                  </div>
                  <div className="form-help">
                    <span style={{ color: strength.color }}>{strength.text}</span>
                    <span>Argon2id (m=19 MiB)</span>
                  </div>
                </div>
              )}
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Confirmar Contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                style={{
                  color: 'var(--accent-emerald)',
                  marginLeft: '0.4rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.4rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                }}
              >
                {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Procesando...' : isRegister ? 'Registrarse' : 'Entrar a la Bóveda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
