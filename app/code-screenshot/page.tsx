"use client";

import { useState, useCallback } from "react";
import {
  Camera,
  Copy,
  Check,
  Shield,
  Zap,
  Download,
  Palette,
  Loader2,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";
import { useToast } from "@/app/components/Toast";

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "csharp",
  "cpp",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "bash",
  "markdown",
  "plaintext",
];

const THEMES = [
  { id: "midnight", label: "Midnight", bg: "#1e1e2e", text: "#cdd6f4", accent: "#89b4fa" },
  { id: "dracula", label: "Dracula", bg: "#282a36", text: "#f8f8f2", accent: "#bd93f9" },
  { id: "nord", label: "Nord", bg: "#2e3440", text: "#d8dee9", accent: "#88c0d0" },
  { id: "solarized-dark", label: "Solarized Dark", bg: "#002b36", text: "#839496", accent: "#268bd2" },
  { id: "one-dark", label: "One Dark", bg: "#282c34", text: "#abb2bf", accent: "#61afef" },
  { id: "github-dark", label: "GitHub Dark", bg: "#0d1117", text: "#c9d1d9", accent: "#58a6ff" },
  { id: "light", label: "Light", bg: "#fafafa", text: "#24292f", accent: "#0969da" },
  { id: "solarized-light", label: "Solarized Light", bg: "#fdf6e3", text: "#657b83", accent: "#268bd2" },
];

const PADDING_OPTIONS = [
  { id: "compact", label: "Compact", value: 24 },
  { id: "normal", label: "Normal", value: 40 },
  { id: "comfortable", label: "Comfortable", value: 56 },
];

const MONO_FONT = '"Menlo", "Consolas", "Courier New", monospace';

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

