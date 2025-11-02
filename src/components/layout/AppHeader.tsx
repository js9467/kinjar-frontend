'use client';

import { AuthUser } from '@/lib/types';

interface AppHeaderProps {
  title: string;
  description?: string;
  user: AuthUser;
  onLogout: () => void;
  actions?: React.ReactNode;
}

export function AppHeader({ title, description, user, onLogout, actions }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-8 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">Kinjar Control Center</p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.name
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </span>
            <div className="min-w-[10rem]">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
    </header>
  );
}
