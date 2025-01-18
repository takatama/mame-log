import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@hono/auth-js/react';

const UserRoutes: React.FC = () => {
  const { status } = useSession();

  if (status !== 'authenticated') {
    return <Navigate to="/" />
  }

  return <Outlet />
};

export default UserRoutes;
