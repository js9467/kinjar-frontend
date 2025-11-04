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

  // Main kinjar.com landing page for non-logged-in users
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center space-y-6">
            {/* Kinjar Logo and Name */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Honey Jar SVG */}
              <div className="relative">
                <svg 
                  width="60" 
                  height="60" 
                  viewBox="0 0 100 100" 
                  className="text-amber-500"
                  fill="currentColor"
                >
                  {/* Jar body */}
                  <path d="M25 35 L25 80 Q25 85 30 85 L70 85 Q75 85 75 80 L75 35 Z" 
                        fill="#f59e0b" opacity="0.9"/>
                  {/* Jar lid */}
                  <ellipse cx="50" cy="35" rx="25" ry="8" fill="#d97706"/>
                  {/* Lid top */}
                  <ellipse cx="50" cy="32" rx="25" ry="8" fill="#f59e0b"/>
                  {/* Lid handle */}
                  <ellipse cx="50" cy="25" rx="8" ry="4" fill="#92400e"/>
                  {/* Jar contents (honey) */}
                  <path d="M27 40 L27 78 Q27 82 30 82 L70 82 Q73 82 73 78 L73 40 Z" 
                        fill="#fbbf24" opacity="0.7"/>
                  {/* Label area */}
                  <rect x="35" y="50" width="30" height="20" rx="3" fill="white" opacity="0.9"/>
                  {/* Hearts on label representing family */}
                  <text x="50" y="62" textAnchor="middle" fontSize="12" fill="#dc2626">♥</text>
                </svg>
              </div>
              
              <div className="text-left">
                <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight">
                  Kinjar
                </h1>
                <p className="text-lg text-amber-600 font-medium italic">
                  Your family's sweet container
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900">
              Connect Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Family</span>
            </h2>
            
            {/* Slogan explanation */}
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 font-medium mb-2">
                <span className="text-amber-600 font-semibold">Kin</span> (family) + 
                <span className="text-amber-600 font-semibold"> Jar</span> (container) = 
                <span className="text-blue-600 font-semibold"> Kinjar</span>
              </p>
              <p className="text-base sm:text-lg text-gray-600">
                A private, secure social platform designed for families to share memories,
                stay connected, and build lasting bonds across generations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-full sm:w-auto"
              >
                Create Family Space
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Safe Family Social Networking
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect families with controlled privacy, where kids can safely interact with trusted family friends.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Family Connections</h3>
            <p className="text-gray-600">Connect with other families you trust. Share memories safely with known family friends.</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe for Kids</h3>
            <p className="text-gray-600">Controlled environment where children can interact safely with pre-approved family connections.</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Private & Secure</h3>
            <p className="text-gray-600">Your family's content stays within your trusted network. No public posts, no strangers.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Connect Your Family?
          </h2>
          <p className="text-base sm:text-xl text-blue-100">
            Join families using Kinjar to stay safely connected
          </p>
          <Link
            href="/auth/register"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-[1.02]"
          >
            Get Started Today
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
