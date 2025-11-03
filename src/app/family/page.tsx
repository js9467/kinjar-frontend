'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { useAuth } from '@/lib/auth';
import { FamilyPost, FamilyProfile, PostVisibility } from '@/lib/types';

interface FeedPost extends FamilyPost {
  familyName: string;
  familySlug: string;
}

const FEED_FILTERS: Array<{ value: PostVisibility | 'all'; label: string }> = [
  { value: 'all', label: 'Everyone' },
  { value: 'family', label: 'My family' },
  { value: 'connections', label: 'Connected families' },
  { value: 'public', label: 'Public highlights' },
];

export default function FamilyExperiencePage() {
  const {
    families,
    connectionRequests,
    createFamilyPost,
    updatePostStatus,
    updatePostVisibility,
    toggleHighlight,
  } = useAppState();
  const { user, loading, subdomainInfo, isRootAdmin } = useAuth();
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<(typeof FEED_FILTERS)[number]['value']>('all');
  const [newPost, setNewPost] = useState('');
  const [newPostVisibility, setNewPostVisibility] = useState<PostVisibility>('family');
  const [message, setMessage] = useState<string | null>(null);

  const accessibleFamilies = useMemo(() => {
    if (!user) {
      return [];
    }

    if (isRootAdmin) {
      return families;
    }

    const membershipSlugs = new Set(user.memberships.map((membership) => membership.familySlug));
    return families.filter((family) => membershipSlugs.has(family.slug));
  }, [families, isRootAdmin, user]);

  useEffect(() => {
    if (!subdomainInfo.isSubdomain || !subdomainInfo.familySlug) {
      return;
    }
    const subdomainFamily = families.find((family) => family.slug === subdomainInfo.familySlug);
    if (subdomainFamily) {
      setSelectedFamilyId(subdomainFamily.id);
    }
  }, [families, subdomainInfo.familySlug, subdomainInfo.isSubdomain]);

  useEffect(() => {
    if (selectedFamilyId) {
      return;
    }
    if (accessibleFamilies.length > 0) {
      setSelectedFamilyId(accessibleFamilies[0].id);
    }
  }, [accessibleFamilies, selectedFamilyId]);

  const activeFamily: FamilyProfile | undefined = useMemo(() => {
    if (!selectedFamilyId) {
      return undefined;
    }
    return families.find((family) => family.id === selectedFamilyId);
  }, [families, selectedFamilyId]);

  const activeMembership = useMemo(() => {
    if (!user || !activeFamily) {
      return undefined;
    }
    return user.memberships.find(
      (membership) =>
        membership.familyId === activeFamily.id || membership.familySlug === activeFamily.slug
    );
  }, [user, activeFamily]);

  const isFamilyAdmin = useMemo(() => {
    if (isRootAdmin) {
      return true;
    }
    return activeMembership?.role === 'ADMIN';
  }, [activeMembership?.role, isRootAdmin]);

  const visiblePosts: FeedPost[] = useMemo(() => {
    if (!activeFamily) {
      return [];
    }

    const allowedFamilyIds = new Set([activeFamily.id, ...activeFamily.connections]);
    const allFamilies = families.filter((family) => allowedFamilyIds.has(family.id));
    const posts: FeedPost[] = [];

    allFamilies.forEach((family) => {
      family.posts.forEach((post) => {
        if (post.status !== 'approved' && family.id !== activeFamily.id) {
          return;
        }

        if (family.id !== activeFamily.id) {
          if (post.visibility === 'family') {
            return;
          }
        }

        posts.push({ ...post, familyName: family.name, familySlug: family.slug });
      });
    });

    return posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [activeFamily, families]);

  const filteredPosts = useMemo(() => {
    if (feedFilter === 'all') {
      return visiblePosts;
    }

    if (feedFilter === 'family') {
      return visiblePosts.filter((post) => post.familyId === activeFamily?.id);
    }

    if (feedFilter === 'connections') {
      return visiblePosts.filter((post) => post.familyId !== activeFamily?.id && post.visibility !== 'family');
    }

    return visiblePosts.filter((post) => post.visibility === 'public');
  }, [visiblePosts, feedFilter, activeFamily?.id]);

  const pendingModeration = activeFamily?.posts.filter((post) => post.status === 'pending') ?? [];
  const pendingConnections = connectionRequests.filter(
    (request) => request.status === 'pending' && request.toFamilyId === activeFamily?.id
  );

  const handleCreatePost = () => {
    if (!activeFamily || !user) {
      return;
    }
    if (!newPost.trim()) {
      setMessage('Share a message before posting.');
      return;
    }

    const membership = user.memberships.find(
      (entry) => entry.familyId === activeFamily.id || entry.familySlug === activeFamily.slug
    );
    const authorId = membership?.memberId ?? activeFamily.admins[0];

    const created = createFamilyPost(activeFamily.id, authorId, newPost.trim(), newPostVisibility);
    if (created) {
      setNewPost('');
      setNewPostVisibility('family');
      setMessage(
        created.status === 'approved'
          ? 'Shared! Your update is live.'
          : 'Saved. Family admins will approve it shortly.'
      );
    }
  };

  const handleModeration = (post: FamilyPost, status: FamilyPost['status']) => {
    if (!activeFamily) return;
    updatePostStatus(activeFamily.id, post.id, status);
    setMessage(`Post marked as ${status}.`);
  };

  const handleVisibilityChange = (post: FamilyPost, visibility: PostVisibility) => {
    if (!activeFamily) return;
    updatePostVisibility(activeFamily.id, post.id, visibility);
    setMessage(`Post visibility updated.`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Loading your family space…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Sign in to view your family spaces.
      </div>
    );
  }

  if (!activeFamily) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        You aren&apos;t connected to any families yet.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Family dashboard</p>
            <h1 className="text-3xl font-semibold text-slate-900">{activeFamily.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{activeFamily.description}</p>
          </div>
          <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center">
              {activeFamily.members.length} member{activeFamily.members.length === 1 ? '' : 's'}
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center">
              {activeFamily.connections.length} connection{activeFamily.connections.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Switch family</p>
            <ul className="mt-3 space-y-2">
              {accessibleFamilies.map((family) => {
                const isActive = family.id === activeFamily.id;
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
              })}
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick stats</p>
            <p>Pending posts: {pendingModeration.length}</p>
            <p>Public highlights: {activeFamily.highlights.length}</p>
            <p>Storage used: {activeFamily.storageUsedMb.toLocaleString()} MB</p>
            <p>Invites sent this month: {activeFamily.invitesSentThisMonth}</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Connection requests</p>
            {pendingConnections.length === 0 ? (
              <p className="text-xs text-slate-500">No pending requests.</p>
            ) : (
              pendingConnections.map((request) => (
                <div key={request.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-xs font-semibold text-slate-700">New connection incoming</p>
                  <p className="text-xs text-slate-500">Requested by {request.requestedBy}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="space-y-6">
          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
              <button
                type="button"
                className="ml-4 text-xs font-semibold uppercase tracking-wide text-emerald-600"
                onClick={() => setMessage(null)}
              >
                Dismiss
              </button>
            </div>
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Share a memory</h2>
            <div className="mt-4 space-y-4">
              <textarea
                value={newPost}
                onChange={(event) => setNewPost(event.target.value)}
                rows={4}
                placeholder="Tell the family what&apos;s happening—photos and videos welcome!"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  {(['family', 'connections', 'public'] as PostVisibility[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setNewPostVisibility(option)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        newPostVisibility === option
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {option === 'family'
                        ? 'Family only'
                        : option === 'connections'
                          ? 'Connected families'
                          : 'Public highlight'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreatePost}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                  Post update
                </button>
              </div>
            </div>
          </section>

          {isFamilyAdmin && pendingModeration.length > 0 ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Moderate drafts</h2>
                <p className="text-xs uppercase tracking-wide text-slate-500">{pendingModeration.length} pending</p>
              </div>
              <div className="mt-4 space-y-3">
                {pendingModeration.map((post) => (
                  <article key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{post.authorName}</p>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                      <span>Visibility: {post.visibility}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleModeration(post, 'approved')}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeration(post, 'flagged')}
                        className="rounded-full border border-rose-200 px-4 py-2 text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                      >
                        Flag
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">Family stream</h2>
              <div className="flex gap-2">
                {FEED_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setFeedFilter(filter.value)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      feedFilter === filter.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No stories to show yet. Share the first update!
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {post.familyName}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">{post.authorName}</p>
                      </div>
                      <div className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                      <span>{post.visibility === 'family' ? 'Family only' : post.visibility === 'connections' ? 'Shared with connections' : 'Public highlight'}</span>
                      {isFamilyAdmin && post.familyId === activeFamily.id ? (
                        <div className="flex gap-2 text-xs font-semibold">
                          {(['family', 'connections', 'public'] as PostVisibility[]).map((visibility) => (
                            <button
                              key={visibility}
                              type="button"
                              onClick={() => handleVisibilityChange(post, visibility)}
                              className={`rounded-full px-3 py-1 transition ${
                                post.visibility === visibility
                                  ? 'bg-indigo-600 text-white'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                              }`}
                            >
                              {visibility === 'family'
                                ? 'Family'
                                : visibility === 'connections'
                                  ? 'Connections'
                                  : 'Public'}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => toggleHighlight(activeFamily.id, post.id)}
                            className={`rounded-full px-3 py-1 transition ${
                              activeFamily.highlights.includes(post.id)
                                ? 'bg-amber-400 text-amber-900'
                                : 'border border-amber-200 bg-white text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            {activeFamily.highlights.includes(post.id) ? 'Highlighted' : 'Highlight'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
