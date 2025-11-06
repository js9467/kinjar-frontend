'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { KinjarIcon } from '@/components/ui/KinjarIcon';

export default function FamilySelectPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (!user?.memberships || user.memberships.length === 0) {
      // User has no family memberships, redirect to create family
      router.replace('/auth/create-family');
      return;
    }

    if (user.memberships.length === 1) {
      // User only belongs to one family, redirect there automatically
      setRedirecting(true);
      router.replace(`/families/${user.memberships[0].familySlug}`);
      return;
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {redirecting ? 'Redirecting to your family...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  if (!user.memberships || user.memberships.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KinjarIcon className="text-blue-600" size={40} />
              <span className="text-2xl font-bold text-gray-900">Kinjar</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Hi, {user.name}!</span>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Family</h1>
          <p className="text-xl text-gray-600">
            You're a member of multiple families. Select which family you'd like to visit.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {user.memberships.map((membership) => (
            <Link
              key={membership.familyId}
              href={`/families/${membership.familySlug}`}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-105 p-6 border border-gray-200">
                {/* Family Icon/Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {membership.familyName.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Family Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {membership.familyName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Role: {membership.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(membership.joinedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Visit Button */}
                <div className="mt-6">
                  <div className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-center group-hover:bg-blue-700 transition-colors">
                    Visit Family
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Options */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need something else?</h3>
            <div className="space-y-3">
              <Link
                href="/auth/create-family"
                className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Create New Family
              </Link>
              <Link
                href="/families"
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Browse Public Families
              </Link>
              <Link
                href="/"
                className="block w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}