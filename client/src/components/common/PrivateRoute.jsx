import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Authenticating user..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their default dashboard
    const defaultRoutes = {
      student: '/dashboard',
      faculty: '/faculty/dashboard',
      technician: '/technician/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={defaultRoutes[user?.role] || '/dashboard'} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

