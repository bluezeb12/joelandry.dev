import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applicationsRegistry } from "./lib/applications-registry";

/**
 * Middleware that handles "Sticky Persona" routing.
 * Stores preferred resume version in a cookie and rewrites generic hits.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Developer Reset Switch
  if (request.nextUrl.searchParams.get("reset") === "true") {
    const redirectUrl = new URL("/", request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("preferred_resume_version");
    
    // Clean up any old auth_ cookies if they exist
    const allCookies = request.cookies.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.startsWith("auth_")) {
        response.cookies.delete(cookie.name);
      }
    }
    return response;
  }

  // 2. Detect Direct Hits to /apply/:company
  const match = pathname.match(/^\/apply\/([^/]+)/);
  if (match) {
    const company = match[1];

    // Only set the cookie if it is a valid company in our registry
    if (company && company in applicationsRegistry) {
      const currentCookie = request.cookies.get("preferred_resume_version")?.value;
      
      const response = NextResponse.next();
      if (currentCookie !== company) {
        response.cookies.set("preferred_resume_version", company, {
          path: "/",
          maxAge: 2592000, // 30 days
          sameSite: "lax",
          secure: true,
        });
      }
      return response;
    }
    
    return NextResponse.next();
  }

  // 3. Detect Generic Hits (Fallback)
  if (pathname === "/" || pathname === "/resume") {
    const preferredCompany = request.cookies.get("preferred_resume_version")?.value;
    if (preferredCompany && preferredCompany in applicationsRegistry) {
      // Internally rewrite to the preferred company's tailored resume
      const rewriteUrl = new URL(`/apply/${preferredCompany}`, request.url);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/resume", "/apply/:path*"],
};

