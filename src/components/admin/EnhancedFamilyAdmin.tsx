'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FamilyPost, AuthUser, FamilyMemberProfile, RolePermissions } from '@/lib/types';

interface EnhancedFamilyAdminProps {
  familyId: string;
  familySlug: string;
}

export function EnhancedFamilyAdmin({ familyId, familySlug }: EnhancedFamilyAdminProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'pending' | 'settings'>('members');
  const [pendingPosts, setPendingPosts] = useState<FamilyPost[]>([]);
  const [members, setMembers] = useState<FamilyMemberProfile[]>([]);
  const [pendingMembers, setPendingMembers] = useState<FamilyMemberProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFamilySlug, setCurrentFamilySlug] = useState(familySlug);
  const [settingsForm, setSettingsForm] = useState({ name: '', slug: '', description: '' });
  const [initialSettings, setInitialSettings] = useState({ name: '', slug: '', description: '' });
  const [settingsStatus, setSettingsStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (familySlug && familySlug !== currentFamilySlug) {
      setCurrentFamilySlug(familySlug);
    }
  }, [familySlug, currentFamilySlug]);

  // Utility function to mask child email addresses
  const maskChildEmail = (email: string, role: string): string => {
    const childRoles = ['CHILD_0_5', 'CHILD_5_10', 'CHILD_10_14', 'CHILD_14_16'];
    if (childRoles.includes(role)) {
      // Mask the email for children: example@domain.com -> ex***@***.com
      const [localPart, domain] = email.split('@');
      if (localPart.length <= 2) {
        return `${localPart[0]}***@***.${domain.split('.').pop()}`;
      }
      return `${localPart.substring(0, 2)}***@***.${domain.split('.').pop()}`;
    }
    return email;
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      void loadPendingPosts();
    } else if (activeTab === 'members' || activeTab === 'settings') {
      void loadMembers();
    }
  }, [activeTab, familySlug]);

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
      // Fetch family profile, which includes members and pending members
      const family = await api.getFamilyBySlug(familySlug);
      setMembers(family.members || []);
      setPendingMembers(family.pendingMembers || []);
      
      // Initialize settings form with family data
      const settings = {
        name: family.name || '',
        slug: family.slug || '',
        description: family.description || ''
      };
      setSettingsForm(settings);
      setInitialSettings(settings);
      
      console.log('Loaded members:', family.members?.length, 'pending:', family.pendingMembers?.length);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
      setPendingMembers([]);
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
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'settings', label: 'Family Settings', icon: '⚙️' }
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
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Family Members</h3>
                {members.length === 0 && pendingMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No members found. Start by inviting someone!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Current Members */}
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
                            <p className="text-sm text-gray-600">{maskChildEmail(member.email, member.role)}</p>
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

                    {/* Pending Members */}
                    {pendingMembers.map((pendingMember) => (
                      <div key={`pending-${pendingMember.id || pendingMember.email}`} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="w-12 h-12 rounded-full bg-amber-300 flex items-center justify-center">
                              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-xs text-amber-600 mt-1 text-center">Pending</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{pendingMember.name}</h4>
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                Invitation Sent
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{maskChildEmail(pendingMember.email, pendingMember.role)}</p>
                            <p className="text-sm text-gray-500">Role: {pendingMember.role}</p>
                            <p className="text-xs text-amber-600 mt-1">Awaiting registration</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <span className="text-sm text-amber-600 font-medium">Invited</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Family Settings</h2>
              
              {/* Family Details Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Family Information</h3>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSavingSettings(true);
                    setSettingsStatus(null);
                    
                    try {
                      await api.updateFamily(familyId, {
                        name: settingsForm.name,
                        slug: settingsForm.slug,
                        description: settingsForm.description
                      });
                      setSettingsStatus({ type: 'success', message: 'Family settings updated successfully!' });
                      setInitialSettings({ ...settingsForm });
                      
                      // Reload family data after 1 second
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    } catch (error: any) {
                      console.error('Failed to update family settings:', error);
                      setSettingsStatus({ 
                        type: 'error', 
                        message: error.message || 'Failed to update family settings' 
                      });
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter family name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.slug}
                      onChange={(e) => setSettingsForm({ ...settingsForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="family-slug"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Your family URL will be: {settingsForm.slug || 'family-slug'}.kinjar.com
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={settingsForm.description}
                      onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Describe your family..."
                    />
                  </div>

                  {settingsStatus && (
                    <div className={`p-4 rounded-md ${
                      settingsStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {settingsStatus.message}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSettings || (
                        settingsForm.name === initialSettings.name && 
                        settingsForm.slug === initialSettings.slug && 
                        settingsForm.description === initialSettings.description
                      )}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingSettings ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Family Photo Upload */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Family Photo</h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          setLoading(true);
                          const formData = new FormData();
                          formData.append('file', file);

                          const token = localStorage.getItem('kinjar-auth-token');
                          const response = await fetch(`https://kinjar-api.fly.dev/api/families/${familyId}/upload-photo`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            },
                            body: formData
                          });

                          if (!response.ok) {
                            throw new Error('Failed to upload family photo');
                          }

                          const result = await response.json();
                          setSettingsStatus({ 
                            type: 'success', 
                            message: 'Family photo uploaded successfully!' 
                          });
                          
                          // Reload after 1 second to show new photo
                          setTimeout(() => {
                            window.location.reload();
                          }, 1000);
                        } catch (error: any) {
                          console.error('Failed to upload family photo:', error);
                          setSettingsStatus({ 
                            type: 'error', 
                            message: 'Failed to upload family photo' 
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a photo that represents your family. This will be shown on your family page and in the family directory.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}