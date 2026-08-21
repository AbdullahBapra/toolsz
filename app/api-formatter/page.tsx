"use client";

import { useState, useCallback } from "react";
import {
  Server,
  Check,
  Copy,
  Shield,
  Zap,
  AlertCircle,
  Clock,
  ArrowDownUp,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

function statusColor(code: number): string {
  if (code >= 200 && code < 300) return "bg-success-muted text-success border-success/20";
  if (code >= 300 && code < 400) return "bg-primary-muted text-primary border-primary-border";
  if (code >= 400 && code < 500) return "bg-warning-muted text-warning border-warning/20";
  return "bg-danger-muted text-danger border-danger/20";
}

function statusLabel(code: number): string {
  const labels: Record<number, string> = {
    200: "OK", 201: "Created", 204: "No Content",
    301: "Moved Permanently", 302: "Found", 304: "Not Modified",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
    404: "Not Found", 429: "Too Many Requests",
    500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable",
  };
  return labels[code] || "Unknown";
}

export default function ApiFormatterPage() {
  const [input, setInput] = useState("");
  const [formatted, setFormatted] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [responseTime, setResponseTime] = useState<string | null>(null);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    setError("");
    try {
      const trimmed = input.trim();

      // Try to parse the entire input as a complete API response object
      // that might contain status, headers, body fields
      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        setError("Invalid JSON — paste a raw API response (JSON)");
        return;
      }

      const obj = parsed as Record<string, unknown>;

      // Detect if it's a structured API response with status/headers/body
      if (typeof obj === "object" && obj !== null && ("status" in obj || "statusCode" in obj || "headers" in obj || "body" in obj || "data" in obj)) {
        const code = (obj.status ?? obj.statusCode ?? obj.code ?? 200) as number;
        setStatusCode(code);
        setResponseTime((obj.responseTime ?? obj.duration ?? obj.elapsed ?? null) as string | null);

        if (obj.headers && typeof obj.headers === "object") {
          setHeaders(obj.headers as Record<string, string>);
        } else {
          setHeaders({});
        }

        const body = obj.body ?? obj.data ?? obj.response ?? obj.result ?? obj;
        setFormatted(JSON.stringify(body, null, 2));
      } else {
        // Plain JSON response — treat entire thing as body
        setStatusCode(200);
        setHeaders({});
        setFormatted(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to format");
    }
  }, [input]);

  const handleCopy = useCallback(() => {
    if (!formatted) return;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [formatted]);

  const handleClear = () => {
    setInput("");
    setFormatted("");
    setError("");
    setStatusCode(null);
    setHeaders({});
    setResponseTime(null);
  };

  const loadSample = () => {
    const sample = {
      status: 200,
      responseTime: "142ms",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_abc123def456",
        "x-rate-limit-remaining": "97",
        cache_control: "max-age=300",
      },
      data: {
        users: [
          { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin", active: true },
          { id: 2, name: "Bob Smith", email: "bob@example.com", role: "editor", active: true },
          { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "viewer", active: false },
        ],
        pagination: { page: 1, per_page: 20, total: 3, total_pages: 1 },
      },
    };
    setInput(JSON.stringify(sample, null, 2));
  };

  const loadErrorSample = () => {
    const sample = {
      status: 422,
      responseTime: "23ms",
      headers: {
        "content-type": "application/problem+json",
        "x-request-id": "req_err789xyz",
      },
      error: {
        type: "validation_error",
        message: "The request body contains invalid fields.",
        details: [
          { field: "email", message: "Must be a valid email address", value: "not-an-email" },
          { field: "age", message: "Must be a positive integer", value: -5 },
        ],
      },
    };
    setInput(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Server}
          title="API Response Formatter"
          description="Format raw API responses with status badges, header inspection, and structured error details — free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Dev Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {/* Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground">
                Paste your API response
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadSample}
                  className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors"
                >
                  Success sample →
                </button>
                <button
                  onClick={loadErrorSample}
                  className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors"
                >
                  Error sample →
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-48 p-4 rounded-xl border border-border bg-surface-1 text-foreground text-xs font-mono resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder='{"status": 200, "data": {"users": [...]}}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-muted border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={handleFormat}
              disabled={!input.trim()}
              className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownUp className="w-5 h-5" />
              Format Response
            </button>
            {formatted && (
              <>
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary inline-flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy formatted
                    </>
                  )}
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs text-foreground-muted hover:text-danger transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Formatted Output */}
          {formatted && statusCode !== null && (
            <div className="animate-fade-in-up space-y-4">
              {/* Status Bar */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-surface-2 border border-border rounded-xl">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${statusColor(statusCode)}`}
                >
                  {statusCode} {statusLabel(statusCode)}
                </span>
                {responseTime && (
                  <span className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                    <Clock className="w-3.5 h-3.5" />
                    {responseTime}
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setViewMode("formatted")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === "formatted"
                        ? "bg-primary text-white"
                        : "bg-primary-muted text-primary hover:bg-primary/20"
                    }`}
                  >
                    Formatted
                  </button>
                  <button
                    onClick={() => setViewMode("raw")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === "raw"
                        ? "bg-primary text-white"
                        : "bg-primary-muted text-primary hover:bg-primary/20"
                    }`}
                  >
                    Raw
                  </button>
                </div>
              </div>

              {/* Headers */}
              {Object.keys(headers).length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary transition-colors">
                    <Server className="w-4 h-4" />
                    Response Headers ({Object.keys(headers).length})
                  </summary>
                  <div className="mt-2 bg-surface-2 border border-border rounded-xl p-4">
                    <table className="w-full text-xs">
                      <tbody>
                        {Object.entries(headers).map(([key, value]) => (
                          <tr key={key} className="border-b border-border last:border-0">
                            <td className="py-2 pr-4 font-mono text-primary font-semibold whitespace-nowrap">
                              {key}
                            </td>
                            <td className="py-2 font-mono text-foreground break-all">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}

              {/* Body */}
              <div className="bg-surface-2 border border-border rounded-xl p-4 max-h-[400px] overflow-auto">
                <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono">
                  {viewMode === "formatted" ? formatted : input}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Auto-Detection
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Automatically detects status codes, headers, error objects, and
                pagination from any API response format.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Debug Faster
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Quickly inspect headers, status codes, and nested error details
                without squinting at raw JSON in your terminal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
