import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Copy, Check, ShieldCheck, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function SecretViewModal({ secretId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (!secretId) return;

    let mounted = true;
    setLoading(true);
    setError('');

    api.getSecretDetail(secretId)
      .then((data) => {
        if (mounted && data?.secret) {
          setDetail(data.secret);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Error al descifrar el secreto');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [secretId]);

  const handleCopy = async () => {
    if (!detail?.content) return;
    try {
      await navigator.clipboard.writeText(detail.content);
      setCopied(true);
      addToast('Secreto copiado al portapapeles', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      addToast('No se pudo copiar automáticamente', 'error');
    }
  };

  if (!secretId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Lock size={18} style={{ color: 'var(--accent-emerald)' }} />
            <span>Detalle Descifrado</span>
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={28} className="spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--accent-emerald)' }} />
              <p>Descifrando en servidor con AES-256-GCM y validando AAD...</p>
            </div>
          ) : error ? (
            <div
              style={{
                background: 'var(--accent-rose-dim)',
                border: '1px solid var(--accent-rose)',
                color: '#fecdd3',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Error de Integridad o Descifrado:</strong>
                <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>{error}</p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="form-label">Título del Secreto</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {detail.title}
                </h3>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Contenido Sensible</span>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                    onClick={() => setRevealed(!revealed)}
                  >
                    {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{revealed ? 'Ocultar' : 'Revelar'}</span>
                  </button>
                </div>

                <div
                  style={{
                    background: '#090d16',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem',
                    minHeight: '90px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    color: revealed ? '#38bdf8' : 'var(--text-muted)',
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap',
                    position: 'relative',
                  }}
                >
                  {revealed ? detail.content : '••••••••••••••••••••••••••••••••••••••••••••'}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  color: '#6ee7b7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>
                  Autenticación de Integridad AAD superada: El criptograma pertenece legítimamente a tu usuario y registro.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          {detail?.content && (
            <button type="button" className="btn btn-primary" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '¡Copiado!' : 'Copiar Secreto'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
