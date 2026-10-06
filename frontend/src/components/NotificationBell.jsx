import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const NotificationBell = () => {
  const { toasts } = useSocket();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#475569',
          position: 'relative',
          transition: 'all 0.2s ease'
        }}
        title="Notifications"
      >
        <Bell size={18} />
        {toasts.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {toasts.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="glass-panel-static"
          style={{
            position: 'absolute',
            top: '46px',
            right: 0,
            width: '280px',
            background: 'rgba(255, 255, 255, 0.96)',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
            borderRadius: '16px',
            padding: '1rem',
            zIndex: 1001
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '0.5rem'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Recent Notifications</span>
            <span className="live-pulse">
              <span className="live-dot"></span> Socket.io
            </span>
          </div>

          {toasts.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>
              No new alerts
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {toasts.map((t) => (
                <div
                  key={t.id}
                  style={{
                    fontSize: '0.82rem',
                    color: '#1e293b',
                    padding: '0.5rem',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}
                >
                  {t.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
