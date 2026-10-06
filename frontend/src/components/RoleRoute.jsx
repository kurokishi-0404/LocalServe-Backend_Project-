import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Checking authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to user's actual role dashboard
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'provider') return <Navigate to="/provider/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
