import { NextResponse } from 'next/server';
import { API_BASE } from '@/lib/api';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const form = await req.formData();
  const id = String(form.get('id') || '');
  const op = String(form.get('op') || 'approve'); // 'approve' | 'deny'
  const cookie = req.headers.get('cookie') || '';

  if (!id) {
    return NextResponse.redirect(new URL('/admin/approvals?err=missing', url), { status: 303 });
  }

  const path = op === 'deny' ? '/admin/signup/deny' : '/admin/signup/approve';
  const body = op === 'deny' ? { requestId: id, reason: 'Not a fit' } : { requestId: id };

  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    credentials: 'include' as any,
    body: JSON.stringify(body),
  });

  const redir = new URL('/admin/approvals', url);
  if (!r.ok) redir.searchParams.set('err', 'action');
  return NextResponse.redirect(redir, { status: 303 });
}
