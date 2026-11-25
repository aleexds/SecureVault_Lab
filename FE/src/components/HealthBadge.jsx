import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import * as api from '../services/api';

export default function HealthBadge() {
  const [health, setHealth] = useState({ status: 'checking', db: 'unknown' });
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    try {
      const res = await api.checkHealth();
      setHealth(res || { status: 'ok', db: 'up' });
    } catch (err) {
      setHealth({
        status: 'error',
        db: 'down',
        message: err.message || 'Sin conexión',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000); // Revisar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const isUp = health.status === 'ok' && health.db === 'up';

  return (
    <div
      className={`badge ${isUp ? 'badge-emerald' : 'badge-rose'}`}
      title={isUp ? 'API y base de datos operativas' : health.message || 'Fallo de conexión'}
      style={{ cursor: 'pointer' }}
      onClick={check}
    >
      {loading ? (
        <RefreshCw size={12} className="spin" />
      ) : isUp ? (
        <CheckCircle2 size={12} />
      ) : (
        <AlertTriangle size={12} />
      )}
      <span>{isUp ? 'Sistema Operativo (MySQL OK)' : 'Backend Desconectado'}</span>
    </div>
  );
}