export default function CodeScreenshotPage() {
  const { addToast } = useToast();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("midnight");
  const [padding, setPadding] = useState("normal");
  const [title, setTitle] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showWindowControls, setShowWindowControls] = useState(true);
  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const currentPadding = PADDING_OPTIONS.find((p) => p.id === padding) || PADDING_OPTIONS[1];

  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "downloaded">("idle");
  const [exporting, setExporting] = useState(false);

  /**
   * Draws the code screenshot directly onto a Canvas using the native API.
   * This bypasses html2canvas entirely — no DOM/CSS parsing needed.
   */
  const renderToCanvas = useCallback((): HTMLCanvasElement | null => {
    const codeLines = code.split("\n");
    if (codeLines.length === 0) return null;

    const dpr = 2; // Retina resolution
    const fontSize = 14 * dpr;
    const lineHeight = 24 * dpr;
    const innerPad = 16 * dpr;
    const lineNumWidth = showLineNumbers ? 40 * dpr : 0;
    const lineNumGap = showLineNumbers ? 16 * dpr : 0;
    const windowControlsHeight = showWindowControls ? 40 * dpr : 0;
    const borderRadius = 12 * dpr;
    const outerPad = currentPadding.value * dpr;
    const shadowBlur = 30 * dpr;
    const shadowOffset = 10 * dpr;

    // Measure max line width
    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d")!;
    measureCtx.font = `${fontSize}px ${MONO_FONT}`;
    let maxLineWidth = 0;
    for (const line of codeLines) {
      const w = measureCtx.measureText(line || " ").width;
      if (w > maxLineWidth) maxLineWidth = w;
    }

    const codeAreaWidth = lineNumWidth + lineNumGap + maxLineWidth + innerPad * 2;
    const windowMinWidth = 480 * dpr;
    const contentWidth = Math.max(codeAreaWidth, windowMinWidth);
    const contentHeight = windowControlsHeight + innerPad + codeLines.length * lineHeight + innerPad;
    const canvasWidth = contentWidth + outerPad * 2;
    const canvasHeight = contentHeight + outerPad * 2;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d")!;

    // Outer background — use a slightly different shade for visual depth
    ctx.fillStyle = currentTheme.bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw a subtle grid pattern on the outer area for visual interest
    const isLight = isLightColor(currentTheme.bg);
    ctx.strokeStyle = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < canvasWidth; gx += 20 * dpr) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, canvasHeight);
      ctx.stroke();
    }
    for (let gy = 0; gy < canvasHeight; gy += 20 * dpr) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(canvasWidth, gy);
      ctx.stroke();
    }

    // Drop shadow behind the code window
    ctx.save();
    ctx.shadowColor = isLight ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.5)";
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = shadowOffset;

    // Rounded rect for the code window
    const rx = outerPad;
    const ry = outerPad;
    const rw = contentWidth;
    const rh = contentHeight;
    ctx.beginPath();
    ctx.moveTo(rx + borderRadius, ry);
    ctx.lineTo(rx + rw - borderRadius, ry);
    ctx.arcTo(rx + rw, ry, rx + rw, ry + borderRadius, borderRadius);
    ctx.lineTo(rx + rw, ry + rh - borderRadius);
    ctx.arcTo(rx + rw, ry + rh, rx + rw - borderRadius, ry + rh, borderRadius);
    ctx.lineTo(rx + borderRadius, ry + rh);
    ctx.arcTo(rx, ry + rh, rx, ry + rh - borderRadius, borderRadius);
    ctx.lineTo(rx, ry + borderRadius);
    ctx.arcTo(rx, ry, rx + borderRadius, ry, borderRadius);
    ctx.closePath();
    ctx.fillStyle = currentTheme.bg;
    ctx.fill();
    ctx.restore();

    // Window controls
    if (showWindowControls) {
      const cy = ry + windowControlsHeight / 2;
      const dotR = 6 * dpr;
      const dotStartX = rx + innerPad;

      ctx.fillStyle = "#ff5f57";
      ctx.beginPath();
      ctx.arc(dotStartX, cy, dotR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#febc2e";
      ctx.beginPath();
      ctx.arc(dotStartX + dotR * 3, cy, dotR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#28c840";
      ctx.beginPath();
      ctx.arc(dotStartX + dotR * 6, cy, dotR, 0, Math.PI * 2);
      ctx.fill();

      // Title text
      if (title) {
        ctx.fillStyle = currentTheme.text;
        ctx.globalAlpha = 0.5;
        ctx.font = `${12 * dpr}px ${MONO_FONT}`;
        ctx.textBaseline = "middle";
        ctx.fillText(title, dotStartX + dotR * 9, cy);
        ctx.globalAlpha = 1;
      }

      // Separator line
      ctx.strokeStyle = currentTheme.text;
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(rx, ry + windowControlsHeight);
      ctx.lineTo(rx + rw, ry + windowControlsHeight);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Code lines
    ctx.font = `${fontSize}px ${MONO_FONT}`;
    ctx.textBaseline = "top";
    const codeStartY = ry + windowControlsHeight + innerPad;

    for (let i = 0; i < codeLines.length; i++) {
      const y = codeStartY + i * lineHeight;

      // Line number
      if (showLineNumbers) {
        ctx.fillStyle = currentTheme.text;
        ctx.globalAlpha = 0.3;
        ctx.textAlign = "right";
        ctx.fillText(String(i + 1), rx + innerPad + lineNumWidth, y);
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
      }

      // Code text
      ctx.fillStyle = currentTheme.text;
      ctx.fillText(
        codeLines[i] || " ",
        rx + innerPad + lineNumWidth + lineNumGap,
        y
      );
    }

    return canvas;
  }, [code, currentTheme, currentPadding, showLineNumbers, showWindowControls, title]);

  const handleCopyImage = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    setCopyState("copying");
    try {
      const canvas = renderToCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) {
        addToast("error", "Failed to generate image — try Download PNG instead");
        setCopyState("idle");
        return;
      }
      try {
        // @ts-ignore — ClipboardItem not in default TS lib
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopyState("copied");
      } catch {
        // Clipboard API may fail without focus/permission — fall back to download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${title || "code-screenshot"}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setCopyState("downloaded");
      }
      setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      addToast("error", "Copy failed — try Download PNG instead");
      setCopyState("idle");
    } finally {
      setExporting(false);
    }
  }, [exporting, renderToCanvas, title, addToast]);

  const handleDownload = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const canvas = renderToCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) {
        addToast("error", "Failed to generate image");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${title || "code-screenshot"}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      addToast("error", "Download failed — please try again");
    } finally {
      setExporting(false);
    }
  }, [exporting, renderToCanvas, title, addToast]);

  const handleClear = () => {
    setCode("");
    setTitle("");
  };

  const loadSample = () => {
    setLanguage("typescript");
    setCode(`// Fetch all users with their roles
async function getUsers(): Promise<User[]> {
  const response = await fetch("/api/users", {
    headers: { Authorization: \`Bearer \${token}\` },
  });

  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`);
  }

  const { data } = await response.json();
  return data.users.filter((u: User) => u.active);
}`);
    setTitle("getUsers.ts");
  };

  const lines = code.split("\n");

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Camera}
          title="Code Screenshot Generator"
          description="Capture elegant code snippets in high fidelity with 8 themes and PNG export — perfect for docs and social media. Free, instant, and private."
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
                Paste your code
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
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Options */}
          {code.trim() && (
            <div className="mb-6 animate-fade-in-up space-y-4">
              {/* Title + Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                    Window Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. index.ts"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-xs focus:outline-none focus:border-primary transition-colors"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        theme === t.id
                          ? "border-primary bg-primary-muted ring-2 ring-primary/30"
                          : "border-border hover:border-primary-border"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: t.bg }}
                      />
                      <span className="text-foreground">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Padding + Toggles */}
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-2 block">
                    Padding
                  </label>
                  <div className="flex gap-1.5">
                    {PADDING_OPTIONS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPadding(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          padding === p.id
                            ? "bg-primary text-white"
                            : "bg-primary-muted text-primary hover:bg-primary/20"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLineNumbers}
                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-foreground">Line numbers</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWindowControls}
                    onChange={(e) => setShowWindowControls(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-foreground">Window controls</span>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {code.trim() ? (
              <>
                <button
                  onClick={handleDownload}
                  disabled={exporting}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {exporting ? "Exporting..." : "Download PNG"}
                </button>
                <button
                  onClick={handleCopyImage}
                  disabled={exporting}
                  className="btn btn-secondary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copyState === "copied" ? <Check className="w-4 h-4" /> : copyState === "downloaded" ? <Download className="w-4 h-4" /> : copyState === "copying" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  {copyState === "copied" ? "Copied!" : copyState === "downloaded" ? "Saved as file!" : copyState === "copying" ? "Copying..." : "Copy to clipboard"}
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs text-foreground-muted hover:text-danger transition-colors"
                >
                  Clear
                </button>
              </>
            ) : (
              <span className="text-xs text-foreground-secondary">Paste code above to see the preview</span>
            )}
          </div>

          {/* Preview */}
          {code.trim() && (
            <div className="animate-fade-in-up">
              <div className="flex justify-center overflow-auto py-4">
                <div style={{ padding: currentPadding.value }}>
                  <div
                    className="rounded-xl overflow-hidden shadow-2xl"
                    style={{ backgroundColor: currentTheme.bg, minWidth: 480 }}
                  >
                    {/* Window Controls */}
                    {showWindowControls && (
                      <div
                        className="flex items-center gap-2 px-4 py-3"
                        style={{ borderBottom: `1px solid ${currentTheme.text}15` }}
                      >
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        {title && (
                          <span
                            className="ml-3 text-xs font-mono opacity-50"
                            style={{ color: currentTheme.text }}
                          >
                            {title}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Code */}
                    <div className="p-4 overflow-x-auto">
                      <pre className="text-xs leading-6 font-mono" style={{ color: currentTheme.text }}>
                        {lines.map((line, i) => (
                          <div key={i} className="flex">
                            {showLineNumbers && (
                              <span
                                className="inline-block w-8 text-right mr-4 select-none opacity-30 flex-shrink-0"
                                style={{ color: currentTheme.text }}
                              >
                                {i + 1}
                              </span>
                            )}
                            <span className="whitespace-pre">{line || " "}</span>
                          </div>
                        ))}
                      </pre>
                    </div>
                  </div>
                </div>
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
                Pixel-Perfect Export
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Export 2x resolution PNG images perfect for Retina displays,
                documentation sites, and social media posts.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                8 Beautiful Themes
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                From Dracula to GitHub Dark — pick a theme that matches your
                brand or mood. Customize padding and window controls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
