"use client";

import { useState, type FormEvent } from "react";
import { TerminalWindow } from "@/components/resume/TerminalWindow";

export default function AdminLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/admin-foobar/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.reload();
        return;
      }

      const data = await res.json();
      setError(data.error || "Authentication failed");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-window">
        <TerminalWindow title="~/admin-foobar/login">
          <div className="login-prompt">
            <span style={{ color: "var(--color-text-muted)" }}>$</span>{" "}
            sudo login admin
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
            }}
          >
            Access to this system is restricted to authorized administrators only.
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
                placeholder="Enter admin password"
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
