import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  const googleEnabled =
    !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <div style={{ padding: 24, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <h1 style={{ margin: 0, marginBottom: 12 }}>Sign in</h1>
        <p style={{ marginTop: 0, color: "#6b7280" }}>Use your Google account</p>
        {googleEnabled ? (
          <a
            href="/api/auth/signin/google"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "white",
              textDecoration: "none",
              color: "black"
            }}
          >
            Continue with Google
          </a>
        ) : (
          <p style={{ color: "#6b7280" }}>Google sign-in is not available.</p>
        )}
      </div>
    </main>
  );
}
