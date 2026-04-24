import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aqua_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('aqua_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('aqua_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    const { user: userData, token: newToken } = res.data;
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('aqua_token', newToken);
    localStorage.setItem('aqua_user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (_) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('aqua_token');
    localStorage.removeItem('aqua_user');
  };

  const isAdmin = user?.role === 'admin';
  const isPengelola = user?.role === 'pengelola';
  const isOperator = user?.role === 'operator';
  const canExport = isAdmin || isPengelola;
  const canCalibrate = isAdmin || isPengelola;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isPengelola, isOperator, canExport, canCalibrate }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
