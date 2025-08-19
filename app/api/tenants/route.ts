import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { z } from "zod";

export async function GET() {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, tenants });
}

const CreateTenant = z.object({
  slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(128)
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}));
  const parsed = CreateTenant.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }
  const { slug, name } = parsed.data;

  try {
    const tenant = await prisma.tenant.create({ data: { slug, name } });
    return NextResponse.json({ ok: true, tenant });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Create failed" }, { status: 500 });
  }
}
