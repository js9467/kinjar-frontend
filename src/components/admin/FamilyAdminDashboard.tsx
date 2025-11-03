'use client';

import { useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { PostVisibility } from '@/lib/types';
import { StatCard } from '../ui/StatCard';
import { FamilyFeed } from '../family/FamilyFeed';

interface FamilyAdminDashboardProps {
  familyId: string;
  onBack?: () => void;
}

const visibilityOptions: { value: PostVisibility; label: string }[] = [
  { value: 'family', label: 'Family only' },
  { value: 'connections', label: 'Connected families' },
  { value: 'public', label: 'Public landing page' },
];

export function FamilyAdminDashboard({ familyId, onBack }: FamilyAdminDashboardProps) {
  const {
    getFamilyById,
    families,
    addFamilyMember,
    inviteFamilyMember,
    createFamilyPost,
    updatePostVisibility,
    updatePostStatus,
    toggleHighlight,
    requestConnection,
  } = useAppState();
  
  // Mock user for demo
  const user = { 
    id: 'user1', 
    name: 'Demo Admin', 
    email: 'admin@example.com',
    memberships: [{ familyId: 'family1', familySlug: 'slaughterbeck', role: 'ADMIN' as const, memberId: 'user1' }]
  };

  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [visibility, setVisibility] = useState<PostVisibility>('family');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [isInvite, setIsInvite] = useState(false);
  const [connectionTarget, setConnectionTarget] = useState('');

  const family = getFamilyById(familyId);

  const adminMember = useMemo(() => {
    if (!family || !user) {
      return null;
    }
    const membership = user.memberships.find((m) => m.familyId === family.id);
    if (!membership) {
      return family.members.find((member) => member.role === 'ADMIN');
    }
    return family.members.find((member) => member.id === membership.memberId) ?? null;
  }, [family, user]);

  if (!family || !adminMember) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
        Unable to load that family workspace.
      </div>
    );
  }

  const handleCreatePost = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }

    createFamilyPost(family.id, adminMember.id, content, visibility, mediaUrl ? { type: mediaType, url: mediaUrl } : undefined);
    setContent('');
    setMediaUrl('');
    setVisibility('family');
  };

  const handleAddMember = (event: React.FormEvent) => {
    event.preventDefault();
    if (!memberName || !memberEmail) {
      return;
    }

    if (isInvite) {
      inviteFamilyMember(family.id, { name: memberName, email: memberEmail });
    } else {
      addFamilyMember(family.id, { name: memberName, email: memberEmail, role: 'ADULT' });
    }

    setMemberName('');
    setMemberEmail('');
  };

  const familyStats = {
    totalPosts: family.posts.length,
    publicPosts: family.posts.filter((post) => post.visibility === 'public' && post.status === 'approved').length,
    pendingModeration: family.posts.filter((post) => post.status === 'pending').length,
    connectedFamilies: family.connections.length,
  };

  const availableConnections = families.filter(
    (candidate) =>
      candidate.id !== family.id && !family.connections.includes(candidate.id)
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            ← Back to overview
          </button>
          <h2 className="text-3xl font-bold text-slate-900">{family.name} admin workspace</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Craft stories, approve posts, and curate what goes public for your family.</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          <p className="font-semibold">Admin on duty</p>
          <p>{adminMember.name}</p>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total posts" value={familyStats.totalPosts} icon={<span className="text-2xl">📝</span>} />
        <StatCard label="Public stories" value={familyStats.publicPosts} icon={<span className="text-2xl">🌍</span>} />
        <StatCard label="Pending review" value={familyStats.pendingModeration} icon={<span className="text-2xl">🛑</span>} />
        <StatCard label="Connections" value={familyStats.connectedFamilies} icon={<span className="text-2xl">🔗</span>} />
      </section>

      <section className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <form onSubmit={handleCreatePost} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Share an update</h3>
            <p className="mt-2 text-sm text-slate-500">Upload photos or write announcements that can be shared with your family or the wider network.</p>
            <div className="mt-4 space-y-4">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Celebrate milestones, share updates, or ask for help..."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  Media URL
                  <input
                    value={mediaUrl}
                    onChange={(event) => setMediaUrl(event.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="https://"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  Media type
                  <select
                    value={mediaType}
                    onChange={(event) => setMediaType(event.target.value as 'image' | 'video')}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Visibility
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as PostVisibility)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Admins publish immediately. Non-admin posts go to moderation.</p>
                <button
                  type="submit"
                  className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                  disabled={!content.trim()}
                >
                  Post update
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Members</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {family.members.length} active
              </span>
            </div>
            <form onSubmit={handleAddMember} className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Name
                <input
                  value={memberName}
                  onChange={(event) => setMemberName(event.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Jamie Doe"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Email
                <input
                  value={memberEmail}
                  onChange={(event) => setMemberEmail(event.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="family@domain.com"
                  type="email"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={isInvite}
                  onChange={(event) => setIsInvite(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Send as invite (keeps them pending until acceptance)
              </label>
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  disabled={!memberName || !memberEmail}
                >
                  {isInvite ? 'Send invite' : 'Add member'}
                </button>
              </div>
            </form>
            <div className="mt-6 grid gap-3">
              {family.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    {member.role === 'ADMIN' ? 'Admin' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
            {family.pendingMembers.length > 0 ? (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                {family.pendingMembers.length} invite(s) waiting for acceptance.
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Story controls</h3>
            <p className="mt-2 text-sm text-slate-500">Update visibility, pin highlights, and approve pending submissions.</p>
            <div className="mt-4 space-y-4">
              {family.posts.length === 0 ? (
                <p className="text-sm text-slate-500">No stories shared yet. Your first post will appear here.</p>
              ) : (
                family.posts.map((post) => (
                  <div key={post.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{post.authorName}</p>
                        <p className="mt-1 text-sm text-slate-600">{post.content}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {new Date(post.createdAt).toLocaleString()} · {post.status}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 text-xs">
                        <select
                          value={post.visibility}
                          onChange={(event) =>
                            updatePostVisibility(family.id, post.id, event.target.value as PostVisibility)
                          }
                          className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                          {visibilityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {post.status !== 'approved' ? (
                          <button
                            type="button"
                            className="rounded-full bg-emerald-500 px-3 py-1 font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                            onClick={() => updatePostStatus(family.id, post.id, 'approved')}
                          >
                            Approve
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className={`rounded-full px-3 py-1 font-semibold transition ${
                            family.highlights.includes(post.id)
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'border border-indigo-200 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                          onClick={() => toggleHighlight(family.id, post.id)}
                        >
                          {family.highlights.includes(post.id) ? 'Featured on landing' : 'Feature publicly'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Connect with another family</h3>
            <p className="mt-2 text-sm text-slate-500">Connections share stories privately across trusted households.</p>
            <div className="mt-3">
              <select
                value={connectionTarget}
                onChange={(event) => setConnectionTarget(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select a family</option>
                {availableConnections.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="mt-3 w-full rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                onClick={() => {
                  if (!connectionTarget) {
                    return;
                  }
                  requestConnection(family.id, connectionTarget, adminMember.id, 'Admin requested connection');
                  setConnectionTarget('');
                }}
                disabled={!connectionTarget}
              >
                Request connection
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">Current connections</p>
              {family.connections.length === 0 ? (
                <p className="text-slate-500">No connections yet.</p>
              ) : (
                family.connections.map((connectionId) => {
                  const connectedFamily = families.find((candidate) => candidate.id === connectionId);
                  return (
                    <div key={connectionId} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      {connectedFamily?.name ?? 'Unknown family'}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-900">Member view preview</h3>
        <p className="mt-2 text-sm text-slate-500">Admins can always experience the family feed exactly how members do.</p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FamilyFeed familyIds={[family.id, ...family.connections]} highlightFamilyId={family.id} />
        </div>
      </section>
    </div>
  );
}
