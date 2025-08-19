// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const runtime = "nodejs";

const GOOGLE_ID =
  process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_SECRET =
  process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
const AUTH_SECRET =
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";

if (!GOOGLE_ID || !GOOGLE_SECRET || !AUTH_SECRET) {
  throw new Error(
    `Missing envs: GOOGLE_ID=${!!GOOGLE_ID}, GOOGLE_SECRET=${!!GOOGLE_SECRET}, AUTH_SECRET=${!!AUTH_SECRET}`
  );
}

const auth = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
    }),
  ],
});

// v5: export the handlers object, not a callable function
export const { GET, POST } = auth.handlers;
