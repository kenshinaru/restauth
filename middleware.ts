import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for API routes, static files, and auth pages
  if (
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path.startsWith("/favicon.ico") ||
    path === "/login" ||
    path === "/register" ||
    path === "/"
  ) {
    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/playground", "/profile", "/account", "/dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  if (isProtectedRoute) {
    // Check NextAuth session first
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Check custom session as fallback
    const customSession = request.cookies.get("user_session")

    let userRole = null
    let isAuthenticated = false

    if (token) {
      // NextAuth session
      isAuthenticated = true
      userRole = token.role as string
    } else if (customSession) {
      // Custom session
      try {
        const sessionData = JSON.parse(decodeURIComponent(customSession.value))
        isAuthenticated = true
        userRole = sessionData.role
      } catch (error) {
        // Invalid custom session
        isAuthenticated = false
      }
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", path)
      return NextResponse.redirect(url)
    }

    // For dashboard, check if user is admin
    if (path.startsWith("/dashboard")) {
      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
