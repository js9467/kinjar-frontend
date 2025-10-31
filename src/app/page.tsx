"use client";

import { API_BASE } from "@/lib/api";

export default function HomePage() {
  return <SmartHomePage />;
}

function SmartHomePage() {
  // Client-side detection to avoid hydration issues
  const isClient = typeof window !== 'undefined';
  
  if (!isClient) {
    return <LoadingPage />;
  }
  
  const hostname = window.location.hostname;
  const familySlug = getFamilySlug(hostname);
  
  if (familySlug) {
    return <FamilyHomePage familySlug={familySlug} />;
  } else {
    return <MainLandingPage />;
  }
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

function FamilyHomePage({ familySlug }: { familySlug: string }) {
  const familyName = familySlug.charAt(0).toUpperCase() + familySlug.slice(1);
  
  return (
    <main style={{ 
      padding: 24, 
      fontFamily: 'system-ui',
      maxWidth: 1000,
      margin: '0 auto'
    }}>
      {/* Family Header */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: 32,
        padding: 32,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{ 
          fontSize: 36, 
          margin: '0 0 8px 0', 
          color: '#111' 
        }}>
          👨‍👩‍👧‍👦 {familyName} Family
        </h1>
        <p style={{ color: '#666', margin: '0 0 24px 0', fontSize: 18 }}>
          Welcome to your private family site
        </p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/login"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14
            }}
          >
            👤 Family Login
          </a>
          <a 
            href="/admin"
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14
            }}
          >
            ⚙️ Family Admin
          </a>
        </div>
      </div>
      
      {/* Family Content Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        <div style={{
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          backgroundColor: '#fff'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>📸 Recent Photos</h3>
          <div style={{ 
            height: 120, 
            backgroundColor: '#f3f4f6', 
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 14
          }}>
            Family photos will appear here
          </div>
        </div>
        
        <div style={{
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          backgroundColor: '#fff'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>🎥 Recent Videos</h3>
          <div style={{ 
            height: 120, 
            backgroundColor: '#f3f4f6', 
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 14
          }}>
            Family videos will appear here
          </div>
        </div>
        
        <div style={{
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          backgroundColor: '#fff'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>👨‍👩‍👧‍👦 Family Members</h3>
          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
            • Mom<br />
            • Dad<br />
            • Sarah<br />
            • Mike<br />
            <span style={{ color: '#9ca3af' }}>+ 2 more members</span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div style={{
        padding: 24,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        backgroundColor: '#fff',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>🚀 Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => alert('Upload feature coming soon!')}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            📸 Upload Photo
          </button>
          <button 
            onClick={() => alert('Upload feature coming soon!')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            🎥 Upload Video
          </button>
          <button 
            onClick={() => alert('Invite feature coming soon!')}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            👨‍👩‍👧‍👦 Invite Family
          </button>
        </div>
      </div>
    </main>
  );
}
