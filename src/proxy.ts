import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Define public routes
    const publicRoutes = ["/auth/login", "/auth/register", "/api/auth"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Get the session token from cookies (Better-Auth uses this name by default)
    const sessionToken = req.cookies.get("better-auth.session_token")?.value;

    // 1. If trying to access a protected route and NOT authenticated, redirect to login
    if (!isPublicRoute && !sessionToken) {
        const loginUrl = new URL("/auth/login", req.url)
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // 2. If authenticated and trying to access a login/register page, redirect to home page
    if (isPublicRoute && sessionToken && (pathname === "/auth/login" || pathname === "/auth/register")) {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
    }

    const session = await auth.api.getSession({
        headers: req.headers
    })
    const role = session?.user?.role
    if (pathname.includes('admin') && role !== 'admin') {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.includes('user') && role !== 'user') {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.includes('dilevery') && role !== 'dileveryBoy') {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
}

// Ensure the proxy doesn't intercept static assets, APIs, or internal next.js requests
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};