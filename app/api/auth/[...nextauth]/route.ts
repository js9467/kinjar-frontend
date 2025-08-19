
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const runtime = "nodejs";

const handler = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url);
        if (u.hostname === "kinjar.com" || u.hostname === "www.kinjar.com" || u.hostname.endsWith(".kinjar.com")) {
          return u.toString();
        }
      } catch {}
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
