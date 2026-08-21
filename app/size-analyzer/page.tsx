"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Gauge,
  Loader2,
  ArrowRight,
  Shield,
  Share2,
  Image as ImageIcon,
  FileText,
  Type,
  Code,
  MessageSquare,
  HardDrive,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Segment {
  key: string;
  label: string;
  bytes: number;
  pct: number;
  color: string;
  count?: number;
  detail: string;
}

interface Rec {
  label: string;
  href: string;
  reason: string;
  highlight?: boolean;
}

interface AnalysisResult {
  type: "pdf" | "image";
  fileName: string;
  fileSize: number;
  segments: Segment[];
  keyFinding: string;
  recs: Rec[];
  // PDF
  pageCount?: number;
  pdfVersion?: string;
  hasJS?: boolean;
  hasForms?: boolean;
  hasEncryption?: boolean;
  // Image
  width?: number;
  height?: number;
  megapixels?: number;
  format?: string;
  dpi?: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(b: number): string {
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(2)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0;
}

// ─── JPEG / PNG chunk-level metadata size detection ───────────────────────────

function getJpegSegmentSizes(bytes: Uint8Array): { exif: number; icc: number; thumbnail: number; xmp: number } {
  const r = { exif: 0, icc: 0, thumbnail: 0, xmp: 0 };
  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) return r;
  let off = 2;
  while (off < bytes.length - 3) {
    if (bytes[off] !== 0xFF) break;
    const marker = bytes[off + 1];
    if (marker === 0xDA) break; // Start of Scan
    const len = (bytes[off + 2] << 8) | bytes[off + 3];
    const segLen = len + 2;
    if (marker === 0xE1) {
      // APP1 — EXIF or XMP
      const tag = String.fromCharCode(...bytes.slice(off + 4, off + 9));
      if (tag.startsWith("Exif")) r.exif += segLen;
      else if (tag.startsWith("http")) r.xmp += segLen;
    } else if (marker === 0xE2) {
      // APP2 — ICC
      r.icc += segLen;
    } else if (marker === 0xE0) {
      // APP0 — JFIF thumbnail
      const thumbW = bytes[off + 13], thumbH = bytes[off + 14];
      if (thumbW > 0 && thumbH > 0) r.thumbnail = thumbW * thumbH * 3;
    }
    off += segLen;
  }
  return r;
}

function getPngChunkSizes(bytes: Uint8Array): { exif: number; icc: number; text: number } {
  const r = { exif: 0, icc: 0, text: 0 };
  if (bytes.length < 8) return r;
  const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!PNG_SIG.every((b, i) => bytes[i] === b)) return r;
  let off = 8;
  const dec = new TextDecoder("latin1");
  while (off < bytes.length - 8) {
    const len = (bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];
    const type = dec.decode(bytes.slice(off + 4, off + 8));
    const total = 12 + len;
    if (type === "eXIf" || type === "zXIf") r.exif += total;
    else if (type === "iCCP") r.icc += total;
    else if (["tEXt", "zTXt", "iTXt"].includes(type)) r.text += total;
    else if (type === "IEND") break;
    off += total;
  }
  return r;
}

// ─── PDF scanner ──────────────────────────────────────────────────────────────

