'use client';

import { useEffect, useState } from 'react';

import { AppHeader } from '@/components/layout/AppHeader';
import { FamilyAdminDashboard } from '@/components/admin/FamilyAdminDashboard';
import { GlobalAdminDashboard } from '@/components/admin/GlobalAdminDashboard';
import { MemberDashboard } from '@/components/family/MemberDashboard';
import { useAppState } from '@/lib/app-state';
import { useAuth } from '@/lib/auth';
import { AuthUser } from '@/lib/types';

export default function HomePage() {
  const {
    user,
    users,
    loading,
    logout,
    loginById,
    isRootAdmin,
    familyAdminIds,
  } = useAuth();
  const { families } = useAppState();

  const [viewMode, setViewMode] = useState<'GLOBAL' | 'FAMILY_ADMIN' | 'MEMBER'>('MEMBER');
  const [activeFamilyId, setActiveFamilyId] = useState<string>('');
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!flashMessage) {
      return;
    }
    const timeout = window.setTimeout(() => setFlashMessage(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [flashMessage]);

  useEffect(() => {
    if (!user || families.length === 0) {
      return;
    }

    const defaultFamily =
      familyAdminIds[0] ?? user.memberships[0]?.familyId ?? families[0]?.id ?? '';

    setActiveFamilyId((current) => current || defaultFamily);

    if (user.globalRole === 'ROOT_ADMIN') {
      setViewMode('GLOBAL');
    } else if (familyAdminIds.length > 0) {
      setViewMode('FAMILY_ADMIN');
    } else {
      setViewMode('MEMBER');
    }
  }, [user, familyAdminIds, families]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <UnauthenticatedLanding users={users} onLogin={loginById} />
    );
  }

  const adminFamilies = isRootAdmin ? families : families.filter((family) => familyAdminIds.includes(family.id));
  const memberFamilies = isRootAdmin ? families : families.filter((family) =>
    user.memberships.some((membership) => membership.familyId === family.id)
  );

  const handleImpersonateFamily = (familyId: string) => {
    setActiveFamilyId(familyId);
    setViewMode('FAMILY_ADMIN');
    setFlashMessage('You are viewing the family admin workspace.');
  };

  const headerActions = (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      {isRootAdmin ? (
        <button
          type="button"
          onClick={() => setViewMode('GLOBAL')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            viewMode === 'GLOBAL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'border border-indigo-200 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
        >
          Global admin
        </button>
      ) : null}
      {adminFamilies.length > 0 ? (
        <select
          value={activeFamilyId}
          onChange={(event) => {
            setActiveFamilyId(event.target.value);
            setViewMode('FAMILY_ADMIN');
          }}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Select family admin view</option>
          {adminFamilies.map((family) => (
            <option key={family.id} value={family.id}>
              Admin · {family.name}
            </option>
          ))}
        </select>
      ) : null}
      {memberFamilies.length > 0 ? (
        <select
          value={activeFamilyId}
          onChange={(event) => {
            setActiveFamilyId(event.target.value);
            setViewMode('MEMBER');
          }}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Switch to member view</option>
          {memberFamilies.map((family) => (
            <option key={family.id} value={family.id}>
              Member · {family.name}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        title={
          viewMode === 'GLOBAL'
            ? 'Root admin dashboard'
            : viewMode === 'FAMILY_ADMIN'
            ? 'Family admin workspace'
            : 'Family feed'
        }
        description={
          viewMode === 'GLOBAL'
            ? 'Govern the entire Kinjar platform, approve new families, and monitor content.'
            : viewMode === 'FAMILY_ADMIN'
            ? 'Manage members, curate stories, and control what appears on your public landing page.'
            : 'Catch up on the latest memories shared within your trusted family network.'
        }
        user={user}
        onLogout={logout}
        actions={headerActions}
      />
      {flashMessage ? (
        <div className="mx-auto mt-4 max-w-4xl px-4">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 shadow-sm">
            {flashMessage}
          </div>
        </div>
      ) : null}
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 lg:px-8">
        {viewMode === 'GLOBAL' ? (
          <GlobalAdminDashboard onImpersonateFamily={handleImpersonateFamily} />
        ) : null}
        {viewMode === 'FAMILY_ADMIN' && activeFamilyId ? (
          <FamilyAdminDashboard
            familyId={activeFamilyId}
            onBack={isRootAdmin ? () => setViewMode('GLOBAL') : undefined}
          />
        ) : null}
        {viewMode === 'MEMBER' && activeFamilyId ? (
          <MemberDashboard familyId={activeFamilyId} />
        ) : null}
      </main>
    </div>
  );
}

function UnauthenticatedLanding({
  users,
  onLogin,
}: {
  users: AuthUser[];
  onLogin: (userId: string) => void;
}) {
  const rootAdmin = users.find((candidate) => candidate.globalRole === 'ROOT_ADMIN');
  const familyAdmins = users.filter((candidate) => candidate.globalRole === 'FAMILY_ADMIN');
  const members = users.filter((candidate) => candidate.globalRole === 'MEMBER');

  const [familyName, setFamilyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [message, setMessage] = useState('');
  const { registerFamilySpace } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await registerFamilySpace({
        familyName,
        adminName,
        adminEmail,
        message,
      });
      setSubmitted(true);
      setFamilyName('');
      setAdminName('');
      setAdminEmail('');
      setMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-slate-100">
      <header className="px-6 py-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">Kinjar</h1>
        <p className="mt-3 text-base text-slate-600">
          Private family networks with granular admin tools and beautiful storytelling.
        </p>
      </header>
      <main className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 lg:grid-cols-2 lg:px-8">
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur">
            <h2 className="text-xl font-semibold text-slate-900">Jump into the live demo</h2>
            <p className="mt-2 text-sm text-slate-500">
              Use any of the preconfigured accounts below to experience the platform immediately.
            </p>
            <div className="mt-4 space-y-3">
              {rootAdmin ? (
                <DemoAccountCard
                  account={rootAdmin}
                  description="Full access across the entire platform, including approvals and moderation."
                  onSelect={onLogin}
                />
              ) : null}
              {familyAdmins.map((account) => (
                <DemoAccountCard
                  key={account.id}
                  account={account}
                  description="Manage a family hub, invite members, and curate public highlights."
                  onSelect={onLogin}
                />
              ))}
              {members.map((account) => (
                <DemoAccountCard
                  key={account.id}
                  account={account}
                  description="Browse the private family feed just like your relatives will."
                  onSelect={onLogin}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur">
            <h2 className="text-xl font-semibold text-slate-900">Request your family space</h2>
            <p className="mt-2 text-sm text-slate-500">
              Tell us a bit about your family and we’ll get you set up with admin access.
            </p>
            {submitted ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Thanks! A Kinjar admin will approve your request shortly.
              </div>
            ) : null}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Family name
                <input
                  value={familyName}
                  onChange={(event) => setFamilyName(event.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="The Carter Family"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Admin name
                <input
                  value={adminName}
                  onChange={(event) => setAdminName(event.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Your name"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Admin email
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="you@family.com"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                What makes your family unique?
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-[120px] rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Share why you want a private space, traditions you love, or upcoming events."
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                disabled={!familyName || !adminName || !adminEmail}
              >
                Submit request
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

function DemoAccountCard({
  account,
  description,
  onSelect,
}: {
  account: AuthUser;
  description: string;
  onSelect: (userId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(account.id)}
      className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white"
        style={{ backgroundColor: account.avatarColor }}
      >
        {account.name
          .split(' ')
          .map((part) => part[0])
          .join('')}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">{account.name}</p>
        <p className="text-xs text-slate-500">{account.email}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </button>
  );
}
