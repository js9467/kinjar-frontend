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

import { useAuth } from './auth';
import { api } from './api';
import { FamilyMemberProfile, FamilyRole } from './types';

interface ChildContextType {
  selectedChild: FamilyMemberProfile | null;
  availableChildren: FamilyMemberProfile[];
  isActingAsChild: boolean;
  selectChild: (child: FamilyMemberProfile | null) => void;
  getCurrentActingUser: () => {
    id: string;
    name: string;
    avatarColor: string;
    avatarUrl?: string;
    role?: FamilyRole;
  };
  loading: boolean;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

interface ChildProviderProps {
  children: ReactNode;
  familyId?: string;
  familySlug?: string;
}

export const ChildProvider = ({ children, familyId, familySlug }: ChildProviderProps) => {
  const { user, subdomainInfo } = useAuth();
  const [selectedChild, setSelectedChild] = useState<FamilyMemberProfile | null>(null);
  const [availableChildren, setAvailableChildren] = useState<FamilyMemberProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine which family we're working with
  const effectiveFamilySlug = familySlug || subdomainInfo.familySlug;
  const effectiveFamilyId = familyId;

  const loadAvailableChildren = useCallback(async () => {
    if (!user || !effectiveFamilySlug || !effectiveFamilyId) return;

    setLoading(true);
    try {
      // Get current user's role in this family
      const membership = user.memberships?.find(
        m => m.familySlug === effectiveFamilySlug || m.familyId === effectiveFamilyId
      );

      if (!membership) return;

      // Only parents (ADMIN or ADULT) can act as children
      const canActAsChildren = ['ADMIN', 'ADULT'].includes(membership.role);
      if (!canActAsChildren) {
        setAvailableChildren([]);
        return;
      }

      // Get family members
      const familyProfile = await api.getFamilyBySlug(effectiveFamilySlug);
      
      // Filter for children that this user can act as
      const children = familyProfile.members.filter((member: FamilyMemberProfile) => {
        // Exclude the current user
        if (member.userId === user.id) return false;
        
        // Include only children roles
        const childRoles: FamilyRole[] = [
          'CHILD_0_5',
          'CHILD_5_10', 
          'CHILD_10_14',
          'CHILD_14_16',
          'CHILD_16_ADULT'
        ];
        
        return childRoles.includes(member.role);
      });

      setAvailableChildren(children);
    } catch (error) {
      console.error('Failed to load available children:', error);
      setAvailableChildren([]);
    } finally {
      setLoading(false);
    }
  }, [user, effectiveFamilySlug, effectiveFamilyId]);

  useEffect(() => {
    loadAvailableChildren();
  }, [loadAvailableChildren]);

  // Immediate restoration from sessionStorage (doesn't wait for availableChildren)
  useEffect(() => {
    if (!effectiveFamilySlug) return;
    
    const stored = sessionStorage.getItem(`selected-child-${effectiveFamilySlug}`);
    if (stored) {
      try {
        const child = JSON.parse(stored);
        setSelectedChild(child);
        api.setActingAsChild({
          id: child.id,
          name: child.name,
          avatarColor: child.avatarColor,
          avatarUrl: child.avatarUrl,
        });
        console.log('[ChildProvider] Restored child from sessionStorage:', child.name);
      } catch (error) {
        console.error('Failed to restore selected child:', error);
      }
    }
  }, [effectiveFamilySlug]);

  const selectChild = useCallback((child: FamilyMemberProfile | null) => {
    setSelectedChild(child);
    
    // Update the API instance to use this child
    if (child) {
      api.setActingAsChild({
        id: child.id,
        name: child.name,
        avatarColor: child.avatarColor,
        avatarUrl: child.avatarUrl,
      });
    } else {
      api.setActingAsChild(null);
    }
    
    // Store selection in sessionStorage for persistence within session
    if (child) {
      sessionStorage.setItem(`selected-child-${effectiveFamilySlug}`, JSON.stringify(child));
    } else {
      sessionStorage.removeItem(`selected-child-${effectiveFamilySlug}`);
    }
  }, [effectiveFamilySlug]);

  // Validate selected child when available children are loaded
  useEffect(() => {
    if (!effectiveFamilySlug || !selectedChild || availableChildren.length === 0) return;
    
    const isValid = availableChildren.some(ac => ac.id === selectedChild.id);
    if (!isValid) {
      console.log('[ChildProvider] Selected child is no longer valid, clearing selection');
      setSelectedChild(null);
      api.setActingAsChild(null);
      sessionStorage.removeItem(`selected-child-${effectiveFamilySlug}`);
    }
  }, [availableChildren, selectedChild, effectiveFamilySlug]);

  const getCurrentActingUser = useCallback(() => {
    if (selectedChild) {
      return {
        id: selectedChild.id,
        name: selectedChild.name,
        avatarColor: selectedChild.avatarColor,
        avatarUrl: selectedChild.avatarUrl,
        role: selectedChild.role,
      };
    }

    // Return current user
    return {
      id: user?.id || '',
      name: user?.name || '',
      avatarColor: user?.avatarColor || '#3B82F6',
      avatarUrl: user?.avatarUrl,
      role: user?.memberships?.find(m => 
        m.familySlug === effectiveFamilySlug || 
        m.familyId === effectiveFamilyId
      )?.role,
    };
  }, [selectedChild, user, effectiveFamilySlug, effectiveFamilyId]);

  const value: ChildContextType = {
    selectedChild,
    availableChildren,
    isActingAsChild: !!selectedChild,
    selectChild,
    getCurrentActingUser,
    loading,
  };

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
};

export const useChildContext = () => {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error('useChildContext must be used within a ChildProvider');
  }
  return context;
};

// Helper hook for components that need child context but want to gracefully handle when it's not available
export const useOptionalChildContext = () => {
  try {
    return useContext(ChildContext);
  } catch {
    return null;
  }
};