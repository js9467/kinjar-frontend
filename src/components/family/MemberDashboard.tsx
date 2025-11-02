'use client';

import { useMemo } from 'react';

import { useAppState } from '@/lib/app-state';
import { FamilyProfile } from '@/lib/types';
import { FamilyFeed } from './FamilyFeed';

interface MemberDashboardProps {
  familyId: string;
}

export function MemberDashboard({ familyId }: MemberDashboardProps) {
  const { getFamilyById } = useAppState();
  const family = getFamilyById(familyId);

  const connections = useMemo(() => {
    if (!family) {
      return [] as FamilyProfile[];
    }
    return family.connections
      .map((id) => getFamilyById(id))
      .filter((candidate): candidate is FamilyProfile => Boolean(candidate));
  }, [family, getFamilyById]);

  if (!family) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
        We couldn’t load your family feed. Please contact your admin.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900">Hello, {family.name}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Share memories, drop quick videos, and keep everyone in the loop. Everything in this space is private to your family unless marked otherwise.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          <span className="rounded-full bg-white px-4 py-2 shadow">{family.members.length} active members</span>
          <span className="rounded-full bg-white px-4 py-2 shadow">{family.posts.length} stories</span>
          <span className="rounded-full bg-white px-4 py-2 shadow">{connections.length} connected families</span>
        </div>
      </section>

      <section>
        <FamilyFeed
          familyIds={[family.id, ...family.connections]}
          highlightFamilyId={family.id}
          title="Latest from your family and connections"
        />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Connected families</h3>
          <p className="text-sm text-slate-500">
            These families can see posts you mark for connections. You can request more connections from your family admin.
          </p>
        </div>
        {connections.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No connected families yet. Ask your admin to invite one you trust.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Connected family</p>
                <h4 className="mt-2 text-lg font-semibold text-slate-900">{connection.name}</h4>
                <p className="mt-2 text-sm text-slate-600">{connection.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
