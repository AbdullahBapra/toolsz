"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FileImage, Download, RotateCcw, Loader2, Shield, Zap } from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type BgOption = "transparent" | "white" | "black" | "custom";
type Scale = "1" | "2" | "3" | "4";

interface Result {
  name: string;
  originalSize: number;
  pngBlob: Blob;
  pngUrl: string;
  pngSize: number;
  width: number;
  height: number;
  svgUrl: string;
}

async function svgToPng(file: File, scale: number, bg: BgOption, customColor: string): Promise<Result> {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "image/svg+xml");
  const svg = doc.documentElement;

  let w = parseFloat(svg.getAttribute("width") || "0");
  let h = parseFloat(svg.getAttribute("height") || "0");

  if ((!w || !h) && svg.hasAttribute("viewBox")) {
    const parts = svg.getAttribute("viewBox")!.trim().split(/[\s,]+/).map(Number);
    w = parts[2] || 300;
    h = parts[3] || 300;
  }

  w = w || 300;
  h = h || 300;

  const outW = Math.round(w * scale);
  const outH = Math.round(h * scale);

  const svgBlob = new Blob([text], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d")!;

      if (bg !== "transparent") {
        ctx.fillStyle = bg === "white" ? "#ffffff" : bg === "black" ? "#000000" : customColor;
        ctx.fillRect(0, 0, outW, outH);
      }
      ctx.drawImage(img, 0, 0, outW, outH);

      canvas.toBlob((blob) => {
        if (!blob) { URL.revokeObjectURL(svgUrl); reject(new Error("Canvas export failed")); return; }
        resolve({
          name: file.name.replace(/\.svg$/i, ".png"),
          originalSize: file.size,
          pngBlob: blob,
          pngUrl: URL.createObjectURL(blob),
          pngSize: blob.size,
          width: outW,
          height: outH,
          svgUrl,
        });
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(svgUrl); reject(new Error("Failed to render SVG — it may reference external resources")); };
    img.src = svgUrl;
  });
}

const CHECKER_BG = {
  backgroundImage: "linear-gradient(45deg,#e0e0e0 25%,transparent 25%),linear-gradient(-45deg,#e0e0e0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e0e0e0 75%),linear-gradient(-45deg,transparent 75%,#e0e0e0 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
  backgroundColor: "#fff",
};

export default function SvgToPngPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [scale, setScale] = useState<Scale>("2");
  const [bg, setBg] = useState<BgOption>("transparent");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [errors, setErrors] = useState<{ name: string; msg: string }[]>([]);
  const [done, setDone] = useState(false);

  const resultsRef = useRef<Result[]>([]);
  useEffect(() => { resultsRef.current = results; }, [results]);
  useEffect(() => () => {
    resultsRef.current.forEach((r) => { URL.revokeObjectURL(r.pngUrl); URL.revokeObjectURL(r.svgUrl); });
  }, []);

  const handleConvert = useCallback(async () => {
    if (!files.length) return;
    setProcessing(true);
    resultsRef.current.forEach((r) => { URL.revokeObjectURL(r.pngUrl); URL.revokeObjectURL(r.svgUrl); });
    const ok: Result[] = [];
    const errs: { name: string; msg: string }[] = [];
    for (const f of files) {
      try { ok.push(await svgToPng(f, parseFloat(scale), bg, customColor)); }
      catch (e) { errs.push({ name: f.name, msg: e instanceof Error ? e.message : "Failed" }); }
    }
    setResults(ok);
    setErrors(errs);
    setDone(true);
    setProcessing(false);
  }, [files, scale, bg, customColor]);

  const handleReset = useCallback(() => {
    results.forEach((r) => { URL.revokeObjectURL(r.pngUrl); URL.revokeObjectURL(r.svgUrl); });
    setFiles([]); setResults([]); setErrors([]); setDone(false);
  }, [results]);

  const handleDownloadAll = useCallback(async () => {
    if (results.length === 1) {
      const a = document.createElement("a"); a.href = results[0].pngUrl; a.download = results[0].name; a.click(); return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.name, r.pngBlob));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "svg-to-png.zip"; a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const fmt = (b: number) => b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileImage}
          title="SVG to PNG Converter"
          description="Convert SVG vector files to high-resolution PNG — choose scale factor and background color. Free, instant, runs entirely in your browser."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
            <FileUpload
              accept=".svg,image/svg+xml"
              multiple
              files={files}
              onFilesChange={setFiles}
              label="Drop your SVG files here"
              description="or click to browse — single or multiple SVG files"
            />

            {files.length > 0 && (
              <div className="space-y-5 animate-fade-in-up">
                {/* Scale */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Output Scale</label>
                  <div className="flex gap-2">
                    {(["1", "2", "3", "4"] as Scale[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          scale === s
                            ? "bg-primary-muted border-primary-border text-primary"
                            : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                        }`}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">Multiplied against the SVG&apos;s native size. 2× is recommended for retina screens.</p>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Background</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {([
                      { id: "transparent", label: "Transparent" },
                      { id: "white", label: "White" },
                      { id: "black", label: "Black" },
                      { id: "custom", label: "Custom" },
                    ] as { id: BgOption; label: string }[]).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setBg(opt.id)}
                        className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          bg === opt.id
                            ? "bg-primary-muted border-primary-border text-primary"
                            : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    {bg === "custom" && (
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-10 h-9 rounded-lg border border-border cursor-pointer"
                      />
                    )}
                  </div>
                </div>

                <button
                  onClick={handleConvert}
                  disabled={processing}
                  className="btn btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting…</>
                    : <><FileImage className="w-4 h-4" /> Convert {files.length} SVG{files.length !== 1 ? "s" : ""} to PNG</>}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            <div className="glass-panel rounded-[16px] p-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-foreground">
                {results.length} PNG{results.length !== 1 ? "s" : ""} ready
              </span>
              <div className="flex-1" />
              {results.length > 0 && (
                <button onClick={handleDownloadAll} className="btn btn-primary inline-flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  {results.length === 1 ? "Download PNG" : "Download ZIP"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r, i) => (
                <div key={i} className="glass-panel rounded-[16px] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate flex-1">{r.name}</p>
                    <a
                      href={r.pngUrl}
                      download={r.name}
                      className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                  <p className="text-xs text-foreground-muted">
                    {r.width} × {r.height}px &middot; {fmt(r.pngSize)}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-foreground-muted mb-1">SVG Original</p>
                      <div className="bg-white rounded-lg border border-border p-2 flex items-center justify-center min-h-[100px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.svgUrl} alt="SVG preview" className="max-w-full max-h-[100px] object-contain" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-foreground-muted mb-1">PNG Output</p>
                      <div className="rounded-lg border border-border p-2 flex items-center justify-center min-h-[100px]" style={CHECKER_BG}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.pngUrl} alt="PNG preview" className="max-w-full max-h-[100px] object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Client-Side</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Conversion runs entirely in your browser using the Canvas API. Your SVG files never leave your device.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Up to 4× High-Resolution</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Export SVGs at 1×, 2×, 3×, or 4× scale — perfect for retina displays, presentations, or print. Transparent or solid background.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
