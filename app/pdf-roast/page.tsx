"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Download,
  RefreshCw,
  ScrollText,
  FileText,
  Shield,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PDFStats {
  version: string;
  versionNum: number;
  pageCount: number;
  fontCount: number;
  imageCount: number;
  hasJS: boolean;
  hasForms: boolean;
  hasEncryption: boolean;
  isLinearized: boolean;
  hasTitle: boolean;
  hasAuthor: boolean;
  objectCount: number;
  imagePct: number;
  fontPct: number;
}

interface PDFMetrics {
  efficiency: number;
  fonts: number;
  images: number;
  safety: number;
  metadata: number;
  version: number;
  overall: number;
}

interface PDFResult {
  metrics: PDFMetrics;
  stats: PDFStats;
  fileName: string;
  fileSize: number;
  grade: GradeInfo;
  badge: BadgeInfo;
  overallRoast: string;
  roasts: Record<string, string>;
  scanPartial: boolean;
}

interface GradeInfo {
  grade: string;
  color: string;
  bg: string;
  label: string;
}

interface BadgeInfo {
  emoji: string;
  text: string;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_MSGS = [
  "Cracking open your PDF…",
  "Counting every embedded font…",
  "Looking for JavaScript (suspicious)…",
  "Checking if this could have been an email…",
  "Measuring image bloat…",
  "Consulting the metadata council…",
  "Evaluating version choices…",
  "Verifying you didn't embed a whole photo album…",
  "Running the professionalism check…",
  "Preparing your score card…",
];

const METRICS_CONFIG = [
  { key: "efficiency", label: "Size Efficiency", icon: "💾", desc: "KB per page" },
  { key: "fonts", label: "Font Load", icon: "🔤", desc: "Embedded font count" },
  { key: "images", label: "Image Load", icon: "🖼️", desc: "Embedded image objects" },
  { key: "safety", label: "Safety", icon: "🛡️", desc: "No JavaScript or risky actions" },
  { key: "metadata", label: "Metadata", icon: "📋", desc: "Title & author completeness" },
  { key: "version", label: "PDF Version", icon: "📄", desc: "Format compatibility" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGrade(score: number): GradeInfo {
  if (score >= 90) return { grade: "S", color: "#10b981", bg: "#d1fae5", label: "Elite Tier" };
  if (score >= 80) return { grade: "A", color: "#22c55e", bg: "#dcfce7", label: "Excellent" };
  if (score >= 70) return { grade: "B", color: "#84cc16", bg: "#ecfccb", label: "Good" };
  if (score >= 60) return { grade: "C", color: "#eab308", bg: "#fef9c3", label: "Average" };
  if (score >= 45) return { grade: "D", color: "#f97316", bg: "#ffedd5", label: "Needs Work" };
  return { grade: "F", color: "#ef4444", bg: "#fee2e2", label: "Yikes" };
}

function getBadge(score: number): BadgeInfo {
  if (score >= 88) return { emoji: "🏆", text: "Professional Grade", color: "#10b981" };
  if (score >= 75) return { emoji: "✅", text: "Share Worthy", color: "#22c55e" };
  if (score >= 60) return { emoji: "😐", text: "It Is What It Is", color: "#eab308" };
  if (score >= 45) return { emoji: "📋", text: "Needs Attention", color: "#f97316" };
  return { emoji: "💀", text: "We're Concerned", color: "#ef4444" };
}

function getOverallRoast(score: number): string {
  if (score >= 90) return "Legitimately professional. This PDF respects everyone's time.";
  if (score >= 80) return "Solid and well-made. No complaints from us.";
  if (score >= 70) return "Pretty good. A few rough edges, but nothing alarming.";
  if (score >= 60) return "Gets the job done. Questionable choices, but functional.";
  if (score >= 50) return "We've seen worse PDFs. Not many, but a few.";
  if (score >= 35) return "This PDF is a cry for help disguised as a document.";
  return "This PDF is why people say 'just send it as a Word doc.'";
}

function getRoast(key: string, score: number): string {
  const map: Record<string, Array<[number, string]>> = {
    efficiency: [
      [12, "This PDF is heavier than a printed encyclopedia. For some reason."],
      [28, "Extremely bloated. Did you embed actual photographs of each word?"],
      [45, "Very heavy. Your recipients will feel it."],
      [62, "A bit heavy, but in a 'big boned' kind of way."],
      [78, "Reasonable size. No urgent complaints."],
      [92, "Lean and efficient. Appreciated."],
      [Infinity, "Almost pure text. Maximum efficiency achieved."],
    ],
    fonts: [
      [18, "You've embedded more fonts than a typography museum."],
      [38, "Font overload. Serif, sans-serif, decorative, bold italic — all in one doc."],
      [58, "More fonts than strictly necessary. But bold choices were made."],
      [74, "Reasonable number of fonts. Respectable."],
      [88, "Clean font usage. Minimal and intentional."],
      [Infinity, "Minimal or no embedded fonts. Fast and lean."],
    ],
    images: [
      [18, "This is less a document and more an image gallery with captions."],
      [38, "Heavy image load. Have you considered compression?"],
      [55, "A fair number of images. Could be leaner."],
      [72, "Moderate image use. Acceptable."],
      [88, "Light on images. Clean document structure."],
      [Infinity, "Minimal to no embedded images. Text-focused efficiency."],
    ],
    safety: [
      [15, "JavaScript detected. Your PDF wants to run code. We have questions."],
      [40, "Risky elements present. Proceed with caution."],
      [65, "Mostly clean. A few raised eyebrows."],
      [Infinity, "No JavaScript. No risky actions. Clean and safe to share."],
    ],
    metadata: [
      [20, "No title, no author. Mysterious. Also unprofessional."],
      [45, "Partially documented. Half-committed."],
      [70, "Decent metadata. Could be more complete."],
      [Infinity, "Properly documented with title and author. Professional."],
    ],
    version: [
      [38, "Ancient PDF version. This document predates most internet memes."],
      [58, "Outdated PDF version. Consider re-exporting."],
      [75, "Acceptable PDF version. Gets the job done."],
      [Infinity, "Modern PDF version. Good compatibility everywhere."],
    ],
  };
  const entries = map[key] ?? [];
  for (const [threshold, line] of entries) {
    if (score <= threshold) return line;
  }
  return "Solid.";
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function barColor(s: number): string {
  if (s >= 80) return "#22c55e";
  if (s >= 65) return "#84cc16";
  if (s >= 50) return "#eab308";
  if (s >= 35) return "#f97316";
  return "#ef4444";
}

// ─── PDF Parser ───────────────────────────────────────────────────────────────

function parsePDFBytes(bytes: Uint8Array, fileSize: number): PDFStats {
  const text = new TextDecoder("latin1").decode(bytes);

  const versionMatch = text.match(/%PDF-(\d+\.\d+)/);
  const version = versionMatch?.[1] ?? "1.4";
  const versionNum = parseFloat(version);

  const hasJS = /\/JavaScript|\/JS[\s(]/.test(text);
  const hasForms = /\/AcroForm/.test(text);
  const hasEncryption = /\/Encrypt\b/.test(text);
  const isLinearized = /\/Linearized/.test(text);
  const hasTitle = /\/Title\s*[\(<]/.test(text);
  const hasAuthor = /\/Author\s*[\(<]/.test(text);

  // Page count: count /Type /Page (most accurate), fallback to /Count
  const pageTypeCount = (text.match(/\/Type\s*\/Page\b/g) ?? []).length;
  const countMatches = [...text.matchAll(/\/Count\s+(\d+)/g)].map((m) => parseInt(m[1]));
  const pageCount = pageTypeCount > 0
    ? pageTypeCount
    : countMatches.length > 0
    ? Math.max(...countMatches)
    : 1;

  // Object breakdown
  const objPattern = /\b\d+\s+\d+\s+obj\b/g;
  const offsets: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = objPattern.exec(text)) !== null) offsets.push(m.index);
  const objectCount = offsets.length;
  offsets.push(text.length);

  let fontBytes = 0, fontCount = 0;
  let imageBytes = 0, imageCount = 0;

  for (let i = 0; i < offsets.length - 1; i++) {
    const size = offsets[i + 1] - offsets[i];
    const hdr = text.slice(offsets[i], Math.min(offsets[i] + 400, offsets[i + 1]));
    if (/\/Type\s*\/Font|\/Subtype\s*\/(Type1|TrueType|CIDFont|Type0|OpenType|CIDFontType)/.test(hdr)) {
      fontCount++;
      fontBytes += size;
    } else if (/\/Subtype\s*\/Image/.test(hdr)) {
      imageCount++;
      imageBytes += size;
    }
  }

  // Scale to real file size
  const rawTotal = offsets.length > 1 ? offsets[offsets.length - 1] - offsets[0] : text.length;
  const scale = rawTotal > 0 ? fileSize / rawTotal : 1;
  const imagePct = Math.min(95, Math.round((imageBytes * scale) / fileSize * 100));
  const fontPct = Math.min(95, Math.round((fontBytes * scale) / fileSize * 100));

  return {
    version,
    versionNum,
    pageCount: Math.max(1, pageCount),
    fontCount,
    imageCount,
    hasJS,
    hasForms,
    hasEncryption,
    isLinearized,
    hasTitle,
    hasAuthor,
    objectCount,
    imagePct,
    fontPct,
  };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function efficiencyScore(fileSize: number, pageCount: number): number {
  const kbPerPage = fileSize / 1024 / Math.max(1, pageCount);
  if (kbPerPage < 8) return 98;
  if (kbPerPage < 30) return 92;
  if (kbPerPage < 80) return 82;
  if (kbPerPage < 200) return 68;
  if (kbPerPage < 500) return 50;
  if (kbPerPage < 1500) return 32;
  if (kbPerPage < 4000) return 18;
  return 8;
}

function fontScore(fontCount: number): number {
  if (fontCount === 0) return 62; // No embedded fonts — may look different on other machines
  if (fontCount <= 2) return 96;
  if (fontCount <= 4) return 88;
  if (fontCount <= 7) return 74;
  if (fontCount <= 12) return 56;
  if (fontCount <= 20) return 38;
  return Math.max(10, 38 - Math.round((fontCount - 20) * 1.2));
}

function imageScore(imageCount: number, imagePct: number): number {
  if (imageCount === 0) return 88;
  // Penalize for count AND proportion of file size
  let s = 88;
  if (imageCount > 5) s -= Math.min(30, (imageCount - 5) * 2.5);
  if (imagePct > 60) s -= Math.min(30, (imagePct - 60) * 0.8);
  return Math.max(8, Math.round(s));
}

function safetyScore(hasJS: boolean): number {
  if (hasJS) return 18;
  return 95;
}

function metadataScore(hasTitle: boolean, hasAuthor: boolean): number {
  if (hasTitle && hasAuthor) return 95;
  if (hasTitle || hasAuthor) return 62;
  return 18;
}

function versionScore(v: number): number {
  if (v >= 1.7) return 92;
  if (v >= 1.6) return 84;
  if (v >= 1.5) return 76;
  if (v >= 1.4) return 66;
  if (v >= 1.3) return 52;
  if (v >= 1.2) return 38;
  return 22;
}

function scannedSuspicion(stats: PDFStats): number {
  let s = 5;
  // Many images with few fonts per page = likely scanned
  const imagesPerPage = stats.imageCount / Math.max(1, stats.pageCount);
  if (imagesPerPage >= 0.8) s += 35;
  else if (imagesPerPage >= 0.4) s += 18;
  // Image takes up most of the file
  if (stats.imagePct > 70) s += 25;
  else if (stats.imagePct > 40) s += 12;
  // Few fonts but has images
  if (stats.fontCount < 2 && stats.imageCount > 0) s += 15;
  return Math.min(95, s);
}

// ─── Main analysis ────────────────────────────────────────────────────────────

async function analyzePDF(file: File): Promise<PDFResult> {
  // Read up to 10MB for analysis (first 5MB + last 5MB for large files)
  const SAMPLE = 5 * 1024 * 1024;
  let bytes: Uint8Array;
  if (file.size <= SAMPLE * 2) {
    bytes = new Uint8Array(await file.arrayBuffer());
  } else {
    const head = new Uint8Array(await file.slice(0, SAMPLE).arrayBuffer());
    const tail = new Uint8Array(await file.slice(-SAMPLE).arrayBuffer());
    bytes = new Uint8Array(head.length + tail.length);
    bytes.set(head, 0);
    bytes.set(tail, head.length);
  }

  // Must start with %PDF-
  const header = String.fromCharCode(...bytes.slice(0, 8));
  if (!header.startsWith("%PDF-")) throw new Error("Not a valid PDF file");

  const stats = parsePDFBytes(bytes, file.size);
  const scanPartial = file.size > SAMPLE * 2;

  const efficiency = efficiencyScore(file.size, stats.pageCount);
  const fonts = fontScore(stats.fontCount);
  const images = imageScore(stats.imageCount, stats.imagePct);
  const safety = safetyScore(stats.hasJS);
  const metadata = metadataScore(stats.hasTitle, stats.hasAuthor);
  const version = versionScore(stats.versionNum);

  const overall = Math.round(
    efficiency * 0.25 + fonts * 0.18 + images * 0.15 +
    safety * 0.20 + metadata * 0.12 + version * 0.10
  );

  const metrics: PDFMetrics = { efficiency, fonts, images, safety, metadata, version, overall };

  return {
    metrics,
    stats,
    fileName: file.name,
    fileSize: file.size,
    grade: getGrade(overall),
    badge: getBadge(overall),
    overallRoast: getOverallRoast(overall),
    scanPartial,
    roasts: {
      efficiency: getRoast("efficiency", efficiency),
      fonts: getRoast("fonts", fonts),
      images: getRoast("images", images),
      safety: getRoast("safety", safety),
      metadata: getRoast("metadata", metadata),
      version: getRoast("version", version),
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PDFRoastPage() {
  const [phase, setPhase] = useState<"upload" | "analyzing" | "result">("upload");
  const [result, setResult] = useState<PDFResult | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [barReady, setBarReady] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const scoreCardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "analyzing") {
      intervalRef.current = setInterval(() => setMsgIdx((m) => (m + 1) % LOADING_MSGS.length), 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  useEffect(() => {
    if (phase === "result") {
      const t = setTimeout(() => setBarReady(true), 120);
      return () => clearTimeout(t);
    }
    setBarReady(false);
  }, [phase]);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a PDF file.");
      return;
    }
    setPhase("analyzing");
    setMsgIdx(0);
    try {
      const r = await analyzePDF(file);
      setResult(r);
      setPhase("result");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to analyze this PDF.";
      alert(msg + " Please try a different file.");
      setPhase("upload");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDrag(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const downloadCard = async () => {
    if (!scoreCardRef.current || !result) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(scoreCardRef.current, { scale: 2, useCORS: true, logging: false });
      const a = document.createElement("a");
      a.download = `pdf-roast-${result.fileName.replace(/\.pdf$/i, "")}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => { setPhase("upload"); setResult(null); setBarReady(false); };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="max-w-[900px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <Link
            href="/pdf-tools"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PDF Tools
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <ScrollText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="type-h1 font-display gradient-text mb-2">
                PDF Roast &amp; Quality Score
              </h1>
              <p className="text-foreground-secondary text-base leading-relaxed max-w-2xl">
                Upload any PDF and get a brutally honest quality score across 6 metrics — size efficiency,
                font load, embedded images, safety, metadata, and PDF version. Download a shareable score card.
                100% private, nothing is uploaded.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 md:px-6 lg:px-8 pb-16">

        {/* ─── Upload Phase ──────────────────────────────────────────────────── */}
        {phase === "upload" && (
          <div
            className={`mt-6 border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center transition-colors duration-200 cursor-pointer ${
              isDrag ? "border-primary bg-primary/5" : "border-border hover:border-primary/60"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
            onDragLeave={() => setIsDrag(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="application/pdf,.pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div className="w-16 h-16 rounded-2xl bg-primary-muted border border-primary-border flex items-center justify-center mx-auto mb-5">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h2 className="type-h2 font-semibold text-foreground mb-2">
              Drop your PDF here
            </h2>
            <p className="text-foreground-secondary mb-6">
              Any PDF — reports, invoices, presentations, scanned documents
            </p>
            <button className="btn-primary px-6 py-2.5">
              Choose PDF
            </button>
          </div>
        )}

        {/* ─── Analyzing Phase ───────────────────────────────────────────────── */}
        {phase === "analyzing" && (
          <div className="mt-6 glass-card-premium p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-muted border border-primary-border flex items-center justify-center mx-auto mb-6 animate-pulse">
              <ScrollText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="type-h2 font-semibold text-foreground mb-3">Roasting your PDF…</h2>
            <p className="text-foreground-secondary text-base min-h-[1.5em] transition-all duration-300">
              {LOADING_MSGS[msgIdx]}
            </p>
          </div>
        )}

        {/* ─── Result Phase ──────────────────────────────────────────────────── */}
        {phase === "result" && result && (
          <>
            {/* ── Overall Score ───────────────────────────────────────────────── */}
            <div className="mt-6 glass-card-premium p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* PDF icon */}
                <div className="w-20 h-24 rounded-xl bg-red-50 border border-red-200/60 flex flex-col items-center justify-center shrink-0 gap-1">
                  <FileText className="w-8 h-8 text-red-500" />
                  <span className="text-xs font-bold text-red-500 tracking-wide">PDF</span>
                </div>

                {/* Score */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-foreground-secondary text-sm mb-0.5 truncate max-w-[300px]">
                        {result.fileName}
                      </p>
                      <p className="text-foreground-secondary text-xs">
                        {fmtBytes(result.fileSize)} &nbsp;·&nbsp; {result.stats.pageCount}{" "}
                        {result.stats.pageCount === 1 ? "page" : "pages"} &nbsp;·&nbsp; PDF&nbsp;
                        {result.stats.version}
                        {result.scanPartial && (
                          <span className="ml-2 text-amber-600">(large file — partial scan)</span>
                        )}
                      </p>
                    </div>
                    {/* Grade badge */}
                    <div
                      className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-2xl leading-none"
                      style={{ background: result.grade.bg, color: result.grade.color }}
                    >
                      {result.grade.grade}
                      <span className="text-[10px] font-semibold mt-0.5" style={{ color: result.grade.color }}>
                        {result.grade.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold tabular-nums" style={{ color: result.grade.color }}>
                        {result.metrics.overall}
                      </span>
                      <span className="text-foreground-secondary text-lg">/100</span>
                    </div>
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ background: result.badge.color + "22", color: result.badge.color }}
                    >
                      {result.badge.emoji} {result.badge.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roast quote */}
              <div className="mt-5 rounded-xl border border-border bg-surface/50 px-5 py-4">
                <p className="text-foreground italic text-base">
                  &ldquo;{result.overallRoast}&rdquo;
                </p>
              </div>
            </div>

            {/* ── Quick Stats Panel ───────────────────────────────────────────── */}
            <div className="mt-5 glass-card-premium p-5">
              <h3 className="font-semibold text-foreground mb-4 text-sm">Quick Facts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatChip label="Pages" value={String(result.stats.pageCount)} />
                <StatChip label="Embedded Fonts" value={String(result.stats.fontCount)} />
                <StatChip label="Embedded Images" value={String(result.stats.imageCount)} />
                <StatChip label="PDF Objects" value={String(result.stats.objectCount)} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.stats.hasJS && (
                  <FlagPill color="red" icon="⚠️" text="Contains JavaScript" />
                )}
                {result.stats.hasEncryption && (
                  <FlagPill color="blue" icon="🔒" text="Password Protected" />
                )}
                {result.stats.hasForms && (
                  <FlagPill color="purple" icon="📝" text="Has Form Fields" />
                )}
                {result.stats.isLinearized && (
                  <FlagPill color="green" icon="⚡" text="Linearized (Fast Web View)" />
                )}
                {result.stats.hasTitle && (
                  <FlagPill color="green" icon="📌" text="Has Title Metadata" />
                )}
                {result.stats.hasAuthor && (
                  <FlagPill color="green" icon="👤" text="Has Author Metadata" />
                )}
                {!result.stats.hasTitle && !result.stats.hasAuthor && (
                  <FlagPill color="amber" icon="📭" text="No Metadata" />
                )}
              </div>
            </div>

            {/* ── Metric Grid ─────────────────────────────────────────────────── */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METRICS_CONFIG.map(({ key, label, icon, desc }) => {
                const score = result.metrics[key as keyof PDFMetrics] as number;
                const roast = result.roasts[key];
                const c = barColor(score);
                return (
                  <div key={key} className="glass-card-premium p-5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{icon}</span>
                        <span className="font-semibold text-foreground">{label}</span>
                        <span className="text-xs text-foreground-secondary hidden sm:inline">{desc}</span>
                      </div>
                      <span className="text-xl font-bold tabular-nums" style={{ color: c }}>
                        {score}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-surface border border-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: barReady ? `${score}%` : "0%", background: c }}
                      />
                    </div>
                    <p className="mt-2.5 text-xs text-foreground-secondary italic">{roast}</p>
                  </div>
                );
              })}
            </div>

            {/* ── Scanned Document Detector ───────────────────────────────────── */}
            <div className="mt-5 glass-card-premium p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/50 flex items-center justify-center shrink-0 text-lg">
                🔬
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">Scanned Document Detector</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Heuristic</span>
                </div>
                {(() => {
                  const sus = scannedSuspicion(result.stats);
                  const c = sus > 60 ? "#f97316" : sus > 30 ? "#eab308" : "#22c55e";
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-2 rounded-full bg-surface border border-border overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: barReady ? `${sus}%` : "0%", background: c }}
                          />
                        </div>
                        <span className="text-lg font-bold tabular-nums shrink-0" style={{ color: c }}>
                          {sus}%
                        </span>
                      </div>
                      <p className="text-xs text-foreground-secondary">
                        {sus >= 65
                          ? "High image-to-font ratio detected. This is likely a scanned document — text may not be searchable or copyable. Consider running OCR."
                          : sus >= 35
                          ? "Some characteristics of a scanned document (relatively high image count vs. font count). May have limited text searchability."
                          : "Mostly text-based. Not likely a scanned document — text should be searchable and copyable."}
                        {" "}
                        <span className="italic opacity-70">(Heuristic — not definitive.)</span>
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* ── Shareable Score Card ────────────────────────────────────────── */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="type-h3 font-semibold text-foreground">Shareable Score Card</h2>
                <button
                  onClick={downloadCard}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors duration-150"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? "Generating…" : "Download PNG"}
                </button>
              </div>

              {/* Card – captured by html2canvas */}
              <div
                ref={scoreCardRef}
                style={{
                  background: "linear-gradient(135deg, #0f1117 0%, #1a1d2e 100%)",
                  borderRadius: 16,
                  padding: "24px",
                  maxWidth: 600,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {/* Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      📄
                    </div>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>PDF Roast</span>
                  </div>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>toolsz.co</span>
                </div>

                {/* File info + score */}
                <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 60, height: 72, borderRadius: 10, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 24 }}>📄</span>
                    <span style={{ color: "#f87171", fontSize: 10, fontWeight: 700 }}>PDF</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#d1d5db", fontSize: 13, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {result.fileName}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: 11, marginBottom: 10 }}>
                      {fmtBytes(result.fileSize)} · {result.stats.pageCount} page{result.stats.pageCount !== 1 ? "s" : ""} · PDF {result.stats.version}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 40, fontWeight: 900, color: result.grade.color, lineHeight: 1 }}>
                        {result.metrics.overall}
                      </span>
                      <span style={{ color: "#6b7280", fontSize: 18, lineHeight: 1 }}>/100</span>
                      <div style={{ padding: "4px 12px", borderRadius: 20, background: result.grade.bg, color: result.grade.color, fontWeight: 700, fontSize: 14 }}>
                        {result.grade.grade} — {result.grade.label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Roast quote */}
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                  <p style={{ color: "#e5e7eb", fontSize: 13, fontStyle: "italic", margin: 0 }}>
                    &ldquo;{result.overallRoast}&rdquo;
                  </p>
                </div>

                {/* Metric bars */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                  {METRICS_CONFIG.map(({ key, label, icon }) => {
                    const score = result.metrics[key as keyof PDFMetrics] as number;
                    const c = barColor(score);
                    return (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "#9ca3af", fontSize: 11 }}>{icon} {label}</span>
                          <span style={{ color: c, fontSize: 12, fontWeight: 700 }}>{score}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${score}%`, background: c, borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Flags row */}
                <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.stats.hasJS && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}>⚠️ Has JS</span>
                  )}
                  {result.stats.hasEncryption && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(59,130,246,0.2)", color: "#93c5fd" }}>🔒 Encrypted</span>
                  )}
                  {result.stats.hasForms && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(139,92,246,0.2)", color: "#c4b5fd" }}>📝 Has Forms</span>
                  )}
                  {result.stats.isLinearized && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(34,197,94,0.2)", color: "#86efac" }}>⚡ Linearized</span>
                  )}
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                    {result.stats.fontCount} font{result.stats.fontCount !== 1 ? "s" : ""}
                  </span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                    {result.stats.imageCount} image{result.stats.imageCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Recommendations ─────────────────────────────────────────────── */}
            <div className="mt-8">
              <h2 className="type-h3 font-semibold text-foreground mb-4">Recommendations</h2>
              <div className="flex flex-col gap-2.5">
                {result.metrics.efficiency < 55 && (
                  <RecoCard
                    icon="💾"
                    title="PDF is too large"
                    body="File size per page is high. Compressing it will help with sharing and loading."
                    href="/compress-pdf"
                    label="Open Compress PDF"
                  />
                )}
                {result.stats.hasJS && (
                  <RecoCard
                    icon="⚠️"
                    title="JavaScript detected"
                    body="Your PDF contains JavaScript which can be a security risk. Consider flattening or cleaning it."
                    href="/flatten-pdf"
                    label="Open Flatten PDF"
                  />
                )}
                {result.metrics.images < 50 && result.stats.imageCount > 0 && (
                  <RecoCard
                    icon="🖼️"
                    title="Image-heavy PDF"
                    body="Images are taking up a large proportion of this PDF. Compress it to reduce size."
                    href="/compress-pdf"
                    label="Open Compress PDF"
                  />
                )}
                {result.metrics.metadata < 55 && (
                  <RecoCard
                    icon="📋"
                    title="Missing metadata"
                    body="No title or author found. Add metadata to make this document more professional and searchable."
                    href="/pdf-editor"
                    label="Open PDF Editor"
                  />
                )}
                {scannedSuspicion(result.stats) >= 55 && (
                  <RecoCard
                    icon="🔬"
                    title="Possibly a scanned document"
                    body="This looks like a scanned PDF. Add a searchable text layer with PDF OCR."
                    href="/pdf-ocr"
                    label="Open PDF OCR"
                  />
                )}
                {result.metrics.overall >= 75 && (
                  <div className="glass-panel rounded-xl px-5 py-4 flex items-center gap-3">
                    <span className="text-xl">🎉</span>
                    <p className="text-sm text-foreground-secondary">
                      Overall quality looks solid. This PDF respects its readers.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Reset ───────────────────────────────────────────────────────── */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground-secondary hover:text-foreground hover:border-primary/50 text-sm font-medium transition-colors duration-150"
              >
                <RefreshCw className="w-4 h-4" />
                Roast Another PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface border border-border px-4 py-3 text-center">
      <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-foreground-secondary mt-0.5">{label}</p>
    </div>
  );
}

function FlagPill({
  color,
  icon,
  text,
}: {
  color: "red" | "blue" | "green" | "amber" | "purple";
  icon: string;
  text: string;
}) {
  const colors = {
    red: "bg-red-50 text-red-700 border-red-200/60",
    blue: "bg-blue-50 text-blue-700 border-blue-200/60",
    green: "bg-green-50 text-green-700 border-green-200/60",
    amber: "bg-amber-50 text-amber-700 border-amber-200/60",
    purple: "bg-purple-50 text-purple-700 border-purple-200/60",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-medium ${colors[color]}`}>
      {icon} {text}
    </span>
  );
}

function RecoCard({
  icon,
  title,
  body,
  href,
  label,
}: {
  icon: string;
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <div className="glass-panel rounded-xl px-5 py-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-foreground-secondary mt-0.5">{body}</p>
        </div>
      </div>
      <Link
        href={href}
        className="shrink-0 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
      >
        {label} →
      </Link>
    </div>
  );
}
