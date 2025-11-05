'use client';

import { useEffect, useState } from 'react';
import { getSubdomainInfo } from '@/lib/api';
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { ConnectedFamiliesFeed } from '@/components/ConnectedFamiliesFeed';
import { AdminFamilyBrowser } from '@/components/admin/AdminFamilyBrowser';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function HomePage() {
  const [subdomainInfo, setSubdomainInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isRootAdmin } = useAuth();

  useEffect(() => {
    const info = getSubdomainInfo();
    setSubdomainInfo(info);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If we're on a family subdomain (like familyname.kinjar.com), show the family dashboard
  if (subdomainInfo?.isSubdomain && subdomainInfo?.familySlug) {
    // Check if logged-in user has access to this family
    if (user && user.memberships && !isRootAdmin) {
      const hasAccess = user.memberships.some(membership => membership.familySlug === subdomainInfo.familySlug);
      if (!hasAccess) {
        // User is logged in but not a member of this family and not a root admin - show access denied
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
                <p className="text-gray-600 mb-6">
                  You are not a member of the {subdomainInfo.familySlug} family. You can only view families you belong to.
                </p>
                <div className="space-y-3">
                  {user.memberships && user.memberships.length > 0 ? (
                    <Link
                      href={`/families/${user.memberships[0].familySlug}`}
                      className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Go to My Family ({user.memberships[0].familyName})
                    </Link>
                  ) : (
                    <Link
                      href="/auth/register"
                      className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Create or Join a Family
                    </Link>
                  )}
                  <Link
                    href="/"
                    className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
    
    return <FamilyDashboard familySlug={subdomainInfo.familySlug} />;
  }

  // If user is logged in and has family memberships, show their main feed
  if (user && user.memberships && user.memberships.length > 0) {
    // Use the first family membership as the primary one
    const primaryFamily = user.memberships[0];
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Family Feed</h1>
                <p className="text-gray-600">Updates from your family and connected families</p>
                {user.memberships.length > 1 && (
                  <p className="text-sm text-blue-600 mt-1">
                    Showing: {primaryFamily.familyName} (you have {user.memberships.length} families)
                  </p>
                )}
              </div>
              <Link
                href={`/families/${primaryFamily.familySlug}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Visit My Family
              </Link>
            </div>
          </div>
        </div>

        {/* Connected Families Feed */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ConnectedFamiliesFeed tenantSlug={primaryFamily.familySlug} limit={20} />
        </div>
      </div>
    );
  }

  // If user is a root admin but has no family memberships, show admin family browser
  if (user && isRootAdmin && (!user.memberships || user.memberships.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Root Admin Dashboard</h1>
                <p className="text-gray-600">Browse and manage all families on the platform</p>
              </div>
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </div>

        {/* Admin Family Browser */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminFamilyBrowser />
        </div>
      </div>
    );
  }

  // Main kinjar.com - require login to see family feed
  // Redirect to login page with return URL
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login?redirect=/';
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
