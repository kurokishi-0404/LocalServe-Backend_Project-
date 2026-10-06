import React from 'react';

const GlassCard = ({ children, className = '', style = {}, hoverEffect = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${hoverEffect ? 'glass-panel' : 'glass-panel-static'} ${className}`}
      style={{
        padding: '1.5rem',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