function scanPDF(bytes: Uint8Array, fileSize: number) {
  const text = new TextDecoder("latin1").decode(bytes);

  const version = text.match(/%PDF-(\d+\.\d+)/)?.[1] ?? "?";
  const hasJS   = /\/JavaScript|\/JS[\s(]/.test(text);
  const hasForms = /\/AcroForm/.test(text);
  const hasEncryption = /\/Encrypt\b/.test(text);
  const isLinearized  = /\/Linearized/.test(text);

  // Count /Type /Page — more reliable than /Count for actual pages
  const pageCount = (text.match(/\/Type\s*\/Page\b/g) ?? []).length ||
                    parseInt(text.match(/\/Count\s+(\d+)/)?.[1] ?? "1");

  // Find objects via "N G obj" pattern
  const objPattern = /\b\d+\s+\d+\s+obj\b/g;
  const offsets: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = objPattern.exec(text)) !== null) offsets.push(m.index);
  offsets.push(text.length);

  const buckets = {
    images:      { count: 0, bytes: 0 },
    fonts:       { count: 0, bytes: 0 },
    content:     { count: 0, bytes: 0 },
    metadata:    { count: 0, bytes: 0 },
    javascript:  { count: 0, bytes: 0 },
    annotations: { count: 0, bytes: 0 },
    other:       { count: 0, bytes: 0 },
  };

  for (let i = 0; i < offsets.length - 1; i++) {
    const size  = offsets[i + 1] - offsets[i];
    const hdr   = text.slice(offsets[i], Math.min(offsets[i] + 500, offsets[i + 1]));

    if (/\/Subtype\s*\/Image/.test(hdr)) {
      buckets.images.count++; buckets.images.bytes += size;
    } else if (/\/Type\s*\/Font|\/Subtype\s*\/(Type1|TrueType|CIDFont|Type0|OpenType|CIDFontType)/.test(hdr)) {
      buckets.fonts.count++; buckets.fonts.bytes += size;
    } else if (/\/Type\s*\/Metadata/.test(hdr) || /\/Title\s*\(|\/Author\s*\(|\/Creator\s*\(/.test(hdr)) {
      buckets.metadata.count++; buckets.metadata.bytes += size;
    } else if (/\/JavaScript|\/JS[\s(]/.test(hdr)) {
      buckets.javascript.count++; buckets.javascript.bytes += size;
    } else if (/\/Type\s*\/Annot|\/Subtype\s*\/(Text|Link|FreeText|Stamp|Widget|Highlight|Ink)/.test(hdr)) {
      buckets.annotations.count++; buckets.annotations.bytes += size;
    } else if (hdr.includes("stream")) {
      buckets.content.count++; buckets.content.bytes += size;
    } else {
      buckets.other.count++; buckets.other.bytes += size;
    }
  }

  // Normalize: scale buckets to match real file size (object scanning over-counts slightly)
  const rawTotal = Object.values(buckets).reduce((s, b) => s + b.bytes, 0);
  const scale    = rawTotal > 0 ? fileSize / rawTotal : 1;
  const entries  = Object.entries(buckets).map(([k, v]) => [k, { count: v.count, bytes: Math.round(v.bytes * scale) }]) as [string, { count: number; bytes: number }][];
  const scaled   = Object.fromEntries(entries) as typeof buckets;

  return { version, hasJS, hasForms, hasEncryption, isLinearized, pageCount, buckets: scaled };
}

// ─── Image analyzer ───────────────────────────────────────────────────────────

async function analyzeImage(file: File, bytes: Uint8Array): Promise<{
  width: number; height: number; dpi: number | null;
  exif: number; icc: number; thumb: number; xmpText: number;
}> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  let segs = { exif: 0, icc: 0, thumbnail: 0, xmp: 0, text: 0 };

  if (["jpg", "jpeg"].includes(ext)) {
    const j = getJpegSegmentSizes(bytes);
    segs = { exif: j.exif, icc: j.icc, thumbnail: j.thumbnail, xmp: j.xmp, text: 0 };
  } else if (ext === "png") {
    const p = getPngChunkSizes(bytes);
    segs = { exif: p.exif, icc: p.icc, thumbnail: 0, xmp: 0, text: p.text };
  }

  // Get image dimensions and DPI via canvas
  const objUrl = URL.createObjectURL(file);
  const img = new Image();
  img.src = objUrl;
  await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); });
  URL.revokeObjectURL(objUrl);

  // Try to get DPI from exifr
  let dpi: number | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exifr = (await import("exifr")) as any;
    const meta = await exifr.parse(file, { tiff: true });
    dpi = meta?.XResolution ?? meta?.YResolution ?? null;
    if (dpi && dpi < 1) dpi = null; // guard
  } catch { /* exifr unavailable */ }

  return {
    width: img.naturalWidth || 0,
    height: img.naturalHeight || 0,
    dpi,
    exif: segs.exif,
    icc: segs.icc,
    thumb: segs.thumbnail,
    xmpText: segs.xmp + segs.text,
  };
}

