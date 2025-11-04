'use client';

import { useEffect, useState } from 'react';
import { getSubdomainInfo } from '@/lib/api';
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { PublicFeed } from '@/components/PublicFeed';
import Link from 'next/link';

export default function HomePage() {
  const [subdomainInfo, setSubdomainInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    return <FamilyDashboard familySlug={subdomainInfo.familySlug} />;
  }

  // Main kinjar.com landing page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900">
              Connect Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Family</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              A private, secure social platform designed for families to share memories,
              stay connected, and build lasting bonds across generations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/families"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Explore Families
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

      {/* Public Feed Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Recent Family Updates
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            See what families are sharing publicly on Kinjar
          </p>
        </div>

        <PublicFeed />
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Connect Your Family?
          </h2>
          <p className="text-base sm:text-xl text-blue-100">
            Join thousands of families already using Kinjar to stay connected
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
