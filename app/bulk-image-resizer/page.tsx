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

type FitMode = "contain" | "cover" | "stretch";

interface ResizedFile {
  originalName: string;
  originalSize: number;
  blob: Blob;
  url: string;
  newName: string;
  newSize: number;
  status: "done" | "error";
  errorMsg?: string;
}

const faqs = [
  {
    q: "What is the difference between Contain, Cover, and Stretch?",
    a: "Contain scales the image to fit within your dimensions while preserving aspect ratio — letterboxing with white bars if needed. Cover scales and crops to completely fill the target dimensions with no bars. Stretch forces exact dimensions, which may distort the image.",
  },
  {
    q: "What output format does the bulk resizer use?",
    a: "All images are output as JPEG at 92% quality, which gives excellent visual quality at a reasonable file size. This format works universally across web, email, and e-commerce platforms.",
  },
  {
    q: "How many images can I resize at once?",
    a: "There is no enforced limit. All processing happens in your browser using the HTML5 Canvas API. For batches of 100+ images, processing may take a minute. Single files download directly; multiple files download as a ZIP.",
  },
  {
    q: "Can I resize images to different dimensions for different files?",
    a: "This tool applies the same target dimensions to all uploaded images at once. For different sizes per image, resize them individually using our Resize Image tool at /resize-image.",
  },
];

export default function BulkImageResizerPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [fitMode, setFitMode] = useState<FitMode>("contain");
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

  const handleResize = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);
    resizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    const results: ResizedFile[] = [];

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
        const targetW = width;
        const targetH = height;

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetW, targetH);

        let drawW: number, drawH: number, offsetX: number, offsetY: number;

        if (fitMode === "stretch") {
          drawW = targetW;
          drawH = targetH;
          offsetX = 0;
          offsetY = 0;
        } else {
          const ratioW = targetW / origW;
          const ratioH = targetH / origH;
          const ratio = fitMode === "cover" ? Math.max(ratioW, ratioH) : Math.min(ratioW, ratioH);
          drawW = Math.round(origW * ratio);
          drawH = Math.round(origH * ratio);
          offsetX = Math.round((targetW - drawW) / 2);
          offsetY = Math.round((targetH - drawH) / 2);
        }

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        URL.revokeObjectURL(objectUrl);

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.92)
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
          status: "error",
          errorMsg: err instanceof Error ? err.message : "Processing failed",
        });
      }
    }

    setResized(results);
    setDone(true);
    setConvertingIndex(-1);
    setProcessing(false);
  }, [files, width, height, fitMode]);

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
      a.download = "resized_images.zip";
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

  const totalOriginal = files.reduce((s, f) => s + f.size, 0);
  const successCount = resized.filter((f) => f.status === "done").length;

  const fitModes: { id: FitMode; label: string; desc: string }[] = [
    { id: "contain", label: "Contain", desc: "Scale to fit, add white bars if needed" },
    { id: "cover", label: "Cover", desc: "Crop to fill — no bars, may crop edges" },
    { id: "stretch", label: "Stretch", desc: "Exact dimensions, may distort image" },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={ImageIcon}
          title="Bulk Image Resizer"
          description="Resize multiple images at once to any dimensions. Choose Contain, Cover, or Stretch fit mode. Download all as ZIP. Free, private, browser-based."
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
              label="Drop your images here"
              description="or click to browse — JPG, PNG, WebP, GIF, AVIF, BMP supported"
              multiple
            />

            {files.length > 0 && (
              <div className="mt-6 space-y-5 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {files.length} image{files.length !== 1 ? "s" : ""} selected
                  </h3>
                  <span className="text-xs text-foreground-secondary">{formatSize(totalOriginal)} total</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Width (px)</label>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Height (px)</label>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={height}
                      onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Fit Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {fitModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setFitMode(mode.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          fitMode === mode.id
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border hover:border-primary-border hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              fitMode === mode.id ? "border-primary bg-primary" : "border-border"
                            }`}
                          >
                            {fitMode === mode.id && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="font-semibold text-xs text-foreground">{mode.label}</span>
                        </div>
                        <p className="text-xs text-foreground-muted ml-6">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

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
                          {width}×{height}px · {formatSize(file.newSize)}
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
                All resizing happens locally in your browser using the Canvas API. Your images never leave your device.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Three Fit Modes</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Choose Contain to preserve the full image with letterboxing, Cover to crop-fill, or Stretch for exact pixel dimensions.
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
