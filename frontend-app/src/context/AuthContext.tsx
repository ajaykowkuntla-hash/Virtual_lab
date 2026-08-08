import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  role: 'student' | 'faculty';
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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async (currentToken: string) => {
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
      // Fallback to decode if fetch fails
      const decoded: any = jwtDecode(currentToken);
      setUser({
        id: decoded.sub,
        role: decoded.role,
        username: decoded.username,
      });
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setUser(null);
    }
  }, [token]);

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
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, refreshUser }}>
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
