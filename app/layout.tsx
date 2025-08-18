export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", margin: <header style={{ padding:"14px 18px", borderBottom:"1px solid #eee", display:"flex", gap:12 }}>
  <strong><a href="/" style={{ textDecoration:"none" }}>KINJAR</a></strong>
  <a href="/feed">Feed</a>
  <a href="/capsules">Capsules</a>
  <a href="/settings/members">Members</a>
  <a href="/kids">Kids</a>
</header>
        <main style={{ maxWidth: 760, margin: "24px auto", padding: "0 16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}