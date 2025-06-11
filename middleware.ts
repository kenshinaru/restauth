import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Get the user session from cookies
  const session = request.cookies.get("user_session")

  // Protected routes that require authentication
  const protectedRoutes = ["/playground", "/profile", "/account", "/dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  if (isProtectedRoute) {
    // If there's no session, redirect to login
    if (!session) {
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", path)
      return NextResponse.redirect(url)
    }

    // For dashboard, check if user is admin
    if (path.startsWith("/dashboard")) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(session.value))
        if (sessionData.role !== "admin") {
          return NextResponse.redirect(new URL("/", request.url))
        }
      } catch (error) {
        // Invalid session, redirect to login
        const url = new URL("/login", request.url)
        url.searchParams.set("redirect", path)
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/playground/:path*", "/profile", "/account", "/dashboard"],
}
