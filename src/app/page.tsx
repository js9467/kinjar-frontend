import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tenantFromHost } from "@/lib/tenant";
import UploadWidget from "@/components/UploadWidget";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function Home({}: {}) {
  const session = await auth();
  const tenantSlug = tenantFromHost(process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || "");
  // Fetch posts via server (you could also call /api/posts)
  // Prefer API route for consistent filtering; here we keep it simple:
  const host = process.env.VERCEL_URL || "localhost:3000";
  const base = process.env.PUBLIC_BASE_DOMAIN!;
  const slug = host.endsWith(`.${base}`) ? host.split(".")[0] : null;

  const posts = slug
    ? await db.post.findMany({
        where: { tenant: { slug } },
        orderBy: { publishedAt: "desc" },
        take: 20,
      })
    : [];

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{slug ? `${slug} — Daily Memories` : "Kinjar"}</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          {session?.user ? <a href="/api/auth/signout">Sign out</a> : <a href="/api/auth/signin">Sign in</a>}
          <a href="/admin">Admin</a>
        </nav>
      </header>

      {session?.user && <UploadWidget />}

      <section style={{ marginTop: 24 }}>
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((p) => (
          <article key={p.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{fmtDate(p.publishedAt)}</div>
            {p.title && <h3 style={{ margin: "6px 0" }}>{p.title}</h3>}
            {p.body && <p>{p.body}</p>}

            {p.mediaKey && p.mediaType?.startsWith("image/") && (
              <img
                src={`${process.env.KINJAR_MEDIA_BASE ?? ""}/${p.mediaKey}`}
                alt=""
                style={{ width: "100%", maxHeight: 480, objectFit: "contain", marginTop: 8 }}
              />
            )}
            {p.mediaKey && p.mediaType?.startsWith("video/") && (
              <video
                style={{ width: "100%", marginTop: 8 }}
                controls
                src={`${process.env.KINJAR_MEDIA_BASE ?? ""}/${p.mediaKey}`}
              />
            )}
            {!p.isPublic && <div style={{ fontSize: 12, opacity: 0.6 }}>Private</div>}
            {p.unlockAt && <div style={{ fontSize: 12, opacity: 0.6 }}>Unlocks: {fmtDate(p.unlockAt)}</div>}
          </article>
        ))}
      </section>
    </main>
  );
}
