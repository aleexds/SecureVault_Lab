import React from 'react';
import { Eye, Edit3, Trash2, Calendar, Key, ShieldCheck } from 'lucide-react';

export default function SecretCard({ secret, onView, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="secret-card">
      <div>
        <div className="secret-card-header">
          <h3 className="secret-title" title={secret.title}>
            {secret.title}
          </h3>
          <span className="badge badge-emerald" title="Cifrado con AES-256-GCM">
            <ShieldCheck size={12} />
            <span>AES-GCM</span>
          </span>
        </div>

        <div className="secret-meta">
          <Calendar size={13} />
          <span>Creado: {formatDate(secret.createdAt)}</span>
        </div>
      </div>

      <div className="secret-card-actions">
        <button
          className="btn btn-primary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
          onClick={() => onView(secret)}
          title="Descifrar y ver contenido"
        >
          <Eye size={14} />
          <span>Ver Secreto</span>
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className="btn-icon"
            onClick={() => onEdit(secret)}
            title="Editar título o contenido"
          >
            <Edit3 size={15} />
          </button>
          <button
            className="btn-icon danger"
            onClick={() => onDelete(secret)}
            title="Eliminar secreto"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
