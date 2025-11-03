'use client';

import { useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { FamilyMemberProfile, FamilyProfile } from '@/lib/types';

interface DerivedUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  globalRole: 'ROOT_ADMIN' | 'FAMILY_ADMIN' | 'MEMBER';
  families: Array<{ id: string; name: string; slug: string; role: FamilyMemberProfile['role'] }>;
  postCount: number;
  lastActivity?: string;
}

const ROOT_ADMIN_EMAILS = ['admin.slaughterbeck@gmail.com'];

export default function AdminUsersPage() {
  const { families } = useAppState();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | DerivedUser['globalRole']>('all');

  const users = useMemo(() => deriveUsers(families), [families]);

  const filtered = users.filter((user) => {
    const query = search.trim().toLowerCase();
    if (query && !`${user.name} ${user.email}`.toLowerCase().includes(query)) {
      return false;
    }

    if (roleFilter !== 'all' && user.globalRole !== roleFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">People across Kinjar</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Audit who has access to each family, track global roles, and see recent activity to ensure every admin is supported.
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr,200px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All roles</option>
            <option value="ROOT_ADMIN">Root admins</option>
            <option value="FAMILY_ADMIN">Family admins</option>
            <option value="MEMBER">Members</option>
          </select>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs uppercase tracking-wide text-slate-500">
          {filtered.length} person{filtered.length === 1 ? '' : 's'}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">
              No people match this view yet.
            </div>
          ) : (
            filtered.map((user) => (
              <article key={user.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{user.globalRole.replace('_', ' ')}</p>
                    <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {user.families.length} family{user.families.length === 1 ? '' : 'ies'}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent activity</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'No posts yet'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stories shared</p>
                    <p className="mt-1 font-semibold text-slate-900">{user.postCount}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Family memberships</p>
                  {user.families.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <span className="font-semibold text-slate-900">{membership.name}</span>
                      <span className="text-xs uppercase tracking-wide text-slate-500">{membership.role.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function deriveUsers(families: FamilyProfile[]): DerivedUser[] {
  const byUser = new Map<string, DerivedUser>();
  const memberLookup = new Map<string, { member: FamilyMemberProfile; family: FamilyProfile }>();

  families.forEach((family) => {
    family.members.forEach((member) => {
      const userId = member.userId ?? member.id;
      memberLookup.set(member.id, { member, family });

      const existing = byUser.get(userId);
      const membershipEntry = { id: family.id, name: family.name, slug: family.slug, role: member.role };

      if (!existing) {
        const globalRole = ROOT_ADMIN_EMAILS.includes(member.email.toLowerCase())
          ? 'ROOT_ADMIN'
          : member.role === 'ADMIN'
            ? 'FAMILY_ADMIN'
            : 'MEMBER';

        byUser.set(userId, {
          id: userId,
          name: member.name,
          email: member.email,
          avatarColor: member.avatarColor,
          globalRole,
          families: [membershipEntry],
          postCount: 0,
        });
      } else {
        existing.families.push(membershipEntry);
        if (existing.globalRole !== 'ROOT_ADMIN' && member.role === 'ADMIN') {
          existing.globalRole = 'FAMILY_ADMIN';
        }
      }
    });
  });

  families.forEach((family) => {
    family.posts.forEach((post) => {
      const lookup = memberLookup.get(post.authorId);
      const userId = lookup?.member.userId ?? lookup?.member.id ?? post.authorId;
      const derived = userId ? byUser.get(userId) : undefined;
      if (derived) {
        derived.postCount += 1;
        if (!derived.lastActivity || derived.lastActivity < post.createdAt) {
          derived.lastActivity = post.createdAt;
        }
        if (derived.globalRole !== 'ROOT_ADMIN' && lookup?.member.role === 'ADMIN') {
          derived.globalRole = 'FAMILY_ADMIN';
        }
      }
    });
  });

  return Array.from(byUser.values()).sort((a, b) => a.name.localeCompare(b.name));
}
