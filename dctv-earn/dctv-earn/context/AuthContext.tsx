import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, LoginPayload, RegisterPayload } from '../types';
import api from '../services/api';
import { User } from '../services/store';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  // Helper to switch user roles for testing purposes
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-logout on 401 from API
    api.setOnUnauthorized(() => {
      logout();
    });
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Try restore token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
          api.setToken(token);
          const res = await api.getMe(); // expects { user }
          if (res?.user) {
            setUser(res.user);
            setIsLoading(false);
            return;
          }
        }
        setUser(null);
      } catch (err) {
        // invalid token or network error, ensure we clear local token
        localStorage.removeItem('token');
        api.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginPayload) => {
    setIsLoading(true);
    try {
      // API client expects (email, password)
      const res = await api.login(data.email, data.password);
      if (res?.token) {
        localStorage.setItem('token', res.token);
        api.setToken(res.token);
      }
      setUser(res.user ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res?.token) {
        localStorage.setItem('token', res.token);
        api.setToken(res.token);
      }
      setUser(res.user ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.clearToken();
    setUser(null);
  };

  // Helper for the demo/test environment only
  const switchRole = (role: UserRole) => {
    if (process.env.NODE_ENV !== 'development') return;
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};