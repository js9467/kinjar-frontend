'use client';

import Image from 'next/image';

import { FamilyPost, FamilyProfile } from '@/lib/types';

interface ModerationItem {
  post: FamilyPost;
  family: FamilyProfile;
}

interface FamilyModerationPanelProps {
  moderationQueue: ModerationItem[];
  onApprove: (familyId: string, postId: string) => void;
  onReject: (familyId: string, postId: string) => void;
}

export function FamilyModerationPanel({ moderationQueue, onApprove, onReject }: FamilyModerationPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Moderation queue</h2>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
          {moderationQueue.length} awaiting review
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {moderationQueue.length === 0 ? (
          <p className="text-sm text-slate-500">There is no content waiting for approval.</p>
        ) : (
          moderationQueue.map(({ post, family }) => (
            <article
              key={post.id}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {family.name} · {post.authorName}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{post.content}</p>
                  {post.media ? (
                    <div className="mt-3 overflow-hidden rounded-xl">
                      {post.media.type === 'image' ? (
                        <div className="relative h-36 w-full">
                          <Image
                            src={post.media.url}
                            alt={post.media.alt ?? 'Uploaded media'}
                            fill
                            className="object-cover"
                            sizes="(min-width: 768px) 30vw, 90vw"
                          />
                        </div>
                      ) : (
                        <video controls className="h-36 w-full rounded-xl">
                          <source src={post.media.url} type="video/mp4" />
                        </video>
                      )}
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                    <span>Visibility: {post.visibility}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                    onClick={() => onApprove(family.id, post.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-500 transition hover:border-rose-300 hover:bg-rose-50"
                    onClick={() => onReject(family.id, post.id)}
                  >
                    Flag
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
