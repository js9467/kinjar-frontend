'use client';

import { useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { StatCard } from '../ui/StatCard';
import { FamilyModerationPanel } from './FamilyModerationPanel';

interface GlobalAdminDashboardProps {
  onImpersonateFamily?: (familyId: string) => void;
}

export function GlobalAdminDashboard({ onImpersonateFamily }: GlobalAdminDashboardProps) {
  const {
    families,
    globalStats,
    pendingFamilySignups,
    connectionRequests,
    approveFamilySignup,
    rejectFamilySignup,
    updatePostStatus,
    requestConnection,
    respondToConnectionRequest,
    getFamilyById,
  } = useAppState();

  const [focusedFamilyId, setFocusedFamilyId] = useState<string>(families[0]?.id ?? '');

  const focusedFamily = focusedFamilyId ? getFamilyById(focusedFamilyId) : undefined;

  const pendingSignups = useMemo(
    () => pendingFamilySignups.filter((signup) => signup.status === 'pending'),
    [pendingFamilySignups]
  );

  const moderationQueue = useMemo(
    () =>
      families
        .flatMap((family) =>
          (family.posts || [])
            .filter((post) => post.status === 'pending')
            .map((post) => ({ post, family }))
        )
        .sort((a, b) => (a.post.createdAt < b.post.createdAt ? 1 : -1)),
    [families]
  );

  const pendingConnections = useMemo(
    () => connectionRequests.filter((request) => request.status === 'pending'),
    [connectionRequests]
  );

  const handleApproveSignup = (signupId: string) => {
    const newFamily = approveFamilySignup(signupId);
    if (newFamily) {
      setFocusedFamilyId(newFamily.id);
    }
  };

  const handleRejectSignup = (signupId: string) => {
    rejectFamilySignup(signupId);
  };

  const handleApprovePost = (familyId: string, postId: string) => {
    updatePostStatus(familyId, postId, 'approved');
  };

  const handleRejectPost = (familyId: string, postId: string) => {
    updatePostStatus(familyId, postId, 'flagged');
  };

  const handleApproveConnection = (requestId: string) => {
    respondToConnectionRequest(requestId, 'approved');
  };

  const handleRejectConnection = (requestId: string) => {
    respondToConnectionRequest(requestId, 'rejected');
  };

  const handleCreateConnection = (fromFamilyId: string, toFamilyId: string) => {
    const family = getFamilyById(fromFamilyId);
    if (!family) {
      return;
    }
    const adminId = family.admins[0];
    if (!adminId) {
      return;
    }
    requestConnection(fromFamilyId, toFamilyId, adminId, 'Global admin created connection');
  };

  return (
    <div className="space-y-12">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total families"
          value={globalStats.totalFamilies}
          trend="3 families onboarded this month"
          icon={<span className="text-2xl">🏡</span>}
        />
        <StatCard
          label="Verified members"
          value={globalStats.totalMembers}
          trend="+12 members this week"
          icon={<span className="text-2xl">👨‍👩‍👧‍👦</span>}
        />
        <StatCard
          label="Pending moderation"
          value={globalStats.pendingModeration}
          highlight="Content awaiting review"
          icon={<span className="text-2xl">🛡️</span>}
        />
        <StatCard
          label="Public highlights"
          value={globalStats.publicHighlights}
          highlight={`${(globalStats.storageUsedMb / 1024).toFixed(1)} GB in use`}
          icon={<span className="text-2xl">✨</span>}
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Families</h2>
              <span className="text-sm text-slate-500">Select a family to preview their workspace</span>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Family</th>
                    <th className="px-4 py-3 font-medium">Members</th>
                    <th className="px-4 py-3 font-medium">Connections</th>
                    <th className="px-4 py-3 font-medium">Showcase</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {families.map((family) => {
                    const isFocused = family.id === focusedFamilyId;
                    return (
                      <tr
                        key={family.id}
                        className={`transition hover:bg-indigo-50/40 ${
                          isFocused ? 'bg-indigo-50/70 font-medium text-indigo-900' : 'bg-white'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p>{family.name}</p>
                            <p className="text-xs text-slate-500">{family.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{family.members.length}</td>
                        <td className="px-4 py-3 text-slate-600">{family.connections.length}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {(family.posts || []).filter((post) => post.visibility === 'public' && post.status === 'approved').length}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-full border border-indigo-200 px-4 py-1.5 text-xs font-medium text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50"
                              onClick={() => setFocusedFamilyId(family.id)}
                            >
                              Preview
                            </button>
                            {onImpersonateFamily ? (
                              <button
                                type="button"
                                className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                onClick={() => onImpersonateFamily(family.id)}
                              >
                                Open workspace
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Pending family signups</h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                  {pendingSignups.length} waiting
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {pendingSignups.length === 0 ? (
                  <p className="text-sm text-slate-500">All caught up. No pending approvals right now.</p>
                ) : (
                  pendingSignups.map((signup) => (
                    <div
                      key={signup.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{signup.familyName}</p>
                          <p className="text-sm text-slate-500">
                            {signup.adminName} — {signup.adminEmail}
                          </p>
                          {signup.message ? (
                            <p className="mt-2 text-sm text-slate-600">“{signup.message}”</p>
                          ) : null}
                          <p className="mt-2 text-xs text-slate-400">
                            Submitted {new Date(signup.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                            onClick={() => handleApproveSignup(signup.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-500 transition hover:border-rose-300 hover:bg-rose-50"
                            onClick={() => handleRejectSignup(signup.id)}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Pending connection requests</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {pendingConnections.length}
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {pendingConnections.length === 0 ? (
                  <p className="text-sm text-slate-500">No open requests.</p>
                ) : (
                  pendingConnections.map((request) => {
                    const from = getFamilyById(request.fromFamilyId);
                    const to = getFamilyById(request.toFamilyId);
                    return (
                      <div
                        key={request.id}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {from?.name ?? 'Unknown family'} → {to?.name ?? 'Unknown family'}
                        </p>
                        {request.notes ? (
                          <p className="mt-2 text-sm text-slate-600">{request.notes}</p>
                        ) : null}
                        <p className="mt-2 text-xs text-slate-400">
                          Requested {new Date(request.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                            onClick={() => handleApproveConnection(request.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-500 transition hover:border-rose-300 hover:bg-rose-50"
                            onClick={() => handleRejectConnection(request.id)}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <FamilyModerationPanel
            moderationQueue={moderationQueue}
            onApprove={handleApprovePost}
            onReject={handleRejectPost}
          />

          {focusedFamily ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{focusedFamily.name}</h2>
                <button
                  type="button"
                  className="rounded-full border border-indigo-200 px-4 py-1.5 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50"
                  onClick={() => onImpersonateFamily?.(focusedFamily.id)}
                >
                  Admin workspace
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-600">{focusedFamily.missionStatement}</p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active members</span>
                  <span className="font-medium text-slate-900">{focusedFamily.members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pending invites</span>
                  <span className="font-medium text-slate-900">{focusedFamily.pendingMembers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Public stories</span>
                  <span className="font-medium text-slate-900">
                    {(focusedFamily.posts || []).filter(
                      (post) => post.status === 'approved' && post.visibility === 'public'
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Connections</span>
                  <span className="font-medium text-slate-900">{focusedFamily.connections.length}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quick connect
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {families
                    .filter((family) => family.id !== focusedFamily.id)
                    .map((family) => (
                      <button
                        key={family.id}
                        type="button"
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        onClick={() => handleCreateConnection(focusedFamily.id, family.id)}
                      >
                        Connect with {family.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
