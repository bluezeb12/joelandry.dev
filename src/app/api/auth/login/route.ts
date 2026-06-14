import {
  getEnvPassword,
  signToken,
  getCookieName,
  COOKIE_MAX_AGE,
} from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, password } = body;

    if (!slug || !password) {
      return Response.json(
        { error: "Missing slug or password" },
        { status: 400 }
      );
    }

    // Look up the expected password from env vars
    const expectedPassword = getEnvPassword(slug);

    if (!expectedPassword) {
      // No password configured for this slug — could mean invalid slug
      return Response.json({ error: "Invalid application" }, { status: 404 });
    }

    // Constant-time comparison would be ideal, but for simple passwords
    // against env vars this is acceptable
    if (password !== expectedPassword) {
      return Response.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Password correct — create signed token and set cookie
    const token = await signToken(slug);
    const cookieName = getCookieName(slug);

    const redirectUrl = new URL(`/apply/${slug}`, request.url);

    // Parse incoming cookies to find any other auth cookies to clear
    const cookieHeader = request.headers.get("Cookie") || "";
    const otherAuthCookiesToClear: string[] = [];
    cookieHeader.split(";").forEach((cookieStr) => {
      const parts = cookieStr.split("=");
      const name = parts[0].trim();
      if (name.startsWith("auth_") && name !== cookieName) {
        otherAuthCookiesToClear.push(name);
      }
    });

    const headers = new Headers();
    headers.set("Location", redirectUrl.toString());
    headers.append(
      "Set-Cookie",
      `${cookieName}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`
    );

    for (const name of otherAuthCookiesToClear) {
      headers.append(
        "Set-Cookie",
        `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
      );
    }

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
