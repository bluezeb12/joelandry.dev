/**
 * Cookie-based authentication utilities using Web Crypto API (HMAC-SHA256).
 * Compatible with Cloudflare Workers / Edge Runtime.
 */

const COOKIE_NAME_PREFIX = "auth_";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    throw new Error("COOKIE_SECRET environment variable is not set");
  }
  return secret;
}

/**
 * Converts a slug like "acme-corp" to an env var key like "APP_PW_ACME_CORP".
 */
export function slugToEnvKey(slug: string): string {
  return `APP_PW_${slug.toUpperCase().replace(/-/g, "_")}`;
}

/**
 * Gets the password for a given application slug from environment variables.
 */
export function getEnvPassword(slug: string): string | undefined {
  return process.env[slugToEnvKey(slug)];
}

/**
 * Returns the cookie name for a given slug.
 */
export function getCookieName(slug: string): string {
  return `${COOKIE_NAME_PREFIX}${slug}`;
}

// ─── HMAC Signing ───────────────────────────────────────────────────────────

async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

// ─── Token Operations ───────────────────────────────────────────────────────

/**
 * Creates a signed token containing the slug and expiry timestamp.
 * Format: `base64(payload).hexSignature`
 */
export async function signToken(slug: string): Promise<string> {
  const expiry = Date.now() + COOKIE_MAX_AGE * 1000;
  const payload = JSON.stringify({ slug, expiry });
  const payloadB64 = btoa(payload);

  const key = await getCryptoKey();
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );

  return `${payloadB64}.${bufferToHex(signature)}`;
}

/**
 * Verifies a signed token and returns the slug if valid.
 * Returns null if the token is invalid, tampered with, or expired.
 */
export async function verifyToken(
  token: string,
  expectedSlug: string
): Promise<boolean> {
  try {
    const [payloadB64, signatureHex] = token.split(".");
    if (!payloadB64 || !signatureHex) return false;

    // Verify signature
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBuffer(signatureHex),
      encoder.encode(payloadB64)
    );

    if (!isValid) return false;

    // Parse and validate payload
    const payload = JSON.parse(atob(payloadB64));
    if (payload.slug !== expectedSlug) return false;
    if (typeof payload.expiry !== "number" || payload.expiry < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Cookie max age constant for use in response headers.
 */
export { COOKIE_MAX_AGE };
