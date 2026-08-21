"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Smartphone,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Image as ImageIcon,
  RotateCcw as ResetIcon,
  Info,
  FileArchive,
  X,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type OutputFormat = "jpg" | "png" | "webp";

interface ConvertedFile {
  originalName: string;
  originalSize: number;
  blob: Blob;
  url: string;
  newName: string;
  newSize: number;
  status: "done" | "error";
  errorMsg?: string;
}

const outputFormats: {
  id: OutputFormat;
  label: string;
  mime: string;
  ext: string;
  description: string;
}[] = [
  {
    id: "jpg",
    label: "JPG",
    mime: "image/jpeg",
    ext: "jpg",
    description: "Most compatible. Ideal for photos, social media, and uploads.",
  },
  {
    id: "png",
    label: "PNG",
    mime: "image/png",
    ext: "png",
    description: "Lossless with transparency. Best for graphics & screenshots.",
  },
  {
    id: "webp",
    label: "WebP",
    mime: "image/webp",
    ext: "webp",
    description: "Modern format, smaller files. Great for web performance.",
  },
];

export default function HeicToJpgPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpg");
  const [quality, setQuality] = useState(0.92);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [converted, setConverted] = useState<ConvertedFile[]>([]);
  const [convertingIndex, setConvertingIndex] = useState(-1);
  const [zipping, setZipping] = useState(false);

  const convertedRef = useRef<ConvertedFile[]>([]);

  // Keep ref in sync for cleanup
  useEffect(() => {
    convertedRef.current = converted;
  }, [converted]);

  // Revoke all blob URLs on unmount
  useEffect(() => {
    return () => {
      convertedRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    // Revoke previous URLs
    convertedRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    setConverted([]);
    setDone(false);
    setFiles(newFiles);
  }, []);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);

    // Revoke previous URLs
    convertedRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    const results: ConvertedFile[] = [];

    try {
      // Dynamic import of heic2any (browser-only, no SSR)
      const heic2any = (await import("heic2any")).default;

      for (let i = 0; i < files.length; i++) {
        setConvertingIndex(i);
        const file = files[i];
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const selected = outputFormats.find((f) => f.id === outputFormat)!;

        try {
          // Step 1: Convert HEIC → intermediate blob (jpeg or png)
          const intermediateBlob = await heic2any({
            blob: file,
            toType: outputFormat === "webp" ? "image/png" : selected.mime,
            quality: quality,
          });

          // heic2any may return an array
          const singleBlob: Blob = Array.isArray(intermediateBlob)
            ? intermediateBlob[0]
            : intermediateBlob;

          // Step 2: If WebP, re-encode via canvas
          if (outputFormat === "webp") {
            const img = new globalThis.Image();
            const objectUrl = URL.createObjectURL(singleBlob);

            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error("Failed to load converted image"));
              img.src = objectUrl;
            });

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(objectUrl);

            const webpBlob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, "image/webp", quality)
            );

            if (!webpBlob) throw new Error("Failed to encode as WebP");

            const url = URL.createObjectURL(webpBlob);
            results.push({
              originalName: file.name,
              originalSize: file.size,
              blob: webpBlob,
              url,
              newName: `${baseName}.${selected.ext}`,
              newSize: webpBlob.size,
              status: "done",
            });
          } else {
            // For JPG/PNG: if quality < 1 and JPG, re-encode via canvas to apply quality
            if (outputFormat === "jpg" && quality < 1) {
              const img = new globalThis.Image();
              const objectUrl = URL.createObjectURL(singleBlob);

              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Failed to load converted image"));
                img.src = objectUrl;
              });

              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d")!;
              // White background for JPG (no transparency)
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(objectUrl);

              const jpgBlob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/jpeg", quality)
              );

              if (!jpgBlob) throw new Error("Failed to encode as JPG");

              const url = URL.createObjectURL(jpgBlob);
              results.push({
                originalName: file.name,
                originalSize: file.size,
                blob: jpgBlob,
                url,
                newName: `${baseName}.${selected.ext}`,
                newSize: jpgBlob.size,
                status: "done",
              });
            } else {
              const url = URL.createObjectURL(singleBlob);
              results.push({
                originalName: file.name,
                originalSize: file.size,
                blob: singleBlob,
                url,
                newName: `${baseName}.${selected.ext}`,
                newSize: singleBlob.size,
                status: "done",
              });
            }
          }
        } catch (err) {
          console.error(`Failed to convert ${file.name}:`, err);
          results.push({
            originalName: file.name,
            originalSize: file.size,
            blob: new Blob(),
            url: "",
            newName: "",
            newSize: 0,
            status: "error",
            errorMsg: err instanceof Error ? err.message : "Conversion failed",
          });
        }
      }

      setConverted(results);
      setDone(true);
    } catch (err) {
      console.error("heic2any import error:", err);
      addToast("error", "Failed to load HEIC converter. Please ensure you're using a modern browser.");
    } finally {
      setProcessing(false);
      setConvertingIndex(-1);
    }
  }, [files, outputFormat, quality, addToast]);

  const downloadAllZip = useCallback(async () => {
    if (converted.length === 0) return;
    setZipping(true);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const file of converted) {
        if (file.status === "error") continue;
        zip.file(file.newName, file.blob);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted-images.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP error:", err);
      addToast("error", "Failed to create ZIP file.");
    } finally {
      setZipping(false);
    }
  }, [converted]);

  const removeConverted = useCallback(
    (index: number) => {
      const file = converted[index];
      if (file.url) URL.revokeObjectURL(file.url);
      const updated = converted.filter((_, i) => i !== index);
      setConverted(updated);
      if (updated.length === 0) setDone(false);
    },
    [converted, addToast]
  );

  const handleReset = useCallback(() => {
    converted.forEach((f) => {
      if (f.url) URL.revokeObjectURL(f.url);
    });
    setFiles([]);
    setConverted([]);
    setDone(false);
    setProcessing(false);
    setOutputFormat("jpg");
    setQuality(0.92);
    setConvertingIndex(-1);
  }, [converted]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalOriginal = files.reduce((sum, f) => sum + f.size, 0);
  const totalConverted = converted.reduce(
    (sum, f) => sum + (f.status === "done" ? f.newSize : 0),
    0
  );
  const successCount = converted.filter((f) => f.status === "done").length;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Smartphone}
          title="HEIC to JPG"
          description="Convert iPhone HEIC/HEIF photos to JPG, PNG, or WebP — batch supported, free, and completely private. No server uploads required."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            {/* Upload Area */}
            <FileUpload
              accept=".heic,.heif,.hif"
              files={files}
              onFilesChange={handleFileChange}
              label="Drop your HEIC/HEIF photos here"
              description="or click to browse — HEIC, HEIF, and HIF files from iPhone & iPad"
              multiple
            />

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </h3>
                  <span className="text-xs text-foreground-secondary">
                    {formatSize(totalOriginal)} total
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {files.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-1 border border-border"
                    >
                      <ImageIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-foreground truncate flex-1">
                        {file.name}
                      </span>
                      <span className="text-xs text-foreground-secondary flex-shrink-0">
                        {formatSize(file.size)}
                      </span>
                      {processing && convertingIndex === i && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary flex-shrink-0" />
                      )}
                      {processing && convertingIndex > i && (
                        <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Format Selection */}
            {files.length > 0 && (
              <div className="mt-8 animate-fade-in-up">
                <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Output Format
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {outputFormats.map((format) => (
                    <button
                      key={format.id}
                      role="radio"
                      aria-checked={outputFormat === format.id}
                      onClick={() => setOutputFormat(format.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        outputFormat === format.id
                          ? "border-primary bg-primary-muted shadow-sm"
                          : "border-border hover:border-primary-border hover:bg-surface-2"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                            outputFormat === format.id
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {outputFormat === format.id && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="font-semibold text-xs text-foreground">
                          {format.label}
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted ml-6">
                        {format.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Quality Slider (for JPG and WebP) */}
                {(outputFormat === "jpg" || outputFormat === "webp") && (
                  <div className="mt-6 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground">
                        Quality
                      </label>
                      <span className="text-xs text-primary font-semibold">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.02"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary"
                    />
                    <div className="flex justify-between text-xs text-foreground-muted mt-1">
                      <span>Smaller file</span>
                      <span>Higher quality</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            {files.length > 0 && (
              <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                {processing && (
                  <p className="text-xs text-foreground-secondary mb-3 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    Converting file {convertingIndex + 1} of {files.length}...
                  </p>
                )}
                <button
                  onClick={handleConvert}
                  disabled={processing}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      Convert {files.length} file{files.length !== 1 ? "s" : ""} to{" "}
                      {outputFormats.find((f) => f.id === outputFormat)?.label}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Success / Results State */
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Conversion Complete!
              </h3>
              <p className="text-foreground-secondary text-sm max-w-md mx-auto">
                {successCount} of {converted.length} file
                {converted.length !== 1 ? "s" : ""} converted to{" "}
                {outputFormats.find((f) => f.id === outputFormat)?.label}
                {successCount > 0 && (
                  <>
                    {" "}
                    — {formatSize(totalOriginal)} → {formatSize(totalConverted)}
                    {totalConverted < totalOriginal && (
                      <span className="text-success ml-1 font-semibold">
                        ({Math.round((1 - totalConverted / totalOriginal) * 100)}%
                        smaller)
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Converted file list */}
            <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
              {converted.map((file, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    file.status === "error"
                      ? "bg-red-50 border-red-100"
                      : "bg-surface-1 border-border hover:bg-surface-2"
                  }`}
                >
                  {file.status === "done" ? (
                    <>
                      <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {file.originalName} → {file.newName}
                        </p>
                        <p className="text-xs text-foreground-secondary">
                          {formatSize(file.originalSize)} →{" "}
                          {formatSize(file.newSize)}
                          {file.newSize < file.originalSize && (
                            <span className="text-success ml-1">
                              ({Math.round((1 - file.newSize / file.originalSize) * 100)}%
                              smaller)
                            </span>
                          )}
                        </p>
                      </div>
                      <a
                        href={file.url}
                        download={file.newName}
                        className="p-2 rounded-lg hover:bg-primary-muted text-primary transition-colors flex-shrink-0"
                        aria-label={`Download ${file.newName}`}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => removeConverted(i)}
                        className="p-2 rounded-lg hover:bg-red-50 text-foreground-secondary hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label={`Remove ${file.newName}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-700 truncate">
                          {file.originalName} — Failed
                        </p>
                        <p className="text-xs text-red-500">
                          {file.errorMsg || "Conversion error"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeConverted(i)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors flex-shrink-0"
                        aria-label={`Remove ${file.originalName}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {successCount > 1 && (
                <button
                  onClick={downloadAllZip}
                  disabled={zipping}
                  className="btn btn-primary inline-flex items-center gap-2 text-center"
                >
                  {zipping ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Creating ZIP...
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-5 h-5" /> Download All as ZIP
                    </>
                  )}
                </button>
              )}
              {successCount === 1 && (
                <a
                  href={converted.find((f) => f.status === "done")?.url}
                  download={converted.find((f) => f.status === "done")?.newName}
                  className="btn btn-primary inline-flex items-center gap-2 text-center"
                >
                  <Download className="w-5 h-5" /> Download{" "}
                  {outputFormats.find((f) => f.id === outputFormat)?.label}
                </a>
              )}
              <button
                onClick={handleReset}
                className="btn btn-secondary inline-flex items-center gap-2 text-center"
              >
                <ResetIcon className="w-4 h-4" /> Convert More
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                100% Browser-Based & Private
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All conversion happens locally using WebAssembly. Your iPhone
                photos never leave your device — no server upload, no cloud
                processing, no data retention.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Batch Conversion with Quality Control
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Convert multiple HEIC files at once. Choose JPG (most
                compatible), PNG (lossless with transparency), or WebP (modern &
                compact). Adjust quality to balance file size and clarity.
              </p>
            </div>
          </div>
        </div>

        {/* HEIC info banner */}
        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-blue-800 mb-1">
              About HEIC/HEIF
            </h4>
            <ul className="text-xs text-blue-700 leading-relaxed space-y-1">
              <li>
                <strong>HEIC</strong> (High Efficiency Image Container) is the
                default photo format on iPhones since iOS 11. It uses HEVC
                compression for smaller files than JPG at equal quality.
              </li>
              <li>
                <strong>Why convert?</strong> Many websites, apps, and Windows
                devices don&apos;t natively support HEIC. Converting to JPG or
                PNG ensures universal compatibility.
              </li>
              <li>
                <strong>Quality tip:</strong> JPG at 92% quality is visually
                indistinguishable from the original HEIC while keeping file
                sizes reasonable.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
