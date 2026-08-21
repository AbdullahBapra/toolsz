"use client";

import { useState, useCallback, useRef } from "react";
import {
  Code2,
  Download,
  Loader2,
  Shield,
  Zap,
  Check,
  AlertCircle,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

// ---------- Sample code ----------
const SAMPLE_CODE = `// pptx is pre-initialized — just add slides below.
// Do NOT call pptx.writeFile() — the tool handles the download.

// ─── Slide 1: Title ───────────────────────────────────────────
const s1 = pptx.addSlide();
s1.background = { color: "FFFFFF" };

// Bottom accent bar
s1.addShape(pptx.ShapeType.rect, {
  x: 0, y: 4.8, w: 10, h: 0.5,
  fill: { color: "3b82f6" }, line: { width: 0 },
});

// Title text
s1.addText("My Custom Presentation", {
  x: 0.5, y: 1.2, w: 9, h: 1.8,
  fontSize: 40, bold: true, color: "1e3a8a",
  align: "center", valign: "middle",
});

// Divider line
s1.addShape(pptx.ShapeType.rect, {
  x: 3.5, y: 3.15, w: 3, h: 0.06,
  fill: { color: "3b82f6" }, line: { width: 0 },
});

// Subtitle
s1.addText("Built with JS to PPTX — Toolsz", {
  x: 0.5, y: 3.35, w: 9, h: 0.9,
  fontSize: 18, color: "6b7280",
  align: "center", italic: true,
});

// ─── Slide 2: Bullets ─────────────────────────────────────────
const s2 = pptx.addSlide();
s2.background = { color: "FFFFFF" };

// Header band
s2.addShape(pptx.ShapeType.rect, {
  x: 0, y: 0, w: 10, h: 1.1,
  fill: { color: "1e3a8a" }, line: { width: 0 },
});
s2.addText("Key Features", {
  x: 0.4, y: 0.12, w: 9.2, h: 0.88,
  fontSize: 24, bold: true, color: "FFFFFF", valign: "middle",
});

// Bullet list
s2.addText([
  { text: "Write pure JavaScript using the pptxgenjs API", options: { bullet: true, fontSize: 18, color: "374151", paraSpaceBefore: 8 } },
  { text: "Full API access: shapes, tables, images, charts", options: { bullet: true, fontSize: 18, color: "374151", paraSpaceBefore: 8 } },
  { text: "Runs 100% in your browser — no server upload", options: { bullet: true, fontSize: 18, color: "374151", paraSpaceBefore: 8 } },
  { text: "No signup, no watermarks, completely free", options: { bullet: true, fontSize: 18, color: "374151", paraSpaceBefore: 8 } },
], { x: 0.5, y: 1.3, w: 9, h: 4.1 });

// ─── Slide 3: Table ───────────────────────────────────────────
const s3 = pptx.addSlide();
s3.background = { color: "FFFFFF" };

s3.addShape(pptx.ShapeType.rect, {
  x: 0, y: 0, w: 10, h: 1.1,
  fill: { color: "1e3a8a" }, line: { width: 0 },
});
s3.addText("Data Table", {
  x: 0.4, y: 0.12, w: 9.2, h: 0.88,
  fontSize: 24, bold: true, color: "FFFFFF", valign: "middle",
});

s3.addTable([
  [
    { text: "Product",  options: { bold: true, color: "FFFFFF", fill: { color: "1e3a8a" }, align: "center" } },
    { text: "Revenue",  options: { bold: true, color: "FFFFFF", fill: { color: "1e3a8a" }, align: "center" } },
    { text: "Growth",   options: { bold: true, color: "FFFFFF", fill: { color: "1e3a8a" }, align: "center" } },
  ],
  [{ text: "Pro Plan" }, { text: "$2.1M" }, { text: "+31%" }],
  [{ text: "Enterprise" }, { text: "$1.6M" }, { text: "+18%" }],
  [{ text: "Starter" }, { text: "$0.5M" }, { text: "+12%" }],
], {
  x: 0.5, y: 1.3, w: 9,
  colW: [3, 3, 3],
  rowH: 0.5,
  fontSize: 15,
  border: { type: "solid", pt: 1, color: "e2e8f0" },
  color: "374151",
});
`;

const API_CHEATSHEET = [
  {
    group: "Slide & Background",
    items: [
      { code: "pptx.addSlide()", desc: "Add a new slide, returns slide object" },
      { code: "slide.background = { color: 'FFFFFF' }", desc: "Set slide background color (hex, no #)" },
      { code: "pptx.layout = 'LAYOUT_WIDE'", desc: "Set 16:9 widescreen layout (default)" },
    ],
  },
  {
    group: "Text",
    items: [
      { code: "slide.addText('Hello', { x, y, w, h, fontSize, bold, color, align })", desc: "Add a text box. x/y/w/h in inches. color = hex without #" },
      { code: "slide.addText([{ text, options }, …], opts)", desc: "Multi-run text for bullets, mixed styles" },
      { code: "options: { bullet: true, italic, underline, valign: 'middle' }", desc: "Common text run options" },
    ],
  },
  {
    group: "Shapes",
    items: [
      { code: "slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill, line })", desc: "Add a rectangle. fill: { color } · line: { width: 0 }" },
      { code: "pptx.ShapeType.ellipse / triangle / …", desc: "Other shape types" },
    ],
  },
  {
    group: "Tables",
    items: [
      { code: "slide.addTable(rows, { x, y, w, colW, rowH, fontSize, border })", desc: "Add a table. rows = [[{ text, options }, …], …]" },
      { code: "border: { type: 'solid', pt: 1, color: 'cccccc' }", desc: "Cell border style" },
    ],
  },
  {
    group: "Positioning",
    items: [
      { code: "x, y, w, h", desc: "All in inches. Slide is 10\" × 5.625\" (16:9)" },
      { code: "align: 'left' | 'center' | 'right'", desc: "Horizontal text alignment" },
      { code: "valign: 'top' | 'middle' | 'bottom'", desc: "Vertical text alignment" },
    ],
  },
];

// ---------- Page ----------
export default function JsToPptxPage() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [fileName, setFileName] = useState("presentation");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRef, setShowRef] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = useCallback(async () => {
    if (!code.trim()) return;
    setProcessing(true);
    setSuccess(false);
    setError(null);

    try {
      const { default: PptxGenJS } = await import("pptxgenjs");
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";

      // Execute user code with pptx in scope
      // eslint-disable-next-line no-new-func
      const AsyncFn = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...args: unknown[]) => Promise<unknown>;
      const fn = new AsyncFn("pptx", code);
      await fn(pptx);

      const name = (fileName.trim() || "presentation") + ".pptx";
      await pptx.writeFile({ fileName: name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProcessing(false);
    }
  }, [code, fileName]);

  const handleInsert = useCallback((snippet: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const updated = code.slice(0, start) + "\n" + snippet + "\n" + code.slice(end);
    setCode(updated);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + snippet.length + 2, start + snippet.length + 2);
    }, 0);
  }, [code]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Code2}
          title="JS to PPTX"
          description="Write JavaScript using the pptxgenjs API and download a PowerPoint file instantly — full API access, runs entirely in your browser."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8 space-y-5">

        {/* Editor + controls */}
        <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">JavaScript Editor</span>
              <span className="text-xs text-foreground-muted">— <code className="bg-surface-2 px-1 rounded">pptx</code> is pre-initialized</span>
            </div>
            <button
              onClick={() => { setCode(SAMPLE_CODE); setError(null); setSuccess(false); }}
              className="text-xs text-primary font-semibold hover:underline transition-colors"
            >
              Reset to sample →
            </button>
          </div>

          {/* Notice */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 leading-relaxed">
            <strong>pptx</strong> is a ready-made <code>PptxGenJS</code> instance. Add slides to it using the API below. <strong>Do not call</strong> <code>pptx.writeFile()</code> — the tool handles the download automatically when you click Run.
          </div>

          {/* Code editor */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(null); setSuccess(false); }}
            spellCheck={false}
            className="w-full h-96 rounded-lg border border-border bg-[#1a1a2e] text-[#e2e8f0] px-4 py-3 text-xs font-mono resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors leading-relaxed"
            placeholder="// Add slides to pptx here..."
          />

          {/* Error output */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700">Runtime Error</p>
                <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap break-all font-mono">{error}</pre>
              </div>
            </div>
          )}

          {/* Bottom controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors w-40"
                placeholder="presentation"
              />
              <span className="text-sm text-foreground-muted">.pptx</span>
            </div>

            <button
              onClick={handleRun}
              disabled={processing || !code.trim()}
              className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
              ) : success ? (
                <><Check className="w-4 h-4 text-green-300" /> Downloaded!</>
              ) : (
                <><Play className="w-4 h-4" /> Run & Download</>
              )}
            </button>

            <button
              onClick={() => { setCode(""); setError(null); setSuccess(false); }}
              className="btn btn-secondary inline-flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* API Reference (collapsible) */}
        <div className="glass-panel rounded-[16px] overflow-hidden">
          <button
            onClick={() => setShowRef((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-1 transition-colors"
          >
            <span className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              pptxgenjs API Quick Reference
            </span>
            {showRef ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}
          </button>

          {showRef && (
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {API_CHEATSHEET.map((section) => (
                <div key={section.group}>
                  <h4 className="text-xs font-semibold text-primary mb-2">{section.group}</h4>
                  <div className="space-y-2">
                    {section.items.map((item, i) => (
                      <div key={i} className="rounded-lg bg-surface-1 border border-border p-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <pre
                            className="text-[10px] font-mono text-foreground leading-relaxed whitespace-pre-wrap break-all flex-1 cursor-pointer hover:text-primary transition-colors"
                            title="Click to insert at cursor"
                            onClick={() => handleInsert(item.code)}
                          >
                            {item.code}
                          </pre>
                        </div>
                        <p className="text-[10px] text-foreground-muted mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="md:col-span-2">
                <p className="text-xs text-foreground-muted">
                  Click any code snippet to insert it at your cursor position.
                  Full API docs: <span className="text-primary font-mono">gitbrent.github.io/PptxGenJS</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Client-Side</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your JavaScript runs locally in the browser — pptxgenjs generates the PPTX file directly without any server upload.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Full pptxgenjs API</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Shapes, text boxes, bullet lists, tables, colors, backgrounds — everything pptxgenjs supports is available in your code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
