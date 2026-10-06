import React from 'react';

const StatusBadge = ({ status }) => {
  const normStatus = (status || 'pending').toLowerCase();
  
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    paid: 'Paid',
    failed: 'Failed'
  };

  return (
    <span className={`badge badge-${normStatus}`}>
      {labels[normStatus] || status}
    </span>
  );
};

export default StatusBadge;
