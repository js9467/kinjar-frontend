"use client";

import { API_BASE } from "@/lib/api";
import { createFileUploadHandler } from "@/lib/upload";

interface FamilyPageProps {
  params: {
    slug: string;
  };
}

export default function FamilyPage({ params }: FamilyPageProps) {
  const familySlug = params.slug;
  const familyName = familySlug.charAt(0).toUpperCase() + familySlug.slice(1);
  
  return <FunctionalFamilyHomePage familySlug={familySlug} />;
}

function FunctionalFamilyHomePage({ familySlug }: { familySlug: string }) {
  const familyName = familySlug.charAt(0).toUpperCase() + familySlug.slice(1);
  
  // Use the improved upload handler without toast notifications for now
  const handleFileUpload = createFileUploadHandler(familySlug);
  
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
  // Simple placeholder - avoid hydration complexity
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