import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import adminAxios from '../utils/adminAxios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'thakkar_admin_token';

const getUsernameFromToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.username || 'Admin';
  } catch {
    return 'Admin';
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setIsAuthenticated(false);
    setUsername('');
  }, []);

  const login = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    setUsername(getUsernameFromToken(newToken));
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        await adminAxios.get('/auth/verify');
        setToken(storedToken);
        setIsAuthenticated(true);
        setUsername(getUsernameFromToken(storedToken));
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, isLoading, username, login, logout }}>
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

export default AuthContext;

