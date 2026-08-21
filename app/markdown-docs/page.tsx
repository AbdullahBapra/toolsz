"use client";

import { useState, useCallback } from "react";
import {
  FileText,
  Check,
  Copy,
  Shield,
  Zap,
  Download,
  Eye,
  Code2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import ToolHero from "@/app/components/ToolHero";
import "highlight.js/styles/github-dark.css";

const SAMPLE_MARKDOWN = `# API Documentation

## Overview

The **Toolsz API** provides programmatic access to our file conversion and processing tools. All endpoints return JSON responses and use standard HTTP status codes.

## Authentication

All API requests require a Bearer token in the \`Authorization\` header:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.toolsz.co/v2/tools
\`\`\`

> **Note:** Free tier accounts are limited to 100 requests per hour. Upgrade to Pro for unlimited access.

## Endpoints

### List Tools

\`GET /v2/tools\`

Returns a list of all available tools.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/v2/tools\` | List all tools |
| POST | \`/v2/compress\` | Compress a PDF |
| POST | \`/v2/convert\` | Convert file format |
| GET | \`/v2/status/{id}\` | Check job status |

### Compress PDF

\`POST /v2/compress\`

Compresses a PDF file using smart optimization algorithms.

**Request body:**

\`\`\`json
{
  "file": "base64_encoded_pdf",
  "quality": "medium",
  "preserve_fonts": true
}
\`\`\`

**Response:**

\`\`\`json
{
  "status": "completed",
  "original_size": 5242880,
  "compressed_size": 2097152,
  "reduction": "60%"
}
\`\`\`

## Error Handling

1. **400 Bad Request** — Missing or invalid parameters
2. **401 Unauthorized** — Invalid or expired token
3. **429 Too Many Requests** — Rate limit exceeded
4. **500 Server Error** — Internal processing failure

---

*Last updated: January 2025* · [Contact Support](mailto:support@toolsz.co)
`;

export default function MarkdownDocsPage() {
  const [input, setInput] = useState("");
  const [rendered, setRendered] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "preview" | "source">("split");
  const [copied, setCopied] = useState(false);

  const handleRender = useCallback(() => {
    if (!input.trim()) return;
    setRendered(true);
  }, [input]);

  const handleCopy = useCallback(() => {
    if (!input) return;
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [input]);

  const handleDownload = useCallback(() => {
    if (!input) return;
    const blob = new Blob([input], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [input]);

  const handleDownloadHtml = useCallback(() => {
    if (!rendered) return;
    // Create a styled HTML document
    const previewEl = document.querySelector("[data-markdown-preview]");
    if (!previewEl) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Document</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#24292f;line-height:1.6}
  h1{font-size:2em;border-bottom:1px solid #d0d7de;padding-bottom:.3em}
  h2{font-size:1.5em;border-bottom:1px solid #d0d7de;padding-bottom:.3em}
  h3{font-size:1.25em}
  code{background:#f6f8fa;padding:.2em .4em;border-radius:6px;font-size:85%;font-family:ui-monospace,SFMono-Regular,SF Mono,Menlo,monospace}
  pre{background:#f6f8fa;padding:1em;border-radius:8px;overflow-x:auto}
  pre code{background:none;padding:0;font-size:100%}
  blockquote{border-left:4px solid #d0d7de;padding:0 1em;color:#656d76;margin:0}
  table{border-collapse:collapse;width:100%}
  th,td{border:1px solid #d0d7de;padding:6px 13px}
  th{background:#f6f8fa;font-weight:600}
  tr:nth-child(even){background:#f6f8fa}
  hr{border:none;border-top:1px solid #d0d7de;margin:1.5em 0}
  a{color:#0969da;text-decoration:none}
  a:hover{text-decoration:underline}
  img{max-width:100%}
  ul,ol{padding-left:2em}
</style></head><body>${previewEl.innerHTML}</body></html>`;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [rendered]);

  const handleClear = () => {
    setInput("");
    setRendered(false);
  };

  const loadSample = () => {
    setInput(SAMPLE_MARKDOWN);
    setRendered(true);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileText}
          title="Markdown → Beautiful Docs"
          description="Real-time rendering for complex Markdown syntax with syntax highlighting — free, client-side, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Dev Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!rendered ? (
            <>
              {/* Input */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">
                    Paste your Markdown
                  </label>
                  <button
                    onClick={loadSample}
                    className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors"
                  >
                    Load sample →
                  </button>
                </div>
                <textarea
                  className="w-full h-64 p-4 rounded-xl border border-border bg-surface-1 text-foreground text-xs font-mono resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="# My Document&#10;&#10;Write your **markdown** here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  spellCheck={false}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRender}
                  disabled={!input.trim()}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-5 h-5" />
                  Render Document
                </button>
                <button
                  onClick={loadSample}
                  className="btn btn-secondary inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Load Sample
                </button>
              </div>
            </>
          ) : (
            <>
              {/* View Mode Toggle */}
              <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewMode("split")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === "split"
                        ? "bg-primary text-white"
                        : "bg-primary-muted text-primary hover:bg-primary/20"
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setViewMode("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === "preview"
                        ? "bg-primary text-white"
                        : "bg-primary-muted text-primary hover:bg-primary/20"
                    }`}
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Preview
                  </button>
                  <button
                    onClick={() => setViewMode("source")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === "source"
                        ? "bg-primary text-white"
                        : "bg-primary-muted text-primary hover:bg-primary/20"
                    }`}
                  >
                    <Code2 className="w-4 h-4 inline mr-1" />
                    Source
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-muted text-primary hover:bg-primary/20 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy MD"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-muted text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    .md
                  </button>
                  <button
                    onClick={handleDownloadHtml}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-muted text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    .html
                  </button>
                  <button
                    onClick={handleClear}
                    className="text-xs text-foreground-muted hover:text-danger transition-colors ml-2"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div
                className={`grid gap-4 ${
                  viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {/* Source Editor */}
                {(viewMode === "split" || viewMode === "source") && (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">Markdown</span>
                    </div>
                    <textarea
                      className="w-full h-[500px] p-4 rounded-xl border border-border bg-surface-1 text-foreground text-xs font-mono resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Preview */}
                {(viewMode === "split" || viewMode === "preview") && (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">Preview</span>
                    </div>
                    <div
                      data-markdown-preview
                      className="h-[500px] overflow-auto p-6 rounded-xl border border-border bg-background prose-content"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {input}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </>
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
                Full GFM Support
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                GitHub-Flavored Markdown including tables, task lists,
                strikethrough, and code blocks with syntax highlighting.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Export as HTML
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Download your rendered document as a self-contained HTML file
                with professional styling — ready to host or share.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
