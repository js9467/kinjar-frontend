'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useAppState } from '@/lib/app-state';
import { useAuth } from '@/lib/auth';

export default function FamilyDirectoryPage() {
  const { families } = useAppState();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl space-y-8 px-4 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">Family directory</h1>
          <p className="mt-3 text-base text-slate-600">
            Browse Kinjar families and explore the public landing pages they&apos;ve chosen to share.
          </p>
          
          {/* Show link to user's families if they're logged in */}
          {user && user.memberships && user.memberships.length > 0 && (
            <div className="mt-6">
              <Link
                href="/families/select"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2M7 13h10M7 17h4" />
                </svg>
                Go to My Families
              </Link>
            </div>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {families.map((family) => {
            const sharedStories = (family.posts || []).filter(
              (post) => post.status === 'approved' && post.visibility === 'family_and_connections'
            ).length;
            return (
              <article
                key={family.id}
                className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={family.bannerImage}
                      alt={`${family.name} banner`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">{family.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{family.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{family.members.length} members</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{family.connections.length} connections</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{sharedStories} shared stories</span>
                  </div>
                </div>
                <Link
                  href={`/families/${family.slug}`}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  View public landing
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
