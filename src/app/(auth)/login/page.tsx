'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// IMPORTANT: make sure NEXT_PUBLIC_API_BASE is set in Vercel to https://kinjar-api.fly.dev
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_URL ?? // optional fallback if you already have this
  'https://kinjar-api.fly.dev';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include', // receive HttpOnly cookie from api.kinjar.com
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password: pw }),
      });
      if (!res.ok) throw new Error('Invalid email or password');
      
      // Smart redirect based on domain and user role
      const hostname = window.location.hostname;
      if (hostname.endsWith('.kinjar.com') && hostname !== 'www.kinjar.com') {
        // On family subdomain - go to family admin
        router.push('/admin');
      } else {
        // On main domain - go to appropriate admin (will auto-detect)
        router.push('/admin');
      }
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '64px auto', fontFamily: 'system-ui' }}>
      <h1>Sign in</h1>
      <form onSubmit={onSubmit}>
        <label>Email<br/>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" />
        </label><br/><br/>
        <label>Password<br/>
          <input type="password" value={pw} onChange={(e)=>setPw(e.target.value)} required autoComplete="current-password" />
        </label><br/><br/>
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      {err && <p style={{ color: '#c00', marginTop: 12 }}>{err}</p>}

      {/* Optional Google button — hidden unless you set NEXT_PUBLIC_SHOW_GOOGLE=1 */}
      {process.env.NEXT_PUBLIC_SHOW_GOOGLE === '1' && (
        <form action="/api/auth/signin/google" method="post" style={{ marginTop: 16 }}>
          <button>Continue with Google</button>
        </form>
      )}
    </main>
  );
}
