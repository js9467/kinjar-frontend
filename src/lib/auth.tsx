'use client';

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api, getSubdomainInfo } from './api';
import { AuthUser, FamilyRole, FamilyMembership, CreateFamilyRequest } from './types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  createFamily: (familyData: CreateFamilyRequest) => Promise<void>;
  isAuthenticated: boolean;
  isRootAdmin: boolean;
  isFamilyAdmin: boolean;
  canManageFamily: (familyId?: string) => boolean;
  hasRole: (role: FamilyRole, familyId?: string) => boolean;
  subdomainInfo: ReturnType<typeof getSubdomainInfo>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const subdomainInfo = useMemo(() => getSubdomainInfo(), []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // User not authenticated or token expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser } = await api.login(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const createFamily = async (familyData: CreateFamilyRequest) => {
    const { user: updatedUser } = await api.createFamily(familyData);
    setUser(updatedUser);
  };

  const canManageFamily = (familyId?: string) => {
    if (!user) return false;
    if (user.globalRole === 'ROOT_ADMIN') return true;
    
    if (familyId) {
      return user.memberships.some(
        (m: FamilyMembership) => m.familyId === familyId && m.role === 'ADMIN'
      );
    }
    
    // If no familyId provided, check if user can manage any family
    return user.memberships.some((m: FamilyMembership) => m.role === 'ADMIN');
  };

  const hasRole = (role: FamilyRole, familyId?: string) => {
    if (!user) return false;
    
    // Determine which family to check
    let targetFamilyId = familyId;
    if (!targetFamilyId && subdomainInfo.isSubdomain) {
      // Find family by subdomain slug
      const membership = user.memberships.find(
        (m: FamilyMembership) => m.familySlug === subdomainInfo.familySlug
      );
      targetFamilyId = membership?.familyId;
    }
    
    if (!targetFamilyId) return false;
    
    const membership = user.memberships.find((m: FamilyMembership) => m.familyId === targetFamilyId);
    return membership?.role === role;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    createFamily,
    isAuthenticated: !!user,
    isRootAdmin: user?.globalRole === 'ROOT_ADMIN',
    isFamilyAdmin: canManageFamily(),
    canManageFamily,
    hasRole,
    subdomainInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type RequiredRole = 'ROOT' | 'AUTHENTICATED' | 'FAMILY_ADMIN';

interface RequireRoleProps {
  role: RequiredRole;
  familyId?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const RequireRole = ({
  role,
  familyId,
  fallback = null,
  children,
}: RequireRoleProps) => {
  const { loading, canManageFamily, isAuthenticated, isRootAdmin } = useAuth();

  const hasRequiredRole = useMemo(() => {
    if (loading) {
      return false;
    }

    if (role === 'AUTHENTICATED') {
      return isAuthenticated;
    }

    if (role === 'ROOT') {
      return isRootAdmin;
    }

    if (role === 'FAMILY_ADMIN') {
      return canManageFamily(familyId);
    }

    return false;
  }, [role, loading, isAuthenticated, isRootAdmin, canManageFamily, familyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-gray-500">
        Checking permissions...
      </div>
    );
  }

  if (!hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
