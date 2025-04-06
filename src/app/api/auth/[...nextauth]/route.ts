// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Affichage en console pour debug
        console.log("credentials reçus =", credentials)
        console.log("ENV => USERNAME =", process.env.HR_USERNAME)
        console.log("ENV => PASSWORD =", process.env.HR_PASSWORD)

        if (!credentials?.username || !credentials?.password) {
          return null
        }

        if (
          credentials.username === process.env.HR_USERNAME &&
          credentials.password === process.env.HR_PASSWORD
        ) {
          return { id: "1", name: "AdminUser" }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.HR_NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
