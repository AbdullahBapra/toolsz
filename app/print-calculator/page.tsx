"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Upload, Printer, RotateCcw, CheckCircle, AlertTriangle, XCircle,
  ArrowLeftRight, ImageIcon, Crop, Maximize2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

interface PrintSize {
  label: string;
  sublabel?: string;
  w: number; // portrait width (inches)
  h: number; // portrait height (inches)
  cat: "photo" | "square" | "paper" | "large";
}

const SIZES: PrintSize[] = [
  { label: "3×5\"",   w: 3,      h: 5,      cat: "photo" },
  { label: "4×6\"",   sublabel: "Standard", w: 4, h: 6, cat: "photo" },
  { label: "5×7\"",   sublabel: "Common",   w: 5, h: 7, cat: "photo" },
  { label: "8×10\"",  sublabel: "Popular",  w: 8, h: 10, cat: "photo" },
  { label: "8×12\"",  w: 8,      h: 12,     cat: "photo" },
  { label: "11×14\"", w: 11,     h: 14,     cat: "photo" },
  { label: "16×20\"", w: 16,     h: 20,     cat: "photo" },
  { label: "4×4\"",   sublabel: "Square",   w: 4, h: 4,  cat: "square" },
  { label: "8×8\"",   sublabel: "Square",   w: 8, h: 8,  cat: "square" },
  { label: "12×12\"", sublabel: "Square",   w: 12,h: 12, cat: "square" },
  { label: "A4",      sublabel: "8.27×11.7\"", w: 8.268, h: 11.693, cat: "paper" },
  { label: "A3",      sublabel: "11.7×16.5\"", w: 11.693,h: 16.535, cat: "paper" },
  { label: "Letter",  sublabel: "8.5×11\"", w: 8.5, h: 11, cat: "paper" },
  { label: "16×24\"", w: 16,     h: 24,     cat: "large" },
  { label: "20×30\"", w: 20,     h: 30,     cat: "large" },
  { label: "24×36\"", sublabel: "Poster",   w: 24,h: 36, cat: "large" },
];

const CAT_LABELS: Record<string, string> = {
  photo: "Photo Prints",
  square: "Square",
  paper: "Paper Sizes",
  large: "Large Format",
};

const DPI_GRADES = [
  { max: 72,  label: "Screen Only", color: "#ef4444", bg: "#fee2e2", desc: "Too low for any print" },
  { max: 150, label: "Poor",        color: "#f97316", bg: "#ffedd5", desc: "Not suitable for print" },
  { max: 200, label: "Acceptable",  color: "#eab308", bg: "#fef9c3", desc: "Casual / home print" },
  { max: 300, label: "Good",        color: "#84cc16", bg: "#ecfccb", desc: "Standard print quality" },
  { max: Infinity, label: "Excellent", color: "#22c55e", bg: "#dcfce7", desc: "Professional quality" },
];

function getDpiGrade(dpi: number) {
  return DPI_GRADES.find((g) => dpi < g.max) ?? DPI_GRADES[DPI_GRADES.length - 1];
}

// ─── Core calculation ─────────────────────────────────────────────────────────

interface CalcResult {
  dpi: number;
  fitsWithoutCrop: boolean;
  crop: { l: number; r: number; t: number; b: number };
  cropPct: number; // total % of image dimension cropped
  mode: "sides" | "topbottom" | "perfect";
  minPx: { w: number; h: number }; // needed for 300 DPI with this print size
  safeZone: { w: number; h: number }; // pixels that make it into the print
}

