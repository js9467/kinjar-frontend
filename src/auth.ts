// src/auth.ts
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";

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

export async function auth() {
  return getServerSession(authOptions);
}

export default NextAuth(authOptions);
