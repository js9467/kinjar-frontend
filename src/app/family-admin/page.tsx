'use client';

import { FormEvent, useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { useAuth } from '@/lib/auth';
import { FamilyMemberProfile, FamilyPost, FamilyProfile, PostVisibility } from '@/lib/types';

const VISIBILITY_OPTIONS: Array<{ value: PostVisibility; label: string }> = [
  { value: 'family_only', label: 'Family only' },
  { value: 'family_and_connections', label: 'Family & Connections' },
];

export default function FamilyAdminWorkspace() {
  const {
    families,
    connectionRequests,
    addFamilyMember,
    createFamilyPost,
    updatePostStatus,
    updatePostVisibility,
    toggleHighlight,
  } = useAppState();
  const { user, isRootAdmin } = useAuth();
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'ADULT' as FamilyMemberProfile['role'] });
  const [postContent, setPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState<PostVisibility>('family_and_connections');
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const activeFamily: FamilyProfile | undefined = useMemo(() => {
    if (accessibleFamilies.length === 0) {
      return undefined;
    }

    const fallback = accessibleFamilies[0];
    if (!selectedFamilyId) {
      return fallback;
    }

    return accessibleFamilies.find((family) => family.id === selectedFamilyId) ?? fallback;
  }, [accessibleFamilies, selectedFamilyId]);

  const pendingRequests = useMemo(
    () =>
      connectionRequests.filter(
        (request) =>
          request.status === 'pending' &&
          (request.fromFamilyId === activeFamily?.id || request.toFamilyId === activeFamily?.id)
      ),
    [connectionRequests, activeFamily?.id]
  );

  const pendingPosts = (activeFamily?.posts || []).filter((post) => post.status === 'pending');
  const approvedPosts = (activeFamily?.posts || []).filter((post) => post.status === 'approved');

  const handleAddMember = (event: FormEvent) => {
    event.preventDefault();
    if (!activeFamily) {
      return;
    }
    if (!newMember.name || !newMember.email) {
      setFeedback('Please provide a name and email for the new member.');
      return;
    }

    const created = addFamilyMember(activeFamily.id, newMember);
    if (created) {
      setFeedback(`${created.name} was added to ${activeFamily.name}.`);
      setNewMember({ name: '', email: '', role: 'ADULT' });
    }
  };

  const handleCreatePost = (event: FormEvent) => {
    event.preventDefault();
    if (!activeFamily || !user) {
      return;
    }
    if (!postContent.trim()) {
      setFeedback('Write a quick update before posting.');
      return;
    }

    const membership = user.memberships.find(
      (entry) => entry.familyId === activeFamily.id || entry.familySlug === activeFamily.slug
    );
    const authorId = membership?.memberId ?? activeFamily.admins[0];

    const post = createFamilyPost(activeFamily.id, authorId, postContent.trim(), postVisibility);
    if (post) {
      setPostContent('');
      setPostVisibility('family_and_connections');
      setFeedback(`Draft created for ${activeFamily.name}. ${post.status === 'approved' ? 'It is live now.' : 'Waiting for moderation.'}`);
    }
  };

  const handleModeration = (post: FamilyPost, status: FamilyPost['status']) => {
    if (!activeFamily) return;
    updatePostStatus(activeFamily.id, post.id, status);
    setFeedback(`Post by ${post.authorName} marked as ${status}.`);
  };

  const handleVisibilityChange = (post: FamilyPost, visibility: PostVisibility) => {
    if (!activeFamily) return;
    updatePostVisibility(activeFamily.id, post.id, visibility);
    setFeedback(`Post visibility updated to ${visibility}.`);
  };

  const handleToggleHighlight = (post: FamilyPost) => {
    if (!activeFamily) return;
    toggleHighlight(activeFamily.id, post.id);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Sign in to administer a family space.
      </div>
    );
  }

  if (accessibleFamilies.length === 0) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        We couldn’t find any families assigned to you yet. Ask a global admin to add you as a family admin.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Family admin workspace</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Moderate posts, invite relatives, and fine-tune privacy for each clan you steward. All updates are instant for your
          family members.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Your families</p>
          <ul className="space-y-2">
            {accessibleFamilies.map((family) => {
              const isActive = family.id === activeFamily?.id;
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
        </aside>

        <div className="space-y-6">
          {feedback ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {feedback}
              <button
                type="button"
                className="ml-4 text-xs font-semibold uppercase tracking-wide text-emerald-600"
                onClick={() => setFeedback(null)}
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {activeFamily ? (
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Family overview</p>
                    <h2 className="text-2xl font-semibold text-slate-900">{activeFamily.name}</h2>
                    <p className="text-sm text-slate-600">{activeFamily.description}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-500">
                    {activeFamily.members.length} member{activeFamily.members.length === 1 ? '' : 's'} ·{' '}
                    {activeFamily.connections.length} connection{activeFamily.connections.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending invitations</p>
                    <p className="mt-1 font-semibold text-slate-900">{activeFamily.pendingMembers.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stories shared with connections</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {(activeFamily.posts || []).filter((post) => post.visibility === 'family_and_connections' && post.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Invite a family member</h3>
                <form onSubmit={handleAddMember} className="mt-4 grid gap-4 md:grid-cols-[1fr,1fr,160px,120px]">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newMember.name}
                    onChange={(event) => setNewMember((prev) => ({ ...prev, name: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newMember.email}
                    onChange={(event) => setNewMember((prev) => ({ ...prev, email: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <select
                    value={newMember.role}
                    onChange={(event) =>
                      setNewMember((prev) => ({ ...prev, role: event.target.value as FamilyMemberProfile['role'] }))
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="ADULT">Adult</option>
                    <option value="CHILD_16_ADULT">Older teen</option>
                    <option value="CHILD_10_14">Young teen</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    Invite
                  </button>
                </form>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Share an update</h3>
                <form onSubmit={handleCreatePost} className="mt-4 space-y-4">
                  <textarea
                    value={postContent}
                    onChange={(event) => setPostContent(event.target.value)}
                    rows={4}
                    placeholder="Celebrate a milestone, drop a video link, or draft an announcement."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      {VISIBILITY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPostVisibility(option.value)}
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                            postVisibility === option.value
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                    >
                      Post update
                    </button>
                  </div>
                </form>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Moderation queue</h3>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{pendingPosts.length} pending posts</p>
                </div>
                <div className="mt-4 space-y-3">
                  {pendingPosts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                      Nothing waiting on you. Enjoy the quiet!
                    </div>
                  ) : (
                    pendingPosts.map((post) => (
                      <article key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{post.authorName}</p>
                        <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Live stories</h3>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{approvedPosts.length} approved posts</p>
                </div>
                <div className="mt-4 space-y-3">
                  {approvedPosts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                      Once you approve stories they’ll appear here for quick visibility changes.
                    </div>
                  ) : (
                    approvedPosts.map((post) => {
                      const isHighlighted = activeFamily.highlights.includes(post.id);
                      return (
                        <article key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{post.authorName}</p>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                              {VISIBILITY_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => handleVisibilityChange(post, option.value)}
                                  className={`rounded-full px-3 py-1 transition ${
                                    post.visibility === option.value
                                      ? 'bg-indigo-600 text-white'
                                      : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleToggleHighlight(post)}
                                className={`rounded-full px-3 py-1 transition ${
                                  isHighlighted
                                    ? 'bg-amber-400 text-amber-900'
                                    : 'border border-amber-200 bg-white text-amber-600 hover:bg-amber-50'
                                }`}
                              >
                                {isHighlighted ? 'Highlighted' : 'Highlight'}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Connection requests</h3>
                <div className="mt-4 space-y-3">
                  {pendingRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                      No pending connection requests.
                    </div>
                  ) : (
                    pendingRequests.map((request) => (
                      <article key={request.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Requested by {request.requestedBy}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {request.fromFamilyId === activeFamily.id ? 'Your family' : 'Another family'} wants to connect.
                        </p>
                        {request.notes ? (
                          <p className="mt-2 text-xs text-slate-500">“{request.notes}”</p>
                        ) : null}
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
