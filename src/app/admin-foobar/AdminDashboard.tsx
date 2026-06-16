"use client";

import { useState, useEffect } from "react";
import { TerminalWindow } from "@/components/resume/TerminalWindow";
import { Copy, Check, LogOut, ExternalLink } from "lucide-react";
import type { ApplicationConfig } from "@/lib/schema";

interface AdminDashboardProps {
  applications: ApplicationConfig[];
}

export default function AdminDashboard({ applications }: AdminDashboardProps) {
  const [origin, setOrigin] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin-foobar/logout", { method: "POST" });
      window.location.reload();
    } catch {
      alert("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  }

  function handleCopy(slug: string) {
    const url = `${origin}/apply/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(slug);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "3rem 1rem",
        maxWidth: "var(--max-width)",
        margin: "0 auto",
      }}
    >
      <div className="resume-section">
        <TerminalWindow title="~/admin-foobar/dashboard">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "1rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Applications Registry
              </h1>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  marginTop: "0.25rem",
                }}
              >
                Manage and share tailored candidate profiles
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.8rem",
                backgroundColor: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--border-radius-sm)",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                transition: "all var(--transition-fast)",
              }}
              className="hover:border-[var(--color-text-accent)] hover:text-[var(--color-text-accent)]"
            >
              <LogOut size={14} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {applications.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                }}
              >
                No applications found in the registry.
              </div>
            ) : (
              applications.map((app) => {
                const targetUrl = `${origin}/apply/${app.slug}`;
                const isCopied = copiedId === app.slug;

                return (
                  <div
                    key={app.slug}
                    style={{
                      padding: "1.25rem",
                      backgroundColor: "rgba(0, 0, 0, 0.15)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--border-radius-sm)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {app.companyName}
                        </h2>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          Role: <strong style={{ color: "var(--color-text-accent)" }}>{app.roleName}</strong>
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontFamily: "var(--font-mono)",
                          padding: "0.2rem 0.5rem",
                          backgroundColor: "var(--color-accent-dim)",
                          color: "var(--color-text-accent)",
                          borderRadius: "9999px",
                          border: "1px solid var(--color-border-accent)",
                        }}
                      >
                        {app.slug}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      <input
                        type="text"
                        readOnly
                        value={targetUrl}
                        style={{
                          flex: 1,
                          padding: "0.5rem 0.75rem",
                          backgroundColor: "rgba(0, 0, 0, 0.25)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--border-radius-sm)",
                          color: "var(--color-text-secondary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8rem",
                          outline: "none",
                        }}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        onClick={() => handleCopy(app.slug)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "38px",
                          height: "38px",
                          backgroundColor: isCopied ? "var(--color-accent-dim)" : "var(--color-bg-tertiary)",
                          border: isCopied ? "1px solid var(--color-border-accent)" : "1px solid var(--color-border)",
                          borderRadius: "var(--border-radius-sm)",
                          color: isCopied ? "var(--color-text-accent)" : "var(--color-text-primary)",
                          cursor: "pointer",
                          transition: "all var(--transition-fast)",
                        }}
                        title="Copy to Clipboard"
                      >
                        {isCopied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <a
                        href={`/apply/${app.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "38px",
                          height: "38px",
                          backgroundColor: "var(--color-bg-tertiary)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--border-radius-sm)",
                          color: "var(--color-text-primary)",
                          transition: "all var(--transition-fast)",
                        }}
                        title="Open in New Tab"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}
