import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-inner">
            <a href="/" className="brand">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 12c3-6 13-6 16 0-3 6-13 6-16 0Z" stroke="url(#g)" strokeWidth="2" /><defs><linearGradient id="g" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#7cc3ff"/><stop offset="1" stopColor="#a0e68a"/></linearGradient></defs></svg>
              <span>KINJAR</span>
              <span className="badge">Family scrapbook</span>
            </a>
            <nav className="nav" style={{marginLeft:"auto", display:"flex", gap:8}}>
              <a href="/feed">Feed</a>
              <a href="/capsules">Capsules</a>
              <a href="/settings/members">Members</a>
              <a href="/kids">Kids</a>
              <a href="/debug" className="fade">Debug</a>
            </nav>
          </div>
        </header>
        <main className="main container">{children}</main>
      </body>
    </html>
  );
}
