"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Check,
  Loader2,
  Shield,
  Zap,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

const outputFormats = [
  {
    id: "png",
    label: "PNG",
    description: "Lossless, supports transparency. Best for graphics & screenshots.",
    mime: "image/png",
    ext: "png",
  },
  {
    id: "jpg",
    label: "JPG",
    description: "Lossy, smaller files. Best for photos & web uploads.",
    mime: "image/jpeg",
    ext: "jpg",
  },
  {
    id: "webp",
    label: "WebP",
    description: "Modern format, superior compression. Best for web performance.",
    mime: "image/webp",
    ext: "webp",
  },
  {
    id: "gif",
    label: "GIF",
    description: "Widely compatible, 256-color palette. Best for simple graphics.",
    mime: "image/gif",
    ext: "gif",
  },
  {
    id: "svg",
    label: "SVG",
    description: "Scalable vector wrapper. Embeds image inside an SVG container.",
    mime: "image/svg+xml",
    ext: "svg",
  },
];

export default function ConvertImagePage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState("png");
  const [quality, setQuality] = useState(0.92);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [newSize, setNewSize] = useState(0);

  const getInputType = () => {
    if (files.length === 0) return null;
    const ext = files[0].name.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg"].includes(ext)) return "jpg";
    if (ext === "png") return "png";
    if (ext === "webp") return "webp";
    if (ext === "bmp") return "bmp";
    if (ext === "gif") return "gif";
    if (ext === "svg") return "svg";
    if (["heic", "heif", "hif"].includes(ext)) return "heic";
    return "other";
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      const file = files[0];
      let loadableBlob: Blob = file;

      // HEIC files can't be loaded by the browser — convert to PNG first via heic2any
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (["heic", "heif", "hif"].includes(ext)) {
        const heic2any = (await import("heic2any")).default;
        const intermediate = await heic2any({ blob: file, toType: "image/png" });
        loadableBlob = Array.isArray(intermediate) ? intermediate[0] : intermediate;
      }

      const img = new globalThis.Image();
      const objectUrl = URL.createObjectURL(loadableBlob);

      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = objectUrl;
        });
      } catch {
        URL.revokeObjectURL(objectUrl);
        throw new Error("Failed to load image. If this is an HEIC file, it may be corrupted or unsupported.");
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        throw new Error("Failed to get canvas context");
      }

      // SVG files without explicit width/height attributes render at 0×0
      if (img.width === 0 || img.height === 0) {
        URL.revokeObjectURL(objectUrl);
        throw new Error(
          "Image could not be loaded — SVG files may need explicit width/height attributes."
        );
      }

      const selected = outputFormats.find((f) => f.id === outputFormat)!;

      // Draw image on canvas first (needed for all formats)
      // JPG and GIF don't support full transparency — fill white background first
      if (selected.id === "jpg" || selected.id === "gif") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      let blob: Blob | null = null;

      if (selected.id === "gif") {
        // GIF encoding via gif-encoder-2
        const GIFEncoder = (await import("gif-encoder-2")).default;
        const encoder = new GIFEncoder(img.width, img.height, "neuquant", true);
        encoder.start();
        encoder.addFrame(ctx);
        encoder.finish();
        const buf = encoder.out.getData();
        blob = new Blob([new Uint8Array(buf)], { type: "image/gif" });
      } else if (selected.id === "svg") {
        // SVG: embed raster image as base64 inside an SVG wrapper
        const dataUrl = canvas.toDataURL("image/png");
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">\n  <image href="${dataUrl}" width="${img.width}" height="${img.height}"/>\n</svg>`;
        blob = new Blob([svgString], { type: "image/svg+xml" });
      } else {
        // PNG, JPG, WebP — use canvas.toBlob
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, selected.mime, quality)
        );
      }

      if (blob) {
        setOriginalSize(file.size);
        setNewSize(blob.size);
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDone(true);
      }
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to convert image.");
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setOutputFormat("png");
    setQuality(0.92);
    setOriginalSize(0);
    setNewSize(0);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const inputType = getInputType();

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={ArrowRightLeft}
          title="Convert Image"
          description="Switch image formats freely — PNG, JPG, WebP, SVG, and more. Batch conversion supported with no watermarks, no signup, and 100% client-side privacy."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              {/* Upload Area */}
              <FileUpload
                accept=".jpg,.jpeg,.png,.webp,.bmp,.gif,.svg,.heic,.heif,.hif"
                files={files}
                onFilesChange={setFiles}

                label="Drop your image here"
                description="or click to browse — PNG, JPG, WebP, BMP, GIF, SVG, HEIC supported"
              />

              {/* Format Selection */}
              {files.length > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Output Format
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {outputFormats.map((format) => {
                      const isCurrentFormat = inputType === format.id;
                      return (
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
                          {isCurrentFormat && (
                            <span className="text-[10px] font-semibold bg-primary-muted text-primary px-1.5 py-0.5 rounded-full ml-6 mt-1 inline-block">
                              Same as input
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* GIF info banner */}
                  {outputFormat === "gif" && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-warning text-xs flex items-start gap-2 animate-fade-in-up">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>GIF uses a 256-color palette. Photos or complex images may lose color detail.</span>
                    </div>
                  )}

                  {/* SVG info banner */}
                  {outputFormat === "svg" && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-start gap-2 animate-fade-in-up">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Output will be an SVG file with your raster image embedded inside. It will scale without pixelation but won&apos;t become a true vector graphic.</span>
                    </div>
                  )}

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
                        onChange={(e) =>
                          setQuality(parseFloat(e.target.value))
                        }
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
                  {inputType === outputFormat && (
                    <p className="text-xs text-orange-500 mb-3 flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      Output format is the same as input — the file will be re-encoded but not converted.
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
                        <ArrowRightLeft className="w-5 h-5" />
                        Convert to{" "}
                        {outputFormats.find((f) => f.id === outputFormat)?.label}
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Image Converted Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your image has been converted from{" "}
                {files[0]?.name.split(".").pop()?.toUpperCase()} to{" "}
                {outputFormats.find((f) => f.id === outputFormat)?.label}.
              </p>

              {/* Size Comparison */}
              <div className="inline-flex items-center gap-4 bg-primary-muted border border-primary-border rounded-xl px-6 py-4 mb-6">
                <ArrowRightLeft className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">
                    {files[0]?.name} →{" "}
                    {files[0]?.name.replace(/\.[^/.]+$/, "")}.
                    {outputFormats.find((f) => f.id === outputFormat)?.ext}
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    {formatSize(originalSize)} → {formatSize(newSize)}
                    {newSize < originalSize && (
                      <span className="text-success ml-2 font-semibold">
                        ({Math.round((1 - newSize / originalSize) * 100)}%
                        smaller)
                      </span>
                    )}
                    {newSize > originalSize && (
                      <span className="text-orange-500 ml-2 font-semibold">
                        ({Math.round((newSize / originalSize - 1) * 100)}%
                        larger)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={files[0]?.name.replace(
                      /\.[^/.]+$/,
                      `.${outputFormats.find((f) => f.id === outputFormat)?.ext}`
                    )}
                    className="btn btn-primary inline-flex items-center gap-2 text-center"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                    Download{" "}
                    {outputFormats.find((f) => f.id === outputFormat)?.label}
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  Convert Another Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                100% Browser-Based
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All conversion happens locally in your browser. Your images are
                never uploaded to any server — complete privacy guaranteed.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Smart Conversion
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Automatically handles transparency when converting to JPG
                (white background fill) and preserves it for PNG, WebP, and
                SVG outputs. GIF uses optimized 256-color quantization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
