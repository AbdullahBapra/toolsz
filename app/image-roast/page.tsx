"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Download,
  RefreshCw,
  FlaskConical,
  Maximize2,
  Sparkles,
  Zap,
  Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metrics {
  sharpness: number;
  resolution: number;
  noise: number;
  compression: number;
  exposure: number;
  color: number;
  aiSuspicion: number;
  overall: number;
}

interface AnalysisResult {
  metrics: Metrics;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  megapixels: number;
  format: string;
  thumbUrl: string;
  grade: GradeInfo;
  badge: BadgeInfo;
  overallRoast: string;
  roasts: Record<string, string>;
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
  "Loading the judges…",
  "Evaluating sharpness…",
  "Counting your pixels…",
  "Checking for crimes against JPEG…",
  "Measuring artistic ambition…",
  "Consulting the color council…",
  "Analyzing your exposure decisions…",
  "Running the vibe check…",
  "Computing the harsh truths…",
  "Preparing your score card…",
];

const METRICS_CONFIG = [
  { key: "sharpness", label: "Sharpness", icon: "🔍", desc: "Edge clarity & focus" },
  { key: "resolution", label: "Resolution", icon: "📐", desc: "Megapixel count" },
  { key: "noise", label: "Cleanliness", icon: "✨", desc: "Signal-to-noise ratio" },
  { key: "compression", label: "Compression", icon: "🗜️", desc: "Quality preservation" },
  { key: "exposure", label: "Exposure", icon: "☀️", desc: "Brightness & clipping" },
  { key: "color", label: "Color", icon: "🎨", desc: "Vibrancy & saturation" },
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
  if (score >= 88) return { emoji: "🏆", text: "Gallery Worthy", color: "#10b981" };
  if (score >= 75) return { emoji: "✅", text: "Share Worthy", color: "#22c55e" };
  if (score >= 60) return { emoji: "😐", text: "It Is What It Is", color: "#eab308" };
  if (score >= 45) return { emoji: "📱", text: "Low Quality Alert", color: "#f97316" };
  return { emoji: "💀", text: "We're Concerned", color: "#ef4444" };
}

function getOverallRoast(score: number): string {
  if (score >= 90) return "Legitimately impressive. We have nothing bad to say.";
  if (score >= 80) return "Solid all around. Your camera work is not the problem.";
  if (score >= 70) return "Pretty good! A few rough edges, but nothing embarrassing.";
  if (score >= 60) return "Gets the job done. Nobody will call the authorities.";
  if (score >= 50) return "We've seen worse. Not many, but a few.";
  if (score >= 35) return "Bless your heart for uploading this.";
  return "This image is why cameras have delete buttons.";
}

