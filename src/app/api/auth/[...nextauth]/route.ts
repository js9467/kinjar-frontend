import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        familySlug: { label: 'Family Code', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.familySlug || !credentials?.password) {
          return null
        }

        try {
          // Authenticate with Kinjar API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              family_slug: credentials.familySlug,
              password: credentials.password,
            }),
          })

          if (response.ok) {
            const user = await response.json()
            return {
              id: user.family_slug,
              name: user.family_name || credentials.familySlug,
              email: `${credentials.familySlug}@kinjar.local`,
              familySlug: user.family_slug,
            }
          }
        } catch (error) {
          console.error('Authentication error:', error)
        }

        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.familySlug = user.familySlug
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.familySlug = token.familySlug as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }