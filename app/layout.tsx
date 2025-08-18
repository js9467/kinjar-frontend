export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", margin: 0 }}>
        <header style={{ padding: "14px 18px", borderBottom: "1px solid #eee" }}>
          <strong>KINJAR</strong>
        </header>
        <main style={{ maxWidth: 760, margin: "24px auto", padding: "0 16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}