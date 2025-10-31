import { API_BASE } from "@/lib/api";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type MeResponse = {
  ok: boolean;
  user: {
    id: string;
    email: string;
    global_role: string;
  };
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  createdAt?: string;
};

type TenantsResponse = {
  ok: boolean;
  tenants: Tenant[];
};

export const dynamic = "force-dynamic";

// Server Action used directly in <form action={createTenant}>
async function createTenant(formData: FormData) {
  "use server";
  const nameRaw = String(formData.get("name") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim().toLowerCase();
  const ownerEmail = String(formData.get("ownerEmail") || "").trim().toLowerCase();

  if (!nameRaw || !slugRaw) {
    redirect("/admin?error=missing_fields");
  }

  const slug = slugRaw
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const cookieHeader = cookies()
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const res = await fetch(`${API_BASE}/admin/tenants`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: cookieHeader,
    },
    cache: "no-store",
    body: JSON.stringify({
      name: nameRaw,
      slug,
      ownerEmail: ownerEmail || undefined,
    }),
  });

  if (!res.ok) {
    let code = "create_failed";
    try {
      const data = await res.json();
      if (typeof data?.error === "string") code = data.error;
    } catch (err) {
      // ignore JSON parse errors
    }
    redirect(`/admin?error=${encodeURIComponent(code)}`);
  }

  revalidatePath("/admin");
  redirect("/admin?created=1");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const cookieHeader = (await headers()).get("cookie") ?? "";

  const meRes = await fetch(`${API_BASE}/auth/me`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  if (meRes.status === 401) redirect("/login");

  const me: MeResponse = await meRes.json();
  if (me.user.global_role !== "ROOT") redirect("/");

  const tenantsRes = await fetch(`${API_BASE}/admin/tenants`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  if (!tenantsRes.ok) {
    throw new Error("Failed to load tenants");
  }

  const tenantsData: TenantsResponse = await tenantsRes.json();
  const tenants = tenantsData.tenants || [];

  const errorParam = Array.isArray(searchParams?.error)
    ? searchParams.error[0]
    : searchParams?.error;
  const created = Array.isArray(searchParams?.created)
    ? searchParams.created[0]
    : searchParams?.created;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 12 }}>Global Admin</h1>
      <p style={{ color: "#6b7280", marginTop: 0 }}>
        Create a tenant (family). Subdomain becomes <code>{`<slug>.kinjar.com`}</code>.
      </p>

      {created && (
        <div
          style={{
            marginTop: 12,
            marginBottom: 12,
            padding: 12,
            borderRadius: 8,
            background: "#ecfdf5",
            color: "#047857",
          }}
        >
          Tenant created successfully.
        </div>
      )}

      {errorParam && (
        <div
          style={{
            marginTop: 12,
            marginBottom: 12,
            padding: 12,
            borderRadius: 8,
            background: "#fef2f2",
            color: "#b91c1c",
          }}
        >
          Failed to create tenant ({String(errorParam)}).
        </div>
      )}

      <form
        action={createTenant}
        style={{ display: "grid", gap: 12, marginTop: 20, padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Name</span>
          <input
            name="name"
            placeholder="Slaughterbecks"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Slug</span>
          <input
            name="slug"
            placeholder="slaughterbecks"
            pattern="[a-z0-9-]+"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Owner email (optional)</span>
          <input
            name="ownerEmail"
            type="email"
            placeholder="parent@example.com"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "white",
            cursor: "pointer",
            width: "fit-content"
          }}
        >
          Create tenant
        </button>
      </form>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 8 }}>Existing tenants</h2>
        {tenants.length === 0 ? (
          <div style={{ color: "#6b7280" }}>None yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {tenants.map((t) => (
              <li key={t.id} style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>
                      {t.domain ?? `${t.slug}.kinjar.com`}
                    </div>
                  </div>
                  <a
                    href={`https://${t.slug}.kinjar.com/dashboard`}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", textDecoration: "none", color: "black" }}
                  >
                    Open dashboard
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
