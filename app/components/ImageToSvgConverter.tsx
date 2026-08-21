"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FileCode, Download, RotateCcw, Loader2, Shield, Zap, Check, ArrowLeftRight, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";
import Link from "next/link";

type Mode = "pixel-perfect" | "high-detail" | "flat" | "monochrome";

interface Result {
  name: string;
  originalSize: number;
  svgBlob: Blob;
  svgUrl: string;
  svgSize: number;
  previewUrl: string;
  width: number;
  height: number;
  mode: Mode;
}

export interface ImageToSvgConverterProps {
  fromFormat: string;
  fromExts: string;
  title: string;
  description: string;
  faqs: { q: string; a: string }[];
  relatedTools: { name: string; href: string }[];
}

const MODES: Record<Mode, { label: string; badge: string; badgeColor: string; desc: string; recommended?: boolean }> = {
  "pixel-perfect": {
    label: "Pixel Perfect",
    badge: "100% Match",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    desc: "Embeds the image inside an SVG container — exact pixel match, infinite scalability",
    recommended: true,
  },
  "high-detail": {
    label: "High Detail",
    badge: "64 colors",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    desc: "Full-color vector tracing — best for logos and illustrations with many colors",
  },
  flat: {
    label: "Flat Colors",
    badge: "16 colors",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    desc: "Clean vector shapes with reduced palette — best for flat design icons",
  },
  monochrome: {
    label: "Monochrome",
    badge: "B&W",
    badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
    desc: "Black & white silhouette tracing — best for single-color stamps and icons",
  },
};

const TRACE_OPTIONS: Record<"high-detail" | "flat" | "monochrome", object> = {
  "high-detail": { numberofcolors: 64, blurradius: 0, blurdelta: 20, strokewidth: 0, linefilter: false, rightangleenhance: true, ltres: 1, qtres: 1, pathomit: 4, roundcoords: 3, lcpr: 0, qcpr: 0, desc: false, viewbox: false },
  flat: { numberofcolors: 16, blurradius: 0, blurdelta: 20, strokewidth: 1, linefilter: false, rightangleenhance: true, ltres: 1, qtres: 2, pathomit: 8, roundcoords: 2, lcpr: 0, qcpr: 0, desc: false, viewbox: false },
  monochrome: { numberofcolors: 2, blurradius: 1, blurdelta: 20, strokewidth: 1, linefilter: false, rightangleenhance: true, ltres: 0.5, qtres: 0.5, pathomit: 4, roundcoords: 2, lcpr: 0, qcpr: 0, desc: false, viewbox: false },
};

const MAX_TRACE_DIM = 1200;
const SVG_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|avif|ico)$/i;

async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function convertPixelPerfect(file: File): Promise<Result> {
  const dataURL = await fileToDataURL(file);
  const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to read image dimensions"));
    img.src = dataURL;
  });
  const svgString = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
    ` width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<image href="${dataURL}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`,
    `</svg>`,
  ].join("");
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  return {
    name: file.name.replace(SVG_EXT_RE, ".svg"),
    originalSize: file.size,
    svgBlob,
    svgUrl: URL.createObjectURL(svgBlob),
    svgSize: svgBlob.size,
    previewUrl: URL.createObjectURL(file),
    width,
    height,
    mode: "pixel-perfect",
  };
}

async function convertTraced(file: File, mode: "high-detail" | "flat" | "monochrome"): Promise<Result> {
  const mod = await import("imagetracerjs");
  const ImageTracer = (mod as { default?: typeof mod }).default ?? mod;
  const fileUrl = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(fileUrl);
      const nativeW = img.naturalWidth;
      const nativeH = img.naturalHeight;
      const maxDim = Math.max(nativeW, nativeH);
      const downFactor = maxDim > MAX_TRACE_DIM ? MAX_TRACE_DIM / maxDim : 1;
      const traceW = Math.round(nativeW * downFactor);
      const traceH = Math.round(nativeH * downFactor);
      const svgScale = 1 / downFactor;
      const canvas = document.createElement("canvas");
      canvas.width = traceW;
      canvas.height = traceH;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, traceW, traceH);
      const imageData = ctx.getImageData(0, 0, traceW, traceH);
      const options = { ...TRACE_OPTIONS[mode], scale: svgScale };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const svgString: string = (ImageTracer as any).imagedataToSVG(
        { width: imageData.width, height: imageData.height, data: imageData.data },
        options
      );
      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      resolve({
        name: file.name.replace(SVG_EXT_RE, ".svg"),
        originalSize: file.size,
        svgBlob,
        svgUrl: URL.createObjectURL(svgBlob),
        svgSize: svgBlob.size,
        previewUrl: URL.createObjectURL(file),
        width: nativeW,
        height: nativeH,
        mode,
      });
    };
    img.onerror = () => { URL.revokeObjectURL(fileUrl); reject(new Error("Failed to load image")); };
    img.src = fileUrl;
  });
}

