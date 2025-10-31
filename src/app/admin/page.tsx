"use client";

import { API_BASE } from "@/lib/api";

export const dynamic = "force-dynamic";

// Simple admin page without complex React hooks
export default function AdminPage() {
  return (
    <main style={{ 
      maxWidth: 1200, 
      margin: "0 auto", 
      padding: 24, 
      fontFamily: "system-ui"
    }}>
      <AdminContent />
    </main>
  );
}

function AdminContent() {
  // Simple client-side detection without useState/useEffect for now
  const isClient = typeof window !== 'undefined';
  
  if (!isClient) {
    return <LoadingView />;
  }
  
  const hostname = window.location.hostname;
  const familySlug = getFamilySlug(hostname);
  
  if (familySlug) {
    return <FamilyAdminView familySlug={familySlug} />;
  } else {
    return <GlobalAdminView />;
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

function LoadingView() {
  return (
    <div style={{ textAlign: 'center', padding: 48 }}>
      <div style={{ fontSize: 18, color: '#666' }}>Loading admin interface...</div>
    </div>
  );
}

function GlobalAdminView() {
  return (
    <>
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
          Platform-wide administration
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
        <StatCard title="Platform Health" value="Good" icon="💚" />
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: 24,
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        backgroundColor: "#fff"
      }}>
        <h2 style={{ margin: "0 0 20px 0", color: "#374151" }}>🔧 Platform Management</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="/admin/approvals"
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14
            }}
          >
            Approve Pending Families
          </a>
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
        </div>
      </div>
    </>
  );
}

function FamilyAdminView({ familySlug }: { familySlug: string }) {
  return (
    <>
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
          👨‍👩‍👧‍👦 {familySlug.charAt(0).toUpperCase() + familySlug.slice(1)} Family Admin
        </h1>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          Manage your family site
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
    </>
  );
}

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