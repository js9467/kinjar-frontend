import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function createTenantAction(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as any).globalRole as string | undefined;
  if (role !== "ROOT") redirect("/");

  const name = String(formData.get("name") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();
  const slug = slugify(slugRaw || name);
  if (!name || !slug) return;

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      createdById: (session.user as any).id
    }
  });

  // Make creator OWNER of the tenant
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: (session.user as any).id, tenantId: tenant.id } },
    update: { role: "OWNER" },
    create: { userId: (session.user as any).id, tenantId: tenant.id, role: "OWNER" }
  });
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as any).globalRole as string | undefined;
  if (role !== "ROOT") redirect("/");

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, createdAt: true }
  });

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <h1>Global Admin</h1>

      <section style={{ marginTop: 24, marginBottom: 32 }}>
        <h2 style={{ marginBottom: 8 }}>Create Tenant</h2>
        <form action={createTenantAction} style={{ display: "flex", gap: 8 }}>
          <input name="name" placeholder="Family name (e.g., Slaughterbecks)" required
            style={{ flex: 1, padding: 8, border: "1px solid #d1d5db", borderRadius: 8 }} />
          <input name="slug" placeholder="slug (optional)" 
            style={{ width: 220, padding: 8, border: "1px solid #d1d5db", borderRadius: 8 }} />
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}>
            Create
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ marginBottom: 8 }}>Tenants</h2>
        <ul style={{ padding: 0, listStyle: "none" }}>
          {tenants.map((t) => (
            <li key={t.id} style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 8 }}>
              <strong>{t.name}</strong> — <code>{t.slug}</code>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
