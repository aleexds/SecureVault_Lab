import React from 'react';
import { Shield, Lock, LogOut, User, Info, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HealthBadge from './HealthBadge';

export default function Navbar({ onOpenAuth, onOpenSecurityInfo }) {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-brand">
          <div className="brand-icon">
            <Shield size={20} />
          </div>
          <div>
            <span>SecureVault</span>
            <span style={{ fontSize: '0.68rem', display: 'block', color: 'var(--text-muted)', fontWeight: 400 }}>
              Cifrado AES-256-GCM & Argon2id
            </span>
          </div>
        </a>

        <div className="navbar-actions">
          <HealthBadge />

          <button
            className="btn btn-ghost"
            onClick={onOpenSecurityInfo}
            title="Información de seguridad y criptografía"
            style={{ fontSize: '0.85rem' }}
          >
            <Info size={16} />
            <span className="hide-mobile">Seguridad</span>
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="badge badge-cyan" title={user.email}>
                <User size={12} />
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={logout}
                title="Cerrar sesión"
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <LogOut size={15} />
                <span className="hide-mobile">Salir</span>
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onOpenAuth}
            >
              <KeyRound size={16} />
              <span>Acceder</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
