// app/page.tsx
"use client";
import { useState } from "react";

export default function Landing() {
  const [fam, setFam] = useState("slaughterbecks");
  const apex = "https://kinjar.com";

  return (
    <div>
      <h1>KINJAR</h1>
      <p>Family social scrapbook</p>
      <p>Private by default. Public when you want it.</p>
      <ul>
        <li>Each family gets a subdomain</li>
        <li>Simple feed for photos &amp; stories</li>
        <li>Toggle posts public to share highlights</li>
      </ul>

      {/* Correct, working example link */}
      <p>
        Try a public page:&nbsp;
        <a href="https://slaughterbecks.kinjar.com" target="_blank" rel="noreferrer">
          https://slaughterbecks.kinjar.com
        </a>
      </p>

      {/* Handy tester */}
      <div style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 8, maxWidth: 480 }}>
        <label>
          Family name:&nbsp;
          <input value={fam} onChange={(e) => setFam(e.target.value)} placeholder="yourfamily" />
        </label>
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {/* Path-based public page (works even if wildcard subdomain isn’t ready) */}
          <a href={`/${encodeURIComponent(fam)}`}>View public page at {apex}/{fam}</a>

          {/* Private feed: sets cookie on first visit via ?family=... */}
          <a href={`/feed?family=${encodeURIComponent(fam)}`}>Open private feed (sets family cookie)</a>
        </div>
      </div>
    </div>
  );
}