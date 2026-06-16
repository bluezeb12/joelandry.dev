import { signToken, COOKIE_MAX_AGE } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return Response.json(
        { error: "Admin password is not configured on the server." },
        { status: 500 }
      );
    }

    if (!password) {
      return Response.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    if (password !== adminPassword) {
      return Response.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }

    // Password correct — create signed token for "admin" and set cookie
    const token = await signToken("admin");
    const cookieName = "admin_auth";

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `${cookieName}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`
    );

    return Response.json(
      { success: true },
      {
        status: 200,
        headers,
      }
    );
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
