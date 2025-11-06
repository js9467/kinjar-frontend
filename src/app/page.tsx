'use client';

import { useEffect, useState } from 'react';
import { getSubdomainInfo } from '@/lib/api';
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { useAuth } from '@/lib/auth';
import { KinjarIcon } from '@/components/ui/KinjarIcon';
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
                      href="/families/select"
                      className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Go to My Families
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

  // Main kinjar.com landing page - show welcome page with login/register options
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KinjarIcon className="text-blue-600" size={40} />
              <span className="text-2xl font-bold text-gray-900">Kinjar</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {user.memberships && user.memberships.length > 0 && (
                    <Link
                      href="/families/select"
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      My Families
                    </Link>
                  )}
                  <span className="text-gray-600">Hi, {user.name}!</span>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <KinjarIcon className="text-blue-600" size={120} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Kin</span> + <span className="text-blue-600">Jar</span>
          </h1>
          <p className="text-2xl font-semibold text-gray-700 mb-4">
            A Safe Container for Your Family
          </p>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Store and share your family's precious moments in your own private space.
            Connect with other families while keeping everything secure and private.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user && user.memberships && user.memberships.length > 0 ? (
              <Link
                href="/families/select"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
              >
                Go to My Families
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
                >
                  Create Your Family
                </Link>
                <Link
                  href="/auth/login"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors text-lg"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Family-First</h3>
            <p className="text-gray-600">
              Create your family space and invite members. Share moments that matter with the people you love.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Private & Secure</h3>
            <p className="text-gray-600">
              Your family's content is private by default. Control who sees what with simple privacy settings.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Families</h3>
            <p className="text-gray-600">
              Connect with other families and share updates across your extended family network.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} Kinjar. Built for families, by families.
          </p>
        </div>
      </footer>
    </div>
  );
}
