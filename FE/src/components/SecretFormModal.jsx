import React, { useState, useEffect } from 'react';
import { X, Lock, Key, ShieldCheck, AlertCircle } from 'lucide-react';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function SecretFormModal({ isOpen, onClose, secretToEdit, onSaved }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const isEditing = Boolean(secretToEdit);

  useEffect(() => {
    if (secretToEdit) {
      setTitle(secretToEdit.title || '');
      // Para editar el contenido, si no viene en el summary, permitimos ingresar nuevo contenido
      setContent('');
    } else {
      setTitle('');
      setContent('');
    }
    setError('');
  }, [secretToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es obligatorio (máx. 100 caracteres)');
      return;
    }

    if (!isEditing && !content.trim()) {
      setError('El contenido es obligatorio (máx. 10000 caracteres)');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const payload = { title: title.trim() };
        if (content.trim()) payload.content = content;
        await api.updateSecret(secretToEdit.id, payload);
        addToast('Secreto actualizado y re-cifrado con nuevo IV', 'success');
      } else {
        await api.createSecret({ title: title.trim(), content });
        addToast('Secreto cifrado con AES-256-GCM y guardado', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el secreto');
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
            <span>{isEditing ? 'Editar Secreto' : 'Nuevo Secreto Seguro'}</span>
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
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Título / Etiqueta</label>
              <input
                type="text"
                className="form-input"
                placeholder="ej: Credenciales API Stripe, Clave SSH Servidor..."
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              <div className="form-help">
                <span>Identificador descriptivo para la lista</span>
                <span>{title.length}/100</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {isEditing ? 'Nuevo Contenido (dejar en blanco para conservar el actual)' : 'Contenido a Cifrar'}
              </label>
              <textarea
                className="form-textarea"
                placeholder={isEditing ? 'Escribe aquí solo si deseas cambiar el secreto...' : 'Pega aquí contraseñas, tokens, llaves privadas o notas confidenciales...'}
                maxLength={10000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required={!isEditing}
              />
              <div className="form-help">
                <span>Cifrado con AES-256-GCM + IV aleatorio de 96 bits</span>
                <span>{content.length}/10000</span>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: '#67e8f9',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <ShieldCheck size={18} style={{ flexShrink: 0 }} />
              <span>
                El texto plano se destruye en memoria una vez cifrado; la base de datos MySQL solo almacena bytes cifrados y etiquetas de autenticación.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Cifrando...' : isEditing ? 'Guardar Cambios' : 'Cifrar y Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
