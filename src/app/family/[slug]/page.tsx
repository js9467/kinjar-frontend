'use client';

import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { ChildProvider } from '@/lib/child-context';
import { getSubdomainInfo } from '@/lib/api';

export default function FamilySlugPage() {
  // Get the family slug from subdomain detection
  const subdomainInfo = getSubdomainInfo();
  const familySlug = subdomainInfo.familySlug;
  
  return (
    <ChildProvider familySlug={familySlug}>
      <FamilyDashboard />
    </ChildProvider>
  );
}
