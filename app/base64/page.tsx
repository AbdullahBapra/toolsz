"use client";

import { useState, useCallback } from "react";
import {
  Binary,
  Check,
  Shield,
  Zap,
  Copy,
  Download,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

type Mode = "base64-encode" | "base64-decode" | "url-encode" | "url-decode" | "html-encode" | "html-decode";

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: "base64-encode", label: "Base64 Encode", desc: "Text → Base64" },
  { id: "base64-decode", label: "Base64 Decode", desc: "Base64 → Text" },
  { id: "url-encode", label: "URL Encode", desc: "Text → %20%2F…" },
  { id: "url-decode", label: "URL Decode", desc: "%20%2F → Text" },
  { id: "html-encode", label: "HTML Encode", desc: "< → &lt;" },
  { id: "html-decode", label: "HTML Decode", desc: "&lt; → <" },
];

function convert(input: string, mode: Mode): string {
  try {
    switch (mode) {
      case "base64-encode":
        return btoa(unescape(encodeURIComponent(input)));
      case "base64-decode":
        return decodeURIComponent(escape(atob(input.trim())));
      case "url-encode":
        return encodeURIComponent(input);
      case "url-decode":
        return decodeURIComponent(input);
      case "html-encode":
        return input
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      case "html-decode": {
        const doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent ?? "";
      }
    }
  } catch {
    return "[Error: Invalid input for this operation]";
  }
}

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>("base64-encode");
  const [input, setInput] = useState("Hello, World!");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    setOutput(convert(input, mode));
  }, [input, mode]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleSwap = useCallback(() => {
    const swapMap: Record<Mode, Mode> = {
      "base64-encode": "base64-decode",
      "base64-decode": "base64-encode",
      "url-encode": "url-decode",
      "url-decode": "url-encode",
      "html-encode": "html-decode",
      "html-decode": "html-encode",
    };
    const newMode = swapMap[mode];
    setMode(newMode);
    if (output) {
      setInput(output);
      setOutput("");
    }
  }, [mode, output]);

  const textareaCls =
    "w-full h-40 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground font-mono placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y";

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Binary}
          title="Base64 Encode / Decode"
          description="Encode and decode Base64, URL encoding, and HTML entities — 6 tools in one. Free, client-side, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">Operation</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setOutput(""); }}
                  className={`px-3 py-2 rounded-lg border text-left transition-all ${
                    mode === m.id
                      ? "bg-primary-muted border-primary-border"
                      : "bg-surface-1 border-border hover:bg-surface-2"
                  }`}
                >
                  <div className={`text-xs font-semibold ${mode === m.id ? "text-primary" : "text-foreground"}`}>
                    {m.label}
                  </div>
                  <div className="text-xs text-foreground-muted">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encode or decode…"
              className={textareaCls}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2"
            >
              <Binary className="w-4 h-4" />
              {mode.includes("encode") ? "Encode" : "Decode"}
            </button>
            <button
              onClick={handleSwap}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              ↔ Swap
            </button>
          </div>

          {/* Output */}
          {output && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Output</label>
              <textarea value={output} readOnly className={textareaCls} />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-1 justify-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-1 justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">6 Encoding Tools in One</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Base64 encode/decode, URL encode/decode, and HTML entity encode/decode — all in a single page.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Swap & Chain</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Instantly swap between encode and decode modes. Output becomes input for reverse operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
