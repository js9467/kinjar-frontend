'use client';

import React, {
  ReactNode,
  createContext,
  useCallback,
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
  const [initialized, setInitialized] = useState(false);

  const subdomainInfo = useMemo(() => getSubdomainInfo(), []);

  const rootAdminEmails = useMemo(() => {
    const configured = (process.env.NEXT_PUBLIC_ROOT_ADMINS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const defaults = ['admin.slaughterbeck@gmail.com'];

    return new Set([...defaults, ...configured]);
  }, []);

  const isRootAdminUser = useCallback(
    (maybeUser: AuthUser | null) => {
      if (!maybeUser) {
        return false;
      }

      if (maybeUser.globalRole === 'ROOT_ADMIN') {
        return true;
      }

      const email = maybeUser.email?.toLowerCase();
      if (!email) {
        return false;
      }

      return rootAdminEmails.has(email);
    },
    [rootAdminEmails]
  );

  useEffect(() => {
    if (initialized) return; // Prevent multiple initialization attempts

    const initializeAuth = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        api.setCurrentUser(currentUser);
      } catch (error) {
        // User not authenticated or token expired - this is normal
        setUser(null);
        api.setCurrentUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [initialized]); // Only depend on initialized flag

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser } = await api.login(email, password);
      setUser(loggedInUser);
      api.setCurrentUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    api.setCurrentUser(null);
  };

  const createFamily = async (familyData: CreateFamilyRequest) => {
    const { user: updatedUser } = await api.createFamily(familyData);
    setUser(updatedUser);
    api.setCurrentUser(updatedUser);
  };

  const canManageFamily = (familyId?: string) => {
    if (!user || !user.memberships) return false;
    if (isRootAdminUser(user)) return true;

    if (familyId) {
      return user.memberships.some(
        (m: FamilyMembership) =>
          (m.familyId === familyId || m.familySlug === familyId) && m.role === 'ADMIN'
      );
    }

    // If no familyId provided, check if user can manage any family
    return user.memberships.some((m: FamilyMembership) => m.role === 'ADMIN');
  };

  const hasRole = (role: FamilyRole, familyId?: string) => {
    if (!user || !user.memberships) return false;

    if (isRootAdminUser(user)) {
      return true;
    }

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
    
    const membership = user.memberships.find(
      (m: FamilyMembership) => m.familyId === targetFamilyId || m.familySlug === targetFamilyId
    );
    return membership?.role === role;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    createFamily,
    isAuthenticated: !!user,
    isRootAdmin: isRootAdminUser(user),
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