function getRoast(key: string, score: number): string {
  const map: Record<string, Array<[number, string]>> = {
    sharpness: [
      [15, "Did you smear Vaseline on the lens on purpose?"],
      [30, "Were you running a 100m dash when you hit shoot?"],
      [50, "Soft focus. Very artistic. Very… accidental."],
      [70, "Acceptably focused. Nobody will ask questions."],
      [85, "Sharp and clear. Well done."],
      [95, "Crisp, clean, respectable."],
      [Infinity, "So sharp it could file taxes. Impressive."],
    ],
    resolution: [
      [15, "This has fewer pixels than our expectations."],
      [30, "Thumbnail energy. Upscale it before someone sees."],
      [50, "Low-res but somehow confident about it."],
      [70, "Decent resolution. Passes the vibe check."],
      [85, "Solid megapixel count. Well done."],
      [95, "High resolution. You weren't playing around."],
      [Infinity, "Did you need this many pixels? You didn't."],
    ],
    noise: [
      [15, "Shot at ISO 204800 in a submarine?"],
      [30, "Grainy like sandpaper. Very film noir. Accidentally."],
      [50, "Some grain. We'll pretend it's artistic."],
      [70, "A little noisy but manageable."],
      [85, "Clean and noise-free. Appreciated."],
      [95, "Very clean. Clinically so."],
      [Infinity, "Practically noiseless. Almost suspicious."],
    ],
    compression: [
      [15, "Your JPEG artifacts have their own artifacts."],
      [30, "Compressed harder than your last career pivot."],
      [50, "Compression damage is showing. Not great, not terrible."],
      [70, "Some compression damage, but surviving."],
      [85, "Compression handled with grace."],
      [95, "Well-preserved quality throughout."],
      [Infinity, "Minimal quality loss. Treated with respect."],
    ],
    exposure: [
      [15, "Is this a photograph of a void? Or a flashbang?"],
      [30, "Significant exposure issues. Ever heard of metering?"],
      [50, "A bit off — too dark or too bright. Almost there."],
      [70, "Decent exposure. Not perfect, but workable."],
      [85, "Well exposed. You know your way around a camera."],
      [95, "Excellent exposure. Textbook stuff."],
      [Infinity, "Perfect exposure. Are you actually a photographer?"],
    ],
    color: [
      [20, "Grayer than a Monday morning. By choice?"],
      [40, "Muted and desaturated. Very moody. If intentional."],
      [60, "Modest color. Tasteful, perhaps."],
      [75, "Good color. Vibrant where it counts."],
      [88, "Rich, vivid, pleasing to the eyes."],
      [Infinity, "The colors slap. Genuinely."],
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

// ─── Analysis Functions ───────────────────────────────────────────────────────

function computeLaplacianVariance(gray: Float32Array, w: number, h: number): number {
  let sum = 0, sum2 = 0, count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = gray[i - w] + gray[i + w] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
      sum += lap;
      sum2 += lap * lap;
      count++;
    }
  }
  const mean = sum / count;
  return sum2 / count - mean * mean;
}

function lapToScore(v: number): number {
  if (v < 30) return Math.round((v / 30) * 15);
  if (v < 100) return Math.round(15 + ((v - 30) / 70) * 15);
  if (v < 400) return Math.round(30 + ((v - 100) / 300) * 25);
  if (v < 1200) return Math.round(55 + ((v - 400) / 800) * 20);
  if (v < 3000) return Math.round(75 + ((v - 1200) / 1800) * 15);
  if (v < 6000) return Math.round(90 + ((v - 3000) / 3000) * 7);
  return Math.min(100, Math.round(97 + ((v - 6000) / 3000) * 3));
}

function computeNoiseScore(gray: Float32Array, w: number, h: number): number {
  const blurred = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      blurred[i] =
        (gray[i - w - 1] + gray[i - w] + gray[i - w + 1] +
          gray[i - 1] + gray[i] + gray[i + 1] +
          gray[i + w - 1] + gray[i + w] + gray[i + w + 1]) / 9;
    }
  }
  let sum2 = 0, count = 0;
  for (let i = w + 1; i < (h - 1) * w - 1; i++) {
    const d = gray[i] - blurred[i];
    sum2 += d * d;
    count++;
  }
  const rms = Math.sqrt(sum2 / count);
  if (rms < 1) return 96;
  if (rms < 2) return 90;
  if (rms < 4) return 82;
  if (rms < 7) return 70;
  if (rms < 12) return 55;
  if (rms < 18) return 38;
  if (rms < 25) return 22;
  return Math.max(5, Math.round(22 - ((rms - 18) / 12) * 17));
}

function computeExposureScore(gray: Float32Array): number {
  let sum = 0, dark = 0, bright = 0;
  const n = gray.length;
  for (let i = 0; i < n; i++) {
    sum += gray[i];
    if (gray[i] < 15) dark++;
    if (gray[i] > 242) bright++;
  }
  const mean = sum / n;
  let score = 100;
  score -= Math.min(35, Math.abs(mean - 120) * 0.35);
  score -= Math.min(25, (dark / n) * 200);
  score -= Math.min(25, (bright / n) * 200);
  return Math.max(5, Math.round(score));
}

