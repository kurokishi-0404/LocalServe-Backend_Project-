import React from 'react';
import { CheckCircle2, Clock, PlayCircle, CheckSquare, XCircle } from 'lucide-react';

const BookingTimeline = ({ status = 'pending' }) => {
  const steps = [
    { key: 'pending', label: 'Requested', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'in_progress', label: 'In Progress', icon: PlayCircle },
    { key: 'completed', label: 'Completed', icon: CheckSquare }
  ];

  if (status === 'cancelled' || status === 'rejected') {
    return (
      <div
        className="glass-panel-static"
        style={{
          padding: '1.25rem',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          color: '#be123c',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <XCircle size={24} />
        <div>
          <div style={{ fontWeight: 700 }}>Booking {status === 'cancelled' ? 'Cancelled' : 'Rejected'}</div>
          <div style={{ fontSize: '0.85rem' }}>This booking is no longer active.</div>
        </div>
      </div>
    );
  }

  const stepOrder = ['pending', 'confirmed', 'in_progress', 'completed'];
  const currentIndex = stepOrder.indexOf(status);

  return (
    <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Live Service Progress</h4>
        <span className="live-pulse">
          <span className="live-dot"></span> LIVE UPDATE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
                flex: 1
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isDone ? (isCurrent ? '#2563eb' : '#10b981') : '#e2e8f0',
                  color: isDone ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon size={18} />
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#0f172a' : '#64748b',
                  marginTop: '0.5rem'
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingTimeline;
