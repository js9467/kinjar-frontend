'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/lib/types';
import { useOptionalChildContext } from '@/lib/child-context';

// Simple SVG icons
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface FamilyAppHeaderProps {
  title: string;
  description?: string;
  user: AuthUser;
  onLogout: () => void;
  actions?: React.ReactNode;
  showChildSelector?: boolean;
  // Navigation props
  stats?: {
    members: number;
    posts: number;
    connections: number;
  };
  onConnectionsClick?: () => void;
  onMembersClick?: () => void;
  onChangePasswordClick?: () => void;
}

export function FamilyAppHeader({ 
  title, 
  description, 
  user, 
  onLogout, 
  actions,
  showChildSelector = true,
  stats,
  onConnectionsClick,
  onMembersClick,
  onChangePasswordClick
}: FamilyAppHeaderProps) {
  const childContext = useOptionalChildContext();
  const [showChildDropdown, setShowChildDropdown] = useState(false);

  const currentActingUser = childContext?.getCurrentActingUser() || {
    id: user.id,
    name: user.name,
    avatarColor: user.avatarColor,
    avatarUrl: user.avatarUrl,
  };

  const hasAvailableChildren = childContext && childContext.availableChildren.length > 0;
  const canSelectChildren = showChildSelector && hasAvailableChildren;

  const handleChildSelect = (child: any) => {
    childContext?.selectChild(child);
    setShowChildDropdown(false);
  };

  const handleReturnToParent = () => {
    childContext?.selectChild(null);
    setShowChildDropdown(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-8 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">Kinjar Family Space</p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{description}</p>
          )}
          {/* Family Stats */}
          {stats && (
            <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
              <button 
                onClick={onMembersClick}
                className="hover:text-slate-900 transition-colors"
              >
                {stats.members} member{stats.members === 1 ? '' : 's'}
              </button>
              <span>•</span>
              <span>{stats.posts} post{stats.posts === 1 ? '' : 's'}</span>
              <span>•</span>
              <button 
                onClick={onConnectionsClick}
                className="hover:text-slate-900 transition-colors"
              >
                {stats.connections} connection{stats.connections === 1 ? '' : 's'}
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Exit Child Mode Button - Prominent when in child mode */}
          {childContext?.isActingAsChild && (
            <button
              onClick={handleReturnToParent}
              className="flex items-center gap-2 rounded-lg bg-orange-100 border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Exit Child Mode
            </button>
          )}

          {/* Current User/Child Display */}
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold text-white"
              style={{ backgroundColor: currentActingUser.avatarColor }}
            >
              {currentActingUser.avatarUrl ? (
                <img 
                  src={currentActingUser.avatarUrl} 
                  alt={currentActingUser.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                currentActingUser.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
              )}
            </span>
            <div className="min-w-[10rem]">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{currentActingUser.name}</p>
                {childContext?.isActingAsChild && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Child Mode
                  </span>
                )}
              </div>
              {childContext?.isActingAsChild ? (
                <p className="text-xs text-slate-500">
                  Interacting as <span className="font-medium">{currentActingUser.name}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-500">{user.email}</p>
              )}
            </div>
          </div>

          {/* Child Selector */}
          {canSelectChildren && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowChildDropdown(!showChildDropdown)}
                className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                <UserIcon className="h-4 w-4" />
                {childContext.isActingAsChild ? 'Switch Child' : 'Act as Child'}
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {showChildDropdown && (
                <div className="absolute right-0 top-full z-[60] mt-2 w-64 rounded-lg border border-slate-200 bg-white py-2 shadow-xl"
                  style={{ zIndex: 9999 }}
                >
                  {/* Return to Parent Option */}
                  {childContext.isActingAsChild && (
                    <>
                      <button
                        onClick={handleReturnToParent}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                          style={{ backgroundColor: user.avatarColor }}
                        >
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            user.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                          )}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">Return to your account</p>
                        </div>
                        <ArrowRightIcon className="h-4 w-4 text-slate-400" />
                      </button>
                      <hr className="my-2 border-slate-100" />
                    </>
                  )}

                  {/* Children Options */}
                  {childContext.availableChildren.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleChildSelect(child)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                        childContext.selectedChild?.id === child.id 
                          ? 'bg-blue-50 text-blue-900' 
                          : 'text-slate-700'
                      }`}
                    >
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: child.avatarColor }}
                      >
                        {child.avatarUrl ? (
                          <img 
                            src={child.avatarUrl} 
                            alt={child.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          child.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                        )}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{child.name}</p>
                        <p className="text-xs text-slate-500">Age {child.age || 'Unknown'}</p>
                      </div>
                      {childContext.selectedChild?.id === child.id && (
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                  ))}

                  {childContext.loading && (
                    <div className="px-4 py-2 text-sm text-slate-500">
                      Loading children...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation and Actions */}
          <div className="flex items-center gap-3">
            {/* Profile Button */}
            <a
              href="/profile"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
            >
              Profile
            </a>
            
            {/* Connections Button */}
            {onConnectionsClick && (
              <button
                onClick={onConnectionsClick}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                Connections
              </button>
            )}
            
            {/* Change Password Button */}
            {onChangePasswordClick && (
              <button
                onClick={onChangePasswordClick}
                className="hidden sm:block rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                Password
              </button>
            )}
            
            {actions}
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showChildDropdown && (
        <div 
          className="fixed inset-0 z-[55]" 
          onClick={() => setShowChildDropdown(false)}
          style={{ zIndex: 9998 }}
        />
      )}
    </header>
  );
}