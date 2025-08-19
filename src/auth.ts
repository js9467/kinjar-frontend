// src/auth.ts
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";

// Minimal demo config — replace with your real provider(s) later
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(creds) {
        if (creds?.username && creds?.password) {
          return { id: "demo", name: creds.username };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" }
};

// Helper so other server code can do `const session = await auth()`
export async function auth() {
  return getServerSession(authOptions);
}

// Default export is used by the route handler
export default NextAuth(authOptions);
