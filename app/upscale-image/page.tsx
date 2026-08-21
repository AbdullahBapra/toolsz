"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Maximize2,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type ScaleFactor = "2x" | "3x" | "4x";

const scaleOptions: { id: ScaleFactor; label: string; value: number }[] = [
  { id: "2x", label: "2× Upscale", value: 2 },
  { id: "3x", label: "3× Upscale", value: 3 },
  { id: "4x", label: "4× Upscale", value: 4 },
];

export default function UpscaleImagePage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState<ScaleFactor>("2x");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const outputRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    };
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (outputRef.current) { URL.revokeObjectURL(outputRef.current); setOutputUrl(null); }
    setFiles(newFiles);
    setDone(false);
    if (newFiles.length === 0) { setImageUrl(null); setImageSize({ width: 0, height: 0 }); return; }
    const url = URL.createObjectURL(newFiles[0]);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
  }, [imageUrl]);

  const scaleValue = scaleOptions.find((s) => s.id === scaleFactor)?.value ?? 2;

  const handleProcess = useCallback(async () => {
    if (!imageUrl || files.length === 0) {
      addToast("error", "Please upload an image first");
      return;
    }
    setProcessing(true);
    setProgress(0);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl!;
      });

      const newW = img.naturalWidth * scaleValue;
      const newH = img.naturalHeight * scaleValue;

      // Cap at 8000px to avoid memory issues
      const maxDim = 8000;
      const actualScale = Math.min(scaleValue, maxDim / Math.max(img.naturalWidth, img.naturalHeight));

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * actualScale);
      canvas.height = Math.round(img.naturalHeight * actualScale);
      const ctx = canvas.getContext("2d")!;

      // Use high-quality interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      setProgress(30);

      // Multi-step upscaling for better quality (step up in increments of 2x)
      if (actualScale > 2) {
        // Step 1: 2x
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.naturalWidth * 2;
        tempCanvas.height = img.naturalHeight * 2;
        const tempCtx = tempCanvas.getContext("2d")!;
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = "high";
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        setProgress(50);

        // Step 2: from 2x to final
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        setProgress(80);
      } else {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setProgress(80);
      }

      // Apply slight sharpening
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Simple unsharp mask: enhance edges slightly
      const output = new Uint8ClampedArray(data);
      const strength = 0.3;

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          for (let c = 0; c < 3; c++) {
            const idx = (y * w + x) * 4 + c;
            const center = data[idx];
            const neighbors = (
              data[((y - 1) * w + x) * 4 + c] +
              data[((y + 1) * w + x) * 4 + c] +
              data[(y * w + (x - 1)) * 4 + c] +
              data[(y * w + (x + 1)) * 4 + c]
            ) / 4;
            const diff = center - neighbors;
            output[idx] = Math.min(255, Math.max(0, center + diff * strength));
          }
        }
      }

      const finalData = new ImageData(output, w, h);
      ctx.putImageData(finalData, 0, 0);
      setProgress(95);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      const url = URL.createObjectURL(blob);
      if (outputRef.current) URL.revokeObjectURL(outputRef.current);
      outputRef.current = url;
      setOutputUrl(url);
      setDone(true);
      setProgress(100);
      addToast("success", `Image upscaled to ${Math.round(img.naturalWidth * actualScale)}×${Math.round(img.naturalHeight * actualScale)}!`);
    } catch (err) {
      console.error("Upscale failed:", err);
      addToast("error", "Failed to upscale image. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [imageUrl, files, scaleValue, addToast]);

  const handleDownload = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `upscaled-${scaleFactor}.png`;
    a.click();
  }, [outputUrl, scaleFactor]);

  const handleReset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    setFiles([]);
    setImageUrl(null);
    setOutputUrl(null);
    setDone(false);
    setImageSize({ width: 0, height: 0 });
    outputRef.current = null;
  }, [imageUrl]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Maximize2}
          title="Image Upscaler"
          description="Upscale images up to 4× with multi-step interpolation and unsharp mask sharpening — free, browser-based, and completely private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload
                accept="image/*"
                files={files}
                onFilesChange={handleFileChange}
                label="Drop an image here or click to upload"
                description="or click to browse — PNG, JPG, WebP supported"
              />

            {imageUrl && (
              <div className="mt-8 animate-fade-in-up space-y-6">
                {/* Preview */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Maximize2 className="w-5 h-5 text-primary" />
                    Original Image
                  </h3>
                  <div className="flex justify-center">
                    <img src={imageUrl} alt="Original" className="max-w-full max-h-72 rounded-lg" />
                  </div>
                  <p className="text-xs text-foreground-muted mt-3 text-center">
                    Current size: {imageSize.width} × {imageSize.height}px
                  </p>
                </div>

                {/* Scale options */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Upscale Factor
                  </h3>
                  <div className="flex gap-3">
                    {scaleOptions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setScaleFactor(s.id)}
                        className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition ${
                          scaleFactor === s.id
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <span className="text-lg font-bold">{s.label}</span>
                        <span className="block text-xs text-foreground-muted mt-1">
                          {imageSize.width * s.value} × {imageSize.height * s.value}px
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Upscaling... {progress}%
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-5 h-5" />
                        Upscale Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8 animate-fade-in-up">
            <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Image Upscaled!</h3>
            <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
              Your image has been enlarged with high-quality interpolation and sharpening.
            </p>

            <div className="flex items-start justify-center gap-6 flex-wrap mb-6">
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground-muted mb-2">Before</p>
                <img src={imageUrl!} alt="Original" className="w-48 h-48 object-contain rounded-lg border border-border bg-surface-1" />
                <p className="text-xs text-foreground-muted mt-2">{imageSize.width} × {imageSize.height}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-primary mb-2">After ({scaleFactor})</p>
                <img src={outputUrl!} alt="Upscaled" className="w-48 h-48 object-contain rounded-lg border border-primary-border bg-surface-1" />
                <p className="text-xs text-foreground-muted mt-2">{imageSize.width * scaleValue} × {imageSize.height * scaleValue}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="btn btn-primary inline-flex items-center gap-2 text-center"
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>
              <button
                onClick={handleReset}
                className="btn btn-secondary inline-flex items-center gap-2 text-center"
              >
                <RotateCcw className="w-4 h-4" />
                Upscale Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Upscaling happens entirely in your browser. Your image is never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Smart Sharpening</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Uses multi-step interpolation with unsharp mask sharpening for high-quality results. Maximum output dimension is 8000px.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
