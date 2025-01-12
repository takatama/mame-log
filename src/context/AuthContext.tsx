import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isSignedIn: boolean;
  isRegistered: boolean;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/status');
      const data : { isRegistered: boolean } = await response.json();
      // isRegistered が false なら isSignedIn も false
      setIsSignedIn(!!data.isRegistered);
      setIsRegistered(data.isRegistered);
    } catch {
      setIsSignedIn(false);
      setIsRegistered(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isSignedIn: isSignedIn, isRegistered, checkAuth }}>
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
