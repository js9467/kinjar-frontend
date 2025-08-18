import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      globalRole?: "ROOT" | "USER";
    };
  }
}


export const GET = handlers.GET;
export const POST = handlers.POST;

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
    async jwt({ token, user }) {
      const root = process.env.ROOT_EMAIL?.toLowerCase();
      if (user?.email && user.email.toLowerCase() === root) (token as any).globalRole = "ROOT";
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.sub!;
      (session.user as any).globalRole = (token as any).globalRole ?? "USER";
      return session;
    },
  },
});
