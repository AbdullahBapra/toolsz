"use client";

import { useState } from "react";
import {
  Highlighter,
  Check,
  Loader2,
  Shield,
  Zap,
  Copy,
  Download,
  FileText,
  AlertCircle,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface HighlightItem {
  page: number;
  type: "Highlight" | "Underline" | "StrikeOut";
  text: string;
  color: string;
}

type AnnotationSubtype = "Highlight" | "Underline" | "StrikeOut";

const TYPE_LABELS: Record<AnnotationSubtype, string> = {
  Highlight: "Highlight",
  Underline: "Underline",
  StrikeOut: "Strikethrough",
};

const TYPE_COLORS: Record<AnnotationSubtype, string> = {
  Highlight: "bg-amber-50 text-warning",
  Underline: "bg-primary-muted text-primary",
  StrikeOut: "bg-danger-muted text-danger",
};

function annotationColorToHex(color: number[] | Uint8ClampedArray | undefined): string {
  if (!color || color.length < 3) return "#fde047"; // default yellow
  // v5 uses Uint8ClampedArray (0-255), older versions used floats (0-1)
  const isFloat = color.some((c) => c > 0 && c <= 1) && !color.some((c) => c > 1 && c < 256);
  const factor = isFloat ? 255 : 1;
  const r = Math.round((color[0] || 0) * factor);
  const g = Math.round((color[1] || 0) * factor);
  const b = Math.round((color[2] || 0) * factor);
  // If all zero (black highlight), default to yellow
  if (r === 0 && g === 0 && b === 0) return "#fde047";
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Resolve annotation type from either numeric annotationType (v5) or string subtype (v4)
// HIGHLIGHT=9, UNDERLINE=10, SQUIGGLY=11, STRIKEOUT=12
// Note: 13+ are shapes (Square, Circle, etc.) — NOT text markup annotations
function getAnnotationSubtype(annot: Record<string, unknown>): AnnotationSubtype | null {
  const t = annot.annotationType;
  if (typeof t === "number") {
    if (t === 9) return "Highlight";
    if (t === 10 || t === 11) return "Underline";
    if (t === 12) return "StrikeOut";
  }
  const s = annot.subtype;
  if (typeof s === "string") {
    if (s === "Highlight") return "Highlight";
    if (s === "Underline" || s === "Squiggly") return "Underline";
    if (s === "StrikeOut") return "StrikeOut";
  }
  return null;
}

// Check if a point is inside ANY of the individual quads in quadPoints.
// Each quad = 4 points (8 coords). Multi-line highlights have multiple quads.
// Coordinates are in raw PDF space (Y-up).
function isPointInAnyQuad(
  px: number,
  py: number,
  quadPoints: number[]
): boolean {
  if (quadPoints.length < 8) return false;
  for (let i = 0; i < quadPoints.length; i += 8) {
    if (i + 8 > quadPoints.length) break;
    const qx1 = quadPoints[i], qy1 = quadPoints[i + 1];
    const qx2 = quadPoints[i + 2], qy2 = quadPoints[i + 3];
    const qx3 = quadPoints[i + 4], qy3 = quadPoints[i + 5];
    const qx4 = quadPoints[i + 6], qy4 = quadPoints[i + 7];
    const minX = Math.min(qx1, qx2, qx3, qx4);
    const maxX = Math.max(qx1, qx2, qx3, qx4);
    const minY = Math.min(qy1, qy2, qy3, qy4);
    const maxY = Math.max(qy1, qy2, qy3, qy4);
    if (px >= minX && px <= maxX && py >= minY && py <= maxY) {
      return true;
    }
  }
  return false;
}

// Check if a text item overlaps with an annotation's region.
// All coordinates are in raw PDF space (Y-up): itemY is the baseline,
// text extends upward to itemY + itemHeight.
function isTextInAnnotation(
  itemX: number,
  itemY: number,
  itemWidth: number,
  itemHeight: number,
  annotationRect: number[],
  quadPoints: number[] | undefined
): boolean {
  const [ax1, ay1, ax2, ay2] = annotationRect;

  // If quadPoints available, use more precise check
  if (quadPoints && quadPoints.length >= 8) {
    const cx = itemX + itemWidth / 2;
    // In PDF Y-up space, baseline is itemY, center of glyph is itemY + itemHeight/2
    const cy = itemY + itemHeight / 2;
    return isPointInAnyQuad(cx, cy, quadPoints);
  }

  // Fallback: bounding box intersection (PDF Y-up space)
  const itemLeft = itemX;
  const itemRight = itemX + itemWidth;
  const itemBottom = itemY; // baseline
  const itemTop = itemY + itemHeight; // top of glyph

  return (
    itemLeft < ax2 &&
    itemRight > ax1 &&
    itemBottom < ay2 &&
    itemTop > ay1
  );
}

// ── Canvas-based visual highlight detection ──────────────────────────────
// Some PDFs have "flattened" highlights — colored rectangles drawn as page
// content rather than proper PDF annotation objects. getAnnotations() won't
// find these, so we render each page to a canvas and scan for colored blobs.

// Check if an RGB pixel is a highlight color (yellow, green, pink, blue, orange)
function isHighlightPixel(r: number, g: number, b: number): boolean {
  // Yellow highlight: high R & G, B is noticeably lower (handles semi-transparent on white)
  if (r > 180 && g > 180 && b < r * 0.8 && b < g * 0.8 && r + g > 380) return true;
  // Green highlight: high G, moderate R, low B
  if (g > 180 && r > 100 && r < 200 && b < 130) return true;
  // Pink/magenta highlight: high R & B, lower G
  if (r > 180 && b > 120 && g < 140) return true;
  // Orange highlight: high R, moderate G, low B
  if (r > 200 && g > 120 && g < 190 && b < 100) return true;
  // Blue highlight: high B, moderate G
  if (b > 160 && g > 100 && r < 130) return true;
  return false;
}

// Build a binary mask of highlight pixels, then dilate it to bridge gaps
// caused by dark text pixels rendered on top of the highlight color.
// Optimization: collect highlight pixel positions first, then dilate from
// those positions only (avoids iterating all pixels for dilation).
function buildDilatedMask(data: Uint8ClampedArray, width: number, height: number, radius: number): Uint8Array {
  const mask = new Uint8Array(width * height);
  const highlightPositions: number[] = [];
  for (let i = 0; i < mask.length; i++) {
    const pi = i * 4;
    if (data[pi + 3] >= 128 && isHighlightPixel(data[pi], data[pi + 1], data[pi + 2])) {
      mask[i] = 1;
      highlightPositions.push(i);
    }
  }
  if (highlightPositions.length === 0) return mask;

  // Dilate: for each highlight pixel, set all neighbors within radius to 1
  if (radius > 0) {
    const dilated = new Uint8Array(mask);
    for (const idx of highlightPositions) {
      const x = idx % width;
      const y = (idx - x) / width;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx >= 0 && nx < width) {
            dilated[ny * width + nx] = 1;
          }
        }
      }
    }
    return dilated;
  }
  return mask;
}

