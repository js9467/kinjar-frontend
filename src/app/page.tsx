'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { useAuth } from '@/lib/auth';
import { PublicFamilyLanding } from '@/components/family/PublicFamilyLanding';

export default function HomePage() {
  const { families, globalStats } = useAppState();
  const { user, loading, isRootAdmin, isFamilyAdmin, subdomainInfo } = useAuth();
  const [redirected, setRedirected] = useState(false);

  const spotlightFamilies = useMemo(() => families.slice(0, 3), [families]);

  useEffect(() => {
    if (loading || redirected) {
      return;
    }

    if (subdomainInfo.isSubdomain) {
      if (user) {
        setRedirected(true);
        window.location.assign('/family');
      }
      return;
    }

    if (user) {
      if (isRootAdmin) {
        setRedirected(true);
        window.location.assign('/admin');
        return;
      }

      if (isFamilyAdmin) {
        setRedirected(true);
        window.location.assign('/family-admin');
        return;
      }

      if (user.memberships.length > 0) {
        setRedirected(true);
        window.location.assign('/family');
        return;
      }
    }
  }, [loading, redirected, subdomainInfo.isSubdomain, user, isRootAdmin, isFamilyAdmin]);

  if (subdomainInfo.isSubdomain && subdomainInfo.familySlug) {
    return (
      <div className="bg-slate-50 py-12">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <PublicFamilyLanding slug={subdomainInfo.familySlug} />
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            {user ? (
              <p>
                We&apos;re taking you to the family dashboard. If the page doesn&apos;t redirect automatically,{' '}
                <Link href="/family" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  open it here
                </Link>
                .
              </p>
            ) : (
              <p>
                Want to contribute more stories?{' '}
                <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Sign in
                </Link>{' '}
                or ask the family admin for an invite.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_55%)]" aria-hidden />
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-24 text-center">
          <div className="space-y-4">
            <span className="inline-flex items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
              Kinjar keeps every branch connected
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              A private home for your family&apos;s stories, run by admins you trust.
            </h1>
            <p className="text-base leading-relaxed text-slate-300">
              Approve new relatives in seconds, highlight the memories that deserve the spotlight, and decide exactly which
              stories the public can see.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
            >
              Sign in to your family
            </Link>
            <Link
              href="/families"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-400 hover:text-indigo-200"
            >
              Explore public landings
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 lg:grid-cols-2">
        <div className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/40 p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-white">Root admins hold the keys</h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Global admins manage every family space from a single control center. Approve signups, monitor content trends, and
            keep Kinjar&apos;s culture healthy.
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" aria-hidden />
              <span>Approve or decline new family signup requests.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" aria-hidden />
              <span>Review flagged stories and keep the network safe.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" aria-hidden />
              <span>Adjust global settings, storage, and support messaging.</span>
            </li>
          </ul>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-full border border-indigo-400/60 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-200 transition hover:border-indigo-300 hover:text-white"
          >
            Launch control center
          </Link>
        </div>
        <div className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/40 p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-white">Family admins shape their clan</h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Each family subdomain has dedicated admins who invite members, approve posts, and decide what should become a
            public highlight.
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              <span>Welcome new relatives and assign roles in seconds.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              <span>Approve or flag stories directly from the moderation queue.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              <span>Choose which memories are shared with connected families or the public.</span>
            </li>
          </ul>
          <Link
            href="/family-admin"
            className="inline-flex items-center justify-center rounded-full border border-emerald-400/60 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300 hover:text-white"
          >
            Open family workspace
          </Link>
        </div>
      </section>

      <section className="bg-slate-900/70 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Trusted families already sharing</p>
            <h2 className="text-3xl font-semibold text-white">Spotlight families</h2>
            <p className="text-sm text-slate-400">
              Each landing lets families control what the public sees. Root admins can preview any space instantly.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {spotlightFamilies.map((family) => (
              <Link
                key={family.id}
                href={`/families/${family.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 shadow-lg transition hover:border-indigo-500/60"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden />
                <div className="relative space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">/{family.slug}</p>
                  <h3 className="text-xl font-semibold text-white">{family.name}</h3>
                  <p className="text-sm text-slate-300 line-clamp-3">{family.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <span>{family.members.length} members</span>
                    <span>{family.connections.length} connections</span>
                    <span>
                      {
                        family.posts.filter((post) => post.status === 'approved' && post.visibility === 'public').length
                      }{' '}
                      public stories
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/50 bg-slate-950/80 py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-slate-300">Kinjar</p>
            <p className="text-xs">A safe place for every branch of your family tree.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-wide">
            <Link href="/families" className="hover:text-slate-200">
              Directory
            </Link>
            <Link href="/auth/login" className="hover:text-slate-200">
              Sign in
            </Link>
            <Link href="mailto:support@kinjar.com" className="hover:text-slate-200">
              Support
            </Link>
          </div>
          <p className="text-xs">{globalStats.totalFamilies} families · {globalStats.totalMembers} members connected</p>
        </div>
      </footer>
    </div>
  );
}
