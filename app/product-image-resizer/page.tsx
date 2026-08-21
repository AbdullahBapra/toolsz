"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  FileArchive,
  RotateCcw as ResetIcon,
  X,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";
import { useToast } from "@/app/components/Toast";

type PresetId = "amazon" | "shopify" | "etsy" | "ebay" | "custom";

interface Preset {
  id: PresetId;
  label: string;
  size: number;
  desc: string;
}

const PRESETS: Preset[] = [
  { id: "amazon", label: "Amazon", size: 1000, desc: "1000×1000 · Main image standard" },
  { id: "shopify", label: "Shopify", size: 2048, desc: "2048×2048 · Optimal product image" },
  { id: "etsy", label: "Etsy", size: 2000, desc: "2000×2000 · Listing photo standard" },
  { id: "ebay", label: "eBay", size: 1600, desc: "1600×1600 · Gallery image standard" },
  { id: "custom", label: "Custom", size: 0, desc: "Set your own dimensions" },
];

interface ResizedFile {
  originalName: string;
  originalSize: number;
  blob: Blob;
  url: string;
  newName: string;
  newSize: number;
  outSize: number;
  status: "done" | "error";
  errorMsg?: string;
}

const faqs = [
  {
    q: "What image size does Amazon require for product photos?",
    a: "Amazon requires main product images to be at least 1000 pixels on the longest side (1000×1000 for square images) to enable the zoom feature. Images must have a pure white background (RGB 255, 255, 255) and the product should fill at least 85% of the frame. Maximum file size is 10 MB.",
  },
  {
    q: "What is the recommended image size for Shopify?",
    a: "Shopify recommends 2048×2048 pixels for product images to ensure they look sharp on high-DPI (Retina) displays. Shopify supports JPG, PNG, WebP, and GIF up to 20 MB. Square images work best as they display consistently across all device sizes.",
  },
  {
    q: "What size should Etsy product photos be?",
    a: "Etsy recommends at least 2000px on the shortest side for thumbnail images. The ideal listing photo ratio is 4:3 but Etsy also supports 1:1 square photos. For cover photos, 3360×840px is recommended. High-resolution images help buyers zoom in to see product details.",
  },
  {
    q: "Does this tool crop images or just scale them?",
    a: "This tool uses cover mode — it scales and center-crops your image to exactly fill the target square. This ensures no white bars appear. If your product is not centered in the original photo, you may want to pre-crop it first using our Crop Image tool at /crop-image.",
  },
];

