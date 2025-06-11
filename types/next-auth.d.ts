declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username: string
      role: string
      apiKey: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    username: string
    role: string
    apiKey: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string
    role: string
    apiKey: string
  }
}
