import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      familySlug: string
    }
  }

  interface User {
    familySlug: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    familySlug: string
  }
}