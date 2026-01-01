import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value
  const pathname = request.nextUrl.pathname

  // Protected routes
  const protectedRoutes = ["/dashboard"]
  const authRoutes = ["/login", "/signup"]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !sessionId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && sessionId) {
    return NextResponse.redirect(new URL("/dashboard/patient", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