function calc(imgW: number, imgH: number, printW: number, printH: number): CalcResult {
  if (!imgW || !imgH || !printW || !printH) {
    return { dpi: 0, fitsWithoutCrop: false, crop: { l:0,r:0,t:0,b:0 }, cropPct: 0, mode: "perfect", minPx: { w: Math.round(printW*300), h: Math.round(printH*300) }, safeZone: {w:imgW,h:imgH} };
  }

  const imgAR   = imgW / imgH;
  const printAR = printW / printH;
  const EPS     = 0.005;

  let dpi: number, l=0, r=0, t=0, b=0;
  let mode: CalcResult["mode"];

  if (Math.abs(imgAR - printAR) < EPS) {
    dpi  = imgW / printW;
    mode = "perfect";
  } else if (imgAR > printAR) {
    // Image wider → fill height, crop width
    dpi = imgH / printH;
    const usedW  = printW * dpi;
    const total  = Math.round(imgW - usedW);
    l = Math.floor(total / 2);
    r = total - l;
    mode = "sides";
  } else {
    // Image taller → fill width, crop height
    dpi = imgW / printW;
    const usedH  = printH * dpi;
    const total  = Math.round(imgH - usedH);
    t = Math.floor(total / 2);
    b = total - t;
    mode = "topbottom";
  }

  const cropPct = mode === "sides"
    ? (l + r) / imgW * 100
    : (t + b) / imgH * 100;

  return {
    dpi:            Math.round(dpi),
    fitsWithoutCrop: mode === "perfect",
    crop:           { l, r, t, b },
    cropPct:        Math.round(cropPct * 10) / 10,
    mode,
    minPx:          { w: Math.round(printW * 300), h: Math.round(printH * 300) },
    safeZone:       { w: imgW - l - r, h: imgH - t - b },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrintCalculatorPage() {
  const [imgW, setImgW] = useState(4000);
  const [imgH, setImgH] = useState(3000);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(1); // 4×6
  const [swapped, setSwapped] = useState(false);    // landscape toggle for print
  const [customMode, setCustomMode] = useState(false);
  const [customW, setCustomW] = useState("10");
  const [customH, setCustomH] = useState("8");
  const [isDrag, setIsDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active print dimensions
  const preset    = SIZES[selectedIdx];
  const baseW     = customMode ? (parseFloat(customW) || 8) : preset.w;
  const baseH     = customMode ? (parseFloat(customH) || 10) : preset.h;
  const printW    = swapped ? baseH : baseW;
  const printH    = swapped ? baseW : baseH;

  const result = calc(imgW, imgH, printW, printH);
  const grade  = getDpiGrade(result.dpi);

  // ── Image upload ────────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImgW(img.naturalWidth);
      setImgH(img.naturalHeight);
      // Thumbnail
      const MAX = 600;
      const s   = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const c   = document.createElement("canvas");
      c.width   = Math.round(img.naturalWidth * s);
      c.height  = Math.round(img.naturalHeight * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      setThumbUrl(c.toDataURL("image/jpeg", 0.85));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  // ── Orientation label ───────────────────────────────────────────────────────
  const orientation = printW >= printH ? "Landscape" : "Portrait";

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="max-w-[960px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <Link
            href="/image-tools"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Image Tools
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Printer className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="type-h1 font-display gradient-text mb-2">
                Print &amp; Frame Calculator
              </h1>
              <p className="text-foreground-secondary text-base leading-relaxed max-w-2xl">
                Will your photo print at 8×10" without cropping? What DPI will it be at A4?
                Upload an image (or enter dimensions) and pick a print size — see exactly what gets
                cropped and whether the resolution is good enough.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-5 md:px-6 lg:px-8 pb-16">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

          {/* ── Left column: inputs ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Image source */}
            <div className="glass-card-premium p-5 sm:p-6">
              <h2 className="font-semibold text-foreground mb-4">Your Image</h2>

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors duration-150 mb-4 ${
                  isDrag ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
                onDragLeave={() => setIsDrag(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                />
                <Upload className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-foreground-secondary">
                  {thumbUrl ? "Upload a different image" : "Drop image to auto-detect dimensions"}
                </p>
              </div>

              {/* Manual dimension entry */}
              <p className="text-xs text-foreground-secondary mb-2 font-medium">Or enter dimensions manually</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-foreground-secondary block mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={imgW}
                    min={1}
                    onChange={(e) => { setImgW(parseInt(e.target.value) || 0); setThumbUrl(null); }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <span className="text-foreground-secondary mt-5 text-lg">×</span>
                <div className="flex-1">
                  <label className="text-xs text-foreground-secondary block mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={imgH}
                    min={1}
                    onChange={(e) => { setImgH(parseInt(e.target.value) || 0); setThumbUrl(null); }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              {imgW > 0 && imgH > 0 && (
                <p className="mt-2 text-xs text-foreground-secondary">
                  {imgW} × {imgH} px &nbsp;·&nbsp; {(imgW * imgH / 1_000_000).toFixed(1)} MP &nbsp;·&nbsp;{" "}
                  {(imgW / imgH).toFixed(3)} : 1 aspect ratio
                </p>
              )}
            </div>

            {/* Print size */}
            <div className="glass-card-premium p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Print / Frame Size</h2>
                {/* Landscape / portrait toggle */}
                <button
                  onClick={() => setSwapped((s) => !s)}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 text-foreground-secondary hover:text-primary transition-colors duration-150"
                  title="Toggle landscape / portrait"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {orientation}
                </button>
              </div>

              {/* Preset grid by category */}
              {(["photo", "square", "paper", "large"] as const).map((cat) => (
                <div key={cat} className="mb-4">
                  <p className="text-xs text-foreground-secondary font-semibold mb-2 uppercase tracking-wide">
                    {CAT_LABELS[cat]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((sz, idx) =>
                      sz.cat !== cat ? null : (
                        <button
                          key={idx}
                          onClick={() => { setSelectedIdx(idx); setCustomMode(false); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                            !customMode && selectedIdx === idx
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "border-border text-foreground-secondary hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {sz.label}
                          {sz.sublabel && (
                            <span className={`ml-1 opacity-70 ${!customMode && selectedIdx === idx ? "text-white/80" : ""}`}>
                              {sz.sublabel}
                            </span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}

              {/* Custom size */}
              <div className="mt-2 pt-3 border-t border-border">
                <p className="text-xs text-foreground-secondary font-semibold mb-2 uppercase tracking-wide">
                  Custom Size (inches)
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customW}
                    min={0.1}
                    step={0.1}
                    onFocus={() => setCustomMode(true)}
                    onChange={(e) => { setCustomW(e.target.value); setCustomMode(true); }}
                    className={`w-20 px-3 py-2 rounded-lg border text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      customMode ? "border-primary bg-primary/5" : "border-border bg-surface"
                    }`}
                    placeholder="w"
                  />
                  <span className="text-foreground-secondary">×</span>
                  <input
                    type="number"
                    value={customH}
                    min={0.1}
                    step={0.1}
                    onFocus={() => setCustomMode(true)}
                    onChange={(e) => { setCustomH(e.target.value); setCustomMode(true); }}
                    className={`w-20 px-3 py-2 rounded-lg border text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      customMode ? "border-primary bg-primary/5" : "border-border bg-surface"
                    }`}
                    placeholder="h"
                  />
                  <span className="text-xs text-foreground-secondary">inches</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column: result ────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Visual preview */}
            <div className="glass-card-premium p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">Visual Preview</h2>
                {result.mode !== "perfect" && (
                  <span className="text-xs text-red-600 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-full font-medium">
                    {result.cropPct.toFixed(1)}% cropped
                  </span>
                )}
              </div>

              {/* Preview container */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-slate-50"
                style={{ aspectRatio: `${imgW} / ${imgH}`, maxHeight: 320, width: "100%" }}
              >
                {/* Image or placeholder */}
                {thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbUrl}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                    <span className="text-slate-400 text-sm font-medium">
                      {imgW.toLocaleString()} × {imgH.toLocaleString()} px
                    </span>
                  </div>
                )}

                {/* Crop overlays (red) */}
                {result.crop.l > 0 && (
                  <div
                    className="absolute top-0 left-0 bottom-0 flex items-center justify-center"
                    style={{ width: `${result.crop.l / imgW * 100}%`, background: "rgba(239,68,68,0.50)" }}
                  >
                    {result.crop.l / imgW > 0.1 && (
                      <span className="text-white text-[11px] font-bold">{result.crop.l.toLocaleString()}</span>
                    )}
                  </div>
                )}
                {result.crop.r > 0 && (
                  <div
                    className="absolute top-0 right-0 bottom-0 flex items-center justify-center"
                    style={{ width: `${result.crop.r / imgW * 100}%`, background: "rgba(239,68,68,0.50)" }}
                  >
                    {result.crop.r / imgW > 0.1 && (
                      <span className="text-white text-[11px] font-bold">{result.crop.r.toLocaleString()}</span>
                    )}
                  </div>
                )}
                {result.crop.t > 0 && (
                  <div
                    className="absolute left-0 right-0 top-0 flex items-center justify-center"
                    style={{ height: `${result.crop.t / imgH * 100}%`, background: "rgba(239,68,68,0.50)" }}
                  >
                    {result.crop.t / imgH > 0.1 && (
                      <span className="text-white text-[11px] font-bold">{result.crop.t.toLocaleString()}</span>
                    )}
                  </div>
                )}
                {result.crop.b > 0 && (
                  <div
                    className="absolute left-0 right-0 bottom-0 flex items-center justify-center"
                    style={{ height: `${result.crop.b / imgH * 100}%`, background: "rgba(239,68,68,0.50)" }}
                  >
                    {result.crop.b / imgH > 0.1 && (
                      <span className="text-white text-[11px] font-bold">{result.crop.b.toLocaleString()}</span>
                    )}
                  </div>
                )}

                {/* Safe zone border */}
                {!result.fitsWithoutCrop && (
                  <div
                    className="absolute border-[3px] border-white pointer-events-none"
                    style={{
                      left:   `${result.crop.l / imgW * 100}%`,
                      right:  `${result.crop.r / imgW * 100}%`,
                      top:    `${result.crop.t / imgH * 100}%`,
                      bottom: `${result.crop.b / imgH * 100}%`,
                      borderStyle: "dashed",
                    }}
                  />
                )}

                {/* Perfect fit badge */}
                {result.fitsWithoutCrop && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-green-500/90 text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-1.5 shadow">
                      <CheckCircle className="w-4 h-4" />
                      Perfect Fit — No Crop Needed
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center gap-4 text-xs text-foreground-secondary">
                {!result.fitsWithoutCrop && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-red-400/80 inline-block" />
                      Gets cropped
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm border-2 border-white bg-transparent inline-block" style={{ borderStyle: "dashed" }} />
                      Print frame
                    </span>
                  </>
                )}
                {result.fitsWithoutCrop && (
                  <span className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Entire image fits within the print frame
                  </span>
                )}
              </div>
            </div>

            {/* DPI card */}
            <div className="glass-card-premium p-5">
              <h2 className="font-semibold text-foreground mb-3">Resolution &amp; DPI</h2>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold tabular-nums" style={{ color: grade.color }}>
                    {result.dpi}
                  </div>
                  <div className="text-xs text-foreground-secondary mt-0.5">DPI</div>
                </div>
                <div
                  className="flex-1 rounded-xl px-4 py-3 border"
                  style={{ background: grade.bg, borderColor: grade.color + "40" }}
                >
                  <p className="font-bold text-sm" style={{ color: grade.color }}>{grade.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: grade.color + "cc" }}>{grade.desc}</p>
                </div>
              </div>

              {/* DPI scale bar */}
              <div className="relative h-3 rounded-full overflow-hidden flex mb-1">
                <div className="flex-1 bg-red-400"    title="Screen" />
                <div className="flex-1 bg-orange-400" title="Poor" />
                <div className="flex-1 bg-yellow-400" title="Acceptable" />
                <div className="flex-1 bg-lime-400"   title="Good" />
                <div className="flex-1 bg-green-400"  title="Excellent" />
              </div>
              <div className="flex justify-between text-[10px] text-foreground-secondary mb-3">
                <span>72</span><span>150</span><span>200</span><span>300</span><span>300+</span>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-2">
                <StatRow label="At this print size" value={`${result.dpi} DPI`} highlight />
                <StatRow label="Minimum for 300 DPI" value={`${result.minPx.w.toLocaleString()} × ${result.minPx.h.toLocaleString()} px`} />
                {!result.fitsWithoutCrop && (
                  <>
                    <StatRow
                      label={result.mode === "sides" ? "Cropped left + right" : "Cropped top + bottom"}
                      value={
                        result.mode === "sides"
                          ? `${result.crop.l.toLocaleString()} + ${result.crop.r.toLocaleString()} px (${result.cropPct}%)`
                          : `${result.crop.t.toLocaleString()} + ${result.crop.b.toLocaleString()} px (${result.cropPct}%)`
                      }
                      warn
                    />
                    <StatRow label="Pixels used in print" value={`${result.safeZone.w.toLocaleString()} × ${result.safeZone.h.toLocaleString()} px`} />
                  </>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card-premium p-5">
              <h2 className="font-semibold text-foreground mb-3">What to do</h2>
              <div className="flex flex-col gap-2.5">

                {result.fitsWithoutCrop && result.dpi >= 200 && (
                  <TipCard
                    icon={<CheckCircle className="w-4 h-4 text-green-600" />}
                    bg="bg-green-50 border-green-200/60"
                    title="Ready to print"
                    body={`No cropping needed. At ${result.dpi} DPI for ${printW}×${printH}", this will print well.`}
                  />
                )}

                {result.dpi < 150 && (
                  <TipCard
                    icon={<XCircle className="w-4 h-4 text-red-500" />}
                    bg="bg-red-50 border-red-200/60"
                    title="Resolution too low for this print size"
                    body={`${result.dpi} DPI is too low. You need ${result.minPx.w.toLocaleString()}×${result.minPx.h.toLocaleString()} px for 300 DPI. Try a smaller print size, or upscale first.`}
                    action={{ label: "Upscale Image →", href: "/upscale-image" }}
                  />
                )}

                {result.dpi >= 150 && result.dpi < 200 && (
                  <TipCard
                    icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                    bg="bg-amber-50 border-amber-200/60"
                    title="Acceptable but not ideal"
                    body={`${result.dpi} DPI is okay for casual home printing but may look slightly soft on professional prints. For 300 DPI you need ${result.minPx.w.toLocaleString()}×${result.minPx.h.toLocaleString()} px.`}
                    action={{ label: "Upscale Image →", href: "/upscale-image" }}
                  />
                )}

                {!result.fitsWithoutCrop && (
                  <TipCard
                    icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                    bg="bg-amber-50 border-amber-200/60"
                    title={result.mode === "sides" ? "Left and right edges will be cropped" : "Top and bottom edges will be cropped"}
                    body={
                      result.mode === "sides"
                        ? `${result.crop.l.toLocaleString()}px left and ${result.crop.r.toLocaleString()}px right (${result.cropPct}% of width) will be cut. Crop manually to choose what to keep.`
                        : `${result.crop.t.toLocaleString()}px top and ${result.crop.b.toLocaleString()}px bottom (${result.cropPct}% of height) will be cut. Crop manually to choose what to keep.`
                    }
                    action={{ label: "Crop Image →", href: "/crop-image" }}
                  />
                )}

                {!result.fitsWithoutCrop && (
                  <TipCard
                    icon={<Maximize2 className="w-4 h-4 text-primary" />}
                    bg="bg-primary/5 border-primary/20"
                    title="Resize to exact print dimensions"
                    body={`Resize to exactly ${result.minPx.w.toLocaleString()}×${result.minPx.h.toLocaleString()} px to get perfect ${printW}×${printH}" at 300 DPI with no cropping.`}
                    action={{ label: "Resize Image →", href: "/resize-image" }}
                  />
                )}

                {result.dpi >= 200 && !result.fitsWithoutCrop && (
                  <TipCard
                    icon={<Crop className="w-4 h-4 text-primary" />}
                    bg="bg-primary/5 border-primary/20"
                    title="Or crop to the exact ratio first"
                    body={`Crop to ${printW < printH ? `${printW}:${printH}` : `${printH}:${printW}`} ratio before printing to control which part of the image is kept.`}
                    action={{ label: "Crop Image →", href: "/crop-image" }}
                  />
                )}
              </div>
            </div>

            {/* DPI reference */}
            <div className="glass-card-premium p-5">
              <h2 className="font-semibold text-foreground mb-3 text-sm">DPI Reference Guide</h2>
              <div className="flex flex-col gap-1.5">
                {DPI_GRADES.map((g) => (
                  <div key={g.label} className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: g.color }} />
                    <span className="text-xs font-semibold w-20" style={{ color: g.color }}>{g.label}</span>
                    <span className="text-xs text-foreground-secondary">{g.desc}</span>
                    <span className="text-xs text-foreground-secondary ml-auto">
                      {g.max === Infinity ? "≥300" : g.max === 72 ? "<72" : `${DPI_GRADES[DPI_GRADES.indexOf(g) - 1]?.max ?? 0}–${g.max}`} DPI
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatRow({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-foreground-secondary">{label}</span>
      <span className={`text-xs font-semibold tabular-nums ${highlight ? "text-primary" : warn ? "text-amber-600" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function TipCard({
  icon, bg, title, body, action,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${bg}`}>
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-foreground-secondary mt-0.5 leading-relaxed">{body}</p>
          {action && (
            <Link href={action.href} className="text-xs text-primary font-semibold hover:underline mt-1.5 inline-block">
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
