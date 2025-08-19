
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers: { GET, POST } } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // helps when HOST/URL is dynamic (Vercel)
  trustHost: true,
});

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
