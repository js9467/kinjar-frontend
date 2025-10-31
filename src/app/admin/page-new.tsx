"use client";

import { useState, useEffect } from "react";
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
  const [familySlug, setFamilySlug] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Determine admin type based on hostname
    const hostname = window.location.hostname;
    const slug = getFamilySlug(hostname);
    
    setFamilySlug(slug);
    
    // Fetch user info to determine permissions
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setUser(data.user);
          
          if (slug) {
            // On family subdomain - show family admin
            setAdminType('family');
          } else {
            // On main domain - check if ROOT admin
            if (data.user.global_role === 'ROOT') {
              setAdminType('global');
            } else {
              // Regular user on main domain - redirect to family selection or login
              window.location.href = '/';
            }
          }
        } else {
          // Not logged in - redirect to login
          window.location.href = '/login';
        }
      })
      .catch(() => {
        setAdminType('global'); // Fallback
      });
  }, []);
  
  if (adminType === 'loading') {
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
  
  if (adminType === 'global') {
    return <GlobalAdminInterface user={user} />;
  } else {
    return <FamilyAdminInterface familySlug={familySlug} user={user} />;
  }
}

// Global Admin Interface (ROOT admins on www.kinjar.com/admin)
function GlobalAdminInterface({ user }: { user: any }) {
  return (
    <main style={{ 
      maxWidth: 1200, 
      margin: "0 auto", 
      padding: 24, 
      fontFamily: "system-ui"
    }}>
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
          <a 
            href="/admin/approvals" 
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              textDecoration: "none",
              marginRight: 12,
              fontSize: 14
            }}
          >
            ⏳ Approve Family Requests
          </a>
          <a 
            href="/admin/users" 
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              textDecoration: "none",
              marginRight: 12,
              fontSize: 14
            }}
          >
            👥 Manage All Users
          </a>
          <a 
            href="/admin/settings" 
            style={{
              backgroundColor: "#6b7280",
              color: "white", 
              padding: "8px 16px",
              borderRadius: 6,
              textDecoration: "none",
              marginRight: 12,
              fontSize: 14
            }}
          >
            ⚙️ Global Settings
          </a>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 32
      }}>
        <StatCard title="Total Families" value="3" icon="👨‍👩‍👧‍👦" />
        <StatCard title="Pending Requests" value="2" icon="⏳" />
        <StatCard title="Total Users" value="15" icon="👤" />
        <StatCard title="Active This Week" value="8" icon="📊" />
      </div>

      {/* Global Admin Tasks */}
      <div style={{
        padding: 24,
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        backgroundColor: "#fff"
      }}>
        <h2 style={{ margin: "0 0 20px 0", color: "#374151" }}>🔧 Platform Management</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={{
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14
          }}>
            Approve Pending Families
          </button>
          <button style={{
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14
          }}>
            Create New Family
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
            Platform Analytics
          </button>
          <button style={{
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14
          }}>
            Emergency Controls
          </button>
        </div>
      </div>
    </main>
  );
}

// Family Admin Interface (family owners on family.kinjar.com/admin)
function FamilyAdminInterface({ familySlug, user }: { familySlug: string | null, user: any }) {
  return (
    <main style={{ 
      maxWidth: 1200, 
      margin: "0 auto", 
      padding: 24, 
      fontFamily: "system-ui"
    }}>
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
          👨‍👩‍👧‍👦 {familySlug?.charAt(0).toUpperCase() + familySlug?.slice(1)} Family Admin
        </h1>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          Manage your family site • Logged in as: {user?.email}
        </p>
        <div style={{ marginTop: 12 }}>
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
          <a 
            href="/upload" 
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              textDecoration: "none",
              marginRight: 12,
              fontSize: 14
            }}
          >
            📸 Upload Media
          </a>
          {user?.global_role === 'ROOT' && (
            <a 
              href="https://www.kinjar.com/admin" 
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                padding: "8px 16px",
                borderRadius: 6,
                textDecoration: "none",
                marginRight: 12,
                fontSize: 14
              }}
            >
              🛡️ Global Admin
            </a>
          )}
        </div>
      </div>

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
            • Total posts: 12<br />
            • Family members: 6<br />
            • Photos shared: 45<br />
            • Videos uploaded: 8
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
          <button style={{
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14
          }}>
            Send Invitation
          </button>
        </div>

        <div style={{
          padding: 24,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          backgroundColor: "#fff"
        }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>🕒 Recent Activity</h3>
          <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
            • Sarah uploaded a photo<br />
            • Mike posted a video<br />
            • New comment from Dad<br />
            • Family event created
          </div>
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
          <button style={{
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14
          }}>
            Manage Members
          </button>
          <button style={{
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14
          }}>
            Privacy Settings
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
            Export Family Data
          </button>
        </div>
      </div>
    </main>
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