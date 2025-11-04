'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FamilyPost, AuthUser, FamilyMemberProfile, RolePermissions } from '@/lib/types';

interface EnhancedFamilyAdminProps {
  familyId: string;
  familySlug: string;
}

export function EnhancedFamilyAdmin({ familyId, familySlug }: EnhancedFamilyAdminProps) {
  // Post creation state for admin
  const [postContent, setPostContent] = useState('');
  const [postAuthorId, setPostAuthorId] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'pending'>('posts');
  const [pendingPosts, setPendingPosts] = useState<FamilyPost[]>([]);
  const [members, setMembers] = useState<FamilyMemberProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default author to first member when members are loaded
    if (members.length > 0 && !postAuthorId) {
      setPostAuthorId(members[0].id);
    }
  }, [members, postAuthorId]);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingPosts();
    } else if (activeTab === 'members') {
      loadMembers();
    }
  }, [activeTab]);

  // Member invitation form
  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    birthdate: '',
    role: 'ADULT'
  });

  const roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ADULT', label: 'Adult' },
    { value: 'CHILD_0_5', label: 'Child (0-5)' },
    { value: 'CHILD_5_10', label: 'Child (5-10)' },
    { value: 'CHILD_10_14', label: 'Child (10-14)' },
    { value: 'CHILD_14_16', label: 'Teen (14-16)' },
    { value: 'CHILD_16_ADULT', label: 'Teen (16-18)' }
  ];

  useEffect(() => {
    // Set default author to first member when members are loaded
    if (activeTab === 'members' && members.length > 0 && !postAuthorId) {
      setPostAuthorId(members[0].id);
    }
    if (activeTab === 'pending') {
      loadPendingPosts();
    } else if (activeTab === 'members') {
      loadMembers();
    }
  }, [activeTab]);

  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      // Pass the family slug to ensure we get posts for the correct family
      const posts = await api.getPendingPosts(familySlug);
      // Ensure posts is always an array
      setPendingPosts(Array.isArray(posts) ? posts : []);
    } catch (error) {
      console.error('Failed to load pending posts:', error);
      // Set empty array on error to prevent map error
      setPendingPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      // Fetch family profile, which includes members
      const family = await api.getFamilyBySlug(familySlug);
      setMembers(family.members || []);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId: string, action: 'approve' | 'reject') => {
    try {
      await api.approvePost(postId, action);
      // Remove the post from pending list
      setPendingPosts(posts => posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error(`Failed to ${action} post:`, error);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !familyId) {
      alert('Name and family ID are required to invite a member.');
      return;
    }
    try {
      setLoading(true);
      const result = await api.inviteFamilyMember({
        ...newMember,
        familyId: String(familyId)
      });
      // Reset form
      setNewMember({
        email: '',
        name: '',
        birthdate: '',
        role: 'ADULT'
      });
      // Refresh members list
      loadMembers();
      alert(`Member invited successfully with role: ${result.assignedRole}`);
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('Failed to invite member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getRecommendedRole = (birthdate: string) => {
    const age = calculateAge(birthdate);
    if (!age) return 'ADULT';
    
    if (age < 5) return 'CHILD_0_5';
    if (age < 10) return 'CHILD_5_10';
    if (age < 14) return 'CHILD_10_14';
    if (age < 16) return 'CHILD_14_16';
    if (age < 18) return 'CHILD_16_ADULT';
    return 'ADULT';
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'pending', label: 'Pending Approval', icon: '⏳', badge: pendingPosts.length }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Family Administration</h1>
        <p className="text-gray-600">Manage your family members, posts, and permissions</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Post Management</h2>
              <p className="text-gray-600">Manage and monitor all family posts.</p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!postContent || !postAuthorId) return;
                  setLoading(true);
                  try {
                    await api.createPost({
                      familyId,
                      authorId: postAuthorId,
                      content: postContent,
                    });
                    setPostContent('');
                  } catch (err) {
                    alert('Failed to create post');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post as</label>
                  <select
                    value={postAuthorId}
                    onChange={(e) => setPostAuthorId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} {member.email ? `(${member.email})` : '(kid/no email)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    placeholder="Write your post..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !postContent || !postAuthorId}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Posting...' : 'Create Post'}
                </button>
              </form>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Member Management</h2>
              
              {/* Invite New Member Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Invite New Member</h3>
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter member's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email {newMember.birthdate && calculateAge(newMember.birthdate) !== null && calculateAge(newMember.birthdate)! < 16 ? 
                          '(Optional for kids under 16)' : '*'}
                      </label>
                      <input
                        type="email"
                        required={!newMember.birthdate || calculateAge(newMember.birthdate) === null || calculateAge(newMember.birthdate)! >= 16}
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={newMember.birthdate && calculateAge(newMember.birthdate) !== null && calculateAge(newMember.birthdate)! < 16 
                          ? "Email optional for kids" : "Enter email address"}
                      />
                      {newMember.birthdate && calculateAge(newMember.birthdate) !== null && calculateAge(newMember.birthdate)! < 16 && (
                        <p className="text-sm text-blue-600 mt-1">
                          💡 Kids under 16 can use their parent's login but still post as themselves
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birthdate
                      </label>
                      <input
                        type="date"
                        value={newMember.birthdate}
                        onChange={(e) => {
                          const birthdate = e.target.value;
                          const recommendedRole = getRecommendedRole(birthdate);
                          setNewMember({ 
                            ...newMember, 
                            birthdate,
                            role: recommendedRole
                          });
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {newMember.birthdate && (
                        <p className="text-sm text-gray-500 mt-1">
                          Age: {calculateAge(newMember.birthdate)} years
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      {newMember.birthdate && newMember.role !== getRecommendedRole(newMember.birthdate) && (
                        <p className="text-sm text-amber-600 mt-1">
                          ⚠️ Recommended role based on age: {roles.find(r => r.value === getRecommendedRole(newMember.birthdate))?.label}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Inviting...' : 'Send Invitation'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Members List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Members</h3>
                {members.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No members found. Start by inviting someone!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                      <div>
                        <div className="relative">
                          <img
                            src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3B82F6&color=fff`}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setLoading(true);
                                  const result = await api.uploadMemberAvatar(familyId, member.id, file);
                                  // Refresh members list to show new avatar
                                  loadMembers();
                                  console.log('Avatar uploaded successfully:', result.avatarUrl);
                                } catch (error) {
                                  console.error('Failed to upload avatar:', error);
                                  alert('Failed to upload avatar. Please try again.');
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">Click to change</p>
                      </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{member.name}</h4>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            <p className="text-sm text-gray-500">Role: {member.role}</p>
                            <div className="mt-2">
                              <label className="block text-xs text-gray-500 mb-1">Quote</label>
                              <input
                                type="text"
                                value={member.quote || ''}
                                placeholder="Add a personal quote..."
                                className="w-48 rounded border px-2 py-1 text-sm"
                                onChange={async (e) => {
                                  try {
                                    await api.updateFamilyMember(familyId, member.id, {
                                      quote: e.target.value
                                    });
                                    // Update local state
                                    setMembers(prev => prev.map(m => 
                                      m.id === member.id ? { ...m, quote: e.target.value } : m
                                    ));
                                  } catch (error) {
                                    console.error('Failed to update quote:', error);
                                    alert('Failed to update quote. Please try again.');
                                  }
                                }}
                                onBlur={() => {
                                  // Optional: save on blur if you want immediate updates
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            onClick={() => {
                              // TODO: Open edit modal or inline editing for more fields
                              const newName = prompt('Enter new name:', member.name);
                              if (newName && newName !== member.name) {
                                api.updateFamilyMember(familyId, member.id, { name: newName })
                                  .then(() => {
                                    loadMembers(); // Refresh the list
                                  })
                                  .catch(error => {
                                    console.error('Failed to update member:', error);
                                    alert('Failed to update member. Please try again.');
                                  });
                              }
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${member.name} from the family?`)) {
                                api.removeFamilyMember(familyId, member.id)
                                  .then(() => {
                                    loadMembers(); // Refresh the list
                                    alert(`${member.name} has been removed from the family.`);
                                  })
                                  .catch(error => {
                                    console.error('Failed to remove member:', error);
                                    alert('Failed to remove member. Please try again.');
                                  });
                              }
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pending Approval Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Posts Pending Approval</h2>
              <p className="text-gray-600">
                Review and approve posts from family members who require approval before publishing.
              </p>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading pending posts...</p>
                </div>
              ) : pendingPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">✅</span>
                  No posts pending approval!
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingPosts.map((post) => (
                    <div key={post.id} className="bg-white border rounded-lg p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: post.authorAvatarColor }}
                          >
                            {post.authorName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{post.authorName}</h3>
                            <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          post.visibility === 'public' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {post.visibility === 'public' ? 'Public' : 'Family'}
                        </span>
                      </div>

                      {post.title && (
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                      )}
                      
                      <div className="prose prose-sm max-w-none mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {post.media && (
                        <div className="mb-4">
                          {post.media.type === 'image' ? (
                            <img
                              src={post.media.url}
                              alt={post.media.alt || 'Post image'}
                              className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                            />
                          ) : (
                            <video
                              src={post.media.url}
                              controls
                              className="rounded-lg max-w-full h-auto max-h-64"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleApprovePost(post.id, 'reject')}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprovePost(post.id, 'approve')}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Approve & Publish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}