function CompareSlider({ original, svg }: { original: string; svg: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);
  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg border border-border bg-surface-1 cursor-col-resize select-none"
      onMouseDown={(e) => { dragging.current = true; updatePos(e.clientX); }}
      onMouseMove={(e) => { if (dragging.current) updatePos(e.clientX); }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onTouchStart={(e) => { dragging.current = true; updatePos(e.touches[0].clientX); }}
      onTouchMove={(e) => { e.preventDefault(); updatePos(e.touches[0].clientX); }}
      onTouchEnd={() => { dragging.current = false; }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={svg} alt="SVG output" className="block w-full max-h-64 object-contain" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={original} alt="Original" className="block w-full max-h-64 object-contain" draggable={false} />
      </div>
      <div className="absolute inset-y-0 pointer-events-none" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white shadow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-border rounded-full shadow-md flex items-center justify-center">
          <ArrowLeftRight className="w-4 h-4 text-foreground-muted" />
        </div>
      </div>
      <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded pointer-events-none">Original</span>
      <span className="absolute top-2 right-2 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded pointer-events-none">SVG</span>
    </div>
  );
}

const fmt = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};

export default function ImageToSvgConverter({ fromFormat, fromExts, title, description, faqs, relatedTools }: ImageToSvgConverterProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<Mode>("pixel-perfect");
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [errors, setErrors] = useState<{ name: string; msg: string }[]>([]);
  const [done, setDone] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const resultsRef = useRef<Result[]>([]);
  useEffect(() => { resultsRef.current = results; }, [results]);
  useEffect(() => () => {
    resultsRef.current.forEach((r) => { URL.revokeObjectURL(r.svgUrl); URL.revokeObjectURL(r.previewUrl); });
  }, []);

  const handleConvert = useCallback(async () => {
    if (!files.length) return;
    setProcessing(true);
    resultsRef.current.forEach((r) => { URL.revokeObjectURL(r.svgUrl); URL.revokeObjectURL(r.previewUrl); });
    const ok: Result[] = [];
    const errs: { name: string; msg: string }[] = [];
    for (const f of files) {
      try {
        ok.push(mode === "pixel-perfect" ? await convertPixelPerfect(f) : await convertTraced(f, mode as "high-detail" | "flat" | "monochrome"));
      } catch (e) {
        errs.push({ name: f.name, msg: e instanceof Error ? e.message : "Failed" });
      }
    }
    setResults(ok);
    setErrors(errs);
    setDone(true);
    setProcessing(false);
  }, [files, mode]);

  const handleReset = useCallback(() => {
    results.forEach((r) => { URL.revokeObjectURL(r.svgUrl); URL.revokeObjectURL(r.previewUrl); });
    setFiles([]); setResults([]); setErrors([]); setDone(false);
  }, [results]);

  const handleDownloadAll = useCallback(async () => {
    if (results.length === 1) {
      const a = document.createElement("a"); a.href = results[0].svgUrl; a.download = results[0].name; a.click(); return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.name, r.svgBlob));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${fromFormat.toLowerCase()}-to-svg.zip`; a.click();
    URL.revokeObjectURL(url);
  }, [results, fromFormat]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={FileCode} title={title} description={description} backHref="/image-tools" backLabel="Back to Image Tools" />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-6">
            <FileUpload accept={fromExts} multiple files={files} onFilesChange={setFiles}
              label={`Drop your ${fromFormat} images here`}
              description={`or click to browse — ${fromFormat} files`} />

            {files.length > 0 && (
              <div className="space-y-5 animate-fade-in-up">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Conversion Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([key, m]) => (
                      <button key={key} onClick={() => setMode(key)}
                        className={`p-3 rounded-lg border text-left transition-all relative ${mode === key ? "bg-primary-muted border-primary-border" : "bg-surface-1 border-border hover:bg-surface-2"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${mode === key ? "text-primary" : "text-foreground"}`}>{m.label}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${m.badgeColor}`}>{m.badge}</span>
                          {m.recommended && (
                            <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground-muted leading-relaxed">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {mode === "pixel-perfect" ? (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-800 leading-relaxed">
                    The SVG embeds the original image as a bitmap — visually identical to source, works everywhere SVG is supported.
                  </div>
                ) : (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 leading-relaxed">
                    {mode === "high-detail" && "Uses 64-color vector tracing. Best for logos and flat illustrations."}
                    {mode === "flat" && "16-color tracing — ideal for flat design icons and simple UI graphics."}
                    {mode === "monochrome" && "2-color B&W silhouette — ideal for stamps, watermarks, and single-color logos."}
                  </div>
                )}

                <button onClick={handleConvert} disabled={processing}
                  className="btn btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {processing
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {mode === "pixel-perfect" ? "Encoding…" : "Tracing vectors…"}</>
                    : <><FileCode className="w-4 h-4" /> Convert {files.length} image{files.length !== 1 ? "s" : ""} to SVG</>}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            <div className="glass-panel rounded-[16px] p-4 flex flex-wrap items-center gap-3">
              <div>
                <span className="text-sm font-semibold text-foreground">{results.length} SVG{results.length !== 1 ? "s" : ""} ready</span>
                <span className="ml-2 text-xs text-foreground-muted">— {MODES[mode].label} mode</span>
              </div>
              <div className="flex-1" />
              {results.length > 0 && (
                <button onClick={handleDownloadAll} className="btn btn-primary inline-flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />{results.length === 1 ? "Download SVG" : "Download ZIP"}
                </button>
              )}
              <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-sm">
                <RotateCcw className="w-4 h-4" /> Convert More
              </button>
            </div>

            {errors.map((e, i) => (
              <div key={i} className="rounded-lg p-3 bg-red-50 border border-red-200 text-sm">
                <span className="font-semibold text-red-700">{e.name}: </span>
                <span className="text-red-600">{e.msg}</span>
              </div>
            ))}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {results.map((r, i) => (
                <div key={i} className="glass-panel rounded-[16px] p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">{r.width} × {r.height}px</p>
                    </div>
                    <a href={r.svgUrl} download={r.name} className="btn btn-primary inline-flex items-center gap-1.5 text-xs shrink-0">
                      <Download className="w-3.5 h-3.5" /> Download SVG
                    </a>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg bg-surface-1 border border-border px-3 py-2">
                      <p className="text-[10px] text-foreground-muted font-medium uppercase tracking-wide">Original</p>
                      <p className="text-sm font-semibold text-foreground">{fmt(r.originalSize)}</p>
                    </div>
                    <div className="flex items-center text-foreground-muted text-sm">→</div>
                    <div className="flex-1 rounded-lg bg-surface-1 border border-border px-3 py-2">
                      <p className="text-[10px] text-foreground-muted font-medium uppercase tracking-wide">SVG Output</p>
                      <p className="text-sm font-semibold text-foreground">{fmt(r.svgSize)}</p>
                    </div>
                    <div className="flex-1 rounded-lg px-3 py-2 border" style={{
                      background: r.svgSize < r.originalSize ? "rgb(240 253 244)" : "rgb(239 246 255)",
                      borderColor: r.svgSize < r.originalSize ? "rgb(187 247 208)" : "rgb(191 219 254)"
                    }}>
                      <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: r.svgSize < r.originalSize ? "rgb(22 163 74)" : "rgb(37 99 235)" }}>
                        {r.svgSize < r.originalSize ? "Smaller" : "Scalable"}
                      </p>
                      <p className="text-sm font-semibold" style={{ color: r.svgSize < r.originalSize ? "rgb(22 163 74)" : "rgb(37 99 235)" }}>
                        {r.svgSize < r.originalSize ? `-${Math.round((1 - r.svgSize / r.originalSize) * 100)}%` : "∞ scale"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted mb-2 flex items-center gap-1.5">
                      <ArrowLeftRight className="w-3 h-3" /> Drag to compare original vs SVG
                    </p>
                    <CompareSlider original={r.previewUrl} svg={r.svgUrl} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Client-Side</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">All conversion happens in your browser. Pixel Perfect embeds as base64; vector modes trace using imagetracerjs. Nothing is uploaded.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">4 Conversion Modes</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Pixel Perfect for exact fidelity, High Detail for full-color logos, Flat for clean shapes, Monochrome for B&W silhouettes.</p>
            </div>
          </div>
        </div>

        {faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-panel rounded-xl border border-border overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-1 transition-colors">
                    <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-foreground-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-foreground-muted shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 border-t border-border">
                      <p className="text-sm text-foreground-secondary leading-relaxed pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedTools.length > 0 && (
          <div className="mt-8 mb-4">
            <h2 className="text-sm font-bold text-foreground mb-3">Related Converters</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map((tool) => (
                <Link key={tool.href} href={tool.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary text-xs font-medium transition-colors bg-white">
                  {tool.name}<ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
