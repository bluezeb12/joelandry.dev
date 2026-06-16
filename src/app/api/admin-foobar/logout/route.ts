export const runtime = "edge";

export async function POST() {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `admin_auth=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  return Response.json(
    { success: true },
    {
      status: 200,
      headers,
    }
  );
}
