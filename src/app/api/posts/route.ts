import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { addMinutes, isAfter } from "date-fns";

const CreateBody = z.object({
  kind: z.enum(["TEXT","PHOTO","VIDEO"]),
  title: z.string().optional(),
  body: z.string().optional(),
  mediaKey: z.string().optional(),
  mediaType: z.string().optional(),
  mediaSize: z.number().optional(),
  isPublic: z.boolean().default(false),
  audience: z.enum(["EVERYONE","ADULTS_ONLY","KIDS"]).default("EVERYONE"),
  unlockAt: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const host = (req.headers.get("host") || "").toLowerCase();
  const base = process.env.PUBLIC_BASE_DOMAIN!;
  const slug = host.endsWith(`.${base}`) ? host.split(".")[0] : null;
  if (!slug) return new Response("Tenant missing", { status: 400 });

  // Must be member (any role) to post; admins/owners moderate later
  const member = await db.membership.findFirst({
    where: { userId: session.user.id, tenant: { slug } },
    select: { tenantId: true, role: true },
  });
  if (!member) return new Response("Forbidden", { status: 403 });

  const body = CreateBody.parse(await req.json());

  const post = await db.post.create({
    data: {
      tenantId: member.tenantId,
      authorId: session.user.id,
      kind: body.kind,
      title: body.title,
      body: body.body,
      mediaKey: body.mediaKey,
      mediaType: body.mediaType,
      mediaSize: body.mediaSize,
      isPublic: body.isPublic,
      audience: body.audience,
      unlockAt: body.unlockAt ? new Date(body.unlockAt) : null,
    },
  });

  return Response.json({ ok: true, post });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const session = await auth();

  const host = (req.headers.get("host") || "").toLowerCase();
  const base = process.env.PUBLIC_BASE_DOMAIN!;
  const slug = host.endsWith(`.${base}`) ? host.split(".")[0] : null;
  if (!slug) return new Response("Tenant missing", { status: 400 });

  // Public view vs member view
  const userId = session?.user?.id ?? null;
  const member = userId
    ? await db.membership.findFirst({
        where: { userId, tenant: { slug } },
        select: { role: true },
      })
    : null;

  const posts = await db.post.findMany({
    where: { tenant: { slug } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  const now = new Date();
  const visible = posts.filter((p) => {
    const locked = p.unlockAt && isAfter(p.unlockAt, now);
    if (!locked) return true;
    // Time-capsule still locked:
    // Only ROOT or tenant admins/owners can see locked items
    const role = member?.role;
    return (session?.user?.globalRole === "ROOT") || role === "ADMIN" || role === "OWNER";
  }).filter((p) => {
    // public filter for non-members
    if (!member) return p.isPublic;
    return true;
  });

  return Response.json({ ok: true, posts: visible });
}
