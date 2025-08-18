export const metadata = {
  title: "KINJAR",
  description: "Family feed",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          margin: 0,
        }}
      >
        <header
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #eee",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <strong>
            <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
              KINJAR
            </a>
          </strong>
          <nav style={{ display: "flex", gap: 12 }}>
            <a href="/feed">Feed</a>
            <a href="/settings/members">Members</a>
          </nav>
        </header>

        <main style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
