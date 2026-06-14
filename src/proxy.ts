import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, getCookieName } from "./lib/auth";

/**
 * Proxy (formerly middleware) that protects /apply/* routes.
 * Redirects unauthenticated requests to the login page.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract the slug from /apply/[slug] or /apply/[slug]/...
  const match = pathname.match(/^\/apply\/([^/]+)/);
  if (!match) return NextResponse.next();

  const slug = match[1];

  // Allow login page and API routes through without auth
  if (pathname.endsWith("/login") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check for valid auth cookie
  const cookieName = getCookieName(slug);
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    // No cookie — redirect to login
    const loginUrl = new URL(`/apply/${slug}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the token signature and expiry
  const isValid = await verifyToken(token, slug);
  if (!isValid) {
    // Invalid or expired cookie — clear it and redirect to login
    const loginUrl = new URL(`/apply/${slug}/login`, request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(cookieName);
    return response;
  }

  // Valid auth — allow through
  return NextResponse.next();
}

export const config = {
  matcher: "/apply/:path*",
};
