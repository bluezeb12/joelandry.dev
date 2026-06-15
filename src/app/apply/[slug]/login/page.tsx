"use client";

import { use, useState, type SubmitEvent } from "react";
import { TerminalWindow } from "@/components/resume/TerminalWindow";

export const runtime = "edge";

export default function LoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
        redirect: "manual",
      });

      if (res.type === "opaqueredirect" || res.status === 302) {
        // Cookie was set, follow the redirect
        window.location.href = `/apply/${slug}`;
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Format slug for display: "acme-corp" → "Acme Corp"
  const displayName = slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  return (
    <div className="login-container">
      <div className="login-window">
        <TerminalWindow title={`~/apply/${slug}/login`}>
          <div className="login-prompt">
            <span style={{ color: "var(--color-text-muted)" }}>$</span>{" "}
            ssh {slug}@joelandry.dev
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
            }}
          >
            This page is password-protected.
            {displayName !== slug && (
              <>
                <br />
                Enter the password provided for <strong style={{ color: "var(--color-text-accent)" }}>{displayName}</strong>.
              </>
            )}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label
                htmlFor="password-input"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                Password:
              </label>
              <input
                id="password-input"
                name="password"
                type="password"
                className="login-input"
                placeholder="Enter access password"
                autoFocus
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Authenticate"}
            </button>
          </form>
        </TerminalWindow>
      </div>
    </div>
  );
}
