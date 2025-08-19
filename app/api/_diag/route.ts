// app/api/_diag/route.ts
export const runtime = "nodejs";
export async function GET() {
  const keys = [
    "NEXTAUTH_URL","AUTH_URL",
    "NEXTAUTH_SECRET","AUTH_SECRET",
    "GOOGLE_CLIENT_ID","AUTH_GOOGLE_ID",
    "GOOGLE_CLIENT_SECRET","AUTH_GOOGLE_SECRET",
  ];
  return Response.json(Object.fromEntries(keys.map(k => [k, !!process.env[k as any]])));
}
