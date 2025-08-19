import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function addMemberAction(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenantSlug = String(formData.get("tenantSlug") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "VIEWER") as any;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return;

  // Ensure current user is ADMIN/OWNER
  const me = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: (session.user as any).id, tenantId: tenant.id } }
  });
  if (!me || (me.role !== "OWNER" && me.role !== "ADMIN")) return;

  // Create user placeholder if they haven't signed in yet
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name: email.split("@")[0] } });
  }

  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
    update: { role },
    create: { userId: user.id, tenantId: tenant.id, role }
  });
}

async function updateRoleAction(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenantSlug = String(formData.get("tenantSlug") || "");
  const membershipId = String(formData.get("membershipId") || "");
  const role = String(formData.get("role") || "VIEWER") as any;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return;

  const me = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: (session.user as any).id, tenantId: tenant.id } }
  });
  if (!me || (me.role !== "OWNER" && me.role !== "ADMIN")) return;

  await prisma.membership.update({ where: { id: membershipId }, data: { role } });
}

export default async function TenantDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const hdrs = headers();
  const tenantSlug = hdrs.get("x-tenant-slug");
  if (!tenantSlug) {
    return (
      <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
        <h1>Tenant Dashboard</h1>
        <p>No tenant in host. Use <code>&lt;tenant&gt;.kinjar.com</code>.</p>
      </main>
    );
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: {
      memberships: { include: { user: true }, orderBy: { createdAt: "asc" } }
    }
  });

  if (!tenant) {
    return (
      <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
        <h1>Tenant Dashboard</h1>
        <p>Unknown tenant: <code>{tenantSlug}</code></p>
      </main>
    );
  }

  // Require at least VIEWER membership to see; enforce ADMIN/OWNER for changes in actions above.
  const myMembership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: (session.user as any).id, tenantId: tenant.id } }
  });
  if (!myMembership) redirect("/login");

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16 }}>
      <h1>{tenant.name} — Admin</h1>

      <section style={{ marginTop: 24, marginBottom: 32 }}>
        <h2>Add Member</h2>
        <form action={addMemberAction} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="hidden" name="tenantSlug" value={tenant.slug} />
          <input name="email" placeholder="email@example.com" required
            style={{ flex: "1 1 280px", padding: 8, border: "1px solid #d1d5db", borderRadius: 8 }} />
          <select name="role" defaultValue="VIEWER"
            style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8 }}>
            <option>OWNER</option>
            <option>ADMIN</option>
            <option>ADULT</option>
            <option>CHILD</option>
            <option>VIEWER</option>
          </select>
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}>
            Add / Update
          </button>
        </form>
      </section>

      <section>
        <h2>Members</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tenant.memberships.map((m) => (
            <li key={m.id} style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
                <div>
                  <strong>{m.user.name || m.user.email}</strong>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{m.user.email}</div>
                </div>
                <form action={updateRoleAction} style={{ display: "flex", gap: 8 }}>
                  <input type="hidden" name="tenantSlug" value={tenant.slug} />
                  <input type="hidden" name="membershipId" value={m.id} />
                  <select name="role" defaultValue={m.role}
                    style={{ padding: 6, border: "1px solid #d1d5db", borderRadius: 8 }}>
                    <option>OWNER</option>
                    <option>ADMIN</option>
                    <option>ADULT</option>
                    <option>CHILD</option>
                    <option>VIEWER</option>
                  </select>
                  <button type="submit" style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db" }}>
                    Save
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