// ─── Build result ─────────────────────────────────────────────────────────────

const SEG_COLORS: Record<string, string> = {
  images:      "#6366f1",
  fonts:       "#10b981",
  content:     "#f59e0b",
  metadata:    "#f43f5e",
  javascript:  "#ef4444",
  annotations: "#8b5cf6",
  other:       "#94a3b8",
  // image-specific
  pixels:      "#6366f1",
  exif:        "#f43f5e",
  icc:         "#10b981",
  thumb:       "#f59e0b",
  xmp_text:    "#8b5cf6",
};

const SEG_LABELS: Record<string, string> = {
  images: "Embedded Images", fonts: "Fonts", content: "Content Streams",
  metadata: "PDF Metadata", javascript: "JavaScript", annotations: "Annotations",
  other: "Structure & Other",
  pixels: "Image Pixel Data", exif: "EXIF Metadata", icc: "ICC Color Profile",
  thumb: "Embedded Thumbnail", xmp_text: "XMP / Text Metadata",
};

async function buildResult(file: File): Promise<AnalysisResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const fileSize = file.size;
  const isPDF = file.name.toLowerCase().endsWith(".pdf");

  if (isPDF) {
    const { version, hasJS, hasForms, hasEncryption, isLinearized, pageCount, buckets } = scanPDF(bytes, fileSize);

    const rawSegs = [
      { key: "images",      ...buckets.images },
      { key: "fonts",       ...buckets.fonts },
      { key: "content",     ...buckets.content },
      { key: "metadata",    ...buckets.metadata },
      { key: "javascript",  ...buckets.javascript },
      { key: "annotations", ...buckets.annotations },
      { key: "other",       ...buckets.other },
    ].filter((s) => s.bytes > 0);

    const segments: Segment[] = rawSegs
      .sort((a, b) => b.bytes - a.bytes)
      .map((s) => ({
        key: s.key,
        label: SEG_LABELS[s.key] ?? s.key,
        bytes: s.bytes,
        pct: pct(s.bytes, fileSize),
        color: SEG_COLORS[s.key] ?? "#94a3b8",
        count: s.count,
        detail: s.count ? `${s.count} object${s.count !== 1 ? "s" : ""}` : "",
      }));

    // Key finding
    const top = segments[0];
    const topPct = top?.pct ?? 0;
    let keyFinding = `Your PDF has ${pageCount} page${pageCount !== 1 ? "s" : ""} and weighs ${fmt(fileSize)}.`;
    if (top?.key === "images" && topPct > 50)
      keyFinding = `${topPct.toFixed(0)}% of this PDF is embedded images${top.count ? ` (${top.count} image${top.count !== 1 ? "s" : ""})` : ""}. Compressing or downscaling them will have the biggest impact.`;
    else if (top?.key === "fonts" && topPct > 30)
      keyFinding = `Fonts take up ${topPct.toFixed(0)}% of the file. This usually means fonts are fully embedded rather than subsetted.`;
    else if (hasJS)
      keyFinding = `This PDF contains embedded JavaScript — uncommon for documents, and often bloat. Removing it can also reduce file size.`;
    else if (top)
      keyFinding = `The largest component is ${top.label} at ${topPct.toFixed(0)}% of the file.`;

    // Recommendations
    const recs: Rec[] = [];
    if (buckets.images.bytes > fileSize * 0.3)
      recs.push({ label: "Compress PDF", href: "/compress-pdf", reason: `Reduces embedded image quality — expected to cut ${fmt(buckets.images.bytes * 0.4)} or more`, highlight: true });
    if (hasJS || buckets.metadata.bytes > 10 * 1024)
      recs.push({ label: "Smart PDF Cleaner", href: "/pdf-cleaner", reason: "Strips JavaScript, metadata, comments, and other invisible bloat" });
    if (buckets.fonts.bytes > fileSize * 0.2)
      recs.push({ label: "Compress PDF", href: "/compress-pdf", reason: "Optimizer will subset fonts — only keeps the glyphs actually used" });
    if (!recs.length)
      recs.push({ label: "Compress PDF", href: "/compress-pdf", reason: "General compression — good for any PDF", highlight: true });
    recs.push({ label: "Smart PDF Cleaner", href: "/pdf-cleaner", reason: "Remove metadata, clean structure, strip hidden layers" });

    return { type: "pdf", fileName: file.name, fileSize, segments, keyFinding, recs, pageCount, pdfVersion: version, hasJS, hasForms, hasEncryption };
  }

  // ── Image analysis ──────────────────────────────────────────────────────────
  const { width, height, dpi, exif, icc, thumb, xmpText } = await analyzeImage(file, bytes);
  const mp = width && height ? parseFloat(((width * height) / 1e6).toFixed(1)) : 0;

  const metaTotal = exif + icc + thumb + xmpText;
  const pixelBytes = Math.max(0, fileSize - metaTotal);

  const rawSegs = [
    { key: "pixels",   bytes: pixelBytes,  count: undefined },
    { key: "exif",     bytes: exif,        count: undefined },
    { key: "icc",      bytes: icc,         count: undefined },
    { key: "thumb",    bytes: thumb,       count: undefined },
    { key: "xmp_text", bytes: xmpText,     count: undefined },
  ].filter((s) => s.bytes > 0);

  const segments: Segment[] = rawSegs
    .sort((a, b) => b.bytes - a.bytes)
    .map((s) => ({
      key: s.key,
      label: SEG_LABELS[s.key] ?? s.key,
      bytes: s.bytes,
      pct: pct(s.bytes, fileSize),
      color: SEG_COLORS[s.key] ?? "#94a3b8",
      detail: s.key === "pixels" && width && height ? `${width}×${height}px` : "",
    }));

  // Theoretical uncompressed size
  const theoreticalBytes = width * height * 3; // RGB
  const compressionRatio = theoreticalBytes > 0 ? (theoreticalBytes / fileSize) : 0;
  const exifPct = pct(metaTotal, fileSize);

  let keyFinding = `${width}×${height}px image (${mp} MP) — ${fmt(fileSize)} file.`;
  if (exifPct > 10)
    keyFinding = `${exifPct.toFixed(0)}% of this image is metadata (EXIF, color profiles). Stripping it saves ${fmt(metaTotal)} with no quality loss.`;
  else if (compressionRatio < 2)
    keyFinding = `This image is already highly compressed. The original pixels would be ${fmt(theoreticalBytes)} uncompressed (${compressionRatio.toFixed(1)}× compression).`;
  else if (mp > 12)
    keyFinding = `At ${mp} megapixels, this image is much larger than screens display. Resizing to 2–4 MP saves 70–85% with no visible quality loss for web use.`;
  else
    keyFinding = `${fmt(theoreticalBytes)} of raw pixel data compressed into ${fmt(fileSize)} — ${compressionRatio.toFixed(1)}× compression ratio.`;

  const recs: Rec[] = [];
  if (metaTotal > 10 * 1024)
    recs.push({ label: "EXIF Remover", href: "/exif-remover", reason: `Strips metadata — saves ${fmt(metaTotal)} instantly with zero quality loss`, highlight: true });
  if (mp > 6)
    recs.push({ label: "Resize Image", href: "/resize-image", reason: "Scale down to 2–4 MP for web — saves 70%+ on file size" });
  recs.push({ label: "Compress to Exact Size", href: "/compress-to-size", reason: "Hit any KB/MB target precisely — useful for form uploads" });
  recs.push({ label: "Compress Image", href: "/compress-image", reason: "Reduce file size while keeping visual quality" });

  const fmt2 = (n: number) => n.toFixed(0);
  void fmt2; // suppress lint

  return { type: "image", fileName: file.name, fileSize, segments, keyFinding, recs, width, height, megapixels: mp, dpi };
}