function computeColorScore(data: Uint8ClampedArray, n: number): number {
  let totalSat = 0;
  for (let i = 0; i < n * 4; i += 4) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    totalSat += s;
  }
  const avg = totalSat / n;
  if (avg < 0.03) return 40;
  return Math.round(Math.min(100, 20 + avg * 130));
}

function compressionToScore(fileSize: number, w: number, h: number, isJpeg: boolean): number {
  if (!isJpeg) return 82;
  const bpp = fileSize / (w * h);
  if (bpp < 0.03) return 10;
  if (bpp < 0.07) return 28;
  if (bpp < 0.15) return 52;
  if (bpp < 0.35) return 73;
  if (bpp < 0.7) return 88;
  return 95;
}

function mpToScore(mp: number): number {
  if (mp < 0.05) return 5;
  if (mp < 0.2) return 18;
  if (mp < 0.5) return 32;
  if (mp < 1.5) return 52;
  if (mp < 4) return 70;
  if (mp < 8) return 84;
  if (mp < 16) return 93;
  if (mp < 30) return 97;
  return 88;
}

function computeAISuspicion(m: Omit<Metrics, "aiSuspicion" | "overall">): number {
  let s = 8;
  if (m.sharpness > 88 && m.noise > 88) s += 32;
  else if (m.sharpness > 78 && m.noise > 78) s += 18;
  if (m.exposure > 88) s += 12;
  if (m.compression > 90) s += 10;
  if (m.resolution > 80 && m.sharpness > 80 && m.noise > 80 && m.exposure > 80) s += 15;
  return Math.min(94, s);
}

