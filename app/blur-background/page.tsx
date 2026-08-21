"use client";

import { useState, useRef } from "react";
import {
  Droplets,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  AlertCircle,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type BlurIntensity = "light" | "medium" | "heavy" | "custom";

const BLUR_PRESETS: { id: BlurIntensity; label: string; value: number; description: string }[] = [
  { id: "light", label: "Light", value: 6, description: "Subtle blur — soft background separation" },
  { id: "medium", label: "Medium", value: 14, description: "Standard portrait-style bokeh effect" },
  { id: "heavy", label: "Heavy", value: 28, description: "Deep blur — strong depth-of-field look" },
  { id: "custom", label: "Custom", value: 14, description: "Set your own blur intensity" },
];

export default function BlurBackgroundPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [progressMsg, setProgressMsg] = useState("");
  const cancelledRef = useRef(false);
  const [cancelling, setCancelling] = useState(false);

  const [blurPreset, setBlurPreset] = useState<BlurIntensity>("medium");
  const [customBlur, setCustomBlur] = useState(14);
  const [edgeSoftness, setEdgeSoftness] = useState(4);
  const [brightnessBoost, setBrightnessBoost] = useState(0);
  const [usedServerFallback, setUsedServerFallback] = useState(false);

  const blurValue = blurPreset === "custom" ? customBlur : BLUR_PRESETS.find((p) => p.id === blurPreset)?.value ?? 14;

  const handleBlur = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError("");
    cancelledRef.current = false;
    setCancelling(false);
    setUsedServerFallback(false);

    // Declare outside try so finally block can access them for cleanup
    let objectUrl: string | null = null;
    let maskUrl: string | null = null;

    try {
      // 1. Load the image onto a canvas
      const file = files[0];
      const img = new globalThis.Image();
      objectUrl = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = objectUrl!;
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      if (cancelledRef.current) throw new Error("cancelled");

      // 2. Run background removal to get the segmentation mask
      const { removeBackground } = await import("@imgly/background-removal");

      // Pass the File directly — removeBackground accepts Blob | File | string
      const blurProgress = (key: string, current: number, total: number) => {
        // If user requested cancel, update message to acknowledge
        if (cancelledRef.current) {
          setProgressMsg('Cancelling after current step...');
          return;
        }
        if (total > 0) {
          const pct = Math.round((current / total) * 100);
          // Map internal key names to user-friendly labels
          const label = key.includes('download') ? 'Downloading AI model'
            : key.includes('compute') ? 'Detecting subject'
            : 'Processing';
          setProgressMsg(`${label}... ${pct}%`);
        } else {
          setProgressMsg('Processing...');
        }
      };

      // device: "gpu" tries WebGPU first (fast, and required for the library to
      // actually honor proxyToWorker — on device: "cpu" it silently ignores the
      // worker flag and runs inference on the main thread, freezing the tab).
      // If WebGPU fails outright, or "succeeds" while silently returning a
      // blank/all-transparent mask, we go straight to the server fallback below.
      //
      // NOTE: deliberately no same-session device: "cpu" retry — the library
      // caches the onnxruntime-web module in a module-level singleton on first
      // use, so after a GPU attempt a CPU retry reuses that cached (wrong)
      // module and reliably fails with "WebAssembly is not initialized yet."
      // The server fallback is strictly more reliable than that retry.
      const attemptBlurRemoval = async () => {
        const result = await removeBackground(file, {
          model: "isnet_fp16",
          device: "gpu",
          proxyToWorker: true,
          output: { format: "image/png", quality: 1 },
          progress: blurProgress,
        });
        if (!(await blobHasVisibleContent(result))) {
          throw new Error("blank-result");
        }
        return result;
      };

      // Last resort: the visitor's browser genuinely can't run the model. Send
      // the image to our own server and process it there with native
      // onnxruntime instead of showing an error — same approach remove.bg
      // uses, just self-hosted. Processed in-memory, never stored.
      const removeBackgroundServerSide = async (): Promise<Blob> => {
        setUsedServerFallback(true);
        setProgressMsg('Processing on our server...');
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/remove-background", { method: "POST", body });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || "Server-side background removal failed");
        }
        return await res.blob();
      };

      const runBlurRemoval = async () => {
        try {
          return await attemptBlurRemoval();
        } catch (gpuErr) {
          console.warn("Client-side background removal failed or was blank, falling back to server:", gpuErr);
          return await removeBackgroundServerSide();
        }
      };

      // Covers the client attempt plus a server round trip (including a
      // possible cold-start model load).
      const blurTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 75_000)
      );
      const resultBlob = await Promise.race([runBlurRemoval(), blurTimeout]);

      if (cancelledRef.current) throw new Error("cancelled");

      // 3. Load the foreground mask (transparent PNG) onto a canvas
      const maskImg = new globalThis.Image();
      maskUrl = URL.createObjectURL(resultBlob);

      await new Promise<void>((resolve, reject) => {
        maskImg.onload = () => resolve();
        maskImg.onerror = () => reject(new Error("Failed to load segmentation mask"));
        maskImg.src = maskUrl!;
      });

      // 4. GPU-accelerated compositing using globalCompositeOperation
      // This is orders of magnitude faster than per-pixel blending in JS.
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = width;
      finalCanvas.height = height;
      const finalCtx = finalCanvas.getContext("2d")!;

      // Step A: Draw the blurred background onto the final canvas
      finalCtx.filter = `blur(${blurValue}px) brightness(${1 + brightnessBoost / 100})`;
      const pad = blurValue * 2;
      finalCtx.drawImage(img, -pad, -pad, width + pad * 2, height + pad * 2);
      finalCtx.filter = "none";

      // Step B: Create feathered mask canvas
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskCtx = maskCanvas.getContext("2d")!;
      if (edgeSoftness > 0) {
        maskCtx.filter = `blur(${edgeSoftness}px)`;
      }
      maskCtx.drawImage(maskImg, 0, 0, width, height);
      maskCtx.filter = "none";

      // Step C: Cut out the foreground area from the blurred background
      // mask alpha > 0 = foreground → remove those pixels from the blurred BG
      finalCtx.globalCompositeOperation = "destination-out";
      finalCtx.drawImage(maskCanvas, 0, 0);

      // Step D: Draw the original sharp image behind the cut-out areas
      // This fills the foreground holes with the sharp original
      finalCtx.globalCompositeOperation = "destination-over";
      finalCtx.drawImage(img, 0, 0);

      // Reset composite mode
      finalCtx.globalCompositeOperation = "source-over";

      // 9. Convert to blob and create download URL
      const outputBlob = await new Promise<Blob | null>((resolve) =>
        finalCanvas.toBlob(resolve, "image/png")
      );

      if (outputBlob) {
        const url = URL.createObjectURL(outputBlob);
        setDownloadUrl(url);

        // Also create a smaller preview for quick display
        const previewCanvas = document.createElement("canvas");
        const maxPreviewDim = 600;
        const scale = Math.min(1, maxPreviewDim / Math.max(width, height));
        previewCanvas.width = Math.round(width * scale);
        previewCanvas.height = Math.round(height * scale);
        const previewCtx = previewCanvas.getContext("2d")!;
        previewCtx.drawImage(finalCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
        const previewBlob = await new Promise<Blob | null>((resolve) =>
          previewCanvas.toBlob(resolve, "image/jpeg", 0.85)
        );
        if (previewBlob) {
          setPreviewUrl(URL.createObjectURL(previewBlob));
        }

        setDone(true);
      }

    } catch (err: unknown) {
      if (err instanceof Error && err.message === "cancelled") {
        // User cancelled — no error message needed
      } else if (err instanceof Error && err.message === "timeout") {
        setError(
          "This is taking too long — likely a slow connection while downloading the AI model. Please check your connection and try again."
        );
      } else if (err instanceof Error && err.message === "blank-result") {
        setError(
          "The AI couldn't detect a subject in this image on this device. Please try a different photo or a different browser."
        );
      } else {
        console.error(err);
        setError(
          "Failed to process image. This may be a very large image or the AI model couldn't download. Please try a smaller image or check your connection."
        );
      }
    } finally {
      // Revoke object URLs to prevent memory leaks
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (maskUrl) URL.revokeObjectURL(maskUrl);
      setProcessing(false);
      setProgressMsg("");
      setCancelling(false);
    }
  };

  // Sanity-check that a result blob isn't blank/all-transparent — some WebGPU
  // backends (software rendering, VMs) "succeed" without erroring but return an
  // empty alpha channel. Samples a small downscaled copy for speed.
  const blobHasVisibleContent = async (blob: Blob): Promise<boolean> => {
    const img = new globalThis.Image();
    const objUrl = URL.createObjectURL(blob);
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to inspect result"));
        img.src = objUrl;
      });
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 10) return true;
      }
      return false;
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    setCancelling(true);
  };

  const handleReset = () => {
    cancelledRef.current = false;
    setCancelling(false);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setError("");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Droplets}
          title="Blur Background"
          description="Automatically blur the background of your photos for a professional bokeh isolation effect — free, instant, and private."
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
                accept=".jpg,.jpeg,.png,.webp"
                files={files}
                onFilesChange={setFiles}

                label="Drop your image here"
                description="or click to browse — JPG, PNG, WebP supported"
              />

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in-up">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-danger">
                    {error}
                  </p>
                </div>
              )}

              {/* Blur Options */}
              {files.length > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    Blur Settings
                  </h3>

                  {/* Blur Intensity Presets */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {BLUR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        role="radio"
                        aria-checked={blurPreset === preset.id}
                        onClick={() => setBlurPreset(preset.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                          blurPreset === preset.id
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border hover:border-primary-border hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              blurPreset === preset.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {blurPreset === preset.id && (
                              <Check className="w-2 h-2 text-white" />
                            )}
                          </div>
                          <span className="font-semibold text-xs text-foreground">
                            {preset.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground-secondary ml-[22px] leading-tight">
                          {preset.description}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Custom Blur Slider */}
                  {blurPreset === "custom" && (
                    <div className="mb-6 animate-fade-in-up">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-foreground">
                          Blur Radius
                        </label>
                        <span className="text-xs text-primary font-semibold">
                          {customBlur}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="50"
                        step="1"
                        value={customBlur}
                        onChange={(e) => setCustomBlur(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary"
                      />
                      <div className="flex justify-between text-xs text-foreground-muted mt-1">
                        <span>Subtle</span>
                        <span>Extreme</span>
                      </div>
                    </div>
                  )}

                  {/* Advanced Options */}
                  <details className="group">
                    <summary className="cursor-pointer text-xs font-semibold text-foreground-secondary hover:text-foreground transition-colors flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 transition-transform group-open:rotate-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      Advanced Options
                    </summary>
                    <div className="mt-4 space-y-5 pl-6 border-l-2 border-primary-border">
                      {/* Edge Softness */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-foreground">
                            Edge Softness
                          </label>
                          <span className="text-xs text-primary font-semibold">
                            {edgeSoftness}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          step="1"
                          value={edgeSoftness}
                          onChange={(e) => setEdgeSoftness(parseInt(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary"
                        />
                        <div className="flex justify-between text-xs text-foreground-muted mt-1">
                          <span>Sharp edge</span>
                          <span>Soft feathered edge</span>
                        </div>
                      </div>

                      {/* Background Brightness */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-foreground">
                            Background Brightness
                          </label>
                          <span className="text-xs text-primary font-semibold">
                            {brightnessBoost > 0 ? `+${brightnessBoost}%` : "0%"}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="1"
                          value={brightnessBoost}
                          onChange={(e) => setBrightnessBoost(parseInt(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary"
                        />
                        <div className="flex justify-between text-xs text-foreground-muted mt-1">
                          <span>Normal</span>
                          <span>Brighter background</span>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Processing Status */}
              {processing && (
                <div className="mt-8 p-5 bg-primary-muted border border-primary-border rounded-xl animate-fade-in-up">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <span className="text-xs font-semibold text-foreground">
                        {progressMsg || "Processing your image..."}
                      </span>
                    </div>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-danger-muted hover:border-danger/30 hover:text-danger text-foreground-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {usedServerFallback
                      ? "Your device couldn't run the AI model locally, so we're processing this securely on our server instead. Not stored."
                      : "The AI model is detecting the foreground subject and generating the background blur. The first run downloads the model (~30MB), subsequent runs are much faster."}
                  </p>
                </div>
              )}

              {/* Action Button */}
              {files.length > 0 && !processing && (
                <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                  <button
                    onClick={handleBlur}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <Droplets className="w-5 h-5" />
                    Blur Background
                  </button>
                  <p className="text-xs text-foreground-muted mt-2">
                    AI-powered subject detection — works with people, objects & pets
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="py-4 animate-fade-in-up">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Background Blurred Successfully!
                </h3>
                <p className="text-foreground-secondary">
                  Your image has a beautiful {blurPreset !== "custom" ? blurPreset : "custom"} bokeh effect.
                  Download the result or try different settings.
                  {usedServerFallback && " Processed on our server since your browser couldn't run the AI model — not stored."}
                </p>
              </div>

              {/* Preview Image */}
              {previewUrl && (
                <div className="mb-6 flex justify-center">
                  <div className="relative inline-block rounded-xl overflow-hidden border border-border shadow-lg max-w-full">
                    <img
                      src={previewUrl}
                      alt="Blurred background result"
                      className="max-h-[400px] w-auto object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Preview
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Summary */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-muted text-primary">
                  <Droplets className="w-3 h-3" />
                  {blurPreset !== "custom" ? blurPreset : `${customBlur}px`} blur
                </span>
                {edgeSoftness > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-primary">
                    {edgeSoftness}px edge softness
                  </span>
                )}
                {brightnessBoost > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-warning-muted text-warning">
                    +{brightnessBoost}% brightness
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`blurred-${files[0]?.name.replace(/\.[^/.]+$/, "")}.png`}
                    className="btn btn-primary inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Image
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Blur Another Image
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
                Private by Default
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your image is processed in your browser whenever your device supports
                it — no upload needed. If it can&apos;t, we process it securely on our
                server instead, and never store it.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                AI-Powered Detection
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Automatically detects people, pets, objects, and more. No
                manual selection needed — just upload and blur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
