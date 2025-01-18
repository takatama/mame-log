import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from '@hono/auth-js/react';

interface AuthContextType {
  isSignedIn: boolean;
  isRegistered: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    setIsSignedIn(status === "authenticated");
    setIsRegistered(!!session?.user?.id)
  }, [session, status]);

  return (
    <AuthContext.Provider value={{ isSignedIn, isRegistered }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
