'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { FamilyMemberProfile } from '@/lib/types';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { useOptionalTheme } from '@/lib/theme-context';
import { getMemberAgeDisplay } from '@/lib/age-utils';
import Link from 'next/link';

export default function ChildProfilePage({ params }: { params: { childId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { currentTheme } = useOptionalTheme();
  const [childProfile, setChildProfile] = useState<FamilyMemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    const loadChildProfile = async () => {
      try {
        setLoading(true);
        
        // First check if this child is accessible by the current user
        // (either the user's own child or from a connected family)
        let canAccess = false;
        let foundChild: FamilyMemberProfile | null = null;

        // Check all families the user has access to
        for (const membership of user.memberships || []) {
          try {
            const family = await api.getFamilyBySlug(membership.familySlug);
            const child = family.members.find(m => m.id === params.childId);
            if (child) {
              foundChild = child;
              canAccess = true;
              break;
            }
          } catch (err) {
            console.error('Error checking family:', membership.familySlug, err);
          }
        }

        if (!canAccess || !foundChild) {
          setError('Child profile not found or access denied');
          return;
        }

        setChildProfile(foundChild);
      } catch (err) {
        console.error('Error loading child profile:', err);
        setError('Failed to load child profile');
      } finally {
        setLoading(false);
      }
    };

    loadChildProfile();
  }, [user, router, params.childId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading child profile...</p>
        </div>
      </div>
    );
  }

  if (error || !childProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The requested profile could not be found.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ 
        background: `linear-gradient(135deg, ${currentTheme.color}10 0%, ${currentTheme.color}05 100%)` 
      }}
    >
      {/* Header */}
      <div 
        className="bg-gradient-to-r text-white py-8"
        style={{ 
          background: `linear-gradient(135deg, ${currentTheme.color} 0%, ${currentTheme.color}dd 100%)` 
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-4xl font-bold"
              style={{ color: 'white' }}
            >
              {childProfile.name}'s Profile
            </h1>
            <Link
              href={user?.memberships && user.memberships.length > 0 
                ? '/families/select' 
                : '/'}
              className="font-medium hover:opacity-80 transition-opacity text-white"
            >
              Back to Families
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6 mb-6">
            <AvatarUpload
              currentAvatarUrl={childProfile.avatarUrl || undefined}
              currentAvatarColor={childProfile.avatarColor || '#3B82F6'}
              userName={childProfile.name || 'User'}
              onUploadSuccess={() => {}}
              onError={() => {}}
              disabled={true}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{childProfile.name}</h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                  Family Member
                </span>
              </div>
              <p className="text-gray-600">{getMemberAgeDisplay(childProfile.birthdate, childProfile.role)}</p>
              <p className="text-sm text-gray-500 mt-2 capitalize">
                {childProfile.role.toLowerCase().replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                {childProfile.name}
              </div>
            </div>

            {childProfile.bio && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {childProfile.bio}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 capitalize">
                {childProfile.role.toLowerCase().replace(/_/g, ' ')}
              </div>
            </div>

            {childProfile.birthdate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {getMemberAgeDisplay(childProfile.birthdate, childProfile.role)}
                </div>
              </div>
            )}
          </div>

          {/* Read-only notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800">
                This is a read-only view of {childProfile.name}'s profile from a connected family.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}