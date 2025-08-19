import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// Server Action used directly in <form action={createTenant}>
async function createTenant(formData: FormData) {
  "use server";
  const session = await auth();
  const user = session?.user as any;

  if (!user || user.globalRole !== "ROOT") {
    throw new Error("Unauthorized");
  }

  const nameRaw = String(formData.get("name") || "").trim();
  let slugRaw = String(formData.get("slug") || "").trim().toLowerCase();
  if (!nameRaw || !slugRaw) return;

  const slug = slugRaw
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const exists = await prisma.tenant.findUnique({ where: { slug } });
  if (exists) throw new Error("Slug already exists");

  await prisma.tenant.create({
    data: { name: nameRaw, slug, createdById: user.id }
  });

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user) redirect("/login");
  if (user.globalRole !== "ROOT") redirect("/");

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, createdAt: true }
  });

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 12 }}>Global Admin</h1>
      <p style={{ color: "#6b7280", marginTop: 0 }}>
        Create a tenant (family). Subdomain becomes <code>{`<slug>.kinjar.com`}</code>.
      </p>

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
                    <div style={{ color: "#6b7280", fontSize: 12 }}>{t.slug}.kinjar.com</div>
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
