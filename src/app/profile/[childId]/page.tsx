'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { FamilyMemberProfile } from '@/lib/types';
import ProfilePage from '../page';

export default function ChildProfilePage({ params }: { params: { childId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
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

  // Pass the child profile data to the main ProfilePage component
  return <ProfilePage childProfile={childProfile} />;
}