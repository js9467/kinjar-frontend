'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: {
    email: string;
    password: string;
    family_name?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isRootAdmin: boolean;
  isFamilyAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in via cookies
    const checkAuth = async () => {
      try {
        // Try to get current user - this will work if valid session cookie exists
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        // User not logged in or session expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);

      let resolvedUser = result.user;

      if (!resolvedUser) {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        return currentUser;
      }

      setUser(resolvedUser);
      return resolvedUser;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    family_name?: string;
  }) => {
    try {
      const result = await api.register(userData);

      if (result.user) {
        setUser(result.user);
      } else {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isRootAdmin: user?.global_role === 'ROOT',
    isFamilyAdmin: !!(user?.global_role === 'ROOT' || (user?.tenants && user.tenants.some((t: any) => t.role === 'OWNER' || t.role === 'ADMIN'))),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading-spinner"></div>
        </div>
      );
    }

    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

// Component for role-based access control
export function RequireRole({ 
  role, 
  children, 
  fallback = null 
}: { 
  role: 'ROOT' | 'ADMIN' | 'MEMBER';
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const hasPermission = () => {
    switch (role) {
      case 'ROOT':
        return user.global_role === 'ROOT';
      case 'ADMIN':
        return user.global_role === 'ROOT' || (user.tenants && user.tenants.some((t: any) => t.role === 'OWNER' || t.role === 'ADMIN'));
      case 'MEMBER':
        return true; // All authenticated users are at least members
      default:
        return false;
    }
  };

  return hasPermission() ? <>{children}</> : <>{fallback}</>;
}