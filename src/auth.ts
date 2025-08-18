import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { type NextRequest } from "next/server";

declare module "next-auth" {
  interface User {
    globalRole?: "ROOT" | "USER";
  }
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      globalRole?: "ROOT" | "USER";
      tenantRole?: string | null;
      tenantSlug?: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, req }) {
      // promote ROOT
      const rootEmail = process.env.ROOT_EMAIL?.toLowerCase();
      if (user?.email && user.email.toLowerCase() === rootEmail) {
        token.globalRole = "ROOT";
      }
      // keep DB globalRole too
      if (user?.id) {
        const u = await db.user.findUnique({ where: { id: user.id } });
        if (u?.globalRole === "ROOT") token.globalRole = "ROOT";
      }
      // Tenant role (from host header)
      const host = (req as unknown as NextRequest)?.headers?.get("host") ?? "";
      const baseDomain = process.env.PUBLIC_BASE_DOMAIN!;
      const slug = host?.toLowerCase().endsWith(baseDomain)
        ? host.split(".")[0]
        : null;

      if (slug && token.sub) {
        const member = await db.membership.findFirst({
          where: { userId: token.sub, tenant: { slug } },
          select: { role: true },
        });
        token.tenantRole = member?.role ?? null;
        token.tenantSlug = slug;
      }

      if (trigger === "update" && session) {
        // allow session.update calls to override tenant mode etc. if needed
        Object.assign(token, session);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.globalRole = (token as any).globalRole ?? "USER";
      session.user.tenantRole = (token as any).tenantRole ?? null;
      session.user.tenantSlug = (token as any).tenantSlug ?? null;
      return session;
    },
  },
});
