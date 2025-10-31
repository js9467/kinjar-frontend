"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

export const dynamic = "force-dynamic";

// Determine if this is a family subdomain or main domain
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

export default function AdminPage() {
  const [adminType, setAdminType] = useState<'global' | 'family' | 'loading'>('loading');
  const [viewMode, setViewMode] = useState<'auto' | 'force-global' | 'force-family'>('auto');
  const [familySlug, setFamilySlug] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Determine admin type based on hostname and view mode
    const hostname = window.location.hostname;
    const slug = getFamilySlug(hostname);
    
    setFamilySlug(slug);
    
    // Fetch user info to determine permissions
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setUser(data.user);
          
          // Determine admin type based on view mode and location
          if (viewMode === 'force-global' && data.user.global_role === 'ROOT') {
            setAdminType('global');
          } else if (viewMode === 'force-family' && slug) {
            setAdminType('family');
          } else if (viewMode === 'auto') {
            if (slug) {
              // On family subdomain - show family admin by default
              setAdminType('family');
            } else {
              // On main domain - check if ROOT admin
              if (data.user.global_role === 'ROOT') {
                setAdminType('global');
              } else {
                // Regular user on main domain - redirect to family selection
                window.location.href = '/';
              }
            }
          }
          
          // Load appropriate stats
          loadStats(data.user, slug);
        } else {
          // Not logged in - redirect to login
          window.location.href = '/login';
        }
      })
      .catch(() => {
        setAdminType('global'); // Fallback
      })
      .finally(() => {
        setLoading(false);
      });
  }, [viewMode]);
  
  const loadStats = async (user: any, slug: string | null) => {
    try {
      if (user.global_role === 'ROOT' && (!slug || viewMode === 'force-global')) {
        // Load global stats
        const [signupReqs, tenants, users] = await Promise.all([
          fetch(`${API_BASE}/admin/signup/requests`, { credentials: 'include' }).then(r => r.json()),
          fetch(`${API_BASE}/admin/tenants`, { credentials: 'include' }).then(r => r.json()),
          fetch(`${API_BASE}/admin/users`, { credentials: 'include' }).then(r => r.json())
        ]);
        
        setStats({
          type: 'global',
          pendingRequests: signupReqs.ok ? signupReqs.requests?.length || 0 : 0,
          totalFamilies: tenants.ok ? tenants.tenants?.length || 0 : 0,
          totalUsers: users.ok ? users.users?.length || 0 : 0,
          requests: signupReqs.requests || [],
          tenants: tenants.tenants || []
        });
      } else if (slug) {
        // Load family stats - placeholder for now, you'll need to create these endpoints
        setStats({
          type: 'family',
          familyName: slug,
          totalPosts: 12, // TODO: Real API call
          familyMembers: 6, // TODO: Real API call
          photosShared: 45, // TODO: Real API call
          videosUploaded: 8 // TODO: Real API call
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  
  if (loading) {
    return (
      <main style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: 24, 
        fontFamily: "system-ui",
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 18, color: '#666', padding: 48 }}>Loading admin interface...</div>
      </main>
    );
  }
  
  return (
    <main style={{ 
      maxWidth: 1200, 
      margin: "0 auto", 
      padding: 24, 
      fontFamily: "system-ui"
    }}>
      {/* Admin Type Switcher */}
      {user?.global_role === 'ROOT' && familySlug && (
        <div style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          border: '1px solid #d1d5db'
        }}>
          <div style={{ marginBottom: 12, fontSize: 14, color: '#6b7280' }}>
            👑 ROOT Admin - Choose View:
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setViewMode('auto')}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                backgroundColor: viewMode === 'auto' ? '#3b82f6' : '#fff',
                color: viewMode === 'auto' ? '#fff' : '#374151',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              🏠 Family View ({familySlug})
            </button>
            <button
              onClick={() => setViewMode('force-global')}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                backgroundColor: viewMode === 'force-global' ? '#ef4444' : '#fff',
                color: viewMode === 'force-global' ? '#fff' : '#374151',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              🛡️ Global Admin
            </button>
            <a
              href="https://www.kinjar.com/admin"
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                backgroundColor: '#6b7280',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 14
              }}
            >
              🌐 Go to Main Admin
            </a>
          </div>
        </div>
      )}
      
      {adminType === 'global' ? (
        <GlobalAdminInterface user={user} stats={stats} />
      ) : (
        <FamilyAdminInterface familySlug={familySlug} user={user} stats={stats} />
      )}
    </main>
  );
}

