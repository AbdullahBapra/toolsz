"use client";

import { useState, useCallback, useMemo } from "react";
import {
  FileJson,
  Download,
  Loader2,
  Shield,
  Zap,
  Check,
  ChevronRight,
  Presentation,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

// ---------- Types ----------
type SlideLayout = "title" | "bullets" | "content" | "table" | "two-col";
type ThemeName = "blue" | "dark" | "green" | "red" | "light";

interface TableData { headers: string[]; rows: string[][] }
interface SlideData {
  layout: SlideLayout;
  title?: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  table?: TableData;
  left?: string;
  right?: string;
}
interface PresentationData { title?: string; theme?: ThemeName; slides: SlideData[] }

interface ThemeConfig {
  label: string;
  bg: string;
  titleColor: string;
  textColor: string;
  accent: string;
  headerBg: string;
  headerText: string;
  swatch: string;
}

// ---------- Themes ----------
const THEMES: Record<ThemeName, ThemeConfig> = {
  blue: { label: "Ocean Blue", bg: "FFFFFF", titleColor: "1e3a8a", textColor: "374151", accent: "3b82f6", headerBg: "1e3a8a", headerText: "FFFFFF", swatch: "#1e3a8a" },
  dark: { label: "Dark Mode", bg: "111827", titleColor: "FFFFFF", textColor: "d1d5db", accent: "818cf8", headerBg: "1f2937", headerText: "FFFFFF", swatch: "#1f2937" },
  green: { label: "Forest Green", bg: "FFFFFF", titleColor: "14532d", textColor: "374151", accent: "16a34a", headerBg: "15803d", headerText: "FFFFFF", swatch: "#15803d" },
  red: { label: "Bold Red", bg: "FFFFFF", titleColor: "7f1d1d", textColor: "374151", accent: "dc2626", headerBg: "b91c1c", headerText: "FFFFFF", swatch: "#b91c1c" },
  light: { label: "Minimal Light", bg: "f8fafc", titleColor: "1e293b", textColor: "475569", accent: "6366f1", headerBg: "e2e8f0", headerText: "1e293b", swatch: "#6366f1" },
};

const VALID_LAYOUTS: SlideLayout[] = ["title", "bullets", "content", "table", "two-col"];

// ---------- Sample ----------
const SAMPLE_JSON = JSON.stringify({
  title: "Q1 2025 Business Review",
  theme: "blue",
  slides: [
    { layout: "title", title: "Q1 2025 Business Review", subtitle: "April · Prepared by the Finance Team" },
    { layout: "bullets", title: "Executive Summary", bullets: ["Revenue grew 24% YoY to $4.2M", "Customer base expanded to 1,840 accounts", "NPS improved from 42 to 61", "3 new enterprise contracts signed"] },
    { layout: "content", title: "Market Overview", content: "The market showed strong recovery in Q1, driven by increased enterprise adoption and favorable macro conditions. Our mid-market positioning continues to gain traction with both SMB and enterprise clients." },
    { layout: "table", title: "Revenue Breakdown", table: { headers: ["Product", "Q1 Revenue", "YoY Growth"], rows: [["Pro Plan", "$2.1M", "+31%"], ["Enterprise", "$1.6M", "+18%"], ["Starter", "$0.5M", "+12%"]] } },
    { layout: "two-col", title: "Strengths & Opportunities", left: "Strong brand recognition\nLow churn rate (2.1%)\nBest-in-class NPS score\nScalable infrastructure", right: "Expand APAC market\nLaunch mobile app Q2\nPartner integrations\nSelf-serve onboarding" },
  ],
}, null, 2);

// ---------- Validation ----------
function validatePresentation(raw: unknown): { data: PresentationData; errors: string[] } {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { data: { slides: [] }, errors: ["Root must be a JSON object with a `slides` array."] };
  }
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.slides) || obj.slides.length === 0) {
    errors.push('`slides` must be a non-empty array.');
  }
  const slides: SlideData[] = [];
  if (Array.isArray(obj.slides)) {
    obj.slides.forEach((s: unknown, i: number) => {
      const idx = i + 1;
      if (!s || typeof s !== "object" || Array.isArray(s)) { errors.push(`Slide ${idx}: must be an object.`); return; }
      const slide = s as Record<string, unknown>;
      if (!VALID_LAYOUTS.includes(slide.layout as SlideLayout)) {
        errors.push(`Slide ${idx}: "layout" must be one of: ${VALID_LAYOUTS.join(", ")}.`);
        return;
      }
      const layout = slide.layout as SlideLayout;
      if (layout === "bullets" && (!Array.isArray(slide.bullets) || slide.bullets.length === 0)) {
        errors.push(`Slide ${idx} (bullets): "bullets" must be a non-empty string array.`);
      }
      if (layout === "table") {
        const t = slide.table as Record<string, unknown> | undefined;
        if (!t || !Array.isArray(t.headers) || !Array.isArray(t.rows)) {
          errors.push(`Slide ${idx} (table): "table" must have "headers" and "rows" arrays.`);
        }
      }
      slides.push(slide as SlideData);
    });
  }
  return {
    data: {
      title: typeof obj.title === "string" ? obj.title : "Presentation",
      theme: VALID_LAYOUTS.includes(obj.theme as SlideLayout) ? undefined : (obj.theme as ThemeName | undefined),
      slides,
    },
    errors,
  };
}

