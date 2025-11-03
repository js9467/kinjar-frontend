'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { useAppState } from '@/lib/app-state';

export default function AdminDashboard() {
  const { families, pendingFamilySignups, connectionRequests, globalStats } = useAppState();
  
  // Mock admin user for demo
  const user = { name: 'Admin', email: 'admin@kinjar.com' };

  const { pendingPosts, flaggedPosts, publicFamilies } = useMemo(() => {
    let pending = 0;
    let flagged = 0;
    let publicCount = 0;

    families.forEach((family) => {
      if (family.isPublic) {
        publicCount += 1;
      }
      family.posts.forEach((post) => {
        if (post.status === 'pending') {
          pending += 1;
        }
        if (post.status === 'flagged') {
          flagged += 1;
        }
      });
    });

    return { pendingPosts: pending, flaggedPosts: flagged, publicFamilies: publicCount };
  }, [families]);

  const pendingConnections = connectionRequests.filter((request) => request.status === 'pending');
  const awaitingSignups = pendingFamilySignups.filter((signup) => signup.status === 'pending');

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Welcome back</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {user?.name ?? user?.email}, you&apos;re overseeing {globalStats.totalFamilies} active families
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              Track new signups, monitor moderation queues, and keep every family space healthy. All admin tooling is now
              consolidated in this control center.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Link
              href="/family-admin"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Jump to family admin workspace
            </Link>
            <Link
              href="/families"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              View public directory
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total members" value={globalStats.totalMembers.toLocaleString()} trend="Across all approved families" />
        <StatCard label="Stories awaiting moderation" value={pendingPosts.toString()} highlight={pendingPosts > 0} />
        <StatCard label="Public family landing pages" value={publicFamilies.toString()} />
        <StatCard
          label="Storage used"
          value={`${Math.round(globalStats.storageUsedMb).toLocaleString()} MB`}
          trend="Monitored across all uploads"
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Operational priorities</h2>
              <p className="text-sm text-slate-500">Follow up on the most pressing tasks for Kinjar.</p>
            </div>
            <Link href="/admin/families" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Manage families →
            </Link>
          </div>
          <ul className="mt-6 space-y-4 text-sm">
            <PriorityItem
              title={`${awaitingSignups.length} pending family signup${awaitingSignups.length === 1 ? '' : 's'}`}
              description="Review requests, onboard new clans, and assign their admins."
              href="/admin/signups"
            />
            <PriorityItem
              title={`${pendingPosts} posts waiting for approval`}
              description="Publish or decline items in family moderation queues."
              href="/family-admin"
            />
            <PriorityItem
              title={`${pendingConnections.length} connection request${pendingConnections.length === 1 ? '' : 's'}`}
              description="Approve cross-family sharing so content flows securely."
              href="/family-admin"
            />
            <PriorityItem
              title={`${flaggedPosts} flagged story${flaggedPosts === 1 ? '' : 'ies'}`}
              description="Investigate reported items and take action if necessary."
              href="/family-admin"
            />
          </ul>
        </section>
        <section className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Live platform health</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt>Families sharing publicly</dt>
                <dd className="font-semibold text-slate-900">{publicFamilies}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt>Connections between clans</dt>
                <dd className="font-semibold text-slate-900">{connectionRequests.length}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt>Families with pending invites</dt>
                <dd className="font-semibold text-slate-900">
                  {
                    families.filter((family) => family.pendingMembers.length > 0).length
                  }
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt>Stories highlighted to the public</dt>
                <dd className="font-semibold text-slate-900">
                  {
                    families.reduce(
                      (count, family) =>
                        count +
                        family.posts.filter(
                          (post) => post.status === 'approved' && post.visibility === 'public'
                        ).length,
                      0
                    )
                  }
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <QuickLink href="/admin/signups" label="Approve signup requests" />
              <QuickLink href="/admin/users" label="Review global roles" />
              <QuickLink href="/admin/settings" label="Update platform settings" />
              <QuickLink href="/family-admin" label="Moderate family content" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  highlight,
}: {
  label: string;
  value: string;
  trend?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${
        highlight ? 'ring-2 ring-amber-400' : ''
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      {trend ? <p className="mt-2 text-xs text-slate-500">{trend}</p> : null}
    </div>
  );
}

function PriorityItem({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <li className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-600">{description}</p>
        </div>
        <Link href={href} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          Manage
        </Link>
      </div>
    </li>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
    >
      <span>{label}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