// Global Admin Interface with real data
function GlobalAdminInterface({ user, stats }: { user: any, stats: any }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const approveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`${API_BASE}/admin/signup/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      
      if (response.ok) {
        window.location.reload(); // Refresh to see changes
      } else {
        alert('Failed to approve request');
      }
    } catch (error) {
      alert('Error approving request');
    }
  };
  
  const denyRequest = async (requestId: string, reason: string = 'Not approved') => {
    try {
      const response = await fetch(`${API_BASE}/admin/signup/deny`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, reason })
      });
      
      if (response.ok) {
        window.location.reload(); // Refresh to see changes
      } else {
        alert('Failed to deny request');
      }
    } catch (error) {
      alert('Error denying request');
    }
  };
  
  return (
    <>
      {/* Header */}
      <div style={{ 
        marginBottom: 32,
        borderBottom: "2px solid #e5e7eb",
        paddingBottom: 16
      }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: "bold", 
          margin: 0,
          color: "#111"
        }}>
          🛡️ Kinjar Global Admin
        </h1>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          Platform-wide administration • Logged in as: {user?.email} (ROOT)
        </p>
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              backgroundColor: activeTab === 'dashboard' ? "#3b82f6" : "#6b7280",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              marginRight: 12,
              fontSize: 14
            }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              backgroundColor: activeTab === 'approvals' ? "#ef4444" : "#6b7280",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              marginRight: 12,
              fontSize: 14
            }}
          >
            ⏳ Approvals ({stats?.pendingRequests || 0})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              backgroundColor: activeTab === 'settings' ? "#6b7280" : "#9ca3af",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              marginRight: 12,
              fontSize: 14
            }}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stats Dashboard */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 32
          }}>
            <StatCard title="Total Families" value={stats?.totalFamilies?.toString() || '0'} icon="👨‍👩‍👧‍👦" />
            <StatCard title="Pending Requests" value={stats?.pendingRequests?.toString() || '0'} icon="⏳" />
            <StatCard title="Total Users" value={stats?.totalUsers?.toString() || '0'} icon="👤" />
            <StatCard title="Platform Health" value="Good" icon="💚" />
          </div>

          {/* Active Families */}
          <div style={{
            padding: 24,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            backgroundColor: "#fff"
          }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#374151" }}>👨‍👩‍👧‍👦 Active Family Sites</h2>
            {stats?.tenants?.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {stats.tenants.map((tenant: any) => (
                  <div key={tenant.id} style={{
                    padding: 16,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{tenant.name}</strong>
                      <div style={{ fontSize: 14, color: '#666' }}>
                        {tenant.slug}.kinjar.com • {tenant.users?.length || 0} members
                      </div>
                    </div>
                    <a 
                      href={`https://${tenant.slug}.kinjar.com`}
                      target="_blank"
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 4,
                        fontSize: 14
                      }}
                    >
                      Visit Site
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>No active family sites yet.</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'approvals' && (
        <div style={{
          padding: 24,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          backgroundColor: "#fff"
        }}>
          <h2 style={{ margin: "0 0 20px 0", color: "#374151" }}>⏳ Pending Family Requests</h2>
          {stats?.requests?.length > 0 ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {stats.requests.map((request: any) => (
                <div key={request.id} style={{
                  padding: 20,
                  border: '2px solid #fbbf24',
                  borderRadius: 8,
                  backgroundColor: '#fefce8'
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <strong style={{ fontSize: 18 }}>{request.family_name}</strong>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>
                      Requested by: {request.contact_email}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>
                      Slug: {request.slug}.kinjar.com
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => approveRequest(request.id)}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 14
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for denial (optional):');
                        if (reason !== null) denyRequest(request.id, reason);
                      }}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 14
                      }}
                    >
                      ❌ Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>No pending requests.</p>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <AccountSettings user={user} />
      )}
    </>
  );
}