export default function ProductImageResizerPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState<PresetId>("amazon");
  const [customWidth, setCustomWidth] = useState(1000);
  const [customHeight, setCustomHeight] = useState(1000);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resized, setResized] = useState<ResizedFile[]>([]);
  const [convertingIndex, setConvertingIndex] = useState(-1);

  const resizedRef = useRef<ResizedFile[]>([]);
  useEffect(() => { resizedRef.current = resized; }, [resized]);

  useEffect(() => {
    return () => { resizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); }); };
  }, []);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    resizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    setResized([]);
    setDone(false);
    setFiles(newFiles);
  }, []);

  const getTargetDimensions = useCallback(() => {
    if (preset === "custom") return { w: customWidth, h: customHeight };
    const p = PRESETS.find((x) => x.id === preset)!;
    return { w: p.size, h: p.size };
  }, [preset, customWidth, customHeight]);

  const handleResize = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);
    resizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    const results: ResizedFile[] = [];
    const { w: targetW, h: targetH } = getTargetDimensions();

    for (let i = 0; i < files.length; i++) {
      setConvertingIndex(i);
      const file = files[i];
      const baseName = file.name.replace(/\.[^/.]+$/, "");

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

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetW, targetH);

        // Cover mode: scale to fill, center-crop
        const ratioW = targetW / origW;
        const ratioH = targetH / origH;
        const ratio = Math.max(ratioW, ratioH);
        const drawW = Math.round(origW * ratio);
        const drawH = Math.round(origH * ratio);
        const offsetX = Math.round((targetW - drawW) / 2);
        const offsetY = Math.round((targetH - drawH) / 2);

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        URL.revokeObjectURL(objectUrl);

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.90)
        );
        if (!blob) throw new Error("Encoding failed");

        const url = URL.createObjectURL(blob);
        results.push({
          originalName: file.name,
          originalSize: file.size,
          blob,
          url,
          newName: `${baseName}_${targetW}x${targetH}.jpg`,
          newSize: blob.size,
          outSize: targetW,
          status: "done",
        });
      } catch (err) {
        results.push({
          originalName: file.name,
          originalSize: file.size,
          blob: new Blob(),
          url: "",
          newName: "",
          newSize: 0,
          outSize: 0,
          status: "error",
          errorMsg: err instanceof Error ? err.message : "Processing failed",
        });
      }
    }

    setResized(results);
    setDone(true);
    setConvertingIndex(-1);
    setProcessing(false);
  }, [files, getTargetDimensions]);

  const handleDownloadAll = useCallback(async () => {
    const successful = resized.filter((f) => f.status === "done");
    if (successful.length === 1) {
      const f = successful[0];
      const a = document.createElement("a");
      a.href = f.url;
      a.download = f.newName;
      a.click();
      return;
    }
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const f of successful) {
        zip.file(f.newName, f.blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product_images.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      addToast("error", "Failed to create ZIP archive.");
    }
  }, [resized, addToast]);

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

  const successCount = resized.filter((f) => f.status === "done").length;
  const { w: targetW, h: targetH } = getTargetDimensions();

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={ImageIcon}
          title="Product Image Resizer"
          description="Resize product photos to the exact dimensions required by Amazon, Shopify, Etsy, and eBay. Square crop, white background, JPG output. Free, private, browser-based."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.bmp"
              files={files}
              onFilesChange={handleFilesChange}
              label="Drop your product photos here"
              description="or click to browse — JPG, PNG, WebP and more supported"
              multiple
            />

            {files.length > 0 && (
              <div className="mt-6 space-y-5 animate-fade-in-up">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Platform Preset</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPreset(p.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                          preset === p.id
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border hover:border-primary-border hover:bg-surface-2"
                        }`}
                      >
                        <div className={`text-xs font-bold ${preset === p.id ? "text-primary" : "text-foreground"}`}>
                          {p.label}
                        </div>
                        <div className="text-xs text-foreground-muted mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {preset === "custom" && (
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

                <p className="text-xs text-foreground-muted">
                  Output: {targetW}×{targetH}px JPG at 90% quality · Cover mode (center-crop) · White background fill
                </p>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleResize}
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
                        <ImageIcon className="w-5 h-5" />
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
              <div className="flex-1" />
              <button
                onClick={handleDownloadAll}
                className="btn btn-primary inline-flex items-center gap-2 text-xs"
              >
                <FileArchive className="w-4 h-4" />
                {successCount === 1 ? "Download Image" : "Download ZIP"}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {resized.map((file, i) => (
                <div
                  key={i}
                  className={`glass-panel rounded-xl p-4 flex items-center gap-4 ${file.status === "error" ? "border-red-200" : ""}`}
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
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{file.originalName}</p>
                        <p className="text-xs text-foreground-secondary">
                          {file.outSize}×{file.outSize}px · {formatSize(file.newSize)}
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

            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2">
                <ResetIcon className="w-4 h-4" /> Resize More Images
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Private — No Upload</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All resizing happens locally in your browser. Your product photos never leave your device.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">E-Commerce Ready</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Platform presets match exact requirements for Amazon, Shopify, Etsy, and eBay. White background fill included.
              </p>
            </div>
          </div>
        </div>

        {faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <details key={i} className="glass-panel rounded-xl border border-border overflow-hidden">
                  <summary className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-surface-1 transition-colors list-none">
                    <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                  </summary>
                  <div className="px-5 pb-4 border-t border-border">
                    <p className="text-sm text-foreground-secondary leading-relaxed pt-3">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
