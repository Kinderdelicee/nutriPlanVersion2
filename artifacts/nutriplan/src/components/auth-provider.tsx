import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setAuthTokenGetter } from '@workspace/api-client-react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem('nutriplan_token');
  });

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('nutriplan_token', newToken);
    } else {
      localStorage.removeItem('nutriplan_token');
    }
    setTokenState(newToken);
  };

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem('nutriplan_token'));
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
