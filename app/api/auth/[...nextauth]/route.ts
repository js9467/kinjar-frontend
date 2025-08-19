// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const runtime = "nodejs";

const GOOGLE_ID =
  process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_SECRET =
  process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
const AUTH_SECRET =
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";

if (!GOOGLE_ID || !GOOGLE_SECRET || !AUTH_SECRET) {
  // Hard fail early so logs say exactly what's missing
  throw new Error(
    `Missing envs: GOOGLE_ID=${!!GOOGLE_ID}, GOOGLE_SECRET=${!!GOOGLE_SECRET}, AUTH_SECRET=${!!AUTH_SECRET}`
  );
}

const handler = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  debug: true, // TEMP
  providers: [
    GoogleProvider({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
    }),
  ],
  logger: {
    error(code, ...message) {
      console.error("NEXTAUTH ERROR", code, ...message);
    },
    warn(code, ...message) {
      console.warn("NEXTAUTH WARN", code, ...message);
    },
  },
});

export async function GET(req: Request) { return handler(req); }
export async function POST(req: Request) { return handler(req); }