// ─── Segment icon map ──────────────────────────────────────────────────────────

const SEG_ICON: Record<string, React.ReactNode> = {
  images:      <ImageIcon  className="w-4 h-4" />,
  fonts:       <Type       className="w-4 h-4" />,
  content:     <FileText   className="w-4 h-4" />,
  metadata:    <HardDrive  className="w-4 h-4" />,
  javascript:  <Code       className="w-4 h-4" />,
  annotations: <MessageSquare className="w-4 h-4" />,
  other:       <HardDrive  className="w-4 h-4" />,
  pixels:      <ImageIcon  className="w-4 h-4" />,
  exif:        <HardDrive  className="w-4 h-4" />,
  icc:         <Sparkles   className="w-4 h-4" />,
  thumb:       <ImageIcon  className="w-4 h-4" />,
  xmp_text:    <FileText   className="w-4 h-4" />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SizeAnalyzerPage() {
  const [files, setFiles]         = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult]       = useState<AnalysisResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [barReady, setBarReady]   = useState(false);

  // Animate bar on result
  useEffect(() => {
    if (result) { setBarReady(false); const t = setTimeout(() => setBarReady(true), 80); return () => clearTimeout(t); }
  }, [result]);

  const handleAnalyze = useCallback(async () => {
    if (!files.length) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    await new Promise((r) => setTimeout(r, 40));
    try {
      const r = await buildResult(files[0]);
      setResult(r);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try a valid PDF or image file.");
    } finally {
      setProcessing(false);
    }
  }, [files]);

  const handleReset = useCallback(() => {
    setFiles([]); setResult(null); setError(null);
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Gauge}
          title="Why Is My File So Big?"
          description="Upload a PDF or image and get a visual breakdown of exactly what's eating the size — embedded images, fonts, metadata, JavaScript, and more. Free, instant, 100% private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8 space-y-5">
        {/* ── Upload ── */}
        {!result && (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept=".pdf,image/*"
              files={files}
              onFilesChange={setFiles}
              label="Drop a PDF or image here"
              description="PDF, JPG, PNG, WebP — any file you want to diagnose"
            />

            {files.length > 0 && !processing && (
              <div className="mt-8 flex justify-center animate-fade-in-up">
                <button onClick={handleAnalyze} className="btn btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
                  <Gauge className="w-5 h-5" />
                  Analyze Size Breakdown
                </button>
              </div>
            )}

            {processing && (
              <div className="mt-8 text-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-foreground-secondary">Scanning file structure…</p>
              </div>
            )}

            {error && (
              <div className="mt-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>
            )}
          </div>
        )}

        {/* ── Result ── */}
        {result && (
          <>
            {/* File header */}
            <div className="glass-panel rounded-[16px] p-5 sm:p-6 animate-fade-in-up">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[14px] bg-primary-muted border border-primary-border flex items-center justify-center shrink-0">
                    {result.type === "pdf"
                      ? <FileText className="w-6 h-6 text-primary" />
                      : <ImageIcon className="w-6 h-6 text-primary" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base leading-tight">{result.fileName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-mono text-foreground-secondary">{fmt(result.fileSize)}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${result.type === "pdf" ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"}`}>
                        {result.type === "pdf" ? "PDF" : "IMAGE"}
                      </span>
                      {result.type === "pdf" && result.pageCount && (
                        <span className="text-xs text-foreground-muted">{result.pageCount} page{result.pageCount !== 1 ? "s" : ""}</span>
                      )}
                      {result.type === "image" && result.width && (
                        <span className="text-xs text-foreground-muted">{result.width}×{result.height}px · {result.megapixels} MP</span>
                      )}
                      {result.type === "pdf" && result.hasJS && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">has JS</span>
                      )}
                      {result.type === "pdf" && result.hasForms && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">has forms</span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={handleReset} className="btn btn-secondary text-sm">Analyze Another</button>
              </div>
            </div>

            {/* Stacked bar chart */}
            <div className="glass-panel rounded-[16px] p-5 sm:p-6 animate-fade-in-up">
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-4">File size breakdown</p>

              {/* Bar */}
              <div className="h-9 rounded-xl overflow-hidden flex w-full bg-surface-2 mb-4">
                {result.segments.map((seg, i) => (
                  <div
                    key={seg.key}
                    style={{
                      width: barReady ? `${seg.pct}%` : "0%",
                      backgroundColor: seg.color,
                      transition: `width 0.7s ease ${i * 80}ms`,
                    }}
                    className="h-full relative group cursor-default"
                    title={`${seg.label}: ${fmt(seg.bytes)} (${seg.pct}%)`}
                  >
                    {seg.pct > 8 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                        {seg.pct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {result.segments.map((seg) => (
                  <div key={seg.key} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs text-foreground-secondary">{seg.label}</span>
                    <span className="text-xs font-mono text-foreground-muted">{seg.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Component cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.segments.map((seg) => (
                <div key={seg.key} className="glass-panel rounded-[14px] p-4 flex items-start gap-3 animate-fade-in-up">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white shrink-0 mt-0.5"
                    style={{ backgroundColor: seg.color }}
                  >
                    {SEG_ICON[seg.key] ?? <HardDrive className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-semibold text-foreground text-sm truncate">{seg.label}</p>
                      <p className="text-xs font-mono text-foreground-muted shrink-0">{seg.pct}%</p>
                    </div>
                    <p className="text-lg font-bold font-mono text-foreground leading-tight">{fmt(seg.bytes)}</p>
                    {seg.detail && <p className="text-[11px] text-foreground-muted mt-0.5">{seg.detail}</p>}
                    {seg.count !== undefined && seg.count > 0 && (
                      <p className="text-[11px] text-foreground-muted">{seg.count} object{seg.count !== 1 ? "s" : ""}</p>
                    )}
                    {/* Mini bar */}
                    <div className="mt-2 h-1 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: barReady ? `${seg.pct}%` : "0%", backgroundColor: seg.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key finding callout */}
            <div className="rounded-[16px] border-2 border-primary/20 bg-primary-muted/20 p-5 sm:p-6 animate-fade-in-up">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5">Key Finding</p>
                  <p className="text-foreground font-medium text-sm leading-relaxed">{result.keyFinding}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 px-1">Recommended next steps</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.recs.slice(0, 4).map((rec, i) => (
                  <a
                    key={i}
                    href={rec.href}
                    className={`rounded-[14px] border p-4 flex items-start gap-3 group transition-all hover:-translate-y-0.5 ${
                      rec.highlight
                        ? "border-primary/30 bg-primary-muted/30 hover:bg-primary-muted/50"
                        : "border-border bg-surface-1 hover:bg-surface-2"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
                      rec.highlight ? "bg-primary text-white" : "bg-surface-2 text-foreground-secondary"
                    }`}>
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${rec.highlight ? "text-primary" : "text-foreground"}`}>{rec.label}</p>
                      <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">{rec.reason}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-foreground-muted shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Info cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Object-Level Scanning</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">
                For PDFs: scans every internal object and categorizes by type — images, fonts, content, metadata, JavaScript. Not a guess.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">100% Private</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">
                All analysis runs in your browser. Your PDF or image never leaves your device — no upload, no server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Shareable Insight</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">
                "Turns out 90% of my PDF was one image" — the breakdown gives you a concrete answer, not just a number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
