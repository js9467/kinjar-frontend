'use client';

import React from 'react';
import { useOptionalChildContext } from '@/lib/child-context';

interface FamilyHeaderActionsProps {
  canManageFamily: boolean;
  familyId: string;
  showAdminInterface: boolean;
  setShowAdminInterface: (show: boolean) => void;
}

export function FamilyHeaderActions({ 
  canManageFamily, 
  familyId, 
  showAdminInterface, 
  setShowAdminInterface 
}: FamilyHeaderActionsProps) {
  const childContext = useOptionalChildContext();
  
  // Hide admin controls when in child mode
  if (childContext?.isActingAsChild) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {canManageFamily && (
        <button
          onClick={() => setShowAdminInterface(!showAdminInterface)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            showAdminInterface
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          {showAdminInterface ? 'Hide Admin' : 'Manage Family'}
        </button>
      )}
    </div>
  );
}