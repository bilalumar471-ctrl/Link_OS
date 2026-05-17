import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../lib/auth';

/**
 * Route wrapper that enforces authentication and optional RBAC.
 *
 * Usage:
 *   <ProtectedRoute>              — any authenticated user
 *   <ProtectedRoute roles={[…]}>  — only users with one of the listed roles
 */
const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/unauthorised" replace />;
  }

  return children;
};

export default ProtectedRoute;
