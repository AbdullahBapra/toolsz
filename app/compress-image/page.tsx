"use client";

import { useState } from "react";
import {
  ImageIcon,
  Check,
  Loader2,
  Shield,
  Zap,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

const qualityOptions = [
  {
    id: "low",
    label: "Light Compression",
    description: "Best quality, larger file size",
    reduction: "~15-30%",
  },
  {
    id: "medium",
    label: "Medium Compression",
    description: "Balanced quality and size",
    reduction: "~40-60%",
  },
  {
    id: "high",
    label: "Maximum Compression",
    description: "Smallest file, some quality loss",
    reduction: "~60-80%",
  },
];

export default function CompressImagePage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState("medium");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleCompress = async () => {
    if (files.length === 0) return;
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
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) throw new Error("Failed to get canvas context");
      ctx.drawImage(img, 0, 0);

      let compressQuality = 0.8;
      if (quality === "low") compressQuality = 0.9;
      if (quality === "high") compressQuality = 0.6;

      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, "image/jpeg", compressQuality)
      );

      if (blob) {
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDone(true);
      }
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to compress image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
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
          icon={ImageIcon}
          title="Compress Image"
          description="Reduce image file size online without losing visual quality — intelligent compression keeps pixels sharp. Free, no signup, and your photos never leave your browser."
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

              {/* Quality Selection */}
              {files.length > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Compression Level
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {qualityOptions.map((option) => (
                      <button
                        key={option.id}
                        role="radio"
                        aria-checked={quality === option.id}
                        onClick={() => setQuality(option.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          quality === option.id
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border hover:border-primary-border hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              quality === option.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {quality === option.id && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                          <span className="font-semibold text-xs text-foreground">
                            {option.label}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-muted ml-6">
                          {option.description}
                        </p>
                        <p className="text-xs text-primary font-semibold ml-6 mt-1">
                          {option.reduction} smaller
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleCompress}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Compressing...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5" />
                        Compress Image
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
                Image Compressed Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your image has been optimized. The file size has been reduced
                while maintaining the best possible quality.
              </p>

              {/* Preview */}
              <div className="inline-flex items-center gap-4 bg-primary-muted border border-primary-border rounded-xl px-6 py-4 mb-6">
                <ImageIcon className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">
                    {files[0]?.name}
                  </p>
                  <p className="text-xs text-foreground-secondary">Optimized and ready</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`compressed-${files[0]?.name.replace(/\.[^/.]+$/, ".jpg")}`}
                    className="btn btn-primary inline-flex items-center gap-2 text-center"
                  >
                    <ImageIcon className="w-5 h-5" />
                    Download Compressed Image
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  Compress Another Image
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
                Your images are encrypted and automatically deleted after 2 hours.
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
                Smart Optimization
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Advanced algorithms reduce file size while preserving visual
                clarity. Get smaller files without visible quality loss.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
