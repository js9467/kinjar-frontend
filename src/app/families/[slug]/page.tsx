'use client';

import { FamilyDashboard } from '@/components/family/FamilyDashboard';

interface FamilyLandingPageProps {
  params: {
    slug: string;
  };
}

export default function FamilyLandingPage({ params }: FamilyLandingPageProps) {
  console.log('[families/[slug]/page.tsx] Route triggered with params:', params);
  return <FamilyDashboard familySlug={params.slug} />;
}
