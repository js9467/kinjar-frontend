'use client';

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAppState } from './app-state';
import { initialUsers } from './sample-data';
import { AuthUser } from './types';

interface RegisterPayload {
  familyName: string;
  adminName: string;
  adminEmail: string;
  message?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  users: AuthUser[];
  loading: boolean;
  login: (email: string) => Promise<AuthUser>;
  loginById: (userId: string) => void;
  logout: () => void;
  registerFamilySpace: (payload: RegisterPayload) => Promise<void>;
  isAuthenticated: boolean;
  isRootAdmin: boolean;
  familyAdminIds: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'kinjar-demo-user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users] = useState<AuthUser[]>(initialUsers);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const { submitFamilySignup } = useAppState();

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const storedId = window.localStorage.getItem(USER_STORAGE_KEY);
    if (storedId) {
      const existing = initialUsers.find((candidate) => candidate.id === storedId);
      if (existing) {
        setUser(existing);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, user.id);
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string) => {
    const account = users.find(
      (candidate) => candidate.email.toLowerCase() === email.toLowerCase()
    );

    if (!account) {
      throw new Error('No account found for that email.');
    }

    setUser(account);
    return account;
  };

  const loginById = (userId: string) => {
    const account = users.find((candidate) => candidate.id === userId);
    if (!account) {
      throw new Error('User not found');
    }
    setUser(account);
  };

  const logout = () => {
    setUser(null);
  };

  const registerFamilySpace = async (payload: RegisterPayload) => {
    if (!payload.familyName || !payload.adminEmail || !payload.adminName) {
      throw new Error('Please provide your family name and admin contact details.');
    }

    submitFamilySignup({
      familyName: payload.familyName,
      adminName: payload.adminName,
      adminEmail: payload.adminEmail,
      message: payload.message,
    });
  };

  const familyAdminIds = useMemo(
    () =>
      user
        ? user.memberships
            .filter((membership) => membership.role === 'ADMIN')
            .map((membership) => membership.familyId)
        : [],
    [user]
  );

  const value: AuthContextType = {
    user,
    users,
    loading,
    login,
    loginById,
    logout,
    registerFamilySpace,
    isAuthenticated: !!user,
    isRootAdmin: user?.globalRole === 'ROOT_ADMIN',
    familyAdminIds,
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
