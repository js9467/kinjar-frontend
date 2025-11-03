'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { FamilyProfile } from '@/lib/types';

export default function AdminFamiliesPage() {
  const { families, updateFamilyProfile } = useAppState();
  const [search, setSearch] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  const filteredFamilies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return families;
    }

    return families.filter((family) => {
      return (
        family.name.toLowerCase().includes(query) ||
        family.slug.toLowerCase().includes(query) ||
        family.description.toLowerCase().includes(query)
      );
    });
  }, [families, search]);

  useEffect(() => {
    if (filteredFamilies.length === 0) {
      setSelectedFamilyId(null);
      return;
    }

    if (!selectedFamilyId || !filteredFamilies.some((family) => family.id === selectedFamilyId)) {
      setSelectedFamilyId(filteredFamilies[0].id);
    }
  }, [filteredFamilies, selectedFamilyId]);

  const selectedFamily: FamilyProfile | null =
    filteredFamilies.find((family) => family.id === selectedFamilyId) ?? filteredFamilies[0] ?? null;

  return (
    <div className="space-y-8 pb-16">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Family management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Search, audit, or adjust every family space on the network. Toggle public visibility, review pending invitations,
            and jump into a family&apos;s admin tools with a single click.
          </p>
        </div>
        <Link
          href="/admin/signups"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          Review pending signups
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, slug, or description"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <ul className="space-y-2">
            {filteredFamilies.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                No families match that search yet.
              </li>
            ) : (
              filteredFamilies.map((family) => {
                const isActive = family.id === selectedFamily?.id;
                return (
                  <li key={family.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedFamilyId(family.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        isActive
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-transparent bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <p className="font-semibold">{family.name}</p>
                      <p className="text-xs text-slate-500">/{family.slug}</p>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className="space-y-6">
          {!selectedFamily ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
              Select a family to inspect their activity and controls.
            </div>
          ) : (
            <FamilyDetail family={selectedFamily} onTogglePublic={updateFamilyProfile} />
          )}
        </section>
      </div>
    </div>
  );
}

function FamilyDetail({
  family,
  onTogglePublic,
}: {
  family: FamilyProfile;
  onTogglePublic: (familyId: string, updates: Partial<FamilyProfile>) => FamilyProfile | null;
}) {
  const familyPosts = family.posts || [];
  const approvedPublicStories = familyPosts.filter(
    (post) => post.status === 'approved' && post.visibility === 'public'
  );
  const pendingPosts = familyPosts.filter((post) => post.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Family overview</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{family.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{family.description}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <button
              type="button"
              onClick={() => onTogglePublic(family.id, { isPublic: !family.isPublic })}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 font-semibold transition ${
                family.isPublic
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {family.isPublic ? 'Public landing enabled' : 'Make landing public'}
            </button>
            <Link
              href={`/families/${family.slug}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              View public landing
            </Link>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <InfoRow label="Members" value={`${family.members.length}`} />
          <InfoRow label="Pending invites" value={`${family.pendingMembers.length}`} />
          <InfoRow label="Connections" value={`${family.connections.length}`} />
          <InfoRow label="Storage used" value={`${family.storageUsedMb.toLocaleString()} MB`} />
          <InfoRow label="Public highlights" value={`${approvedPublicStories.length}`} />
          <InfoRow label="Posts pending" value={`${pendingPosts.length}`} />
        </dl>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Admins and recent activity</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {family.members
            .filter((member) => member.role === 'ADMIN')
            .map((member) => (
              <li key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span>
                  <span className="font-semibold text-slate-900">{member.name}</span>
                  <span className="ml-2 text-xs uppercase tracking-wide text-slate-500">Admin</span>
                </span>
                <span className="text-xs text-slate-500">{member.email}</span>
              </li>
            ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent highlights</h3>
          <Link href={`/family-admin?family=${family.slug}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Open family workspace →
          </Link>
        </div>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {approvedPublicStories.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs text-slate-500">
              No public stories yet. Encourage the family admin to publish highlights.
            </li>
          ) : (
            approvedPublicStories.slice(0, 4).map((post) => (
              <li key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{post.authorName}</p>
                <p className="mt-1 text-sm text-slate-700">{post.content}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
