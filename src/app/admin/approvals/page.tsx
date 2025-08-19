import { API_BASE } from '@/lib/api';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

async function getMe(cookieHeader: string) {
  const r = await fetch(`${API_BASE}/auth/me`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  });
  if (r.status === 401) return null;
  return r.json();
}

async function getQueue(cookieHeader: string) {
  const r = await fetch(`${API_BASE}/admin/signup/requests?status=pending`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  });
  if (!r.ok) throw new Error('queue fetch failed');
  return r.json();
}

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
  const cookieHeader = (await headers()).get('cookie') ?? '';
  const me = await getMe(cookieHeader);
  if (!me || me.user.global_role !== 'ROOT') {
    redirect('/login');
  }
  const q = await getQueue(cookieHeader);

  return (
    <main style={{ maxWidth: 720, margin: '48px auto', fontFamily: 'system-ui' }}>
      <h1>Signup Approvals</h1>
      {q.items.length === 0 && <p>No pending requests.</p>}
      {q.items.map((it: any) => (
        <form
          key={it.id}
          method="post"
          action="/admin/approvals/submit"
          style={{ border: '1px solid #ddd', padding: 16, margin: '12px 0' }}
        >
          <input type="hidden" name="id" value={it.id} />
          <div>
            <strong>{it.tenant_name}</strong> — desired slug:{' '}
            <code>{it.desired_slug || '(auto)'}</code>
          </div>
          <div>{it.email}</div>
          <div>Requested: {new Date(it.created_at).toLocaleString()}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button name="op" value="approve">Approve</button>
            <button name="op" value="deny">Deny</button>
          </div>
        </form>
      ))}
    </main>
  );
}
