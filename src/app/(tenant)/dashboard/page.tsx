"use client";"use client";"use client";"use client";"use client";"use client";



export default function DashboardPage() {

  return (

    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>export default function DashboardPage() {

      <h1>Dashboard</h1>

      <p>Welcome to your dashboard.</p>  return (

    </div>

  );    <div style={{ export default function DashboardPage() {

}
      padding: '2rem',

      fontFamily: 'system-ui'  return (

    }}>

      <h1>Dashboard</h1>    <div style={{ import { useEffect, useState } from "react";

      <p>Welcome to your dashboard.</p>

    </div>      padding: '2rem',

  );

}      fontFamily: 'system-ui'import { useRouter } from "next/navigation";

    }}>

      <h1>Dashboard</h1>import { API_BASE } from "@/lib/api";import { API_BASE } from "@/lib/api";

      <p>Welcome to your dashboard.</p>

    </div>export default function DashboardPage() {

  );

}  const [isLoading, setIsLoading] = useState(true);import { useEffect, useState } from "react";import { useEffect, useState } from "react";

  const router = useRouter();

import { useRouter } from "next/navigation";import { useRouter } from "next/navigation";

  useEffect(() => {

    const timer = setTimeout(() => {

      setIsLoading(false);

    }, 1000);export default function DashboardPage() {interface User {



    return () => clearTimeout(timer);  const [isLoading, setIsLoading] = useState(true);  id: string;

  }, []);

  const [error, setError] = useState<string | null>(null);  email: string;

  if (isLoading) {

    return (  const router = useRouter();  displayName?: string;

      <div style={{ 

        padding: '2rem',   role: string;

        textAlign: 'center',

        fontFamily: 'system-ui'  useEffect(() => {  createdAt: string;

      }}>

        <div>Loading dashboard...</div>    const checkAuth = async () => {}

      </div>

    );      try {

  }

        const response = await fetch(`${API_BASE}/auth/me`, {async function addMemberAction(formData: FormData) {

  return (

    <div style={{           credentials: 'include'  "use server";

      padding: '2rem',

      fontFamily: 'system-ui'        });  const session = await auth();

    }}>

      <h1>Dashboard</h1>          if (!session?.user) redirect("/login");

      <p>Welcome to your dashboard. This page is under development.</p>

    </div>        if (!response.ok) {

  );

}          router.push('/login');  const tenantSlug = String(formData.get("tenantSlug") || "");

          return;  const email = String(formData.get("email") || "").trim().toLowerCase();

        }  const role = String(formData.get("role") || "VIEWER") as any;

        

        setIsLoading(false);  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });

      } catch (err) {  if (!tenant) return;

        setError('Failed to authenticate');

        setIsLoading(false);  // Ensure current user is ADMIN/OWNER

      }  const me = await prisma.membership.findUnique({

    };    where: { userId_tenantId: { userId: (session.user as any).id, tenantId: tenant.id } }

  });

    checkAuth();  if (!me || (me.role !== "OWNER" && me.role !== "ADMIN")) return;

  }, [router]);

  // Create user placeholder if they haven't signed in yet

  if (isLoading) {  let user = await prisma.user.findUnique({ where: { email } });

    return (  if (!user) {

      <div style={{     user = await prisma.user.create({ data: { email, name: email.split("@")[0] } });

        padding: '2rem',   }

        textAlign: 'center',

        fontFamily: 'system-ui'  await prisma.membership.upsert({

      }}>    where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },

        <div>Loading dashboard...</div>    update: { role },

      </div>    create: { userId: user.id, tenantId: tenant.id, role }

    );  });

  }}



  if (error) {async function updateRoleAction(formData: FormData) {

    return (  "use server";

      <div style={{   const session = await auth();

        padding: '2rem',   if (!session?.user) redirect("/login");

        textAlign: 'center',

        fontFamily: 'system-ui'  const tenantSlug = String(formData.get("tenantSlug") || "");

      }}>  const membershipId = String(formData.get("membershipId") || "");

        <div style={{ color: 'red' }}>{error}</div>  const role = String(formData.get("role") || "VIEWER") as any;

      </div>

    );  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });

  }  if (!tenant) return;



  return (  const me = await prisma.membership.findUnique({

    <div style={{     where: { userId_tenantId: { userId: (session.user as any).id, tenantId: tenant.id } }

      padding: '2rem',  });

      fontFamily: 'system-ui'  if (!me || (me.role !== "OWNER" && me.role !== "ADMIN")) return;

    }}>

      <h1>Dashboard</h1>  await prisma.membership.update({ where: { id: membershipId }, data: { role } });

      <p>Welcome to your dashboard. This page is under development.</p>}

    </div>

  );export default async function TenantDashboard() {

}  const session = await auth();
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
