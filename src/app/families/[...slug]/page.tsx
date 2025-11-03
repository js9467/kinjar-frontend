'use client';

import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { useEffect, useState } from 'react';
import { getSubdomainInfo } from '@/lib/api';

// This handles all family subdomain routes like family.kinjar.com/posts
// and also path-based routes like /families/slug/additional/paths
export default function FamilyDynamicPage({ params }: { params: { slug: string[] } }) {
  const [familySlug, setFamilySlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're on a subdomain or have a family context
    const subdomainInfo = getSubdomainInfo();
    
    if (subdomainInfo.isSubdomain && subdomainInfo.familySlug) {
      // Subdomain case: family.kinjar.com
      setFamilySlug(subdomainInfo.familySlug);
    } else if (params.slug && params.slug.length > 0) {
      // Path case: www.kinjar.com/families/slaughterbeck
      // Use the first slug parameter as family identifier
      const firstSlug = params.slug[0];
      setFamilySlug(firstSlug);
    }
    
    setIsLoading(false);
  }, [params.slug]);

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

  if (!familySlug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Family Not Found</h1>
          <p className="text-gray-600">The family you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return <FamilyDashboard familySlug={familySlug} />;
}