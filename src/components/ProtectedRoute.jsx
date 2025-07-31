// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // adjust path if different

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;

  // Check role if required
  if (allowedRoles && !allowedRoles.includes(userData?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
