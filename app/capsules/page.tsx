// app/capsules/page.tsx

import { getCapsules, type Capsule } from "../../lib/api";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

function toStr(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function CapsulesPage({ searchParams }: PageProps) {
  const family = (toStr(searchParams?.family) ?? "public").trim().toLowerCase();
  const caps: Capsule[] = await getCapsules(family);

  return (
    <main style={{ maxWidth: 760, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Time Capsules</h1>
      <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 16 }}>
        Family: <code>{family}</code>
      </div>

      {caps.length === 0 && (
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >
          <p style={{ margin: 0 }}>No capsules yet.</p>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {caps.map((c) => (
          <article
            key={c.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{c.title}</div>
              <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
                Opens: {new Date(c.opensAt).toLocaleString()}
              </div>

              {c.coverUrl && (
                <img
                  src={c.coverUrl}
                  alt=""
                  style={{ display: "block", width: "100%", height: "auto", marginTop: 8, borderRadius: 8 }}
                />
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
