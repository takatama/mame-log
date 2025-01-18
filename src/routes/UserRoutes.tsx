import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserRoutes: React.FC = () => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Navigate to="/" />
  }

  return <Outlet />
};

export default UserRoutes;
