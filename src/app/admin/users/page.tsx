export default function UsersPage() {
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
          👥 User Management
        </h1>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          View and manage all users across family sites
        </p>
        <div style={{ marginTop: 12 }}>
          <a 
            href="/admin" 
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              padding: "8px 16px",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14,
              marginRight: 8
            }}
          >
            ← Back to Admin
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 32
      }}>
        <StatCard title="Total Users" value={15} icon="👤" />
        <StatCard title="Root Admins" value={1} icon="🛡️" />
        <StatCard title="Active Today" value={8} icon="💚" />
        <StatCard title="New This Week" value={3} icon="🆕" />
      </div>

      {/* Users List */}
      <div style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        overflow: "hidden"
      }}>
        <div style={{ 
          backgroundColor: "#f8f9fa",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: "bold"
        }}>
          All Users
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={tableHeaderStyle}>User</th>
                <th style={tableHeaderStyle}>Family Site</th>
                <th style={tableHeaderStyle}>Role</th>
                <th style={tableHeaderStyle}>Joined</th>
                <th style={tableHeaderStyle}>Last Active</th>
                <th style={tableHeaderStyle}>Posts</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <UserRow 
                name="Admin User"
                email="admin@kinjar.com"
                family="Root"
                role="ROOT"
                joined="2024-10-01"
                lastActive="2 hours ago"
                posts={0}
                avatar="🛡️"
              />
              <UserRow 
                name="John Slaughterbeck"
                email="john@slaughterbeck.com"
                family="Slaughterbeck Family"
                role="OWNER"
                joined="2024-10-15"
                lastActive="30 minutes ago"
                posts={12}
                avatar="👨"
              />
              <UserRow 
                name="Sarah Slaughterbeck"
                email="sarah@slaughterbeck.com"
                family="Slaughterbeck Family"
                role="MEMBER"
                joined="2024-10-15"
                lastActive="1 hour ago"
                posts={8}
                avatar="👩"
              />
              <UserRow 
                name="Mike Johnson"
                email="mike@johnson.com"
                family="Johnson Family"
                role="OWNER"
                joined="2024-10-20"
                lastActive="4 hours ago"
                posts={15}
                avatar="👨"
              />
              <UserRow 
                name="Lisa Johnson"
                email="lisa@johnson.com"
                family="Johnson Family"
                role="MEMBER"
                joined="2024-10-20"
                lastActive="6 hours ago"
                posts={3}
                avatar="👩"
              />
              <UserRow 
                name="Bob Smith"
                email="bob@smith.com"
                family="Smith Family"
                role="OWNER"
                joined="2024-10-28"
                lastActive="Yesterday"
                posts={6}
                avatar="👨"
              />
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left" as const,
  fontSize: 12,
  fontWeight: "bold" as const,
  color: "#666",
  borderBottom: "1px solid #e5e7eb"
};

const tableCellStyle = {
  padding: "12px",
  fontSize: 14,
  borderBottom: "1px solid #f3f4f6"
};

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

function UserRow({ 
  name, 
  email, 
  family, 
  role, 
  joined, 
  lastActive, 
  posts, 
  avatar 
}: {
  name: string;
  email: string;
  family: string;
  role: string;
  joined: string;
  lastActive: string;
  posts: number;
  avatar: string;
}) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ROOT": return "#ef4444";
      case "OWNER": return "#3b82f6";
      case "ADMIN": return "#8b5cf6";
      case "MEMBER": return "#10b981";
      default: return "#6b7280";
    }
  };

  return (
    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
      <td style={tableCellStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{avatar}</span>
          <div>
            <div style={{ fontWeight: "bold" }}>{name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{email}</div>
          </div>
        </div>
      </td>
      <td style={tableCellStyle}>
        <span style={{ fontSize: 14 }}>{family}</span>
      </td>
      <td style={tableCellStyle}>
        <span style={{
          backgroundColor: getRoleColor(role),
          color: "white",
          padding: "2px 8px",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: "bold"
        }}>
          {role}
        </span>
      </td>
      <td style={tableCellStyle}>
        <span style={{ fontSize: 12, color: "#666" }}>
          {new Date(joined).toLocaleDateString()}
        </span>
      </td>
      <td style={tableCellStyle}>
        <span style={{ fontSize: 12, color: "#666" }}>{lastActive}</span>
      </td>
      <td style={tableCellStyle}>
        <span style={{ fontSize: 14, fontWeight: "bold" }}>{posts}</span>
      </td>
      <td style={tableCellStyle}>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={{
            padding: "4px 8px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 3,
            fontSize: 11,
            cursor: "pointer"
          }}>
            View
          </button>
          {role !== "ROOT" && (
            <button style={{
              padding: "4px 8px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 3,
              fontSize: 11,
              cursor: "pointer"
            }}>
              Remove
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}