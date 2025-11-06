'use client';

import { FamilyDashboard } from '@/components/family/FamilyDashboard';

export default function FamilySlugPage() {
  // The slug is handled by the subdomain detection in api.ts
  // which reads from the URL path and sets the tenant context
  return <FamilyDashboard />;
}
