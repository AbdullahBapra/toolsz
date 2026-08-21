"use client";

import { useState, useCallback } from "react";
import {
  Braces,
  Check,
  Shield,
  Zap,
  ChevronRight,
  ChevronDown,
  Copy,
  Search,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

function typeColor(val: unknown): string {
  if (val === null) return "bg-foreground-muted/20 text-foreground-secondary";
  if (typeof val === "string") return "bg-success-muted text-success";
  if (typeof val === "number") return "bg-primary-muted text-primary";
  if (typeof val === "boolean") return "bg-warning-muted text-warning";
  if (Array.isArray(val)) return "bg-purple-50 text-primary";
  if (typeof val === "object") return "bg-indigo-50 text-primary";
  return "bg-foreground-muted/20 text-foreground-secondary";
}

function typeLabel(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return `array[${val.length}]`;
  return typeof val;
}

function JsonValue({
  value,
  name,
  depth = 0,
  searchTerm,
}: {
  value: unknown;
  name?: string;
  depth?: number;
  searchTerm: string;
}) {
  const isObj = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const matchesSearch =
    !searchTerm ||
    (name && name.toLowerCase().includes(searchTerm.toLowerCase()));

  // When searching, auto-expand nodes that contain matching descendants
  const hasMatchingDescendant =
    searchTerm && isObj && !isArray &&
    Object.values(value as Record<string, unknown>).some(
      (v) => typeof v === "string" && v.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const [open, setOpen] = useState(depth < 2 || !!hasMatchingDescendant);

  if (!matchesSearch && !isObj && !hasMatchingDescendant) return null;

  if (isArray) {
    return (
      <div className={depth > 0 ? "ml-4 border-l border-border pl-3" : ""}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 hover:bg-surface-2 rounded px-1 py-0.5 w-full text-left group"
        >
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-foreground-muted group-hover:text-primary" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-foreground-muted group-hover:text-primary" />
          )}
          {name && (
            <span className="text-primary font-semibold text-xs">{name}</span>
          )}
          {name && <span className="text-foreground-muted text-xs">:</span>}
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-semibold ${typeColor(value)}`}
          >
            {typeLabel(value)}
          </span>
        </button>
        {open && (
          <div className="mt-0.5">
            {(value as unknown[]).map((item, i) => (
              <JsonValue
                key={i}
                name={String(i)}
                value={item}
                depth={depth + 1}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isObj) {
    return (
      <div className={depth > 0 ? "ml-4 border-l border-border pl-3" : ""}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 hover:bg-surface-2 rounded px-1 py-0.5 w-full text-left group"
        >
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-foreground-muted group-hover:text-primary" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-foreground-muted group-hover:text-primary" />
          )}
          {name && (
            <span className="text-primary font-semibold text-xs">{name}</span>
          )}
          {name && <span className="text-foreground-muted text-xs">:</span>}
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-semibold ${typeColor(value)}`}
          >
            {typeLabel(value)}
          </span>
        </button>
        {open && (
          <div className="mt-0.5">
            {Object.entries(value as Record<string, unknown>).map(
              ([key, val]) => (
                <JsonValue
                  key={key}
                  name={key}
                  value={val}
                  depth={depth + 1}
                  searchTerm={searchTerm}
                />
              )
            )}
          </div>
        )}
      </div>
    );
  }

  // Primitive
  return (
    <div
      className={`flex items-center gap-2 py-0.5 px-1 hover:bg-surface-2 rounded ${
        depth > 0 ? "ml-4 border-l border-border pl-3" : ""
      }`}
    >
      {name && (
        <span className="text-primary font-semibold text-xs">{name}</span>
      )}
      {name && <span className="text-foreground-muted text-xs">:</span>}
      <span
        className={`text-xs px-1.5 py-0.5 rounded font-semibold ${typeColor(value)}`}
      >
        {typeLabel(value)}
      </span>
      <span className="text-xs text-foreground break-all">
        {value === null ? (
          <span className="text-foreground-muted italic">null</span>
        ) : typeof value === "string" ? (
          <span className="text-success">&quot;{value}&quot;</span>
        ) : typeof value === "boolean" ? (
          <span className="text-warning font-semibold">
            {String(value)}
          </span>
        ) : (
          <span className="text-blue-600">{String(value)}</span>
        )}
      </span>
    </div>
  );
}

export default function JsonPreviewPage() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<Record<string, unknown> | unknown[] | string | number | boolean | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree");

  const handleParse = useCallback(() => {
    if (!input.trim()) return;
    try {
      const obj = JSON.parse(input);
      setParsed(obj);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setParsed(null);
    }
  }, [input]);

  const handleCopy = useCallback(() => {
    if (!parsed) return;
    navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [parsed]);

  const handleClear = () => {
    setInput("");
    setParsed(null);
    setError("");
    setSearchTerm("");
  };

  const loadSample = () => {
    const sample = {
      name: "Toolsz API",
      version: "2.0.0",
      endpoints: [
        {
          method: "GET",
          path: "/api/tools",
          description: "List all available tools",
          auth: true,
        },
        {
          method: "POST",
          path: "/api/compress",
          description: "Compress a PDF file",
          auth: true,
          rateLimit: { requests: 100, period: "1h" },
        },
      ],
      metadata: {
        createdAt: "2025-01-15T10:30:00Z",
        features: ["pdf", "image", "developer"],
        active: true,
        stats: { users: 15420, conversions: 892300, uptime: 99.97 },
      },
    };
    setInput(JSON.stringify(sample, null, 2));
    setParsed(sample);
    setError("");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Braces}
          title="JSON → UI Preview"
          description="Visualize JSON payloads as an interactive collapsible tree with type badges and search — free, instant, and completely private. No data leaves your browser."
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
                Paste your JSON
              </label>
              <button
                onClick={loadSample}
                className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors"
              >
                Load sample →
              </button>
            </div>
            <textarea
              className="w-full h-48 p-4 rounded-xl border border-border bg-surface-1 text-foreground text-xs font-mono resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder='{"name": "example", "items": [1, 2, 3]}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-muted border border-danger/20 text-danger text-xs">
              ✗ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={handleParse}
              disabled={!input.trim()}
              className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Braces className="w-5 h-5" />
              Preview JSON
            </button>
            {parsed && (
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
                <button onClick={handleClear} className="text-xs text-foreground-muted hover:text-danger transition-colors">
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Preview */}
          {parsed !== null && (
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("tree")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === "tree"
                        ? "bg-primary text-white"
                        : "bg-primary-muted text-primary hover:bg-primary/20"
                    }`}
                  >
                    Tree View
                  </button>
                  <button
                    onClick={() => setViewMode("raw")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === "raw"
                        ? "bg-primary text-white"
                        : "bg-primary-muted text-primary hover:bg-primary/20"
                    }`}
                  >
                    Raw JSON
                  </button>
                </div>
                {viewMode === "tree" && (
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                    <input
                      type="text"
                      placeholder="Search keys..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface-1 text-xs focus:outline-none focus:border-primary transition-colors w-44"
                    />
                  </div>
                )}
              </div>
              <div className="bg-surface-2 border border-border rounded-xl p-4 max-h-[500px] overflow-auto">
                {viewMode === "tree" ? (
                  <JsonValue value={parsed} searchTerm={searchTerm} />
                ) : (
                  <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono">
                    {JSON.stringify(parsed, null, 2)}
                  </pre>
                )}
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
                100% Client-Side
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your JSON never leaves your browser. All parsing and rendering
                happens locally — zero data sent to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Instant Visualization
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Deeply nested APIs, config files, or logs — explore them
                interactively with collapsible nodes and type badges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
