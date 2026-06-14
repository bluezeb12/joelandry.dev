import {
  getEnvPassword,
  signToken,
  getCookieName,
  COOKIE_MAX_AGE,
} from "@/lib/auth";

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

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
        "Set-Cookie": `${cookieName}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`,
      },
    });
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
