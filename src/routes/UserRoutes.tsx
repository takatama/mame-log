import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserRoutes: React.FC = () => {
  const { isSignedIn, isRegistered } = useAuth();

  if (!isSignedIn) {
    // return <Navigate to="/api/auth/signin" />;
    window.location.href = '/api/auth/signin'; // 外部リンクへのリダイレクト
    return null; // コンポーネントをレンダリングしない
  }

  if (!isRegistered) {
    return <Navigate to="/signup" />;
  }

  return <Outlet />
};

export default UserRoutes;
