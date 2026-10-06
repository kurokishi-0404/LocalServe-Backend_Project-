import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, CheckCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useSocket();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        maxWidth: '380px'
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass-panel-static"
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#2563eb'}`,
            padding: '0.85rem 1.1rem',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            borderRadius: '14px',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {toast.type === 'success' ? (
              <CheckCircle size={18} color="#10b981" />
            ) : (
              <Bell size={18} color="#2563eb" />
            )}
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ color: '#94a3b8', padding: '0.2rem' }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;