// ---------- PPTX Builder ----------
async function buildPptx(data: PresentationData, themeName: ThemeName, fileName: string) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  const theme = THEMES[themeName];

  pptx.layout = "LAYOUT_WIDE";
  pptx.title = data.title ?? "Presentation";

  for (const s of data.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };

    if (s.layout === "title") {
      // Bottom accent bar
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 4.8, w: 10, h: 0.5, fill: { color: theme.accent }, line: { width: 0 } });
      slide.addText(s.title ?? "", { x: 0.5, y: 1.2, w: 9, h: 1.8, fontSize: 40, bold: true, color: theme.titleColor, align: "center", valign: "middle" });
      // Divider line
      slide.addShape(pptx.ShapeType.rect, { x: 3.5, y: 3.15, w: 3, h: 0.06, fill: { color: theme.accent }, line: { width: 0 } });
      if (s.subtitle) slide.addText(s.subtitle, { x: 0.5, y: 3.35, w: 9, h: 0.9, fontSize: 18, color: theme.textColor, align: "center", italic: true });
    }

    if (s.layout === "content" || s.layout === "bullets" || s.layout === "table" || s.layout === "two-col") {
      // Header band
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: theme.headerBg }, line: { width: 0 } });
      slide.addText(s.title ?? "", { x: 0.4, y: 0.12, w: 9.2, h: 0.88, fontSize: 24, bold: true, color: theme.headerText, valign: "middle" });
    }

    if (s.layout === "content") {
      slide.addText(s.content ?? "", { x: 0.5, y: 1.3, w: 9, h: 4.1, fontSize: 18, color: theme.textColor, valign: "top", wrap: true });
    }

    if (s.layout === "bullets") {
      const items = (s.bullets ?? []).map((b) => ({
        text: b,
        options: { bullet: { type: "bullet" as const }, fontSize: 18, color: theme.textColor, paraSpaceBefore: 8 } as object,
      }));
      if (items.length) slide.addText(items, { x: 0.5, y: 1.3, w: 9, h: 4.1 });
    }

    if (s.layout === "table" && s.table) {
      const headerRow = s.table.headers.map((h) => ({
        text: h,
        options: { bold: true, color: theme.headerText, fill: { color: theme.headerBg }, align: "center" as const },
      }));
      const dataRows = s.table.rows.map((row) =>
        row.map((cell) => ({ text: cell, options: { color: theme.textColor } }))
      );
      const colCount = s.table.headers.length;
      slide.addTable([headerRow, ...dataRows], {
        x: 0.5, y: 1.3, w: 9,
        colW: Array(colCount).fill(9 / colCount),
        rowH: 0.5,
        fontSize: 15,
        border: { type: "solid", pt: 1, color: "e2e8f0" },
      });
    }

    if (s.layout === "two-col") {
      slide.addShape(pptx.ShapeType.rect, { x: 4.92, y: 1.3, w: 0.04, h: 4.0, fill: { color: theme.accent }, line: { width: 0 } });
      const toItems = (text: string) => (text ?? "").split("\n").filter(Boolean).map((l) => ({
        text: l,
        options: { bullet: { type: "bullet" as const }, fontSize: 16, color: theme.textColor, paraSpaceBefore: 6 } as object,
      }));
      const left = toItems(s.left ?? "");
      const right = toItems(s.right ?? "");
      if (left.length) slide.addText(left, { x: 0.5, y: 1.3, w: 4.2, h: 4.0 });
      if (right.length) slide.addText(right, { x: 5.1, y: 1.3, w: 4.4, h: 4.0 });
    }
  }

  await pptx.writeFile({ fileName });
}

