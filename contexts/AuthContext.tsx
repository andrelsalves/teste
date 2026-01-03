import React, {
  createContext,
  useContext,
  useState,
  ReactNode
} from 'react';

import { User } from '../types/types';

interface AuthContextData {
  user: User | null;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const value: AuthContextData = {
    user,
    logout: () => setUser(null),
    updateUser: setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
