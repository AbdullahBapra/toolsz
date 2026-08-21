"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Target,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  AlertCircle,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

// ─── Constants ────────────────────────────────────────────────────────────────

type Unit   = "KB" | "MB";
type Format = "image/jpeg" | "image/webp";

const SIZE_PRESETS = [
  { label: "20 KB",  bytes: 20   * 1024 },
  { label: "50 KB",  bytes: 50   * 1024 },
  { label: "100 KB", bytes: 100  * 1024 },
  { label: "200 KB", bytes: 200  * 1024 },
  { label: "500 KB", bytes: 500  * 1024 },
  { label: "1 MB",   bytes: 1024 * 1024 },
  { label: "2 MB",   bytes: 2048 * 1024 },
];

// Government & professional photo presets — size + exact pixel dimensions
const FORM_PRESETS = [
  { label: "US Passport / Visa",   bytes: 240  * 1024, w: 600,  h: 600,  note: "USCIS / DS-160 specs" },
  { label: "UK Passport Photo",    bytes: 1024 * 1024, w: 413,  h: 531,  note: "HM Passport Office" },
  { label: "Schengen Visa (EU)",   bytes: 200  * 1024, w: 413,  h: 531,  note: "European visa form" },
  { label: "Australian Passport",  bytes: 999  * 1024, w: 413,  h: 531,  note: "DFAT requirements" },
  { label: "Canada IRCC / PR",     bytes: 240  * 1024, w: 420,  h: 560,  note: "Immigration Canada" },
  { label: "US Green Card (USCIS)",bytes: 240  * 1024, w: 600,  h: 600,  note: "I-485 photo specs" },
  { label: "UK Visa (UKVI)",       bytes: 1024 * 1024, w: 413,  h: 531,  note: "UK Visas & Immigration" },
  { label: "NZ Passport Photo",    bytes: 500  * 1024, w: 900,  h: 1200, note: "DIA New Zealand" },
  { label: "LinkedIn Profile",     bytes: 5120 * 1024, w: 400,  h: 400,  note: "Professional headshot" },
  { label: "Common App (US)",      bytes: 500  * 1024, w: 200,  h: 200,  note: "College applications" },
  { label: "India UPSC / SSC",     bytes: 20   * 1024, w: 200,  h: 230,  note: "Indian civil services" },
  { label: "Pakistan NADRA",       bytes: 100  * 1024, w: 413,  h: 531,  note: "CNIC / NICOP" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(b: number, decimals = 1): string {
  if (b <= 0) return "0 KB";
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(2)} MB`;
  return `${(b / 1024).toFixed(decimals)} KB`;
}

async function toBlob(canvas: HTMLCanvasElement, fmt: Format, q: number): Promise<Blob> {
  return new Promise((res) => canvas.toBlob((b) => res(b!), fmt, q));
}

interface CompressResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  quality: number;
  format: Format;
  dimensionsShrunk: boolean;
}

async function compressToTarget(
  img: HTMLImageElement,
  targetBytes: number,
  outW: number,
  outH: number,
  fmt: Format
): Promise<CompressResult> {
  let w = outW, h = outH;
  let dimensionsShrunk = false;

  const draw = () => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d")!.drawImage(img, 0, 0, w, h);
    return c;
  };

  let canvas = draw();

  // Check if even quality=0.01 fits; if not, shrink dimensions iteratively
  let attempt = await toBlob(canvas, fmt, 0.01);
  let shrinkIter = 0;
  while (attempt.size > targetBytes && shrinkIter < 10) {
    const ratio = Math.sqrt(targetBytes / attempt.size) * 0.92;
    w = Math.max(1, Math.round(w * ratio));
    h = Math.max(1, Math.round(h * ratio));
    canvas = draw();
    attempt = await toBlob(canvas, fmt, 0.01);
    dimensionsShrunk = true;
    shrinkIter++;
  }

  // Check if quality=0.99 already fits (image was already small)
  const maxBlob = await toBlob(canvas, fmt, 0.99);
  if (maxBlob.size <= targetBytes) {
    const url = URL.createObjectURL(maxBlob);
    return { blob: maxBlob, url, width: w, height: h, quality: 0.99, format: fmt, dimensionsShrunk };
  }

  // Binary search quality to land just under target
  let lo = 0.01, hi = 0.99;
  let bestBlob = attempt;
  let bestQ = 0.01;

  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    const blob = await toBlob(canvas, fmt, mid);
    if (blob.size <= targetBytes) {
      bestBlob = blob;
      bestQ = mid;
      lo = mid;
    } else {
      hi = mid;
    }
    if (hi - lo < 0.002) break;
  }

  const url = URL.createObjectURL(bestBlob);
  return { blob: bestBlob, url, width: w, height: h, quality: bestQ, format: fmt, dimensionsShrunk };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompressToSizePage() {
  const [files, setFiles]         = useState<File[]>([]);
  const [targetVal, setTargetVal] = useState("100");
  const [unit, setUnit]           = useState<Unit>("KB");
  const [fmt, setFmt]             = useState<Format>("image/jpeg");
  const [wInput, setWInput]       = useState("");
  const [hInput, setHInput]       = useState("");
  const [keepAR, setKeepAR]       = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult]       = useState<CompressResult | null>(null);
  const [origSize, setOrigSize]   = useState(0);
  const [origW, setOrigW]         = useState(0);
  const [origH, setOrigH]         = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    urlRef.current = result?.url ?? null;
    return () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); };
  }, [result]);

  const targetBytes = parseFloat(targetVal) * (unit === "MB" ? 1024 * 1024 : 1024);

  const applyPreset = useCallback((bytes: number, w?: number, h?: number) => {
    if (bytes >= 1024 * 1024) {
      setTargetVal(String(bytes / 1024 / 1024));
      setUnit("MB");
    } else {
      setTargetVal(String(Math.round(bytes / 1024)));
      setUnit("KB");
    }
    setWInput(w ? String(w) : "");
    setHInput(h ? String(h) : "");
  }, []);

  const handleProcess = useCallback(async () => {
    if (!files.length) return;
    if (isNaN(targetBytes) || targetBytes <= 0) {
      setError("Please enter a valid target size.");
      return;
    }
    setProcessing(true);
    setError(null);
    setResult(null);
    await new Promise((r) => setTimeout(r, 40));

    try {
      const file = files[0];
      const objUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = objUrl;
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); });

      setOrigSize(file.size);
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);

      const aspect = img.naturalWidth / img.naturalHeight;
      const w = wInput ? Math.max(1, parseInt(wInput)) : 0;
      const h = hInput ? Math.max(1, parseInt(hInput)) : 0;
      let outW = img.naturalWidth, outH = img.naturalHeight;

      if (w > 0 && h > 0) {
        outW = w; outH = h;
      } else if (w > 0) {
        outW = w; outH = keepAR ? Math.round(w / aspect) : img.naturalHeight;
      } else if (h > 0) {
        outH = h; outW = keepAR ? Math.round(h * aspect) : img.naturalWidth;
      }

      const res = await compressToTarget(img, targetBytes, outW, outH, fmt);
      URL.revokeObjectURL(objUrl);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError("Failed to compress. Please try a different image or a larger target size.");
    } finally {
      setProcessing(false);
    }
  }, [files, targetBytes, fmt, wInput, hInput, keepAR]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const ext  = result.format === "image/webp" ? "webp" : "jpg";
    const base = files[0]?.name?.replace(/\.[^.]+$/, "") ?? "image";
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${base}-${Math.round(result.blob.size / 1024)}kb.${ext}`;
    a.click();
  }, [result, files]);

  const handleReset = useCallback(() => {
    setFiles([]); setResult(null); setError(null); setOrigSize(0);
  }, []);

  const reduction = result ? (origSize - result.blob.size) / origSize * 100 : 0;
  const isOver    = result ? result.blob.size > targetBytes * 1.02 : false;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Target}
          title="Compress Image to Exact Size"
          description="Hit any target file size — 20 KB, 50 KB, 200 KB, 1 MB, or custom. Built-in presets for UPSC, IBPS, JEE, NEET, NADRA, and visa forms. Free, instant, 100% private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8 space-y-5">
        {!result ? (
          <>
            {/* ── Step 1: Target size ── */}
            <div className="glass-panel rounded-[16px] p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Set Target File Size
              </h2>

              {/* Size quick-select */}
              <p className="text-xs text-foreground-muted mb-2">Quick presets</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {SIZE_PRESETS.map((p) => {
                  const active = Math.abs(targetBytes - p.bytes) < 50;
                  return (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p.bytes)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        active
                          ? "bg-primary-muted border-primary-border text-primary"
                          : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom target input */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="1"
                    value={targetVal}
                    onChange={(e) => setTargetVal(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-32 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex rounded-lg border border-border overflow-hidden text-xs font-semibold">
                    {(["KB", "MB"] as Unit[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-4 py-2 transition-all ${unit === u ? "bg-primary text-white" : "bg-surface-1 text-foreground-secondary hover:bg-surface-2"}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                {!isNaN(targetBytes) && targetBytes > 0 && (
                  <span className="text-sm text-foreground-muted">
                    = <span className="font-mono font-semibold text-foreground">{formatBytes(targetBytes)}</span>
                  </span>
                )}
              </div>

              {/* Exam / form presets */}
              <div className="mt-6">
                <p className="text-xs text-foreground-muted mb-2">Exam &amp; government form presets — size + dimensions in one click</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FORM_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p.bytes, p.w, p.h)}
                      className="px-3 py-2.5 rounded-lg border border-border bg-surface-1 text-foreground-secondary hover:bg-surface-2 transition-all text-left"
                    >
                      <span className="text-xs font-semibold block">{p.label}</span>
                      <span className="text-[10px] text-foreground-muted block mt-0.5">{p.w}×{p.h}px · {formatBytes(p.bytes, 0)}</span>
                      <span className="text-[10px] text-primary/70 block">{p.note}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Step 2: Dimensions + format ── */}
            <div className="glass-panel rounded-[16px] p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Dimensions &amp; Format
                <span className="text-foreground-muted font-normal text-xs">(optional — leave blank to keep original)</span>
              </h2>

              <div className="flex flex-wrap gap-5 items-end">
                {/* Width */}
                <div>
                  <label className="block text-xs text-foreground-muted mb-1.5">Width (px)</label>
                  <input
                    type="number" min="1"
                    value={wInput}
                    onChange={(e) => setWInput(e.target.value)}
                    placeholder="original"
                    className="w-28 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <span className="text-foreground-muted pb-2">×</span>
                {/* Height */}
                <div>
                  <label className="block text-xs text-foreground-muted mb-1.5">Height (px)</label>
                  <input
                    type="number" min="1"
                    value={hInput}
                    onChange={(e) => setHInput(e.target.value)}
                    placeholder="original"
                    className="w-28 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                {/* Keep AR */}
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={keepAR}
                    onChange={(e) => setKeepAR(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-xs text-foreground-secondary">Keep aspect ratio</span>
                </label>

                {/* Format */}
                <div className="sm:ml-auto">
                  <label className="block text-xs text-foreground-muted mb-1.5">Output format</label>
                  <div className="flex rounded-lg border border-border overflow-hidden text-xs font-semibold">
                    {([["JPEG", "image/jpeg"], ["WebP", "image/webp"]] as [string, Format][]).map(([label, f]) => (
                      <button
                        key={f}
                        onClick={() => setFmt(f)}
                        className={`px-5 py-2 transition-all ${fmt === f ? "bg-primary text-white" : "bg-surface-1 text-foreground-secondary hover:bg-surface-2"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-foreground-muted mt-1">
                    {fmt === "image/jpeg" ? "Best quality/size ratio for photos" : "Smaller files, modern browsers"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Step 3: Upload + go ── */}
            <div className="glass-panel rounded-[16px] p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Upload Image
              </h2>

              <FileUpload
                accept="image/*"
                files={files}
                onFilesChange={setFiles}
                label="Drop your image here"
                description="JPG, PNG, WebP, HEIC — any photo or scan"
              />

              {files.length > 0 && !processing && (
                <div className="mt-6 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} className="btn btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
                    <Target className="w-5 h-5" />
                    Compress to {targetVal} {unit}
                  </button>
                </div>
              )}

              {processing && (
                <div className="mt-6 text-center py-10">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-foreground-secondary">Running binary-search compression…</p>
                  <p className="text-xs text-foreground-muted mt-1">Testing quality levels to land on exactly {targetVal} {unit}</p>
                </div>
              )}

              {error && (
                <div className="mt-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Result ── */
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isOver ? "bg-amber-100" : "bg-success/10"}`}>
                  {isOver
                    ? <AlertCircle className="w-5 h-5 text-amber-600" />
                    : <Check className="w-5 h-5 text-success" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {isOver ? "Closest possible — image couldn't reach target" : "Compressed successfully"}
                  </p>
                  {result.dimensionsShrunk && (
                    <p className="text-xs text-foreground-muted">Dimensions were reduced to reach the target size</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleReset} className="btn btn-secondary">Compress Another</button>
                <button onClick={handleDownload} className="btn btn-primary inline-flex items-center gap-2">
                  <Download className="w-5 h-5" /> Download
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Original",     value: formatBytes(origSize),            sub: `${origW}×${origH}px`,                        accent: false },
                { label: "Compressed",   value: formatBytes(result.blob.size),    sub: `${result.width}×${result.height}px`,          accent: true  },
                { label: "Reduction",    value: `${reduction > 0 ? "-" : "+"}${Math.abs(reduction).toFixed(1)}%`, sub: "size change", accent: false },
                { label: "Quality Used", value: `${Math.round(result.quality * 100)}%`, sub: result.format === "image/jpeg" ? "JPEG" : "WebP", accent: false },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border p-4 text-center ${s.accent ? "border-primary/30 bg-primary-muted/30" : "border-border bg-surface-1"}`}>
                  <p className="text-[11px] text-foreground-muted mb-1">{s.label}</p>
                  <p className={`text-lg font-bold font-mono leading-tight ${s.accent ? "text-primary" : "text-foreground"}`}>{s.value}</p>
                  <p className="text-[10px] text-foreground-muted mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Size bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-foreground-muted mb-1.5">
                <span>Compressed: {formatBytes(result.blob.size)}</span>
                <span>Target: {formatBytes(targetBytes)}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isOver ? "bg-amber-400" : "bg-success"}`}
                  style={{ width: `${Math.min(100, (result.blob.size / targetBytes) * 100).toFixed(1)}%` }}
                />
              </div>
              <p className="text-[10px] text-foreground-muted mt-1 text-right">
                {isOver
                  ? `${formatBytes(result.blob.size - targetBytes)} over target`
                  : `${formatBytes(targetBytes - result.blob.size)} under target`
                }
              </p>
            </div>

            {/* Preview */}
            <div className="flex justify-center">
              <img
                src={result.url}
                alt="Compressed output"
                className="max-w-full max-h-96 rounded-xl border border-border shadow-sm"
              />
            </div>
          </div>
        )}

        {/* ── Info cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Binary-Search Precision</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">
                22-step binary search over JPEG/WebP quality to land as close as possible under your target — never over.
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
                Your exam photo or ID scan is processed entirely in your browser — nothing uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Exam-Form Ready</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">
                Built-in presets for UPSC, IBPS, JEE/NEET, NADRA, and Schengen visa — exact size and pixel dimensions in one click.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