// ---------- Layout badge colors ----------
const LAYOUT_BADGE: Record<SlideLayout, string> = {
  title: "bg-indigo-100 text-indigo-700",
  bullets: "bg-blue-100 text-blue-700",
  content: "bg-green-100 text-green-700",
  table: "bg-amber-100 text-amber-700",
  "two-col": "bg-purple-100 text-purple-700",
};

// ---------- Page ----------
export default function JsonToPptxPage() {
  const [json, setJson] = useState(SAMPLE_JSON);
  const [theme, setTheme] = useState<ThemeName>("blue");
  const [fileName, setFileName] = useState("presentation");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Live parse + validate
  const parsed = useMemo(() => {
    try {
      const raw = JSON.parse(json);
      const { data, errors } = validatePresentation(raw);
      // Auto-apply theme from JSON if valid
      if (data.theme && THEMES[data.theme]) {
        // don't override user selection, just report
      }
      return { data, errors, jsonError: null };
    } catch (e) {
      return { data: null, errors: [], jsonError: (e as Error).message };
    }
  }, [json]);

  const hasErrors = parsed.jsonError || parsed.errors.length > 0;
  const slides = parsed.data?.slides ?? [];

  const handleGenerate = useCallback(async () => {
    if (!parsed.data || hasErrors) return;
    setProcessing(true);
    setSuccess(false);
    try {
      // Use theme from JSON if it's valid, else use selected
      const effectiveTheme = (parsed.data.theme && THEMES[parsed.data.theme]) ? parsed.data.theme : theme;
      await buildPptx(parsed.data, effectiveTheme, fileName.trim() || "presentation");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setProcessing(false);
    }
  }, [parsed.data, hasErrors, theme, fileName]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileJson}
          title="JSON to PPTX"
          description="Convert structured JSON data to a polished PowerPoint presentation — 5 layouts, 5 themes. Free, instant, runs entirely in your browser."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Editor + Controls */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
              {/* JSON Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">Presentation JSON</label>
                  <button
                    onClick={() => { setJson(SAMPLE_JSON); setSuccess(false); }}
                    className="text-xs text-primary hover:text-primary font-semibold transition-colors"
                  >
                    Load sample →
                  </button>
                </div>
                <textarea
                  value={json}
                  onChange={(e) => { setJson(e.target.value); setSuccess(false); setParseError(null); }}
                  spellCheck={false}
                  className="w-full h-72 rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs font-mono text-foreground resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                  placeholder='{ "slides": [{ "layout": "title", "title": "My Presentation" }] }'
                />
              </div>

              {/* JSON errors */}
              {parsed.jsonError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-700">Invalid JSON</p>
                    <p className="text-xs text-red-600 mt-0.5">{parsed.jsonError}</p>
                  </div>
                </div>
              )}
              {!parsed.jsonError && parsed.errors.length > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1">
                  {parsed.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">{e}</p>
                    </div>
                  ))}
                </div>
              )}
              {parseError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">{parseError}</div>
              )}

              {/* Theme */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Theme</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(THEMES) as [ThemeName, ThemeConfig][]).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        theme === key ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-white/50 shadow-sm" style={{ background: t.swatch }} />
                      {t.label}
                    </button>
                  ))}
                </div>
                {parsed.data?.theme && THEMES[parsed.data.theme] && parsed.data.theme !== theme && (
                  <p className="text-xs text-foreground-muted mt-1.5">
                    Your JSON specifies theme <strong>{parsed.data.theme}</strong> — it will override your selection above.
                  </p>
                )}
              </div>

              {/* File name */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Output filename</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors w-48"
                    placeholder="presentation"
                  />
                  <span className="text-sm text-foreground-muted">.pptx</span>
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={processing || !!hasErrors}
                className="btn btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Building PPTX…</>
                ) : success ? (
                  <><Check className="w-4 h-4 text-green-400" /> Downloaded!</>
                ) : (
                  <><Download className="w-4 h-4" /> Generate & Download PPTX</>
                )}
              </button>
            </div>

            {/* Schema reference */}
            <div className="glass-panel rounded-[16px] p-5">
              <h3 className="text-xs font-semibold text-foreground mb-3">JSON Schema Reference</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-foreground-muted">
                <div>
                  <p className="font-semibold text-foreground mb-1">Root fields</p>
                  <ul className="space-y-1">
                    <li><code className="bg-surface-2 px-1 rounded">title</code> — Presentation title (string)</li>
                    <li><code className="bg-surface-2 px-1 rounded">theme</code> — blue · dark · green · red · light</li>
                    <li><code className="bg-surface-2 px-1 rounded">slides</code> — Array of slide objects</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Layouts</p>
                  <ul className="space-y-1">
                    <li><code className="bg-surface-2 px-1 rounded">title</code> — title, subtitle</li>
                    <li><code className="bg-surface-2 px-1 rounded">bullets</code> — title, bullets[ ]</li>
                    <li><code className="bg-surface-2 px-1 rounded">content</code> — title, content</li>
                    <li><code className="bg-surface-2 px-1 rounded">table</code> — title, table.headers[ ], table.rows[ ][ ]</li>
                    <li><code className="bg-surface-2 px-1 rounded">two-col</code> — title, left, right</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Slide preview */}
          <div className="space-y-4">
            <div className="glass-panel rounded-[16px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Presentation className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold text-foreground">
                  Slide Preview
                  {slides.length > 0 && (
                    <span className="ml-1.5 text-foreground-muted font-normal">({slides.length} slide{slides.length !== 1 ? "s" : ""})</span>
                  )}
                </h3>
              </div>

              {slides.length === 0 ? (
                <p className="text-xs text-foreground-muted text-center py-8">
                  Paste valid JSON to see a slide list
                </p>
              ) : (
                <ol className="space-y-2">
                  {slides.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-1 border border-border">
                      <span className="text-[10px] font-bold text-foreground-muted mt-0.5 w-4 shrink-0">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${LAYOUT_BADGE[s.layout as SlideLayout] ?? "bg-gray-100 text-gray-600"}`}>
                            {s.layout}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">{s.title || <em className="text-foreground-muted">Untitled</em>}</p>
                        {s.layout === "bullets" && s.bullets && (
                          <p className="text-[10px] text-foreground-muted mt-0.5">{s.bullets.length} bullet{s.bullets.length !== 1 ? "s" : ""}</p>
                        )}
                        {s.layout === "table" && s.table && (
                          <p className="text-[10px] text-foreground-muted mt-0.5">{s.table.rows.length} row{s.table.rows.length !== 1 ? "s" : ""} × {s.table.headers.length} col{s.table.headers.length !== 1 ? "s" : ""}</p>
                        )}
                        {s.layout === "title" && s.subtitle && (
                          <p className="text-[10px] text-foreground-muted mt-0.5 truncate">{s.subtitle}</p>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-foreground-muted shrink-0 mt-0.5" />
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Quick add examples */}
            <div className="glass-panel rounded-[16px] p-5">
              <h3 className="text-xs font-semibold text-foreground mb-3">Quick Snippets</h3>
              <div className="space-y-2 text-xs font-mono text-foreground-muted">
                {[
                  { label: "Title slide", snippet: '{"layout":"title","title":"Hello","subtitle":"World"}' },
                  { label: "Bullets", snippet: '{"layout":"bullets","title":"Points","bullets":["A","B","C"]}' },
                  { label: "Table", snippet: '{"layout":"table","title":"Data","table":{"headers":["Col"],"rows":[["Val"]]}}' },
                ].map((q) => (
                  <div key={q.label}>
                    <p className="text-foreground-secondary font-sans font-semibold mb-0.5">{q.label}</p>
                    <pre className="bg-surface-1 border border-border rounded p-1.5 text-[10px] overflow-x-auto whitespace-pre-wrap break-all">{q.snippet}</pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Client-Side</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                PPTX generation runs in your browser using pptxgenjs. Your JSON data never leaves your device.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">5 Layouts × 5 Themes</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Title, bullets, content, table, and two-column layouts. Five professional color themes. Automate report generation from any JSON data source.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
