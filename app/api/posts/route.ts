import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const tenantSlug = req.nextUrl.searchParams.get("tenant");
  if (!tenantSlug) {
    return NextResponse.json({ ok: false, error: "tenant is required" }, { status: 400 });
  }
  const posts = await prisma.post.findMany({
    where: { tenant: { slug: tenantSlug } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ ok: true, posts });
}

const CreatePost = z.object({
  tenant: z.string().min(2),
  kind: z.enum(["TEXT", "PHOTO", "VIDEO"]),
  title: z.string().optional(),
  body: z.string().optional()
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}));
  const parsed = CreatePost.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }
  const { tenant, kind, title, body } = parsed.data;

  const t = await prisma.tenant.findUnique({ where: { slug: tenant } });
  if (!t) return NextResponse.json({ ok: false, error: "tenant not found" }, { status: 404 });

  const post = await prisma.post.create({
    data: { tenantId: t.id, kind, title, body }
  });

  return NextResponse.json({ ok: true, post }, { status: 201 });
}

