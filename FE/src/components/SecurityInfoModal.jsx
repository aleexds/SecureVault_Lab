import React from 'react';
import { X, ShieldCheck, Key, Lock, Database, ShieldAlert, Cpu } from 'lucide-react';

export default function SecurityInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Lock size={20} color="#10b981" />,
      title: 'Cifrado AES-256-GCM Autenticado',
      desc: 'Cada secreto se cifra con clave de 256 bits, un vector de inicialización (IV) de 96 bits aleatorio por operación y una etiqueta de autenticación (auth tag) de 128 bits para detectar manipulaciones.',
    },
    {
      icon: <Cpu size={20} color="#06b6d4" />,
      title: 'Protección AAD (Associated Data)',
      desc: 'El criptograma se vincula criptográficamente a la tupla `securevault:${userId}:${secretId}`. Si un atacante copia un secreto cifrado a otro usuario o fila, el descifrado falla de forma inmediata.',
    },
    {
      icon: <Key size={20} color="#6366f1" />,
      title: 'Contraseñas con Argon2id',
      desc: 'Implementa el algoritmo estándar de OWASP (m=19 MiB, t=2, p=1). Rehash automático y verificación ficticia contra enumeración de usuarios por análisis de tiempo de respuesta.',
    },
    {
      icon: <Database size={20} color="#f59e0b" />,
      title: 'Usuario MySQL de Mínimo Privilegio',
      desc: 'La aplicación opera con el usuario `securevault_app` restringido exclusivamente a permisos DML (SELECT, INSERT, UPDATE, DELETE), sin privilegios DDL (DROP, CREATE, ALTER).',
    },
    {
      icon: <ShieldCheck size={20} color="#ec4899" />,
      title: 'Cookies Seguras HttpOnly & Strict CSP',
      desc: 'Sesión JWT contenida en cookie `sv_session` con banderas `HttpOnly`, `SameSite=Strict` y `Secure`. Cabeceras Helmet con `CSP: default-src \'none\'` y anti-clickjacking.',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <ShieldCheck size={20} style={{ color: 'var(--accent-emerald)' }} />
            <span>Arquitectura de Seguridad SecureVault</span>
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            SecureVault ha sido desarrollado bajo estrictos estándares de seguridad y criptografía moderna definidos en la Fase 0 de la práctica:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {features.map((item, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ marginTop: '2px' }}>{item.icon}</div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
