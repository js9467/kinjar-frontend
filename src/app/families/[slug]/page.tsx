import { PublicFamilyLanding } from '@/components/family/PublicFamilyLanding';

interface FamilyLandingPageProps {
  params: {
    slug: string;
  };
}

export default function FamilyLandingPage({ params }: FamilyLandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <PublicFamilyLanding slug={params.slug} />
      </div>
    </div>
  );
}
