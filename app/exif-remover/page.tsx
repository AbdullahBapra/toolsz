"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Image as ImageIcon,
  RotateCcw as ResetIcon,
  MapPin,
  Camera,
  Clock,
  Info,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface ExifData {
  [key: string]: unknown;
}

interface ProcessedFile {
  originalName: string;
  originalSize: number;
  blob: Blob;
  url: string;
  newName: string;
  newSize: number;
  exifData: ExifData | null;
  hasGPS: boolean;
  hasCamera: boolean;
  hasDate: boolean;
  status: "done" | "error";
  errorMsg?: string;
}

const EXIF_CATEGORIES = [
  { key: "GPS", label: "GPS / Location", icon: MapPin, color: "text-red-500" },
  { key: "camera", label: "Camera / Device", icon: Camera, color: "text-blue-500" },
  { key: "date", label: "Date / Time", icon: Clock, color: "text-green-500" },
];

function categorizeExifKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.includes("gps") || lower.includes("latitude") || lower.includes("longitude") || lower.includes("altitude"))
    return "GPS";
  if (lower.includes("make") || lower.includes("model") || lower.includes("lens") || lower.includes("focal") || lower.includes("exposure") || lower.includes("iso") || lower.includes("aperture") || lower.includes("flash") || lower.includes("white") || lower.includes("software"))
    return "camera";
  if (lower.includes("date") || lower.includes("time") || lower.includes("modify") || lower.includes("create"))
    return "date";
  return "other";
}

function formatExifValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(4);
  }
  if (value instanceof Date) return value.toLocaleString();
  if (Array.isArray(value)) return value.map((v) => formatExifValue(v)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function ExifRemoverPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [processed, setProcessed] = useState<ProcessedFile[]>([]);
  const [viewingExif, setViewingExif] = useState<number | null>(null);

  const processedRef = useRef<ProcessedFile[]>([]);

  useEffect(() => {
    processedRef.current = processed;
  }, [processed]);

  // Revoke all blob URLs on unmount
  useEffect(() => {
    return () => {
      processedRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    processedRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    setProcessed([]);
    setDone(false);
    setViewingExif(null);
    setFiles(newFiles);
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);

    processedRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    const results: ProcessedFile[] = [];

    try {
      const exifr = (await import("exifr")).default;

      for (const file of files) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

        try {
          // Read EXIF data
          let exifData: ExifData | null = null;
          try {
            exifData = await exifr.parse(file);
          } catch {
            // No EXIF or unsupported format
          }

          const hasGPS = exifData
            ? Object.keys(exifData).some((k) => categorizeExifKey(k) === "GPS")
            : false;
          const hasCamera = exifData
            ? Object.keys(exifData).some((k) => categorizeExifKey(k) === "camera")
            : false;
          const hasDate = exifData
            ? Object.keys(exifData).some((k) => categorizeExifKey(k) === "date")
            : false;

          // Strip EXIF by re-encoding via canvas
          const img = new globalThis.Image();
          const objectUrl = URL.createObjectURL(file);

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = objectUrl;
          });

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;

          // For JPG, fill white background (no alpha)
          const outputMime = ["jpg", "jpeg"].includes(ext) ? "image/jpeg" : "image/png";
          if (outputMime === "image/jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(objectUrl);

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, outputMime, 0.95)
          );

          if (!blob) throw new Error("Failed to re-encode image");

          const url = URL.createObjectURL(blob);
          results.push({
            originalName: file.name,
            originalSize: file.size,
            blob,
            url,
            newName: `${baseName}_clean.${ext === "jpeg" ? "jpg" : ext}`,
            newSize: blob.size,
            exifData,
            hasGPS,
            hasCamera,
            hasDate,
            status: "done",
          });
        } catch (err) {
          console.error(`Failed to process ${file.name}:`, err);
          results.push({
            originalName: file.name,
            originalSize: file.size,
            blob: new Blob(),
            url: "",
            newName: "",
            newSize: 0,
            exifData: null,
            hasGPS: false,
            hasCamera: false,
            hasDate: false,
            status: "error",
            errorMsg: err instanceof Error ? err.message : "Processing failed",
          });
        }
      }

      setProcessed(results);
      setDone(true);
    } catch (err) {
      console.error("exifr import error:", err);
      addToast("error", "Failed to load EXIF reader. Please try a modern browser.");
    } finally {
      setProcessing(false);
    }
  }, [files, addToast]);

  const handleReset = useCallback(() => {
    processed.forEach((f) => {
      if (f.url) URL.revokeObjectURL(f.url);
    });
    setFiles([]);
    setProcessed([]);
    setDone(false);
    setProcessing(false);
    setViewingExif(null);
  }, [processed]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const currentViewExif = viewingExif !== null ? processed[viewingExif] : null;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={ShieldCheck}
          title="EXIF Remover"
          description="View and strip GPS location, camera info, and timestamp metadata from your photos for privacy — free, instant, and completely private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept=".jpg,.jpeg,.png,.webp,.tiff,.tif,.heic,.heif,.hif,.avif"
              files={files}
              onFilesChange={handleFileChange}
              label="Drop your photos here"
              description="or click to browse — JPG, PNG, WebP, TIFF, HEIC supported"
              multiple
            />

            {files.length > 0 && (
              <div className="mt-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </h3>
                  <span className="text-xs text-foreground-secondary">
                    {formatSize(files.reduce((s, f) => s + f.size, 0))} total
                  </span>
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-6 flex flex-col items-center animate-fade-in-up">
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing & Stripping...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      View EXIF & Strip Metadata
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results */}
            {processed.map((file, i) => (
              <div
                key={i}
                className={`glass-panel rounded-[16px] p-5 animate-fade-in-up ${
                  file.status === "error" ? "border-red-200" : ""
                }`}
              >
                {file.status === "error" ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <X className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-700">{file.originalName} — Failed</p>
                      <p className="text-xs text-red-500">{file.errorMsg}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{file.originalName}</p>
                        <p className="text-xs text-foreground-secondary">
                          {formatSize(file.originalSize)} → {formatSize(file.newSize)}
                          {file.newSize < file.originalSize && (
                            <span className="text-success ml-1">
                              ({Math.round((1 - file.newSize / file.originalSize) * 100)}% smaller)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* EXIF badges */}
                        {EXIF_CATEGORIES.filter((cat) => {
                          if (cat.key === "GPS") return file.hasGPS;
                          if (cat.key === "camera") return file.hasCamera;
                          if (cat.key === "date") return file.hasDate;
                          return false;
                        }).map((cat) => (
                          <span
                            key={cat.key}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-2 border border-border text-xs font-semibold ${cat.color}`}
                          >
                            <cat.icon className="w-3 h-3" />
                            {cat.label} found
                          </span>
                        ))}
                        {!file.hasGPS && !file.hasCamera && !file.hasDate && file.exifData && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-2 border border-border text-xs font-semibold text-foreground-secondary">
                            Minimal EXIF
                          </span>
                        )}
                        {!file.exifData && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-100 text-xs font-semibold text-green-700">
                            No EXIF data
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                      <a
                        href={file.url}
                        download={file.newName}
                        className="btn btn-primary inline-flex items-center gap-2 text-xs"
                      >
                        <Download className="w-4 h-4" /> Download Clean Image
                      </a>
                      {file.exifData && Object.keys(file.exifData).length > 0 && (
                        <button
                          onClick={() => setViewingExif(viewingExif === i ? null : i)}
                          className="btn btn-secondary inline-flex items-center gap-2 text-xs"
                        >
                          <Eye className="w-4 h-4" />
                          {viewingExif === i ? "Hide EXIF" : "View Original EXIF"}
                        </button>
                      )}
                    </div>

                    {/* EXIF detail view */}
                    {viewingExif === i && file.exifData && (
                      <div className="mt-4 p-4 rounded-xl bg-surface-1 border border-border animate-fade-in-up">
                        <h4 className="text-xs font-semibold text-foreground mb-3">
                          Original EXIF Data ({Object.keys(file.exifData).length} fields)
                        </h4>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {Object.entries(file.exifData).map(([key, value]) => {
                            const cat = categorizeExifKey(key);
                            const catInfo = EXIF_CATEGORIES.find((c) => c.key === cat);
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-surface-2 transition-colors"
                              >
                                {catInfo && (
                                  <catInfo.icon className={`w-3.5 h-3.5 flex-shrink-0 ${catInfo.color}`} />
                                )}
                                <span className="text-xs font-mono font-semibold text-foreground min-w-[140px]">
                                  {key}
                                </span>
                                <span className="text-xs text-foreground-secondary truncate">
                                  {formatExifValue(value)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={handleReset}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <ResetIcon className="w-4 h-4" /> Process More Images
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
                True EXIF Stripping — 100% Private
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                EXIF data is permanently removed by re-encoding the image. GPS
                coordinates, camera serial numbers, and timestamps cannot be
                recovered. Everything runs in your browser — no upload needed.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                View Before You Strip
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                See exactly what metadata your photo contains — GPS location,
                camera model, lens info, timestamps — before deciding to strip
                it. Batch support for processing multiple photos at once.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy tip */}
        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-amber-800 mb-1">
              Why strip EXIF data?
            </h4>
            <ul className="text-xs text-amber-700 leading-relaxed space-y-1">
              <li>
                <strong>GPS:</strong> Photos from smartphones often contain exact
                GPS coordinates — revealing your home, workplace, or travel
                locations.
              </li>
              <li>
                <strong>Device info:</strong> Camera model, lens, and serial
                numbers can be used to identify you across multiple images.
              </li>
              <li>
                <strong>Timestamps:</strong> Exact date/time of capture can
                reveal when and where a photo was taken.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
