import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth-config"
import { getUserFromSession } from "./auth"

export async function getUnifiedSession(request?: Request) {
  // Try NextAuth session first
  const session = await getServerSession(authOptions)

  if (session?.user) {
    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        username: session.user.username,
        role: session.user.role,
        apiKey: session.user.apiKey,
      },
      type: "nextauth",
    }
  }

  // Fallback to custom session
  if (request) {
    const customUser = await getUserFromSession(request)
    if (customUser) {
      return {
        user: {
          id: customUser._id.toString(),
          name: customUser.name,
          email: customUser.email,
          username: customUser.username,
          role: customUser.role,
          apiKey: customUser.apiKey,
        },
        type: "custom",
      }
    }
  }

  return null
}
