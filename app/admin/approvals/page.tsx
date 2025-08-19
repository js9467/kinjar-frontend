import { API_BASE } from '@/lib/api';
import { redirect } from 'next/navigation';

async function getMe() {
  const r = await fetch(`${API_BASE}/auth/me`, { cache: 'no-store', credentials: 'include' as any });
  if (r.status === 401) return null;
  return r.json();
}
async function getQueue() {
  const r = await fetch(`${API_BASE}/admin/signup/requests?status=pending`, { cache: 'no-store', credentials: 'include' as any });
  if (!r.ok) throw new Error('queue fetch failed');
  return r.json();
}

async function act(path: string, body: any) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include' as any,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('action failed');
  return r.json();
}

export default async function ApprovalsPage() {
  const me = await getMe();
  if (!me || me.user.global_role !== 'ROOT') redirect('/login');
  const q = await getQueue();

  return (
    <main style={{maxWidth:720, margin:'48px auto', fontFamily:'system-ui'}}>
      <h1>Signup Approvals</h1>
      {q.items.length === 0 && <p>No pending requests.</p>}
      {q.items.map((it: any) => (
    
  <form
    key={it.id}
    method="post"
    action="/admin/approvals"
    style={{border:'1px solid #ddd', padding:16, margin:'12px 0'}}
  >
    <input type="hidden" name="id" value={it.id} />
    <div><strong>{it.tenant_name}</strong> — desired slug: <code>{it.desired_slug || '(auto)'}</code></div>
    <div>{it.email}</div>
    <div>Requested: {new Date(it.created_at).toLocaleString()}</div>
    <div style={{marginTop:8, display:'flex', gap:8}}>
      <button name="op" value="approve">Approve</button>
      <button name="op" value="deny">Deny</button>
    </div>
  </form>
))}

      ))}
    </main>
  );
}

// Server Actions (App Router, Node runtime)
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const { pathname, searchParams } = new URL(req.url);
  const id = searchParams.get('id')!;
  if (pathname.endsWith('/approve')) {
    await act('/admin/signup/approve', { requestId: id });
  } else if (pathname.endsWith('/deny')) {
    await act('/admin/signup/deny', { requestId: id, reason: 'Not a fit' });
  }
  return new Response(null, { status: 303, headers: { Location: '/admin/approvals' } });
}
