import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSession } from '@hono/auth-js/react';

const PublicRoutes: React.FC = () => {
  const { status } = useSession();

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />; // 子ルートをレンダリング
};

export default PublicRoutes;
