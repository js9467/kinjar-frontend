'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function SignupRequestPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [family, setFamily] = useState('');
  const [slug, setSlug] = useState('');
  const [msg, setMsg] = useState<string|undefined>();
  const [err, setErr] = useState<string|undefined>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined); setMsg(undefined);
    try {
      const res = await api<{ok:boolean; requestId:string}>('/signup/request', {
        method: 'POST',
        body: JSON.stringify({
          email, password: pw, familyName: family, desiredSlug: slug || undefined
        })
      });
      setMsg('Request submitted. You’ll be notified after approval. Try signing in later.');
    } catch {
      setErr('Could not submit request. Check inputs and try again.');
    }
  }

  return (
    <main style={{maxWidth:420, margin:'64px auto', fontFamily:'system-ui'}}>
      <h1>Request an Account</h1>
      <form onSubmit={submit}>
        <label>Family Name<br/>
          <input value={family} onChange={e=>setFamily(e.target.value)} required />
        </label><br/><br/>
        <label>Desired Slug (optional)<br/>
          <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="slaughterbecks" />
        </label><br/><br/>
        <label>Email<br/>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </label><br/><br/>
        <label>Password (min 8)<br/>
          <input type="password" minLength={8} value={pw} onChange={e=>setPw(e.target.value)} required/>
        </label><br/><br/>
        <button type="submit">Request Access</button>
      </form>
      {msg && <p style={{color:'#0a0'}}>{msg}</p>}
      {err && <p style={{color:'#c00'}}>{err}</p>}
      <p style={{marginTop:16}}>Already approved? <a href="/login">Sign in</a></p>
    </main>
  );
}
