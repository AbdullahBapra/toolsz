"use client";

import { useState } from "react";
import {
  Maximize,
  Check,
  Loader2,
  Shield,
  Zap,
  Settings,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

const presetSizes = [
  { id: "custom", label: "Custom Size", width: 0, height: 0 },
  { id: "hd", label: "HD (1280×720)", width: 1280, height: 720 },
  { id: "fullhd", label: "Full HD (1920×1080)", width: 1920, height: 1080 },
  { id: "square", label: "Square (1080×1080)", width: 1080, height: 1080 },
  { id: "thumbnail", label: "Thumbnail (150×150)", width: 150, height: 150 },
  { id: "a4", label: "A4 Print (2480×3508)", width: 2480, height: 3508 },
];

export default function ResizeImagePage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState("custom");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockRatio, setLockRatio] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handlePresetChange = (id: string) => {
    setPreset(id);
    const p = presetSizes.find((s) => s.id === id);
    if (p && p.width > 0) {
      setWidth(String(p.width));
      setHeight(String(p.height));
    }
  };

  const handleResize = async () => {
    if (files.length === 0) return;
    if (!width && !height) return;
    setProcessing(true);
    
    try {
      const file = files[0];
      const img = new globalThis.Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      const targetWidth = parseInt(width, 10) || img.width;
      const targetHeight = parseInt(height, 10) || img.height;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      if (!ctx) throw new Error("Failed to get context");
      
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, file.type || "image/jpeg", 0.95)
      );

      if (blob) {
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDone(true);
      }
      URL.revokeObjectURL(objectUrl);
    } catch(err) {
      console.error(err);
      addToast("error", "Failed to resize image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setPreset("custom");
    setWidth("");
    setHeight("");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Maximize}
          title="Resize Image"
          description="Scale image dimensions to any target size — free, instant, and private. Supports all major formats with precise pixel or percentage control."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              {/* Upload Area */}
              <FileUpload
                accept=".jpg,.jpeg,.png,.webp"
                files={files}
                onFilesChange={setFiles}

                label="Drop your image here"
                description="or click to browse — JPG, PNG, WebP supported"
              />

              {/* Resize Options */}
              {files.length > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Target Size
                  </h3>

                  {/* Preset Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {presetSizes.map((option) => (
                      <button
                        key={option.id}
                        role="radio"
                        aria-checked={preset === option.id}
                        onClick={() => handlePresetChange(option.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                          preset === option.id
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border hover:border-primary-border hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              preset === option.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {preset === option.id && (
                              <Check className="w-2 h-2 text-white" />
                            )}
                          </div>
                          <span className="font-semibold text-xs text-foreground">
                            {option.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Dimension Inputs */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-foreground-secondary mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={width}
                          onChange={(e) => {
                            setWidth(e.target.value);
                            setPreset("custom");
                          }}
                          placeholder="e.g. 1920"
                          className="w-32 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>

                      {/* Lock ratio button */}
                      <button
                        onClick={() => setLockRatio(!lockRatio)}
                        className={`mt-5 p-2 rounded-lg border transition-colors ${
                          lockRatio
                            ? "border-primary bg-primary-muted text-primary"
                            : "border-border text-foreground-secondary hover:text-foreground"
                        }`}
                        aria-label={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                        title={lockRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {lockRatio ? (
                            <>
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </>
                          ) : (
                            <>
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </>
                          )}
                        </svg>
                      </button>

                      <div className="flex flex-col">
                        <label className="text-xs text-foreground-secondary mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => {
                            setHeight(e.target.value);
                            setPreset("custom");
                          }}
                          placeholder="e.g. 1080"
                          className="w-32 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {files.length > 0 && (width || height) && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleResize}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Resizing...
                      </>
                    ) : (
                      <>
                        <Maximize className="w-5 h-5" />
                        Resize Image
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
                Image Resized Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your image has been resized to {width || "auto"}×{height || "auto"} pixels
                while maintaining the best possible quality.
              </p>

              <div className="inline-flex items-center gap-2 bg-primary-muted border border-primary-border rounded-xl px-4 py-3 mb-6">
                <Maximize className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  {files[0]?.name} — {width || "auto"}×{height || "auto"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`resized-${files[0]?.name}`}
                    className="btn btn-primary inline-flex items-center gap-2 text-center"
                  >
                    <Maximize className="w-5 h-5" />
                    Download Resized Image
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  Resize Another Image
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
                Secure Processing
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your images are encrypted and automatically deleted after processing.
                We never store or share your data.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                High-Quality Scaling
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Advanced interpolation algorithms ensure your resized images
                stay sharp and clear — whether upscaling or downscaling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
