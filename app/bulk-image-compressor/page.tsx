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

interface CompressedFile {
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
    q: "What image formats does the bulk compressor support?",
    a: "You can upload JPG, JPEG, PNG, WebP, GIF, AVIF, and BMP files. All processing happens in your browser via the Canvas API — no files are uploaded to any server.",
  },
  {
    q: "How does the quality slider affect my images?",
    a: "The quality slider controls JPEG encoding quality from 1% to 100%. At 80% you get a great balance between file size and visual quality — typically 50–70% smaller than the original with no visible degradation. Lower values produce smaller files with more compression artifacts.",
  },
  {
    q: "Can I compress 100+ images at once?",
    a: "Yes, there is no enforced limit. Images are processed sequentially in your browser. For very large batches (100+ images or files over 10 MB each), processing in groups of 50 gives the smoothest experience.",
  },
  {
    q: "Will the compressed images keep the same format?",
    a: "All images are re-encoded as JPEG for maximum compression. PNG files with transparency will lose their alpha channel. If you need to preserve transparency, download the individual files and check before using.",
  },
];

export default function BulkImageCompressorPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [compressed, setCompressed] = useState<CompressedFile[]>([]);
  const [convertingIndex, setConvertingIndex] = useState(-1);

  const compressedRef = useRef<CompressedFile[]>([]);
  useEffect(() => { compressedRef.current = compressed; }, [compressed]);

  useEffect(() => {
    return () => { compressedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); }); };
  }, []);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    compressedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    setCompressed([]);
    setDone(false);
    setFiles(newFiles);
  }, []);

  const handleCompress = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);
    compressedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    const results: CompressedFile[] = [];

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

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(objectUrl);

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", quality / 100)
        );
        if (!blob) throw new Error("Encoding failed");

        const url = URL.createObjectURL(blob);
        results.push({
          originalName: file.name,
          originalSize: file.size,
          blob,
          url,
          newName: `${baseName}_compressed.jpg`,
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

    setCompressed(results);
    setDone(true);
    setConvertingIndex(-1);
    setProcessing(false);
  }, [files, quality]);

  const handleDownloadAll = useCallback(async () => {
    const successful = compressed.filter((f) => f.status === "done");
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
      a.download = "compressed_images.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      addToast("error", "Failed to create ZIP archive.");
    }
  }, [compressed, addToast]);

  const handleReset = useCallback(() => {
    compressed.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    setFiles([]);
    setCompressed([]);
    setDone(false);
    setProcessing(false);
    setConvertingIndex(-1);
  }, [compressed]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalOriginal = files.reduce((s, f) => s + f.size, 0);
  const totalCompressed = compressed.reduce((s, f) => s + f.newSize, 0);
  const successCount = compressed.filter((f) => f.status === "done").length;
  const savings = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={ImageIcon}
          title="Bulk Image Compressor"
          description="Compress multiple images at once with adjustable quality. Reduce file sizes for web, email, and storage. Download all as ZIP. Free, private, browser-based."
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
                  <span className="text-xs text-foreground-secondary">
                    {formatSize(totalOriginal)} total
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-foreground-muted mt-1">
                    <span>1% (smallest)</span>
                    <span>80% (recommended)</span>
                    <span>100% (original)</span>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleCompress}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Compressing {convertingIndex + 1}/{files.length}...
                      </>
                    ) : (
                      <>
                        <FileArchive className="w-5 h-5" />
                        Compress {files.length} Image{files.length !== 1 ? "s" : ""}
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
                <span className="text-xs font-semibold text-green-700">{successCount} compressed</span>
              </div>
              {compressed.some((f) => f.status === "error") && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-semibold text-red-700">
                    {compressed.filter((f) => f.status === "error").length} failed
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
                <span className="text-xs font-semibold text-foreground-secondary">
                  {formatSize(totalOriginal)} → {formatSize(totalCompressed)}
                  {savings > 0 && (
                    <span className="text-success ml-1">({savings}% smaller)</span>
                  )}
                </span>
              </div>
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
              {compressed.map((file, i) => (
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
                          {formatSize(file.originalSize)} → {formatSize(file.newSize)}
                          {file.originalSize > 0 && (
                            <span className="text-success ml-1">
                              ({Math.round((1 - file.newSize / file.originalSize) * 100)}% smaller)
                            </span>
                          )}
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
                <ResetIcon className="w-4 h-4" /> Compress More Images
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
                All compression happens locally in your browser using the Canvas API. Your images never leave your device.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Adjustable Quality</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Fine-tune the quality slider to get the perfect balance between file size and image clarity for your use case.
              </p>
            </div>
          </div>
        </div>

        {faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <details key={i} className="glass-panel rounded-xl border border-border overflow-hidden group">
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