// Family Admin Interface with real functionality
function FamilyAdminInterface({ familySlug, user, stats }: { familySlug: string | null, user: any, stats: any }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inviteEmail, setInviteEmail] = useState('');
  
  const inviteFamilyMember = async () => {
    if (!inviteEmail) return;
    
    try {
      // TODO: Implement family member invitation API
      alert(`Invitation sent to ${inviteEmail} (Feature coming soon)`);
      setInviteEmail('');
    } catch (error) {
      alert('Failed to send invitation');
    }
  };
  
  return (
    <>
      {/* Header */}
      <div style={{ 
        marginBottom: 32,
        borderBottom: "2px solid #e5e7eb",
        paddingBottom: 16
      }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: "bold", 
          margin: 0,
          color: "#111"
        }}>
          👨‍👩‍👧‍👦 {familySlug ? familySlug.charAt(0).toUpperCase() + familySlug.slice(1) : 'Family'} Admin
        </h1>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          Manage your family site • Logged in as: {user?.email}
        </p>
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              backgroundColor: activeTab === 'dashboard' ? "#3b82f6" : "#6b7280",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              marginRight: 12,
              fontSize: 14
            }}
          >
            📊 Dashboard
          </button>
          <a 
            href="/" 
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              textDecoration: "none",
              marginRight: 12,
              fontSize: 14
            }}
          >
            🏠 View Family Site
          </a>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              backgroundColor: activeTab === 'settings' ? "#6b7280" : "#9ca3af",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              marginRight: 12,
              fontSize: 14
            }}
          >
            ⚙️ Account Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <>
          {/* Family Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 24,
            marginBottom: 32
          }}>
            <div style={{
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb"
            }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>📊 Family Stats</h3>
              <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                • Total posts: {stats?.totalPosts || 0}<br />
                • Family members: {stats?.familyMembers || 0}<br />
                • Photos shared: {stats?.photosShared || 0}<br />
                • Videos uploaded: {stats?.videosUploaded || 0}
              </div>
            </div>

            <div style={{
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff"
            }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>👨‍👩‍👧‍👦 Invite Family</h3>
              <input 
                type="email" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 4,
                  marginBottom: 12,
                  boxSizing: "border-box"
                }}
              />
              <button 
                onClick={inviteFamilyMember}
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 14
                }}
              >
                Send Invitation
              </button>
            </div>
          </div>

          {/* Family Management */}
          <div style={{
            padding: 24,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            backgroundColor: "#fff"
          }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#374151" }}>⚙️ Family Management</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="/upload"
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontSize: 14
                }}
              >
                📸 Upload Media
              </a>
              <button style={{
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14
              }}>
                👥 Manage Members
              </button>
              <button style={{
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14
              }}>
                📊 Family Analytics
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <AccountSettings user={user} />
      )}
    </>
  );
}

// Account Settings Component with password management
function AccountSettings({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters');
      return;
    }
    
    try {
      // TODO: Implement password change API endpoint
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      if (response.ok) {
        setMessage('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to change password');
      }
    } catch (error) {
      setMessage('Password change feature coming soon');
    }
  };
  
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/login';
    } catch (error) {
      window.location.href = '/login';
    }
  };
  
  return (
    <div style={{
      padding: 24,
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      backgroundColor: "#fff"
    }}>
      <h2 style={{ margin: "0 0 20px 0", color: "#374151" }}>⚙️ Account Settings</h2>
      
      {/* User Info */}
      <div style={{ marginBottom: 32, padding: 20, backgroundColor: '#f9fafb', borderRadius: 6 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>👤 Account Information</h3>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          <strong>Email:</strong> {user?.email}<br />
          <strong>Role:</strong> {user?.global_role === 'ROOT' ? 'Platform Administrator' : 'Family Member'}<br />
          <strong>Member since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
        </div>
      </div>
      
      {/* Change Password */}
      <form onSubmit={changePassword} style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 16px 0' }}>🔒 Change Password</h3>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
            Current Password:
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 300,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
            New Password:
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 300,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
            Confirm New Password:
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 300,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button
          type="submit"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            marginRight: 12
          }}
        >
          Change Password
        </button>
        
        {message && (
          <div style={{ 
            marginTop: 12, 
            padding: 8, 
            backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2',
            color: message.includes('success') ? '#065f46' : '#991b1b',
            borderRadius: 4,
            fontSize: 14
          }}>
            {message}
          </div>
        )}
      </form>
      
      {/* Logout */}
      <div>
        <h3 style={{ margin: '0 0 16px 0' }}>🚪 Session</h3>
        <button
          onClick={logout}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon }: { title: string, value: string, icon: string }) {
  return (
    <div style={{
      padding: 20,
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      backgroundColor: "#fff",
      textAlign: "center"
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: "bold", color: "#111", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 14, color: "#666" }}>{title}</div>
    </div>
  );
}