import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  title = 'No items found',
  description = 'There are no records to display at this time.',
  icon: Icon = PackageOpen,
  actionText = null,
  onAction = null
}) => {
  return (
    <div
      className="glass-panel-static"
      style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        margin: '1.5rem 0'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(37, 99, 235, 0.08)',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}
      >
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
