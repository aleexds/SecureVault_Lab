import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  Plus,
  Search,
  RefreshCw,
  Lock,
  KeyRound,
  FileKey,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import * as api from './services/api';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import SecretCard from './components/SecretCard';
import SecretViewModal from './components/SecretViewModal';
import SecretFormModal from './components/SecretFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import SecurityInfoModal from './components/SecurityInfoModal';
import ToastContainer from './components/ToastContainer';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [secrets, setSecrets] = useState([]);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Modales
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [secretToEdit, setSecretToEdit] = useState(null);
  const [secretToView, setSecretToView] = useState(null);
  const [secretToDelete, setSecretToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSecrets = useCallback(async () => {
    if (!user) {
      setSecrets([]);
      return;
    }
    setLoadingSecrets(true);
    try {
      const res = await api.getSecrets();
      setSecrets(res?.secrets || []);
    } catch (err) {
      addToast(err.message || 'Error al cargar los secretos', 'error');
    } finally {
      setLoadingSecrets(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const filteredSecrets = useMemo(() => {
    if (!searchQuery.trim()) return secrets;
    const q = searchQuery.toLowerCase();
    return secrets.filter((s) => s.title.toLowerCase().includes(q));
  }, [secrets, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!secretToDelete) return;
    setDeleting(true);
    try {
      await api.deleteSecret(secretToDelete.id);
      addToast('Secreto eliminado de la base de datos', 'success');
      setSecretToDelete(null);
      fetchSecrets();
    } catch (err) {
      addToast(err.message || 'Error al eliminar el secreto', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw size={36} className="spin" style={{ color: 'var(--accent-emerald)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Comprobando sesión segura con el servidor...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSecurityInfo={() => setIsSecurityOpen(true)}
      />

      <main className="main-content">
        {!user ? (
          /* Landing / Estado no autenticado */
          <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'var(--accent-emerald)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Shield size={32} />
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              Gestión Criptográfica de Secretos Sensibles
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              SecureVault almacena y custodia credenciales, claves API y datos confidenciales cifrados con <strong>AES-256-GCM</strong> y autenticados con <strong>AAD</strong> vinculado a tu usuario. Las contraseñas están protegidas mediante <strong>Argon2id</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.8rem 1.6rem', fontSize: '1rem' }}
                onClick={() => setIsAuthOpen(true)}
              >
                <KeyRound size={18} />
                <span>Iniciar Sesión / Registrarse</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.8rem 1.6rem', fontSize: '1rem' }}
                onClick={() => setIsSecurityOpen(true)}
              >
                <span>Conocer la Arquitectura</span>
              </button>
            </div>

            {/* Tarjetas de características criptográficas */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '1.25rem',
                marginTop: '4rem',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ color: 'var(--accent-emerald)', marginBottom: '0.75rem' }}>
                  <Lock size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>AES-256-GCM</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  IV único de 96 bits por cada operación y verificación de autenticidad criptográfica con tag de 128 bits.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
                  <Cpu size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>Aislamiento AAD</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Los datos autenticados asocian cada secreto a su fila y usuario para impedir trasplantes en base de datos.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ color: '#818cf8', marginBottom: '0.75rem' }}>
                  <FileKey size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>Argon2id OWASP</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Hashing resistente a ataques en GPU/ASIC (m=19 MiB, t=2) con tiempo constante contra enumeración.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard del usuario autenticado */
          <div>
            {/* Hero Stats */}
            <div className="hero-banner">
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Bóveda Personal de Secretos
                </h1>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Sesión activa con el usuario <strong style={{ color: '#fff' }}>{user.email}</strong>.
                </p>
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">{secrets.length}</span>
                  <span className="stat-label">Secretos Cifrados</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value" style={{ color: 'var(--accent-emerald)' }}>AES-256</span>
                  <span className="stat-label">Algoritmo GCM</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value" style={{ color: 'var(--accent-cyan)' }}>AAD OK</span>
                  <span className="stat-label">Integridad de Fila</span>
                </div>
              </div>
            </div>

            {/* Barra de Controles y Búsqueda */}
            <div className="controls-bar">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar secretos por título..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={fetchSecrets}
                  disabled={loadingSecrets}
                  title="Recargar secretos"
                >
                  <RefreshCw size={15} className={loadingSecrets ? 'spin' : ''} />
                  <span>Actualizar</span>
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSecretToEdit(null);
                    setIsFormOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Nuevo Secreto</span>
                </button>
              </div>
            </div>

            {/* Grid de Secretos */}
            {loadingSecrets && secrets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--accent-emerald)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Cargando secretos desde el servidor...</p>
              </div>
            ) : filteredSecrets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Lock size={28} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  {searchQuery ? 'No se encontraron secretos coincidentes' : 'Tu bóveda está vacía'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  {searchQuery
                    ? `No hay ningún secreto con el término "${searchQuery}".`
                    : 'Crea tu primer secreto. El contenido se cifrará de inmediato con AES-256-GCM antes de guardarse en MySQL.'}
                </p>
                {!searchQuery && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSecretToEdit(null);
                      setIsFormOpen(true);
                    }}
                  >
                    <Plus size={16} />
                    <span>Crear mi primer secreto</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="secrets-grid">
                {filteredSecrets.map((secret) => (
                  <SecretCard
                    key={secret.id}
                    secret={secret}
                    onView={(s) => setSecretToView(s.id)}
                    onEdit={(s) => {
                      setSecretToEdit(s);
                      setIsFormOpen(true);
                    }}
                    onDelete={(s) => setSecretToDelete(s)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modales */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <SecurityInfoModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      <SecretFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSecretToEdit(null);
        }}
        secretToEdit={secretToEdit}
        onSaved={fetchSecrets}
      />

      <SecretViewModal
        secretId={secretToView}
        onClose={() => setSecretToView(null)}
      />

      <DeleteConfirmModal
        secret={secretToDelete}
        onClose={() => setSecretToDelete(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      <ToastContainer />
    </div>
  );
}
