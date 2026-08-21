"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Eraser,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type BgColor = "transparent" | "white" | "black" | "custom";

const BG_OPTIONS: { id: BgColor; label: string; color: string }[] = [
  { id: "transparent", label: "Transparent", color: "transparent" },
  { id: "white", label: "White", color: "#FFFFFF" },
  { id: "black", label: "Black", color: "#000000" },
  { id: "custom", label: "Custom", color: "#5B5BD6" },
];

export default function RemoveBgPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bgOption, setBgOption] = useState<BgColor>("transparent");
  const [customBg, setCustomBg] = useState("#5B5BD6");
  const [outputFormat, setOutputFormat] = useState<"png" | "webp">("png");
  const [usedServerFallback, setUsedServerFallback] = useState(false);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    setDone(false);
    setUsedServerFallback(false);

    try {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);

      const { removeBackground } = await import("@imgly/background-removal");

      const removalProgress = (key: string, current: number, total: number) => {
        if (total > 0) setProgress(Math.round((current / total) * 100));
      };

      // device: "gpu" tries WebGPU first (fast, and required for the library to
      // actually honor proxyToWorker — on device: "cpu" it silently ignores the
      // worker flag and runs inference on the main thread). If WebGPU isn't
      // available, the library normally falls back to CPU/WASM on its own — but
      // in some environments (VMs, remote desktops, sandboxed browsers, software
      // GPU drivers) the WebGPU path either throws, or worse, "succeeds" while
      // silently producing a blank/all-transparent result. We check for both
      // and, if either happens, go straight to the server fallback below.
      //
      // NOTE: we deliberately do NOT retry with device: "cpu" client-side.
      // @imgly/background-removal caches the onnxruntime-web module in a
      // module-level singleton on first use — after a GPU attempt it's the
      // WebGPU-flavored module, and a same-session CPU retry reuses that
      // cached (wrong) module instead of loading the CPU one, which reliably
      // fails with "WebAssembly is not initialized yet." Not worth chasing;
      // the server fallback is strictly more reliable than a broken retry.
      const attemptRemoval = async () => {
        const result = await removeBackground(file, {
          device: "gpu",
          proxyToWorker: true,
          progress: removalProgress,
        });
        if (!(await blobHasVisibleContent(result))) {
          throw new Error("blank-result");
        }
        return result;
      };

      // Last resort: the visitor's browser genuinely can't run the model
      // (no WebGPU, broken WASM, underpowered device, etc). Rather than show
      // an error, send the image to our own server and process it there with
      // native onnxruntime — same approach remove.bg uses, just self-hosted.
      // The image is processed in-memory and never stored.
      const removeBackgroundServerSide = async (): Promise<Blob> => {
        setUsedServerFallback(true);
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/remove-background", { method: "POST", body });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || "Server-side background removal failed");
        }
        return await res.blob();
      };

      const runRemoval = async () => {
        try {
          return await attemptRemoval();
        } catch (gpuErr) {
          console.warn("Client-side background removal failed or was blank, falling back to server:", gpuErr);
          setProgress(0);
          return await removeBackgroundServerSide();
        }
      };

      // Covers the client attempt plus a server round trip (including a
      // possible cold-start model load) without cutting the fallback off
      // before it gets a chance to finish.
      const removalTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 75_000)
      );
      const blob = await Promise.race([runRemoval(), removalTimeout]);

      // Composite with background color if not transparent
      let finalBlob: Blob;
      if (bgOption === "transparent") {
        finalBlob = blob;
      } else {
        const bgColor = bgOption === "custom" ? customBg : BG_OPTIONS.find(o => o.id === bgOption)?.color ?? "#FFFFFF";
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await new Promise<void>((resolve) => { img.onload = () => resolve(); });
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(img.src);
        const mimeType = outputFormat === "webp" ? "image/webp" : "image/png";
        finalBlob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), mimeType, 0.92));
      }

      const resultUrlStr = URL.createObjectURL(finalBlob);
      setResultUrl(resultUrlStr);
      setDone(true);
      // NOTE: Don't revoke originalUrl here — it's needed for the Before/After comparison.
      // Cleanup happens via useEffect on unmount or handleReset.
    } catch (err) {
      console.error("Background removal failed:", err);
      const message = err instanceof Error ? err.message : "";
      setError(
        message === "timeout"
          ? "This is taking too long — likely a slow connection while downloading the AI model. Please check your connection and try again."
          : message === "blank-result"
          ? "The AI couldn't detect a subject in this image on this device. Please try a different photo or a different browser."
          : "Failed to remove background. Please try a different image or refresh the page."
      );
    } finally {
      setProcessing(false);
    }
  }, [files, bgOption, customBg, outputFormat]);

  // Sanity-check that a result blob isn't blank/all-transparent — some WebGPU
  // backends (software rendering, VMs) "succeed" without erroring but return an
  // empty alpha channel. Samples a small downscaled copy for speed.
  const blobHasVisibleContent = async (blob: Blob): Promise<boolean> => {
    const img = new Image();
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

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const ext = bgOption === "transparent" ? "png" : outputFormat;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `no-bg-${files[0]?.name?.replace(/\.[^.]+$/, "") ?? "image"}.${ext}`;
    a.click();
  }, [resultUrl, bgOption, outputFormat, files]);

  // Cleanup blob URLs on unmount
  const urlsRef = useRef<{ original: string | null; result: string | null }>({ original: null, result: null });
  useEffect(() => {
    urlsRef.current = { original: originalUrl, result: resultUrl };
    return () => {
      if (urlsRef.current.original) URL.revokeObjectURL(urlsRef.current.original);
      if (urlsRef.current.result) URL.revokeObjectURL(urlsRef.current.result);
    };
  }, [originalUrl, resultUrl]);

  const handleReset = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setResultUrl(null);
    setOriginalUrl(null);
    setError(null);
    setProgress(0);
  }, [originalUrl, resultUrl]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Eraser}
          title="Background Remover"
          description="Remove image backgrounds with AI — full resolution, no watermark, no signup. Add custom background colors, all processed privately in your browser."
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
                onFilesChange={setFiles}
                label="Drop your image here"
                description="PNG, JPG, WebP — any size, full resolution output"
              />

              {files.length > 0 && !processing && (
                <div className="mt-8 space-y-5 animate-fade-in-up">
                  {/* Preview */}
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-1 border border-border">
                    <img
                      src={URL.createObjectURL(files[0])}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{files[0].name}</p>
                      <p className="text-xs text-foreground-muted">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  {/* Background option */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Background</label>
                    <div className="flex gap-2 flex-wrap">
                      {BG_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setBgOption(opt.id)}
                          className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                            bgOption === opt.id
                              ? "bg-primary-muted border-primary-border text-primary"
                              : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded border border-border flex-shrink-0"
                            style={{
                              backgroundColor: opt.id === "transparent" ? "transparent" : opt.color,
                              backgroundImage: opt.id === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)" : undefined,
                              backgroundSize: opt.id === "transparent" ? "8px 8px" : undefined,
                              backgroundPosition: opt.id === "transparent" ? "0 0, 4px 4px" : undefined,
                            }}
                          />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {bgOption === "custom" && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={customBg}
                          onChange={(e) => setCustomBg(e.target.value)}
                          className="w-8 h-8 rounded border border-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customBg}
                          onChange={(e) => setCustomBg(e.target.value)}
                          className="w-24 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs text-foreground font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Output format (non-transparent only) */}
                  {bgOption !== "transparent" && (
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-2">Output Format</label>
                      <div className="flex gap-2">
                        {(["png", "webp"] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setOutputFormat(fmt)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all uppercase ${
                              outputFormat === fmt
                                ? "bg-primary-muted border-primary-border text-primary"
                                : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process button */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleProcess}
                      className="btn btn-primary inline-flex items-center gap-2"
                    >
                      <Eraser className="w-5 h-5" />
                      Remove Background
                    </button>
                  </div>
                </div>
              )}

              {/* Processing state */}
              {processing && (
                <div className="mt-8 text-center py-12 animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full bg-primary-muted border border-primary-border flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Removing background...</h3>
                  <p className="text-xs text-foreground-secondary mb-4">
                    {usedServerFallback
                      ? "Your device couldn't run the AI model locally, so we're processing this securely on our server instead. Not stored."
                      : "AI model is processing your image. This may take 10-30 seconds."}
                  </p>
                  <div className="max-w-xs mx-auto">
                    <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-foreground-muted mt-1">{progress}%</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center">
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Background Removed!</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Full-resolution output with {bgOption === "transparent" ? "transparent" : bgOption} background.
                {usedServerFallback && " Processed on our server since your browser couldn't run the AI model — not stored."}
              </p>

              {/* Before/After comparison */}
              <div className="flex items-center justify-center gap-6 mb-6">
                {originalUrl && (
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground-muted mb-2">Before</p>
                    <img src={originalUrl} alt="Original" className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-lg border border-border bg-surface-1" />
                  </div>
                )}
                {resultUrl && (
                  <div className="text-center">
                    <p className="text-xs font-semibold text-primary mb-2">After</p>
                    <img
                      src={resultUrl}
                      alt="Result"
                      className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-lg border border-primary-border"
                      style={bgOption === "transparent" ? {
                        backgroundImage: "linear-gradient(45deg, #e4e4e7 25%, transparent 25%, transparent 75%, #e4e4e7 75%), linear-gradient(45deg, #e4e4e7 25%, transparent 25%, transparent 75%, #e4e4e7 75%)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 8px 8px",
                      } : undefined}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={handleDownload} className="btn btn-primary inline-flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download {bgOption === "transparent" ? "PNG" : outputFormat.toUpperCase()}
                </button>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Process Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private by Default</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                AI runs directly in your browser whenever your device supports it — no upload needed. If your browser can&apos;t run the model, we process it securely on our server instead, and never store your images.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Full Resolution, No Watermark</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Unlike paid alternatives, output is full-resolution with zero watermarks. Replace backgrounds with transparent, white, or custom colors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
