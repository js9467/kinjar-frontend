import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

function rootEmails(): Set<string> {
  const raw = process.env.ROOT_EMAILS || "";
  return new Set(
    rawimport NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

/**
 * Comma-separated list of global admin emails (ROOT role).
 * Example: "you@example.com,other@example.com"
 */
function rootEmails(): Set<string> {
  const raw = process.env.ROOT_EMAILS || "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

const config = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,

  // Share auth cookies across subdomains in production (e.g., *.kinjar.com)
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        domain: process.env.COOKIE_DOMAIN || undefined, // e.g. ".kinjar.com"
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],

  callbacks: {
    async signIn({ user }) {
      // Promote to ROOT if the email is in ROOT_EMAILS
      if (user?.email && rootEmails().has(user.email.toLowerCase())) {
        await prisma.user.update({
          where: { id: user.id },
          data: { globalRole: "ROOT" }
        });
      }
      return true;
    },

    async jwt({ token, user }) {
      // On first sign-in, attach id & globalRole
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, globalRole: true }
        });
        (token as any).uid = dbUser?.id;
        (token as any).globalRole = dbUser?.globalRole ?? "USER";
      } else if (!(token as any).globalRole && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { globalRole: true }
        });
        (token as any).globalRole = dbUser?.globalRole ?? "USER";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).uid ?? token.sub;
        (session.user as any).globalRole = (token as any).globalRole ?? "USER";
      }
      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);

      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // Upgrade to ROOT if email is in ROOT_EMAILS
      if (user?.email && rootEmails().has(user.email.toLowerCase())) {
        await prisma.user.update({
          where: { id: user.id },
          data: { globalRole: "ROOT" }
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, globalRole: true }
        });
        token.uid = dbUser?.id;
        token.globalRole = dbUser?.globalRole ?? "USER";
      } else if (!token.globalRole && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { globalRole: true }
        });
        token.globalRole = dbUser?.globalRole ?? "USER";
      }
      return token as any;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).uid ?? token.sub;
        (session.user as any).globalRole = (token as any).globalRole ?? "USER";
      }
      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(config as any);