// Flood-fill connected highlight pixels to find blob bounding boxes
function findHighlightBlobs(
  imageData: ImageData,
  width: number,
  height: number
): { minX: number; minY: number; maxX: number; maxY: number; avgColor: string }[] {
  const data = imageData.data;
  // Dilate mask by 3px to bridge gaps between highlight fragments caused by
  // dark text pixels rendered on top of the highlight color.
  const mask = buildDilatedMask(data, width, height, 3);
  const visited = new Uint8Array(width * height);
  const blobs: { minX: number; minY: number; maxX: number; maxY: number; avgR: number; avgG: number; avgB: number; count: number }[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx] || !mask[idx]) continue;

      // DFS flood fill on the dilated mask (pop() is O(1) vs shift() O(n))
      const stack: number[] = [idx];
      visited[idx] = 1;
      let minX = x, maxX = x, minY = y, maxY = y;
      let sumR = 0, sumG = 0, sumB = 0, count = 0;

      while (stack.length > 0) {
        const cur = stack.pop()!;
        const cx = cur % width;
        const cy = (cur - cx) / width;
        // Average color from original (non-dilated) highlight pixels only
        const ci = cur * 4;
        if (data[ci + 3] >= 128 && isHighlightPixel(data[ci], data[ci + 1], data[ci + 2])) {
          sumR += data[ci]; sumG += data[ci + 1]; sumB += data[ci + 2]; count++;
        }
        minX = Math.min(minX, cx); maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy); maxY = Math.max(maxY, cy);

        const neighbors = [
          cx > 0 ? cur - 1 : -1,
          cx < width - 1 ? cur + 1 : -1,
          cy > 0 ? cur - width : -1,
          cy < height - 1 ? cur + width : -1,
        ];
        for (const n of neighbors) {
          if (n < 0 || visited[n]) continue;
          if (mask[n]) {
            visited[n] = 1;
            stack.push(n);
          }
        }
      }

      // Only keep blobs that span a reasonable area (at least a few words)
      const blobWidth = maxX - minX + 1;
      const blobHeight = maxY - minY + 1;
      // Lower threshold since dilation may have included non-highlight pixels in count
      if (blobWidth > 20 && blobHeight > 5 && count >= 50) {
        blobs.push({ minX, minY, maxX, maxY, avgR: sumR / count, avgG: sumG / count, avgB: sumB / count, count });
      }
    }
  }

  // Merge overlapping or vertically-adjacent blobs (multi-line highlights)
  blobs.sort((a, b) => a.minY - b.minY || a.minX - b.minX);
  const merged: typeof blobs = [];
  for (const blob of blobs) {
    const last = merged[merged.length - 1];
    if (last && blob.minY <= last.maxY + 12 && blob.minX < last.maxX && blob.maxX > last.minX) {
      last.minX = Math.min(last.minX, blob.minX);
      last.maxX = Math.max(last.maxX, blob.maxX);
      last.minY = Math.min(last.minY, blob.minY);
      last.maxY = Math.max(last.maxY, blob.maxY);
      const tc = last.count + blob.count;
      last.avgR = (last.avgR * last.count + blob.avgR * blob.count) / tc;
      last.avgG = (last.avgG * last.count + blob.avgG * blob.count) / tc;
      last.avgB = (last.avgB * last.count + blob.avgB * blob.count) / tc;
      last.count = tc;
    } else {
      merged.push({ ...blob });
    }
  }

  return merged.map((b) => ({
    minX: b.minX, minY: b.minY, maxX: b.maxX, maxY: b.maxY,
    avgColor: `#${Math.round(b.avgR).toString(16).padStart(2, "0")}${Math.round(b.avgG).toString(16).padStart(2, "0")}${Math.round(b.avgB).toString(16).padStart(2, "0")}`,
  }));
}

