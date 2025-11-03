'use client';

import { FamilyDashboard } from '@/components/family/FamilyDashboard';

interface FamilyLandingPageProps {
  params: {
    slug: string;
  };
}

export default function FamilyLandingPage({ params }: FamilyLandingPageProps) {
  return <FamilyDashboard familySlug={params.slug} />;
}
