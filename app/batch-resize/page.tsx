"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Maximize,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Image as ImageIcon,
  RotateCcw as ResetIcon,
  Info,
  X,
  FileArchive,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type ResizeMode = "preset" | "custom" | "percent";
type OutputFormat = "original" | "jpg" | "png" | "webp";

interface ResizedFile {
  originalName: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  blob: Blob;
  url: string;
  newName: string;
  newSize: number;
  newWidth: number;
  newHeight: number;
  status: "done" | "error";
  errorMsg?: string;
}

const PRESETS: { label: string; width: number; height: number; desc: string }[] = [
  { label: "HD 720p", width: 1280, height: 720, desc: "Web / Blog" },
  { label: "Full HD", width: 1920, height: 1080, desc: "Desktop / Video" },
  { label: "Instagram Post", width: 1080, height: 1080, desc: "1:1 Square" },
  { label: "Instagram Story", width: 1080, height: 1920, desc: "9:16 Vertical" },
  { label: "Twitter Header", width: 1500, height: 500, desc: "3:1 Banner" },
  { label: "Facebook Cover", width: 820, height: 312, desc: "Page banner" },
  { label: "Thumbnail", width: 320, height: 240, desc: "Small preview" },
  { label: "Icon 256", width: 256, height: 256, desc: "App icon" },
  { label: "Icon 512", width: 512, height: 512, desc: "App store" },
  { label: "A4 @150dpi", width: 1240, height: 1754, desc: "Print" },
  { label: "A4 @300dpi", width: 2480, height: 3508, desc: "Hi-res print" },
];

