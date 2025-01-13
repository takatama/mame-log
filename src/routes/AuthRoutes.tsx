import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRoutes: React.FC = () => {
  const { isSignedIn, isRegistered } = useAuth();

  if (!isSignedIn) {
    // return <Navigate to="/api/auth/signin" />;
    window.location.href = '/api/auth/signin'; // 外部リンクへのリダイレクト
    return null; // コンポーネントをレンダリングしない
  }

  if (isRegistered) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Outlet />;
}

export default AuthRoutes;
