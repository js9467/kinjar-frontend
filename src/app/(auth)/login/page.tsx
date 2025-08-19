import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <div style={{ padding: 24, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <h1 style={{ margin: 0, marginBottom: 12 }}>Sign in</h1>
        <p style={{ marginTop: 0, color: "#6b7280" }}>Use your Google account</p>
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
      </div>
    </main>
  );
}
