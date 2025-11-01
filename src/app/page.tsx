export const dynamic = 'force-dynamic';

"use client";

import { API_BASE } from "@/lib/api";

export default function HomePage() {
  return (
    <>
      <noscript>
        <div style={{ padding: 48, textAlign: 'center', fontFamily: 'system-ui' }}>
          <h1>JavaScript Required</h1>
          <p>Please enable JavaScript to use Kinjar.</p>
        </div>
      </noscript>
      <MainLandingPage />
      <ClientSideSubdomainChecker />
    </>
  );
}

function ClientSideSubdomainChecker() {
  // This component only runs on client side and handles subdomain logic
  if (typeof window === 'undefined') {
    return null;
  }

  // Use event listener approach to avoid setTimeout issues
  const windowAny = window as any;
  if (!windowAny.kinjarSubdomainChecked) {
    windowAny.kinjarSubdomainChecked = true;
    
    const hostname = window.location.hostname;
    const familySlug = getFamilySlug(hostname);
    
    if (familySlug) {
      // Store family slug in sessionStorage and redirect to family route
      sessionStorage.setItem('familySlug', familySlug);
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        window.location.href = `/family/${familySlug}`;
      });
    }
  }
  
  return null;
}

function getFamilySlug(hostname: string): string | null {
  if (!hostname) return null;
  
  // Remove protocol if present
  hostname = hostname.replace(/^https?:\/\//, '');
  
  // Check if it's a subdomain of kinjar.com
  if (hostname.endsWith('.kinjar.com')) {
    const subdomain = hostname.split('.')[0];
    // Exclude www and api subdomains
    if (subdomain !== 'www' && subdomain !== 'api') {
      return subdomain;
    }
  }
  
  return null;
}

function LoadingPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', textAlign: 'center' }}>
      <div style={{ fontSize: 18, color: '#666' }}>Loading...</div>
    </main>
  );
}

function MainLandingPage() {
  return (
    <main style={{ 
      padding: 24, 
      fontFamily: 'system-ui',
      maxWidth: 800,
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 48, margin: '32px 0 16px 0', color: '#111' }}>
          👨‍👩‍👧‍👦 Kinjar
        </h1>
        <p style={{ fontSize: 20, color: '#666', margin: '0 0 32px 0' }}>
          Private family video sharing platform
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        <div style={{
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>🏠 For Families</h3>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
            Create your own private family site to share videos, photos, and memories with loved ones.
          </p>
        </div>
        
        <div style={{
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>🔒 Private & Secure</h3>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
            Your family content is private and only accessible to invited family members.
          </p>
        </div>
        
        <div style={{
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>📱 Easy Sharing</h3>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
            Upload and share videos and photos from any device with your family.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a 
          href="/login"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 16,
            fontWeight: 500
          }}
        >
          Sign In
        </a>
        <a 
          href="/signup"
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 16,
            fontWeight: 500
          }}
        >
          Request Family Site
        </a>
      </div>
      
      <div style={{ marginTop: 48, fontSize: 14, color: '#9ca3af' }}>
        <p>Already have a family site? Visit yourfamily.kinjar.com</p>
      </div>
    </main>
  );
}