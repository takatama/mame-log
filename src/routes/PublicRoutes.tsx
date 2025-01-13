import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoutes: React.FC = () => {
  const { isRegistered } = useAuth();

  if (isRegistered) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />; // 子ルートをレンダリング
};

export default PublicRoutes;
