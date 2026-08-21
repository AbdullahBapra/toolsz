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
    q: "What are Amazon's main image requirements?",
    a: "Amazon requires main product images (MAIN) to have a pure white background (RGB 255, 255, 255). The product must fill at least 85% of the image frame. Images must be at least 1000px on the longest side to enable the zoom feature. Maximum file size is 10 MB. Supported formats are JPG, PNG, GIF, and TIFF.",
  },
  {
    q: "Why does Amazon require a 1000×1000 pixel image?",
    a: "Amazon uses a minimum of 1000px to enable their hover-zoom feature on product detail pages. The zoom feature is proven to increase conversion rates by letting customers examine product details. Images below 1000px still appear in listings but won't support zoom.",
  },
  {
    q: "Does Amazon require sRGB color space?",
    a: "Yes. Amazon recommends sRGB color space for consistent color rendering across devices. Images in CMYK color space may display with color shifts. Most cameras and smartphones output sRGB by default. If you export from professional photo editing software, make sure to convert to sRGB before uploading.",
  },
  {
    q: "Can my product touch the image edges?",
    a: "No. Amazon requires at least a small amount of white space between the product and all four image edges. The product should fill 85–95% of the image with a visible white border. Products that bleed to the edges or have backgrounds that don't extend to all edges will be rejected.",
  },
  {
    q: "What about secondary and lifestyle images on Amazon?",
    a: "Secondary images (A+, lifestyle, infographic, detail shots) do not require white backgrounds. They can show the product in use, include text overlays, or display from different angles. However, the MAIN image (the first image buyers see in search results) must always have a pure white background.",
  },
];

export default function AmazonImageResizerPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [whiteBg, setWhiteBg] = useState(true);
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
    const TARGET = 1000;

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
        canvas.width = TARGET;
        canvas.height = TARGET;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");

        if (whiteBg) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, TARGET, TARGET);
        }

        // Cover mode: scale and center-crop to fill 1000×1000
        const ratioW = TARGET / origW;
        const ratioH = TARGET / origH;
        const ratio = Math.max(ratioW, ratioH);
        const drawW = Math.round(origW * ratio);
        const drawH = Math.round(origH * ratio);
        const offsetX = Math.round((TARGET - drawW) / 2);
        const offsetY = Math.round((TARGET - drawH) / 2);

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
          newName: `${baseName}_amazon_1000x1000.jpg`,
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
  }, [files, whiteBg]);

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
      a.download = "amazon_product_images.zip";
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

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={ImageIcon}
          title="Amazon Image Resizer"
          description="Resize product photos to Amazon's 1000×1000 pixel standard. White background, JPG at 90% quality. Meets Amazon main image requirements. Free, private, browser-based."
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
                <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary-muted border border-primary-border flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Amazon Standard: 1000×1000px JPG</p>
                    <p className="text-xs text-foreground-secondary">Enables zoom feature · Cover crop · 90% quality</p>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border hover:bg-surface-2 transition-colors">
                  <input
                    type="checkbox"
                    checked={whiteBg}
                    onChange={(e) => setWhiteBg(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <div>
                    <p className="text-xs font-semibold text-foreground">White background fill</p>
                    <p className="text-xs text-foreground-secondary">Recommended — required for Amazon main images (RGB 255, 255, 255)</p>
                  </div>
                </label>

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
                        Resize for Amazon ({files.length} image{files.length !== 1 ? "s" : ""})
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
                <span className="text-xs font-semibold text-green-700">{successCount} ready for Amazon</span>
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
                          1000×1000px JPG · {formatSize(file.newSize)}
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Amazon Compliant Output</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Outputs 1000×1000px JPG with pure white background — meets Amazon's main image requirements and enables the zoom feature.
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
