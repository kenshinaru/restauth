import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { loginUser } from "./auth"
import { getUsersCollection } from "./mongodb"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const user = await loginUser({
            username: credentials.username,
            password: credentials.password,
          })

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            apiKey: user.apiKey,
          }
        } catch (error) {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const users = await getUsersCollection()

          // Check if user exists by email
          let existingUser = await users.findOne({ email: user.email })

          if (!existingUser) {
            // Create new user for social login
            const { registerUser, generateApiKey } = await import("./auth")

            const userData = {
              name: user.name || "",
              username: user.email?.split("@")[0] || "",
              email: user.email || "",
              password: "", // No password for social login
            }

            // Generate unique username if it already exists
            let username = userData.username
            let counter = 1
            while (await users.findOne({ username })) {
              username = `${userData.username}${counter}`
              counter++
            }

            const result = await users.insertOne({
              name: userData.name,
              username,
              email: userData.email,
              password: "", // No password for social login
              role: "user",
              apiKey: generateApiKey(),
              usage: 0,
              limit: 100,
              banned: false,
              premium: false,
              expired: 0,
              createdAt: new Date(),
              provider: account.provider,
              providerId: account.providerAccountId,
            })

            existingUser = await users.findOne({ _id: result.insertedId })
          }

          // Update user object with database info
          if (existingUser) {
            user.id = existingUser._id.toString()
            user.username = existingUser.username
            user.role = existingUser.role
            user.apiKey = existingUser.apiKey
          }

          return true
        } catch (error) {
          console.error("Error during social sign in:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.username = user.username
        token.role = user.role
        token.apiKey = user.apiKey
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
        session.user.role = token.role as string
        session.user.apiKey = token.apiKey as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
