export default function SettingsPage() {
  return (
    <main style={{ 
      maxWidth: 800, 
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
          ⚙️ Global Settings
        </h1>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          Configure global Kinjar platform settings
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

      {/* Platform Settings */}
      <div style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 20,
        marginBottom: 24
      }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
          🌐 Platform Configuration
        </h2>
        
        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
              Root Domain:
            </label>
            <input
              type="text"
              defaultValue="kinjar.com"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 14
              }}
            />
            <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0 0" }}>
              Main domain for the platform. Family sites will be [family].kinjar.com
            </p>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
              API Base URL:
            </label>
            <input
              type="text"
              defaultValue="https://api.kinjar.com"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
              Auto-Approve New Families:
            </label>
            <select style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              fontSize: 14
            }}>
              <option value="false">Manual Approval (Recommended)</option>
              <option value="true">Auto-Approve All</option>
            </select>
            <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0 0" }}>
              When enabled, new family signups are automatically approved
            </p>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              alignSelf: "flex-start"
            }}
          >
            Save Platform Settings
          </button>
        </form>
      </div>

      {/* Storage Settings */}
      <div style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 20,
        marginBottom: 24
      }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
          💾 Storage & Media
        </h2>
        
        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
              Max Video Size (MB):
            </label>
            <input
              type="number"
              defaultValue="100"
              min="1"
              max="500"
              style={{
                width: "200px",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
              Max Video Duration (seconds):
            </label>
            <input
              type="number"
              defaultValue="300"
              min="10"
              max="3600"
              style={{
                width: "200px",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
              Allowed File Types:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {['mp4', 'webm', 'jpg', 'jpeg', 'png', 'gif', 'webp'].map(type => (
                <label key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ fontSize: 12 }}>{type.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              alignSelf: "flex-start"
            }}
          >
            Save Media Settings
          </button>
        </form>
      </div>

      {/* Security Settings */}
      <div style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 20,
        marginBottom: 24
      }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
          🔒 Security & Access
        </h2>
        
        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
              Session Timeout (hours):
            </label>
            <input
              type="number"
              defaultValue="24"
              min="1"
              max="168"
              style={{
                width: "200px",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: "bold" }}>
              Minimum Password Length:
            </label>
            <input
              type="number"
              defaultValue="8"
              min="6"
              max="32"
              style={{
                width: "200px",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: 14 }}>Require email verification for new accounts</span>
            </label>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: 14 }}>Enable two-factor authentication</span>
            </label>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              alignSelf: "flex-start"
            }}
          >
            Save Security Settings
          </button>
        </form>
      </div>

      {/* System Information */}
      <div style={{
        backgroundColor: "#f8f9fa",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 20
      }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
          📊 System Information
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>Platform Version:</div>
            <div style={{ fontSize: 14, fontWeight: "bold" }}>Kinjar v1.0.0</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>API Status:</div>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#10b981" }}>✅ Online</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>Database:</div>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#10b981" }}>✅ Connected</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>Storage:</div>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#10b981" }}>✅ R2 Active</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>Uptime:</div>
            <div style={{ fontSize: 14, fontWeight: "bold" }}>2 days, 14 hours</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>Last Backup:</div>
            <div style={{ fontSize: 14, fontWeight: "bold" }}>Oct 31, 2024 02:00</div>
          </div>
        </div>
      </div>
    </main>
  );
}