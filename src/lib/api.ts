// lib/api.ts  (or src/lib/api.ts)
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'https://kinjar-api.fly.dev';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include', // send/receive cookies
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`${res.status}`);
  }
  return (await res.json()) as T;
}