export default function BatchResizePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resized, setResized] = useState<ResizedFile[]>([]);
  const [convertingIndex, setConvertingIndex] = useState(-1);

  // Resize settings
  const [resizeMode, setResizeMode] = useState<ResizeMode>("preset");
  const [presetIdx, setPresetIdx] = useState(0);
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(600);
  const [percent, setPercent] = useState(50);
  const [fitMode, setFitMode] = useState<"cover" | "contain" | "stretch">("contain");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [quality, setQuality] = useState(0.9);
  const [bgColor, setBgColor] = useState("#FFFFFF");

  const resizedRef = useRef<ResizedFile[]>([]);
  useEffect(() => { resizedRef.current = resized; }, [resized]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => { resizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); }); };
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    resizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    setResized([]);
    setDone(false);
    setFiles(newFiles);
  }, []);

  const computeDimensions = (origW: number, origH: number) => {
    let targetW: number;
    let targetH: number;

    if (resizeMode === "preset") {
      const p = PRESETS[presetIdx];
      targetW = p.width;
      targetH = p.height;
    } else if (resizeMode === "custom") {
      targetW = customWidth;
      targetH = customHeight;
    } else {
      // Percent mode
      targetW = Math.round(origW * (percent / 100));
      targetH = Math.round(origH * (percent / 100));
    }

    if (resizeMode === "percent") return { drawW: targetW, drawH: targetH, canvasW: targetW, canvasH: targetH };

    // Fit mode calculations
    if (fitMode === "stretch") {
      return { drawW: targetW, drawH: targetH, canvasW: targetW, canvasH: targetH };
    }

    const ratioW = targetW / origW;
    const ratioH = targetH / origH;
    const ratio = fitMode === "cover" ? Math.max(ratioW, ratioH) : Math.min(ratioW, ratioH);

    const drawW = Math.round(origW * ratio);
    const drawH = Math.round(origH * ratio);

    if (fitMode === "contain") {
      return { drawW, drawH, canvasW: targetW, canvasH: targetH };
    }
    // cover: canvas is target, image drawn centered
    return { drawW, drawH, canvasW: targetW, canvasH: targetH };
  };

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);

    resizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    const results: ResizedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      setConvertingIndex(i);
      const file = files[i];
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const origExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

      try {
        const img = new globalThis.Image();
        const objectUrl = URL.createObjectURL(file);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = objectUrl;
        });

        const origW = img.naturalWidth;
        const origH = img.naturalHeight;
        const { drawW, drawH, canvasW, canvasH } = computeDimensions(origW, origH);

        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d")!;

        // Background fill (for contain mode)
        if (fitMode === "contain" && resizeMode !== "percent") {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // Center the image
        const offsetX = Math.round((canvasW - drawW) / 2);
        const offsetY = Math.round((canvasH - drawH) / 2);
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        URL.revokeObjectURL(objectUrl);

        // Determine output format
        const outExt = outputFormat === "original" ? origExt : outputFormat;
        const mime = outExt === "jpg" || outExt === "jpeg" ? "image/jpeg"
          : outExt === "webp" ? "image/webp"
          : "image/png";

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, mime, quality)
        );
        if (!blob) throw new Error("Failed to encode image");

        const url = URL.createObjectURL(blob);
        const finalExt = outExt === "jpeg" ? "jpg" : outExt;
        results.push({
          originalName: file.name,
          originalSize: file.size,
          originalWidth: origW,
          originalHeight: origH,
          blob,
          url,
          newName: `${baseName}_${drawW}x${drawH}.${finalExt}`,
          newSize: blob.size,
          newWidth: drawW,
          newHeight: drawH,
          status: "done",
        });
      } catch (err) {
        results.push({
          originalName: file.name,
          originalSize: file.size,
          originalWidth: 0,
          originalHeight: 0,
          blob: new Blob(),
          url: "",
          newName: "",
          newSize: 0,
          newWidth: 0,
          newHeight: 0,
          status: "error",
          errorMsg: err instanceof Error ? err.message : "Processing failed",
        });
      }
    }

    setResized(results);
    setDone(true);
    setConvertingIndex(-1);
    setProcessing(false);
  }, [files, resizeMode, presetIdx, customWidth, customHeight, percent, fitMode, outputFormat, quality, bgColor]);

  const handleDownloadAll = useCallback(async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const f of resized) {
      if (f.status === "done" && f.blob) {
        zip.file(f.newName, f.blob);
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resized_images.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [resized]);

  const handleReset = useCallback(() => {
    resized.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    setFiles([]);
    setResized([]);
    setDone(false);
    setProcessing(false);
    setConvertingIndex(-1);
  }, [resized]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalOriginal = files.reduce((s, f) => s + f.size, 0);
  const totalResized = resized.reduce((s, f) => s + f.newSize, 0);
  const successCount = resized.filter((f) => f.status === "done").length;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Maximize}
          title="Batch Image Resizer"
          description="Resize 50+ images at once with presets or custom dimensions — download all as a ZIP. Free, instant, and completely private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept=".jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff,.tif,.avif,.heic,.heif"
              files={files}
              onFilesChange={handleFileChange}
              label="Drop your images here"
              description="or click to browse — JPG, PNG, WebP, HEIC supported. Batch up to 100 images."
              multiple
            />

            {files.length > 0 && (
              <div className="mt-6 space-y-5 animate-fade-in-up">
                {/* File count */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {files.length} image{files.length !== 1 ? "s" : ""} selected
                  </h3>
                  <span className="text-xs text-foreground-secondary">
                    {formatSize(totalOriginal)} total
                  </span>
                </div>

                {/* Resize Mode */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Resize Mode</label>
                  <div className="flex gap-2">
                    {(["preset", "custom", "percent"] as ResizeMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setResizeMode(mode)}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          resizeMode === mode
                            ? "bg-primary-muted border-primary-border text-primary"
                            : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                        }`}
                      >
                        {mode === "preset" ? "Presets" : mode === "custom" ? "Custom" : "Percent"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Selection */}
                {resizeMode === "preset" && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Size Preset</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESETS.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setPresetIdx(i)}
                          className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                            presetIdx === i
                              ? "bg-primary-muted border-primary-border"
                              : "bg-surface-1 border-border hover:bg-surface-2"
                          }`}
                        >
                          <div className={`text-xs font-semibold ${presetIdx === i ? "text-primary" : "text-foreground"}`}>
                            {p.label}
                          </div>
                          <div className="text-xs text-foreground-secondary">
                            {p.width}×{p.height} · {p.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Size */}
                {resizeMode === "custom" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Width (px)</label>
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Height (px)</label>
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                )}

                {/* Percent */}
                {resizeMode === "percent" && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Scale: {percent}%
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={200}
                      value={percent}
                      onChange={(e) => setPercent(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-foreground-muted mt-1">
                      <span>5%</span><span>100%</span><span>200%</span>
                    </div>
                  </div>
                )}

                {/* Fit Mode (preset & custom only) */}
                {resizeMode !== "percent" && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Fit Mode</label>
                    <div className="flex gap-2">
                      {(["contain", "cover", "stretch"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setFitMode(mode)}
                          className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                            fitMode === mode
                              ? "bg-primary-muted border-primary-border text-primary"
                              : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                          }`}
                        >
                          {mode === "contain" ? "Fit (contain)" : mode === "cover" ? "Fill (cover)" : "Stretch"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Output Format & Quality */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Output Format</label>
                    <div className="flex gap-2 flex-wrap">
                      {(["original", "jpg", "png", "webp"] as OutputFormat[]).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setOutputFormat(fmt)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            outputFormat === fmt
                              ? "bg-primary-muted border-primary-border text-primary"
                              : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                          }`}
                        >
                          {fmt === "original" ? "Same as input" : fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Process Button */}
                <div className="flex flex-col items-center pt-2">
                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Resizing {convertingIndex + 1}/{files.length}...
                      </>
                    ) : (
                      <>
                        <Maximize className="w-5 h-5" />
                        Resize {files.length} Image{files.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {/* Summary */}
            <div className="glass-panel rounded-[16px] p-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">{successCount} resized</span>
              </div>
              {resized.some((f) => f.status === "error") && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-semibold text-red-700">
                    {resized.filter((f) => f.status === "error").length} failed
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
                <span className="text-xs font-semibold text-foreground-secondary">
                  {formatSize(totalOriginal)} → {formatSize(totalResized)}
                  {totalResized < totalOriginal && (
                    <span className="text-success ml-1">
                      ({Math.round((1 - totalResized / totalOriginal) * 100)}% smaller)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex-1" />
              <button
                onClick={handleDownloadAll}
                className="btn btn-primary inline-flex items-center gap-2 text-xs"
              >
                <FileArchive className="w-4 h-4" /> Download ZIP
              </button>
            </div>

            {/* Results list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {resized.map((file, i) => (
                <div
                  key={i}
                  className={`glass-panel rounded-xl p-4 flex items-center gap-4 ${
                    file.status === "error" ? "border-red-200" : ""
                  }`}
                >
                  {file.status === "error" ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-700">{file.originalName}</p>
                        <p className="text-xs text-red-500">{file.errorMsg}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={file.url}
                        alt={file.newName}
                        className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{file.originalName}</p>
                        <p className="text-xs text-foreground-secondary">
                          {file.originalWidth}×{file.originalHeight} ({formatSize(file.originalSize)})
                          → {file.newWidth}×{file.newHeight} ({formatSize(file.newSize)})
                        </p>
                      </div>
                      <a
                        href={file.url}
                        download={file.newName}
                        className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2">
                <ResetIcon className="w-4 h-4" /> Resize More Images
              </button>
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Browser-Based — No Upload</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All images are resized locally using the HTML5 Canvas API. Your photos never leave
                your device. Perfect for sensitive product photos or personal images.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Batch 50+ Images at Once</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Drag in your entire photo folder. Choose from 11 presets (Instagram, Facebook, HD,
                print) or set custom dimensions. Download all resized images as a ZIP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
