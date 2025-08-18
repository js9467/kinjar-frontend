import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2),
  ownerEmail: z.string().email(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.globalRole !== "ROOT") {
    return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
  }

  const body = Body.parse(await req.json());

  const owner = await db.user.upsert({
    where: { email: body.ownerEmail },
    update: {},
    create: { email: body.ownerEmail, name: body.ownerEmail.split("@")[0] },
  });

  const tenant = await db.tenant.create({
    data: {
      name: body.name,
      slug: body.slug,
      createdById: session.user.id,
      members: { create: [{ userId: owner.id, role: "OWNER" }] },
    },
  });

  return Response.json({ ok: true, tenant });
}
