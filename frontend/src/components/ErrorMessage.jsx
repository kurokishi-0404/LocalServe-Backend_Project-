import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message = 'An error occurred', onRetry = null }) => {
  return (
    <div
      style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#b91c1c',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        margin: '1rem 0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <AlertCircle size={20} color="#dc2626" />
        <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: '#ffffff',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            padding: '0.3rem 0.8rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
