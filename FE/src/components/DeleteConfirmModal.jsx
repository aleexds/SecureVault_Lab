import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ secret, onClose, onConfirm, deleting }) {
  if (!secret) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: 'var(--accent-rose)' }}>
            <Trash2 size={18} />
            <span>Eliminar Secreto</span>
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div
              style={{
                background: 'var(--accent-rose-dim)',
                color: 'var(--accent-rose)',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                ¿Estás seguro de que deseas eliminar este secreto?
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Se eliminará permanentemente la entrada cifrada <strong style={{ color: '#fff' }}>"{secret.title}"</strong> de la base de datos MySQL. Esta acción es irreversible.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={deleting}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Sí, Eliminar Permanentemente'}
          </button>
        </div>
      </div>
    </div>
  );
}
