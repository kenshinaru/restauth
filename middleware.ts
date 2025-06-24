import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(request) {
    const path = request.nextUrl.pathname
    const token = request.nextauth.token

    // Redirect logged-in users from login/register pages to playground
    if (token && (path === "/login" || path === "/register")) {
      return NextResponse.redirect(new URL("/playground", request.url))
    }

    // Protect dashboard route for admin users only
    if (path.startsWith("/dashboard") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/playground", request.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        const protectedRoutes = ["/playground", "/profile", "/account", "/dashboard"]
        const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

        // If it's a protected route, require a token
        if (isProtectedRoute) {
          return !!token
        }
        // For all other routes, allow access
        return true
      },
    },
    pages: {
      signIn: "/login", // Redirect unauthenticated users to this page
    },
  },
)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
}
