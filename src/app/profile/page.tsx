'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ChangePasswordModal } from '@/components/ui/ChangePasswordModal';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { useOptionalChildContext } from '@/lib/child-context';
import { useOptionalTheme, Theme } from '@/lib/theme-context';
import { FamilyMemberProfile } from '@/lib/types';
import Link from 'next/link';

interface ProfilePageProps {
  childProfile?: FamilyMemberProfile;
}

export default function ProfilePage({ childProfile }: ProfilePageProps) {
  const { user } = useAuth();
  const childContext = useOptionalChildContext();
  const selectedChild = childContext?.selectedChild;
  const { currentTheme, allThemes, isChildTheme, setTheme } = useOptionalTheme();
  const router = useRouter();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(currentTheme.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Determine if we're viewing/editing a child profile
  const isChildProfile = !!(selectedChild || childProfile);
  const currentProfile = childProfile || selectedChild || user;

  // Initialize form fields when user/child is loaded
  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name || '');
      setBio(currentProfile.bio || '');
      setSelectedTheme(currentTheme.id);
    }
  }, [currentProfile, currentTheme]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Update theme in context
      setTheme(selectedTheme);

      if (isChildProfile && selectedChild) {
        setSuccess('Child profile updated successfully!');
      } else if (childProfile) {
        // External child profile - not editable
        setError('You cannot edit this profile');
        return;
      } else {
        // Update user profile
        await api.updateUserProfile({ 
          displayName: name, 
          bio
        });
        
        // Refresh user data
        await api.getCurrentUser();
        setSuccess('Profile updated successfully!');
      }
      
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUploadSuccess = async (avatarUrl: string) => {
    setSuccess('Avatar uploaded successfully!');
    // Refresh user data to show new avatar
    await api.getCurrentUser();
  };

  const handleAvatarUploadError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ '--theme-color': currentTheme.color } as React.CSSProperties}
    >
      {/* Header */}
      <div 
        className="bg-white border-b shadow-sm"
        style={{ 
          borderBottomColor: currentTheme.color + '20',
          backgroundColor: currentTheme.color + '05'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold"
              style={{ color: currentTheme.color }}
            >
              {childProfile 
                ? `${childProfile.name}'s Profile`
                : isChildProfile 
                  ? `${selectedChild?.name}'s Profile` 
                  : 'My Profile'
              }
            </h1>
            <Link
              href={user.memberships && user.memberships.length > 0 
                ? '/families/select' 
                : '/'}
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: currentTheme.color }}
            >
              Back to Families
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6 mb-6">
            <AvatarUpload
              currentAvatarUrl={currentProfile?.avatarUrl || undefined}
              currentAvatarColor={currentProfile?.avatarColor || '#3B82F6'}
              userName={currentProfile?.name || 'User'}
              onUploadSuccess={handleAvatarUploadSuccess}
              onError={handleAvatarUploadError}
              disabled={!!childProfile}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{currentProfile?.name}</h2>
                {(isChildProfile || childProfile) && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                    {childProfile ? 'Family Member' : 'Child Profile'}
                  </span>
                )}
              </div>
              <p className="text-gray-600">{currentProfile?.email || 'No email'}</p>
              {!isChildProfile && (currentProfile as any)?.createdAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Member since {new Date((currentProfile as any).createdAt).toLocaleDateString()}
                </p>
              )}
              {/* Current theme display */}
              <div className="flex items-center gap-2 mt-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: currentTheme.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {currentTheme.name}
                </span>
              </div>
            </div>
            {!editMode && !childProfile && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: currentTheme.color }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Details */}
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Your Theme
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allThemes.map((theme) => (
                    <label
                      key={theme.id}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedTheme === theme.id 
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={theme.id}
                        checked={selectedTheme === theme.id}
                        onChange={(e) => setSelectedTheme(e.target.value)}
                        className="sr-only"
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: theme.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{theme.name}</div>
                        <div className="text-sm text-gray-500">{theme.description}</div>
                      </div>
                      {selectedTheme === theme.id && (
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your theme helps others know who is interacting and adds a personal touch to your posts and comments.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:bg-gray-400"
                  style={{ backgroundColor: currentTheme.color }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    if (currentProfile) {
                      setName(currentProfile.name || '');
                      setBio(currentProfile.bio || '');
                      setSelectedTheme(currentTheme.id);
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {user.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Bio</h3>
                  <p className="text-gray-900">{user.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Family Memberships */}
        {user.memberships && user.memberships.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Families</h3>
            <div className="space-y-3">
              {user.memberships.map((membership) => (
                <Link
                  key={membership.familyId}
                  href={`/families/${membership.familySlug}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{membership.familyName}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {membership.role.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Security Section - Only for adult profiles */}
        {!isChildProfile && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Change Password
            </button>
          </div>
        )}

        {/* Sign Out - Only for adult profiles */}
        {!isChildProfile && (
          <div className="mt-6">
            <button
              onClick={() => {
                api.logout();
                router.push('/');
              }}
              className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}
