'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import ProfilePage from '../page';

export default function ChildProfilePage({ params }: { params: { childId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [childProfile, setChildProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // For now, redirect to the main profile page
    // The profile page will handle child profile display through the child context
    // This is a temporary solution - ideally we'd want to set the child context here
    router.replace('/profile');
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

  return <ProfilePage />;
}