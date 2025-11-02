'use client';

import Image from 'next/image';
import { useMemo } from 'react';

import { useAppState } from '@/lib/app-state';

interface PublicFamilyLandingProps {
  slug: string;
}

export function PublicFamilyLanding({ slug }: PublicFamilyLandingProps) {
  const { getFamilyBySlug } = useAppState();
  const family = getFamilyBySlug(slug);

  const publicPosts = useMemo(() => {
    if (!family) {
      return [];
    }
    return family.posts
      .filter((post) => post.status === 'approved' && post.visibility === 'public')
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [family]);

  if (!family) {
    return (
      <div className="min-h-[50vh] rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
        We couldn’t find that family. Their public page may be private for now.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section
        className="relative overflow-hidden rounded-3xl border border-slate-200"
        style={{ backgroundColor: family.themeColor + '10' }}
      >
        <div className="absolute inset-0">
          <Image
            src={family.heroImage}
            alt={`${family.name} hero`}
            fill
            className="object-cover opacity-30"
            sizes="100vw"
          />
        </div>
        <div className="relative grid gap-8 bg-gradient-to-br from-white/90 via-white/70 to-white/30 p-8 sm:p-12 lg:grid-cols-2">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow">
              Public family landing
            </span>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{family.name}</h1>
            <p className="text-base text-slate-700">{family.description}</p>
            <p className="text-sm text-slate-600">{family.missionStatement}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-wide text-slate-600">
              <span className="rounded-full bg-white/80 px-4 py-2 shadow">{family.members.length} members</span>
              <span className="rounded-full bg-white/80 px-4 py-2 shadow">{family.connections.length} connections</span>
              <span className="rounded-full bg-white/80 px-4 py-2 shadow">{publicPosts.length} public stories</span>
            </div>
          </div>
          <div className="flex items-end justify-end">
            <div className="relative h-64 w-full overflow-hidden rounded-3xl shadow-lg">
              <Image
                src={family.bannerImage}
                alt={`${family.name} banner`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Public highlights</h2>
          <p className="text-sm text-slate-500">Curated stories that the family has chosen to share publicly.</p>
        </div>
        {publicPosts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            This family hasn’t shared public stories yet. Check back soon!
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {publicPosts.map((post) => (
              <article key={post.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{family.name}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{post.authorName}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{post.content}</p>
                {post.media ? (
                  <div className="mt-3 overflow-hidden rounded-2xl">
                    {post.media.type === 'image' ? (
                      <div className="relative h-60 w-full">
                        <Image
                          src={post.media.url}
                          alt={post.media.alt ?? 'Family moment'}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 45vw, 100vw"
                        />
                      </div>
                    ) : (
                      <video controls className="w-full rounded-2xl">
                        <source src={post.media.url} type="video/mp4" />
                      </video>
                    )}
                  </div>
                ) : null}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.reactions} reactions</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
