import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Get the user session from cookies
  const session = request.cookies.get("user_session")

  // Protected routes that require authentication
  const protectedRoutes = ["/playground", "/profile", "/account", "/dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  // Public routes that should redirect to playground if already logged in
  const publicRoutes = ["/login", "/register"]
  const isPublicRoute = publicRoutes.includes(path)

  // If user is logged in and trying to access login/register, redirect to playground
  if (isPublicRoute && session) {
    try {
      const sessionData = JSON.parse(decodeURIComponent(session.value))
      if (sessionData.id) {
        return NextResponse.redirect(new URL("/playground", request.url))
      }
    } catch (error) {
      // Invalid session, clear the cookie and continue
      const response = NextResponse.next()
      response.cookies.delete("user_session")
      return response
    }
  }

  if (isProtectedRoute) {
    // If there's no session, redirect to login
    if (!session) {
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", path)
      return NextResponse.redirect(url)
    }

    try {
      const sessionData = JSON.parse(decodeURIComponent(session.value))

      // Check if session has required fields
      if (!sessionData.id || !sessionData.username) {
        const url = new URL("/login", request.url)
        url.searchParams.set("redirect", path)
        return NextResponse.redirect(url)
      }

      // For dashboard, check if user is admin
      if (path.startsWith("/dashboard") && sessionData.role !== "admin") {
        return NextResponse.redirect(new URL("/playground", request.url))
      }
    } catch (error) {
      // Invalid session, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("user_session")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
}
