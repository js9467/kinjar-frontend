"use client";

import { API_BASE } from "@/lib/api";

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
  
  const handleFileUpload = async (type: 'photo' | 'video') => {
    // Create a file input element in a React-compatible way
    const uploadFile = (file: File) => {
      console.log(`Uploading ${type}:`, file.name, file.size, 'bytes');
      console.log('API_BASE:', API_BASE);
      
      return new Promise<void>(async (resolve, reject) => {
        try {
          // First, test if the API is reachable with better error handling
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const healthResponse = await fetch(`${API_BASE}/health`, {
              method: 'GET',
              signal: controller.signal,
              mode: 'cors', // Explicitly set CORS mode
              headers: {
                'Accept': 'application/json',
              }
            });
            
            clearTimeout(timeoutId);
            console.log('Health check status:', healthResponse.status);
            
            if (!healthResponse.ok) {
              throw new Error(`API is not available (health check failed: ${healthResponse.status})`);
            }
          } catch (healthError) {
            console.error('Health check failed:', healthError);
            const errorMessage = healthError instanceof Error ? healthError.message : String(healthError);
            const errorName = healthError instanceof Error ? healthError.name : '';
            
            if (errorName === 'AbortError') {
              alert('API request timed out. The server may be slow or unavailable.');
            } else if (errorMessage.includes('CORS')) {
              alert('Cross-origin request blocked. API may have CORS issues.');
            } else {
              alert('API is currently unavailable. The server may be starting up. Please try again in a moment.');
            }
            reject(healthError);
            return;
          }
          
          // Create form data for upload
          const formData = new FormData();
          formData.append('file', file);
          formData.append('family_slug', familySlug);
          formData.append('type', type);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for uploads
          
          const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            mode: 'cors'
          });
          
          clearTimeout(timeoutId);
          console.log('Upload response status:', response.status);
          
          const responseText = await response.text();
          console.log('Upload response:', responseText);
          
          if (response.ok) {
            alert(`${type === 'photo' ? 'Photo' : 'Video'} uploaded successfully!`);
            window.location.reload(); // Refresh to show new content
            resolve();
          } else {
            alert(`Failed to upload ${type}: ${responseText}`);
            reject(new Error(responseText));
          }
        } catch (error) {
          console.error('Upload error:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorName = error instanceof Error ? error.name : '';
          
          if (errorName === 'AbortError') {
            alert(`Upload timed out. The ${type} may be too large or the connection is slow.`);
          } else if (errorMessage.includes('Failed to fetch')) {
            alert(`Network error: Could not connect to the server. Please check your internet connection and try again.`);
          } else {
            alert(`Error uploading ${type}: ${error}. Check the console for details.`);
          }
          reject(error);
        }
      });
    };

    // Create file input programmatically but handle it better
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'photo' ? 'image/*' : 'video/*';
    input.multiple = true;
    input.style.display = 'none';
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      
      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        try {
          await uploadFile(files[i]);
        } catch (error) {
          console.error(`Failed to upload file ${files[i].name}:`, error);
          // Continue with next file
        }
      }
      
      // Clean up
      try {
        document.body.removeChild(input);
      } catch (e) {
        // Input may already be removed
      }
    };
    
    // Add to DOM temporarily and trigger click
    document.body.appendChild(input);
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