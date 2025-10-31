import { API_BASE } from "@/lib/api";

export const dynamic = "force-dynamic";

export default function AdminPage() {
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
          Manage all family sites and users
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
              fontSize: 14,
              fontWeight: "bold",
              marginRight: 8
            }}
          >
            📋 Approve Signups
          </a>
          <a 
            href="/logout"
            style={{
              backgroundColor: "#6b7280",
              color: "white", 
              padding: "8px 16px",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14
            }}
          >
            Sign Out
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
        <StatCard title="Total Families" value={3} icon="👨‍👩‍👧‍👦" />
        <StatCard title="Pending Requests" value={2} icon="⏳" />
        <StatCard title="Total Users" value={15} icon="👤" />
        <StatCard title="Total Posts" value={47} icon="📝" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Main Content */}
        <div>
          {/* Create New Tenant */}
          <div style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #e5e7eb", 
            borderRadius: 8,
            padding: 20,
            marginBottom: 24
          }}>
            <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
              🏗️ Create New Family Site
            </h2>
            <form style={{ display: "flex", gap: 12, alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
                  Family Name:
                </label>
                <input
                  name="name"
                  placeholder="e.g., Slaughterbeck Family"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 4,
                    fontSize: 14
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
                  Subdomain:
                </label>
                <input
                  name="slug"
                  placeholder="e.g., slaughterbeck"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 4,
                    fontSize: 14
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Create Site
              </button>
            </form>
            <p style={{ fontSize: 12, color: "#666", margin: "8px 0 0 0" }}>
              This will create a new family site accessible at [subdomain].kinjar.com
            </p>
          </div>

          {/* Existing Tenants */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
              🏠 Family Sites (3)
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              <TenantCard 
                name="Slaughterbeck Family"
                slug="slaughterbeck"
                members={6}
                posts={23}
                created="2024-10-15"
              />
              <TenantCard 
                name="Johnson Family"
                slug="johnsons"
                members={4}
                posts={18}
                created="2024-10-20"
              />
              <TenantCard 
                name="Smith Family"
                slug="smiths"
                members={5}
                posts={6}
                created="2024-10-28"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Pending Requests */}
          <div style={{
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24
          }}>
            <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#92400e" }}>
              ⏳ Pending Requests (2)
            </h3>
            <div>
              <div style={{ 
                fontSize: 12, 
                color: "#92400e",
                marginBottom: 8,
                paddingBottom: 8,
                borderBottom: "1px solid #fbbf24"
              }}>
                <div style={{ fontWeight: "bold" }}>Wilson Family</div>
                <div>wilson@email.com</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Oct 30, 2024</div>
              </div>
              <div style={{ 
                fontSize: 12, 
                color: "#92400e",
                marginBottom: 8
              }}>
                <div style={{ fontWeight: "bold" }}>Garcia Family</div>
                <div>garcia@email.com</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Oct 31, 2024</div>
              </div>
              <a 
                href="/admin/approvals"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "6px 12px",
                  backgroundColor: "#f59e0b",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: "bold"
                }}
              >
                Review All →
              </a>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16
          }}>
            <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
              ⚡ Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a 
                href="/admin/approvals"
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: 4,
                  fontSize: 14,
                  textAlign: "center"
                }}
              >
                📋 Manage Approvals
              </a>
              <a 
                href="/admin/users"
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#8b5cf6",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: 4,
                  fontSize: 14,
                  textAlign: "center"
                }}
              >
                👥 View All Users
              </a>
              <a 
                href="/admin/settings"
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: 4,
                  fontSize: 14,
                  textAlign: "center"
                }}
              >
                ⚙️ Global Settings
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            marginTop: 16
          }}>
            <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
              📊 Recent Activity
            </h3>
            <div style={{ fontSize: 12, color: "#666" }}>
              <div style={{ marginBottom: 6 }}>
                🎥 New video posted in <strong>Slaughterbeck</strong>
              </div>
              <div style={{ marginBottom: 6 }}>
                👤 New user joined <strong>Johnsons</strong>
              </div>
              <div style={{ marginBottom: 6 }}>
                💬 5 new comments across all sites
              </div>
              <div>
                📝 2 new posts this week
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: 16,
      textAlign: "center"
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: "bold", color: "#111", marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
    </div>
  );
}

function TenantCard({ name, slug, members, posts, created }: { 
  name: string; 
  slug: string;
  members: number;
  posts: number;
  created: string;
}) {
  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: 16,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}>
            {name}
          </h3>
          <span style={{
            backgroundColor: "#10b981",
            color: "white",
            padding: "2px 6px",
            borderRadius: 3,
            fontSize: 10,
            fontWeight: "bold"
          }}>
            ACTIVE
          </span>
        </div>
        <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
          <strong>URL:</strong> {slug}.kinjar.com
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          Created: {new Date(created).toLocaleDateString()} |
          Members: {members} |
          Posts: {posts}
        </div>
      </div>
      
      <div style={{ display: "flex", gap: 8 }}>
        <a 
          href={`https://${slug}.kinjar.com`}
          target="_blank"
          style={{
            padding: "6px 12px",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: 4,
            fontSize: 12
          }}
        >
          Visit Site
        </a>
        <a 
          href={`/admin/tenants/${slug}`}
          style={{
            padding: "6px 12px",
            backgroundColor: "#8b5cf6",
            color: "white",
            textDecoration: "none",
            borderRadius: 4,
            fontSize: 12
          }}
        >
          Manage
        </a>
        <button
          style={{
            padding: "6px 12px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 4,
            fontSize: 12,
            cursor: "pointer"
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}