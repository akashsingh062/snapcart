import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define public routes
  const publicRoutes = ["/auth/login", "/auth/register", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Get the session token from cookies (handles both HTTP localhost and HTTPS production)
  const sessionToken =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  // 1. If public route:
  if (isPublicRoute) {
    // If already authenticated and visiting login/register, redirect to home
    if (
      sessionToken &&
      (pathname === "/auth/login" || pathname === "/auth/register")
    ) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // 2. If trying to access a protected route and NOT authenticated, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role checks for authenticated users
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    const role = session?.user?.role;
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/user") && role !== "user") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/delivery") && role !== "deliveryBoy" && role !== "delivery-boy") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  } catch {
    // Ignored
  }

  return NextResponse.next();
}

// Ensure the proxy doesn't intercept static assets, APIs, or internal next.js requests
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
