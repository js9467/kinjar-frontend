'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { RequireRole, useAuth } from '@/lib/auth';

const NAVIGATION = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/families', label: 'Families', icon: '🏡' },
  { href: '/admin/signups', label: 'Signups', icon: '📝' },
  { href: '/admin/users', label: 'People', icon: '👥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <RequireRole
      role="ROOT"
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-semibold">Global administrator access required</h1>
            <p className="text-sm text-slate-300">
              Switch to a root admin account or head back to your family dashboard.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow"
            >
              Return home
            </Link>
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen bg-slate-100">
        <aside className="hidden w-72 flex-shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur lg:block">
          <div className="space-y-6 p-6">
            <div>
              <Link href="/admin" className="block text-lg font-semibold text-slate-900">
                Kinjar Control Center
              </Link>
              <p className="mt-1 text-xs text-slate-500">Whole-network oversight for trusted admins.</p>
            </div>
            <nav className="space-y-1">
              {NAVIGATION.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg" aria-hidden>
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Need to manage a single family?</p>
              <p className="mt-2">
                Use the family admin workspace to invite relatives, curate posts, and control privacy for each clan.
              </p>
              <Link
                href="/family-admin"
                className="mt-3 inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Family admin workspace
              </Link>
            </div>
          </div>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Global administration</p>
                <p className="text-base font-semibold text-slate-900">{user?.name ?? user?.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/family"
                  className="hidden rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 lg:inline-flex"
                >
                  View family experience
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
