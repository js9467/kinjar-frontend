'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';

interface FamilyFeedProps {
  familyIds: string[];
  highlightFamilyId?: string;
  title?: string;
}

export function FamilyFeed({ familyIds, highlightFamilyId, title = 'Family stories' }: FamilyFeedProps) {
  const { families } = useAppState();
  const [filter, setFilter] = useState<'all' | 'public' | 'family'>('all');

  const posts = useMemo(() => {
    const relevantFamilies = families.filter((family) => familyIds.includes(family.id));
    return relevantFamilies
      .flatMap((family) =>
        (family.posts || [])
          .filter((post) => post.status === 'approved')
          .map((post) => ({ post, family }))
      )
      .sort((a, b) => (a.post.createdAt < b.post.createdAt ? 1 : -1));
  }, [families, familyIds]);

  const filteredPosts = useMemo(() => {
    if (filter === 'all') {
      return posts;
    }
    if (filter === 'public') {
      return posts.filter((item) => item.post.visibility === 'public');
    }
    return posts.filter((item) => item.post.visibility !== 'public');
  }, [filter, posts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-xl font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-500">Stories from your family and trusted connections.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-1 transition ${filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-white hover:text-indigo-600'}`}
          >
            All stories
          </button>
          <button
            type="button"
            onClick={() => setFilter('family')}
            className={`rounded-full px-3 py-1 transition ${filter === 'family' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-white hover:text-indigo-600'}`}
          >
            Family & connections
          </button>
          <button
            type="button"
            onClick={() => setFilter('public')}
            className={`rounded-full px-3 py-1 transition ${filter === 'public' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-white hover:text-indigo-600'}`}
          >
            Public highlights
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
            No stories to display yet. Share something to kick things off!
          </div>
        ) : (
          filteredPosts.map(({ post, family }) => (
            <article
              key={post.id}
              className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                family.id === highlightFamilyId ? 'ring-2 ring-indigo-200' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    {family.name} · {post.visibility === 'public' ? 'Public' : post.visibility === 'connections' ? 'Connections' : 'Family only'}
                  </p>
                  <h5 className="mt-2 text-lg font-semibold text-slate-900">{post.authorName}</h5>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{post.content}</p>
                </div>
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: post.authorAvatarColor }}
                >
                  {post.authorName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </span>
              </div>
              {post.media ? (
                <div className="mt-4 overflow-hidden rounded-2xl">
                  {post.media.type === 'image' ? (
                    <div className="relative h-64 w-full">
                      <Image
                        src={post.media.url}
                        alt={post.media.alt ?? 'Family moment'}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 60vw, 100vw"
                      />
                    </div>
                  ) : (
                    <video controls className="w-full rounded-2xl">
                      <source src={post.media.url} type="video/mp4" />
                    </video>
                  )}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>{new Date(post.createdAt).toLocaleString()}</span>
                <span>Reactions: {post.reactions}</span>
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
              {post.comments.length > 0 ? (
                <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 text-sm text-slate-600">
                      <span
                        className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: comment.authorAvatarColor }}
                      >
                        {comment.authorName
                          .split(' ')
                          .map((part) => part[0])
                          .join('')}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-700">{comment.authorName}</p>
                        <p>{comment.content}</p>
                        <p className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