function generateMarkdownText(highlights: HighlightItem[]): string {
  return highlights
    .map((h) => {
      const label = TYPE_LABELS[h.type] || h.type;
      return `**Page ${h.page} — ${label}**\n> ${h.text}`;
    })
    .join("\n\n");
}

function generateJson(highlights: HighlightItem[], filename: string): string {
  return JSON.stringify(
    {
      filename,
      totalHighlights: highlights.length,
      highlights: highlights.map((h) => ({
        page: h.page,
        type: h.type,
        text: h.text,
        color: h.color,
      })),
    },
    null,
    2
  );
}

export default function HighlightExtractorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<"text" | "markdown" | "json">(
    "text"
  );
  const [error, setError] = useState("");
  const [progressMsg, setProgressMsg] = useState("");

  const handleExtract = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError("");
    setProgressMsg("");

    try {
      // ── Bypass webpack/SWC to avoid transpilation bug ────────────────
      // Next.js's SWC compiler breaks pdfjs-dist's Annotation class
      // constructors, causing "Object.defineProperty called on non-object".
      // We load the untranspiled library directly from public/ via native
      // browser ESM import, which bypasses webpack entirely.
      // The webpackIgnore magic comment tells webpack to not process this.
      setProgressMsg("Loading PDF library...");
      // @ts-ignore — Path resolves at runtime via webpackIgnore, not at compile time
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      setProgressMsg("Reading PDF file...");
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;
      setPageCount(pdf.numPages);

      const allHighlights: HighlightItem[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgressMsg(`Scanning page ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        let annotations: any[] = [];
        let textContent: any = { items: [] };
        try {
          annotations = await page.getAnnotations();
          textContent = await page.getTextContent();
        } catch (e) {
          console.warn(`Page ${i} annotation extraction failed:`, e);
          try { textContent = await page.getTextContent(); } catch { /* skip */ }
        }

        // ── Method 1: PDF Annotation objects ───────────────────────────
        // Filter for highlight annotation types using both numeric (v5) and string (v4)
        const highlightAnnots = annotations.filter(
          (a: Record<string, unknown>) => getAnnotationSubtype(a) !== null
        );

        for (const annot of highlightAnnots) {
          const annotObj = annot as Record<string, unknown>;
          const rect = annotObj.rect as number[] | undefined;
          const quadPoints = annotObj.quadPoints as number[] | undefined;
          const color = annotObj.color as number[] | Uint8ClampedArray | undefined;
          const subtype = getAnnotationSubtype(annotObj) as AnnotationSubtype;

          let text = "";

          // 1a. Try direct contents string first (some PDF readers set this)
          const contentsObj = annotObj.contentsObj as { str?: string } | undefined;
          if (contentsObj?.str?.trim()) {
            text = contentsObj.str.trim();
          } else if (typeof annotObj.contents === "string" && annotObj.contents.trim()) {
            text = (annotObj.contents as string).trim();
          }

          // 1b. Fallback: spatial matching of annotation region against text items
          if (!text && rect) {
            const [rx1, ry1, rx2, ry2] = rect;
            const normRect = [
              Math.min(rx1, rx2), Math.min(ry1, ry2),
              Math.max(rx1, rx2), Math.max(ry1, ry2),
            ];

            let normQuad: number[] | undefined;
            if (quadPoints && (Array.isArray(quadPoints) || (quadPoints as any).length > 0)) {
              normQuad = [];
              if (quadPoints[0] !== null && typeof quadPoints[0] === "object") {
                for (const pt of (quadPoints as unknown as { x: number; y: number }[])) {
                  normQuad.push(pt.x, pt.y);
                }
              } else {
                normQuad = Array.from(quadPoints as Iterable<number>);
              }
            }

            const matchedTexts: { str: string; x: number; y: number }[] = [];
            for (const item of textContent.items as { str: string; transform: number[]; width: number; height?: number }[]) {
              if (!item.str || !item.transform) continue;
              const itemX = item.transform[4];
              const itemY = item.transform[5];
              const itemWidth = item.width || 0;
              const itemHeight = item.height || Math.abs(item.transform[3]) || 12;
              if (isTextInAnnotation(itemX, itemY, itemWidth, itemHeight, normRect, normQuad)) {
                matchedTexts.push({ str: item.str, x: itemX, y: itemY });
              }
            }
            matchedTexts.sort((a, b) => b.y - a.y || a.x - b.x);
            text = matchedTexts.map((t) => t.str).join(" ").trim();
          }

          if (text) {
            allHighlights.push({ page: i, type: subtype, text, color: annotationColorToHex(color) });
          }
        }

        // ── Method 2: Canvas-based visual highlight detection ──────────
        // Only run visual detection if no annotation highlights were found on
        // this page. For PDFs with proper annotations, this avoids the expensive
        // canvas render + pixel scan on every page. For flattened PDFs (no
        // annotations), this catches visual highlights drawn as page content.
        if (highlightAnnots.length === 0) {
          setProgressMsg(`Detecting visual highlights on page ${i}...`);
          try {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d")!;

            await page.render({ canvasContext: ctx, viewport } as any).promise;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const blobs = findHighlightBlobs(imageData, canvas.width, canvas.height);

            const scale = 1.5;
            for (const blob of blobs) {
              const pdfMinX = blob.minX / scale;
              const pdfMinY = (viewport.height - blob.maxY) / scale;
              const pdfMaxX = blob.maxX / scale;
              const pdfMaxY = (viewport.height - blob.minY) / scale;
              const normRect = [pdfMinX, pdfMinY, pdfMaxX, pdfMaxY];

              const matchedTexts: { str: string; x: number; y: number }[] = [];
              for (const item of textContent.items as { str: string; transform: number[]; width: number; height?: number }[]) {
                if (!item.str || !item.transform) continue;
                const itemX = item.transform[4];
                const itemY = item.transform[5];
                const itemWidth = item.width || 0;
                const itemHeight = item.height || Math.abs(item.transform[3]) || 12;
                if (isTextInAnnotation(itemX, itemY, itemWidth, itemHeight, normRect, undefined)) {
                  matchedTexts.push({ str: item.str, x: itemX, y: itemY });
                }
              }
              matchedTexts.sort((a, b) => b.y - a.y || a.x - b.x);
              const text = matchedTexts.map((t) => t.str).join(" ").trim();

              if (text) {
                allHighlights.push({ page: i, type: "Highlight", text, color: blob.avgColor });
              }
            }
          } catch (e) {
            console.warn(`Visual highlight detection failed on page ${i}:`, e);
          }
        }
      }

      setHighlights(allHighlights);
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("PDF Extraction Error:", err);
      setError(
        msg || "Failed to extract highlights. Make sure it's a valid PDF with highlight annotations."
      );
    } finally {
      setProcessing(false);
      setProgressMsg("");
    }
  };

  const getOutputText = (): string => {
    switch (exportFormat) {
      case "text":
        return highlights
          .map((h) => `[Page ${h.page}] ${TYPE_LABELS[h.type]}: ${h.text}`)
          .join("\n");
      case "markdown":
        return generateMarkdownText(highlights);
      case "json":
        return generateJson(highlights, files[0]?.name || "document.pdf");
    }
  };

  const handleCopy = async () => {
    const output = getOutputText();
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = output;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const output = getOutputText();
    const isJson = exportFormat === "json";
    const isMd = exportFormat === "markdown";
    const mimeType = isJson ? "application/json" : isMd ? "text/markdown" : "text/plain";
    const ext = isJson ? "json" : isMd ? "md" : "txt";
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${files[0]?.name.replace(/\.[^/.]+$/, "")}-highlights.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setHighlights([]);
    setPageCount(0);
    setCopied(false);
    setExportFormat("text");
    setError("");
    setProgressMsg("");
  };

  // Stats
  const highlightCount = highlights.filter(
    (h) => h.type === "Highlight"
  ).length;
  const underlineCount = highlights.filter(
    (h) => h.type === "Underline"
  ).length;
  const strikeoutCount = highlights.filter(
    (h) => h.type === "StrikeOut"
  ).length;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Highlighter}
          title="PDF Highlight Extractor"
          description="Pull out all highlighted, underlined, and strikethrough text from your PDF — free, instant, and private. Export as plain text, Markdown, or JSON."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              {/* Upload Area */}
              <FileUpload
                accept=".pdf"
                files={files}
                onFilesChange={setFiles}

                label="Drop your PDF here"
                description="or click to browse — PDF files with highlights"
              />

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in-up">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-danger">
                    {error}
                  </p>
                </div>
              )}

              {/* Action Button */}
              {files.length > 0 && (
                <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                  <button
                    onClick={handleExtract}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {progressMsg || "Extracting Highlights..."}
                      </>
                    ) : (
                      <>
                        <Highlighter className="w-5 h-5" />
                        Extract Highlights
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="py-4 animate-fade-in-up">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Highlights Extracted!
                </h3>
                <p className="text-foreground-secondary">
                  Found {highlights.length} annotation
                  {highlights.length !== 1 ? "s" : ""} across {pageCount} page
                  {pageCount !== 1 ? "s" : ""}.
                </p>
              </div>

              {/* Stats Bar */}
              {highlights.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  {highlightCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-warning">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      {highlightCount} Highlight{highlightCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {underlineCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-muted text-primary">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      {underlineCount} Underline{underlineCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {strikeoutCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-danger-muted text-danger">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      {strikeoutCount} Strikethrough{strikeoutCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {/* No highlights found */}
              {highlights.length === 0 && (
                <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <FileText className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-1">
                    No Annotations Found
                  </h4>
                  <p className="text-xs text-foreground-secondary">
                    This PDF doesn&apos;t contain any highlight, underline, or
                    strikethrough annotations. Make sure the PDF has been
                    annotated with a PDF reader like Adobe Acrobat, Preview, or
                    Chrome&apos;s built-in viewer.
                  </p>
                </div>
              )}

              {/* Highlight Cards */}
              {highlights.length > 0 && (
                <div className="mb-6 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="group bg-surface-2 border border-border rounded-xl p-4 hover:border-primary-border transition-colors animate-fade-in-up"
                    >
                      <div className="flex items-start gap-3">
                        {/* Color dot */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5 border border-black/10"
                          style={{ backgroundColor: h.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_COLORS[h.type]}`}
                            >
                              {TYPE_LABELS[h.type]}
                            </span>
                            <span className="text-[10px] text-foreground-secondary">
                              Page {h.page}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed">
                            {h.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Output Format + Textarea */}
              {highlights.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-foreground">
                      Output
                    </h4>
                    <div className="flex items-center bg-surface-2 border border-border rounded-lg overflow-hidden">
                      {(["text", "markdown", "json"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`px-3 py-1 text-xs font-semibold transition-colors ${
                            fmt !== "text" ? "border-l border-border" : ""
                          } ${
                            exportFormat === fmt
                              ? "bg-primary text-white"
                              : "text-foreground-secondary hover:text-foreground"
                          }`}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="w-full h-48 p-4 rounded-xl border border-border bg-background text-foreground text-xs resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                    value={getOutputText()}
                    readOnly
                    placeholder="Extracted highlights will appear here..."
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {highlights.length > 0 && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="btn btn-primary inline-flex items-center justify-center gap-2"
                    >
                      <Copy className="w-5 h-5" />
                      {copied ? "Copied!" : `Copy ${exportFormat.toUpperCase()}`}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn btn-primary inline-flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Save as .{exportFormat === "markdown" ? "md" : exportFormat === "json" ? "json" : "txt"}
                    </button>
                  </>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Extract Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Total Privacy
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your PDF is processed entirely in your browser. No data is
                uploaded to any server — your documents stay private.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Smart Extraction
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Detects highlights, underlines, and strikethroughs with precise
                text mapping. Export as plain text, Markdown, or structured JSON.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