async function analyzeImage(file: File): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const origW = img.naturalWidth;
        const origH = img.naturalHeight;
        const mp = (origW * origH) / 1_000_000;
        const scale = Math.min(1, 640 / Math.max(origW, origH));
        const w = Math.round(origW * scale);
        const h = Math.round(origH * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);

        const gray = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) {
          gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
        }

        const lapVar = computeLaplacianVariance(gray, w, h);
        const sharpness = lapToScore(lapVar);
        const noise = computeNoiseScore(gray, w, h);
        const exposure = computeExposureScore(gray);
        const color = computeColorScore(data, w * h);
        const resolution = mpToScore(mp);
        const isJpeg =
          file.type === "image/jpeg" ||
          file.name.toLowerCase().endsWith(".jpg") ||
          file.name.toLowerCase().endsWith(".jpeg");
        const compression = compressionToScore(file.size, origW, origH, isJpeg);

        const base = { sharpness, resolution, noise, compression, exposure, color };
        const aiSuspicion = computeAISuspicion(base);
        const overall = Math.round(
          sharpness * 0.25 + resolution * 0.20 + noise * 0.15 +
          compression * 0.15 + exposure * 0.15 + color * 0.10
        );
        const metrics: Metrics = { ...base, aiSuspicion, overall };

        // Thumbnail (data URL so html2canvas works cross-origin-free)
        const ts = Math.min(1, 200 / Math.max(origW, origH));
        const thumbC = document.createElement("canvas");
        thumbC.width = Math.round(origW * ts);
        thumbC.height = Math.round(origH * ts);
        thumbC.getContext("2d")!.drawImage(img, 0, 0, thumbC.width, thumbC.height);
        const thumbUrl = thumbC.toDataURL("image/jpeg", 0.85);

        resolve({
          metrics,
          fileName: file.name,
          fileSize: file.size,
          width: origW,
          height: origH,
          megapixels: Math.round(mp * 100) / 100,
          format: (file.name.split(".").pop() ?? "IMG").toUpperCase(),
          thumbUrl,
          grade: getGrade(overall),
          badge: getBadge(overall),
          overallRoast: getOverallRoast(overall),
          roasts: {
            sharpness: getRoast("sharpness", sharpness),
            resolution: getRoast("resolution", resolution),
            noise: getRoast("noise", noise),
            compression: getRoast("compression", compression),
            exposure: getRoast("exposure", exposure),
            color: getRoast("color", color),
          },
        });
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageRoastPage() {
  const [phase, setPhase] = useState<"upload" | "analyzing" | "result">("upload");
  const [result, setResult] = useState<AnalysisResult | null>(null);
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
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, WebP, etc.).");
      return;
    }
    setPhase("analyzing");
    setMsgIdx(0);
    try {
      const r = await analyzeImage(file);
      setResult(r);
      setPhase("result");
    } catch {
      alert("Failed to analyze this image. Please try a different file.");
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
      a.download = `roast-${result.fileName.replace(/\.[^.]+$/, "")}.png`;
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
            href="/image-tools"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Image Tools
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <FlaskConical className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="type-h1 font-display gradient-text mb-2">
                Image Roast &amp; Quality Score
              </h1>
              <p className="text-foreground-secondary text-base leading-relaxed max-w-2xl">
                Upload any image and get a brutally honest quality score across 6 metrics — sharpness,
                resolution, noise, compression, exposure, and color. Download a shareable score card.
                100% private, nothing is uploaded.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 md:px-6 lg:px-8 pb-16">

        {/* ─── Upload Phase ─────────────────────────────────────────────────── */}
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
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div className="w-16 h-16 rounded-2xl bg-primary-muted border border-primary-border flex items-center justify-center mx-auto mb-5">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h2 className="type-h2 font-semibold text-foreground mb-2">
              Drop your image here
            </h2>
            <p className="text-foreground-secondary mb-6">
              JPG, PNG, WebP, GIF — any raster image
            </p>
            <button className="btn-primary px-6 py-2.5">
              Choose Image
            </button>
          </div>
        )}

        {/* ─── Analyzing Phase ──────────────────────────────────────────────── */}
        {phase === "analyzing" && (
          <div className="mt-6 glass-card-premium p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-muted border border-primary-border flex items-center justify-center mx-auto mb-6 animate-pulse">
              <FlaskConical className="w-8 h-8 text-primary" />
            </div>
            <h2 className="type-h2 font-semibold text-foreground mb-3">Roasting your image…</h2>
            <p className="text-foreground-secondary text-base min-h-[1.5em] transition-all duration-300">
              {LOADING_MSGS[msgIdx]}
            </p>
          </div>
        )}

        {/* ─── Result Phase ─────────────────────────────────────────────────── */}
        {phase === "result" && result && (
          <>
            {/* ── Overall Score ──────────────────────────────────────────────── */}
            <div className="mt-6 glass-card-premium p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Thumbnail */}
                <div className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.thumbUrl}
                    alt={result.fileName}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-border"
                    style={{ imageRendering: "auto" }}
                  />
                </div>

                {/* Score */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-foreground-secondary text-sm mb-0.5 truncate max-w-[300px]">
                        {result.fileName}
                      </p>
                      <p className="text-foreground-secondary text-xs">
                        {result.width} × {result.height}px &nbsp;·&nbsp; {result.megapixels} MP &nbsp;·&nbsp;{" "}
                        {fmtBytes(result.fileSize)} &nbsp;·&nbsp; {result.format}
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

            {/* ── Metric Grid ────────────────────────────────────────────────── */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METRICS_CONFIG.map(({ key, label, icon, desc }) => {
                const score = result.metrics[key as keyof Metrics] as number;
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
                    {/* Bar */}
                    <div className="mt-2 h-2 rounded-full bg-surface border border-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: barReady ? `${score}%` : "0%",
                          background: c,
                        }}
                      />
                    </div>
                    {/* Roast line */}
                    <p className="mt-2.5 text-xs text-foreground-secondary italic">{roast}</p>
                  </div>
                );
              })}
            </div>

            {/* ── AI Detection ───────────────────────────────────────────────── */}
            <div className="mt-5 glass-card-premium p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/50 flex items-center justify-center shrink-0 text-lg">
                🤖
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">AI Generation Detector</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Heuristic</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 rounded-full bg-surface border border-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: barReady ? `${result.metrics.aiSuspicion}%` : "0%",
                        background: result.metrics.aiSuspicion > 60 ? "#a855f7" : "#d8b4fe",
                      }}
                    />
                  </div>
                  <span className="text-lg font-bold tabular-nums text-purple-600 shrink-0">
                    {result.metrics.aiSuspicion}%
                  </span>
                </div>
                <p className="text-xs text-foreground-secondary">
                  {result.metrics.aiSuspicion >= 65
                    ? "Suspiciously sharp, clean, and perfectly exposed. Could be AI-generated — or just a very good photographer. We're not sure."
                    : result.metrics.aiSuspicion >= 35
                    ? "Some AI-like characteristics (unusual sharpness/cleanliness ratio), but nothing conclusive."
                    : "Imperfections detected. This looks like a real photograph — grain, slight blur, and natural compression are all present."}
                  {" "}
                  <span className="italic opacity-70">
                    (This is a heuristic guess, not a real AI detector.)
                  </span>
                </p>
              </div>
            </div>

            {/* ── Shareable Score Card ───────────────────────────────────────── */}
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
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      ⚡
                    </div>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Image Roast</span>
                  </div>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>toolsz.co</span>
                </div>

                {/* File info + score */}
                <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.thumbUrl}
                    alt=""
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#d1d5db", fontSize: 13, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {result.fileName}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: 11, marginBottom: 10 }}>
                      {result.width}×{result.height}px · {result.megapixels}MP · {fmtBytes(result.fileSize)}
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
                    const score = result.metrics[key as keyof Metrics] as number;
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

                {/* AI suspicion */}
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>🤖 AI Suspicion</span>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${result.metrics.aiSuspicion}%`, background: "#a855f7", borderRadius: 2 }} />
                  </div>
                  <span style={{ color: "#a855f7", fontSize: 11, fontWeight: 700 }}>{result.metrics.aiSuspicion}%</span>
                </div>
              </div>
            </div>

            {/* ── Recommendations ────────────────────────────────────────────── */}
            <div className="mt-8">
              <h2 className="type-h3 font-semibold text-foreground mb-4">Recommendations</h2>
              <div className="flex flex-col gap-2.5">
                {result.metrics.sharpness < 60 && (
                  <RecoCard
                    icon="🔍"
                    title="Sharpen this image"
                    body="The sharpness score is low. Try enhancing or upscaling it."
                    href="/photo-enhancer"
                    label="Open Photo Enhancer"
                  />
                )}
                {result.metrics.resolution < 55 && (
                  <RecoCard
                    icon="📐"
                    title="Upscale for more resolution"
                    body="Low megapixel count. Upscaling can recover some detail."
                    href="/upscale-image"
                    label="Open Image Upscaler"
                  />
                )}
                {result.metrics.compression < 45 && (
                  <RecoCard
                    icon="🗜️"
                    title="Image is over-compressed"
                    body="Heavy JPEG artifact damage detected. Re-export at higher quality."
                    href="/compress-image"
                    label="Open Compress Image"
                  />
                )}
                {result.metrics.exposure < 55 && (
                  <RecoCard
                    icon="☀️"
                    title="Fix exposure issues"
                    body="Brightness or clipping issues detected. Auto-fix can help."
                    href="/photo-enhancer"
                    label="Open Photo Enhancer"
                  />
                )}
                {result.metrics.noise < 45 && (
                  <RecoCard
                    icon="✨"
                    title="High noise level"
                    body="Significant grain detected. Photo Enhancer can reduce noise."
                    href="/photo-enhancer"
                    label="Open Photo Enhancer"
                  />
                )}
                {result.metrics.overall >= 75 && (
                  <div className="glass-panel rounded-xl px-5 py-4 flex items-center gap-3">
                    <span className="text-xl">🎉</span>
                    <p className="text-sm text-foreground-secondary">
                      Overall quality is good. Nothing urgent to fix — your image is in solid shape.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Reset ──────────────────────────────────────────────────────── */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground-secondary hover:text-foreground hover:border-primary/50 text-sm font-medium transition-colors duration-150"
              >
                <RefreshCw className="w-4 h-4" />
                Roast Another Image
              </button>
            </div>
          </>
        )}
      </div>
    </div>
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
