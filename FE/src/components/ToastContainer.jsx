import React from 'react';
import { X, CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />;
      case 'error':
        return <AlertOctagon size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />;
      default:
        return <Info size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {getIcon(t.type)}
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: '0.5rem',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
