import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  role: 'student' | 'faculty' | 'admin';
  username?: string;
  name?: string;
  department?: string;
  program?: string;
  email?: string;
  contact_number?: string;
  rfid_tag_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(!!localStorage.getItem('token'));

  const fetchUser = useCallback(async (currentToken: string) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (e) {
      console.error(e);
      // Fallback to JWT decode only when the server is genuinely unreachable
      try {
        const decoded: any = jwtDecode(currentToken);
        setUser({
          id: decoded.sub,
          role: decoded.role,
          username: decoded.username,
        });
      } catch {
        // Token is invalid — clear auth state
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setUser(null);
      setIsAuthLoading(false);
    }
  }, [token, fetchUser]);

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token);
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isAuthLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
