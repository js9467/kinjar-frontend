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
      <ClientOnlyHomePage />
    </>
  );
}

function ClientOnlyHomePage() {
  // Completely prevent SSR for this component to avoid hydration mismatches
  if (typeof window === 'undefined') {
    return null; // Return nothing during SSR
  }
  
  const hostname = window.location.hostname;
  const familySlug = getFamilySlug(hostname);
  
  if (familySlug) {
    return <FunctionalFamilyHomePage familySlug={familySlug} />;
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

function FunctionalFamilyHomePage({ familySlug }: { familySlug: string }) {
  const familyName = familySlug.charAt(0).toUpperCase() + familySlug.slice(1);
  
  const handleFileUpload = async (type: 'photo' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'photo' ? 'image/*' : 'video/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading ${type}:`, file.name, file.size, 'bytes');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('family_slug', familySlug);
        formData.append('type', type);
        
        try {
          console.log(`Uploading ${type}:`, file.name, file.size, 'bytes');
          console.log('API_BASE:', API_BASE);
          
          // First, test if the API is reachable
          try {
            const healthResponse = await fetch(`${API_BASE}/health`, {
              method: 'GET'
            });
            console.log('Health check status:', healthResponse.status);
            
            if (!healthResponse.ok) {
              throw new Error(`API is not available (health check failed: ${healthResponse.status})`);
            }
          } catch (healthError) {
            console.error('Health check failed:', healthError);
            alert('API is currently unavailable. The server may be starting up. Please try again in a moment.');
            return;
          }
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('family_slug', familySlug);
          formData.append('type', type);
          
          const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
            // Don't set Content-Type header - browser will set it automatically for FormData
            // Don't require auth for now until we implement proper login flow
          });
          
          console.log('Upload response status:', response.status);
          const responseText = await response.text();
          console.log('Upload response:', responseText);
          
          if (response.ok) {
            alert(`${type === 'photo' ? 'Photo' : 'Video'} uploaded successfully!`);
            window.location.reload(); // Refresh to show new content
          } else {
            alert(`Failed to upload ${type}: ${responseText}`);
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert(`Error uploading ${type}: ${error}. Check the console for details.`);
        }
      }
    };
    
    input.click();
  };
  
  const handleInviteFamily = async () => {
    const email = prompt('Enter family member email:');
    if (!email) return;
    
    try {
      console.log(`Sending invite to ${email} for family ${familySlug}`);
      
      const response = await fetch(`${API_BASE}/families/${familySlug}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Removed auth for development
        },
        body: JSON.stringify({ email })
      });
      
      console.log('Invite response status:', response.status);
      const responseText = await response.text();
      console.log('Invite response:', responseText);
      
      if (response.ok) {
        alert('Invitation sent successfully!');
      } else {
        alert(`Failed to send invitation: ${responseText}`);
      }
    } catch (error) {
      console.error('Invite error:', error);
      alert(`Error sending invitation: ${error}. Check the console for details.`);
    }
  };
  
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
          <FamilyContentSection familySlug={familySlug} type="photo" />
        </div>
        
        <div style={{
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          backgroundColor: '#fff'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>🎥 Recent Videos</h3>
          <FamilyContentSection familySlug={familySlug} type="video" />
        </div>
        
        <div style={{
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          backgroundColor: '#fff'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>👨‍👩‍👧‍👦 Family Members</h3>
          <FamilyMembersSection familySlug={familySlug} />
        </div>
      </div>
      
      {/* Functional Quick Actions */}
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
            onClick={() => handleFileUpload('photo')}
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
            onClick={() => handleFileUpload('video')}
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
            onClick={handleInviteFamily}
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

// Component to show actual family content
function FamilyContentSection({ familySlug, type }: { familySlug: string, type: 'photo' | 'video' }) {
  if (typeof window === 'undefined') {
    return <div style={{ height: 120, backgroundColor: '#f3f4f6', borderRadius: 6 }} />;
  }
  
  // This would normally fetch from API, for now show placeholder
  return (
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
      No {type}s yet - upload some to get started!
    </div>
  );
}

// Component to show family members
function FamilyMembersSection({ familySlug }: { familySlug: string }) {
  if (typeof window === 'undefined') {
    return <div style={{ height: 120, backgroundColor: '#f3f4f6', borderRadius: 6 }} />;
  }
  
  // This would normally fetch from API
  return (
    <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
      <div style={{ marginBottom: 8 }}>
        Loading family members...
      </div>
      <button 
        onClick={() => {
          const email = prompt('Invite family member by email:');
          if (email) {
            // Would call API here
            alert('Invitation feature coming in next update!');
          }
        }}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 12
        }}
      >
        + Invite Member
      </button>
    </div>
  );
}
