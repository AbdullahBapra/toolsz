"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  EyeOff,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCw,
  Paintbrush,
  Square,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type DrawMode = "rectangle" | "paint";
type BlurIntensity = "light" | "medium" | "heavy" | "custom";

const BLUR_PRESETS: { id: BlurIntensity; label: string; value: number; description: string }[] = [
  { id: "light", label: "Light", value: 8, description: "Subtle blur — still slightly recognizable" },
  { id: "medium", label: "Medium", value: 18, description: "Standard anonymization blur" },
  { id: "heavy", label: "Heavy", value: 35, description: "Strong blur — completely unrecognizable" },
  { id: "custom", label: "Custom", value: 18, description: "Set your own blur radius" },
];

export default function BlurFacePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Drawing state
  const [drawMode, setDrawMode] = useState<DrawMode>("rectangle");
  const [blurPreset, setBlurPreset] = useState<BlurIntensity>("medium");
  const [customBlur, setCustomBlur] = useState(18);
  const [brushSize, setBrushSize] = useState(40);

  const blurValue = blurPreset === "custom" ? customBlur : BLUR_PRESETS.find((p) => p.id === blurPreset)?.value ?? 18;

  // Canvas refs
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isDrawingRef = useRef(false);

  // Rectangle drawing state
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [rectCurrent, setRectCurrent] = useState<{ x: number; y: number } | null>(null);
  // Refs for reliable reading in mouseUp (avoids stale closure)
  const rectStartRef = useRef<{ x: number; y: number } | null>(null);
  const rectCurrentRef = useRef<{ x: number; y: number } | null>(null);

  // Track image load for re-render
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load image when files change
  useEffect(() => {
    if (files.length === 0) return;
    setImageLoaded(false);
    const file = files[0];
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);

      // Create mask canvas at full resolution
      const mc = document.createElement("canvas");
      mc.width = img.naturalWidth;
      mc.height = img.naturalHeight;
      // Initialize context with willReadFrequently hint for faster getImageData
      mc.getContext("2d", { willReadFrequently: true });
      maskCanvasRef.current = mc;

      // Draw image on display canvas
      renderDisplayCanvas();
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [files]);

  // Re-render display when rectangle changes
  useEffect(() => {
    if (imgRef.current && maskCanvasRef.current) {
      renderDisplayCanvas();
    }
  }, [rectCurrent]);

  const renderDisplayCanvas = useCallback(() => {
    const img = imgRef.current;
    const canvas = displayCanvasRef.current;
    const mask = maskCanvasRef.current;
    if (!img || !canvas || !mask) return;

    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    // Fit to container
    const maxW = 800;
    const maxH = 500;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw mask overlay (red semi-transparent)
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw rectangle in progress
    if (rectStart && rectCurrent && drawMode === "rectangle") {
      ctx.save();
      ctx.strokeStyle = "#4F46E5";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(
        Math.min(rectStart.x, rectCurrent.x),
        Math.min(rectStart.y, rectCurrent.y),
        Math.abs(rectCurrent.x - rectStart.x),
        Math.abs(rectCurrent.y - rectStart.y),
      );
      ctx.restore();
    }
  }, [rectStart, rectCurrent, drawMode]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas || !imgRef.current) return { x: 0, y: 0, scaleX: 1, scaleY: 1 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      scaleX,
      scaleY,
    };
  };

  const paintOnMask = useCallback((x: number, y: number) => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const ctx = mask.getContext("2d")!;
    ctx.fillStyle = "white";
    const size = brushSize * (imgRef.current ? Math.max(imgRef.current.naturalWidth / 800, 1) : 1);
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [brushSize]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const { x, y } = getCanvasCoords(e);
    if (drawMode === "paint") {
      paintOnMask(x, y);
      renderDisplayCanvas();
    } else {
      rectStartRef.current = { x, y };
      rectCurrentRef.current = { x, y };
      setRectStart({ x, y });
      setRectCurrent({ x, y });
    }
  }, [drawMode, paintOnMask, renderDisplayCanvas]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const { x, y } = getCanvasCoords(e);
    if (drawMode === "paint") {
      paintOnMask(x, y);
      renderDisplayCanvas();
    } else {
      rectCurrentRef.current = { x, y };
      setRectCurrent({ x, y });
    }
  }, [drawMode, paintOnMask, renderDisplayCanvas]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    // Finalize rectangle on mask — read from refs to avoid stale closure
    if (drawMode === "rectangle") {
      const rs = rectStartRef.current;
      const rc = rectCurrentRef.current;
      if (rs && rc) {
        const mask = maskCanvasRef.current;
        if (mask) {
          const ctx = mask.getContext("2d")!;
          ctx.fillStyle = "white";
          const x = Math.min(rs.x, rc.x);
          const y = Math.min(rs.y, rc.y);
          const w = Math.abs(rc.x - rs.x);
          const h = Math.abs(rc.y - rs.y);
          if (w > 2 && h > 2) {
            ctx.fillRect(x, y, w, h);
          }
        }
      }
      rectStartRef.current = null;
      rectCurrentRef.current = null;
      setRectStart(null);
      setRectCurrent(null);
      renderDisplayCanvas();
    }
  }, [drawMode, renderDisplayCanvas]);

  const handleProcess = useCallback(async () => {
    const img = imgRef.current;
    const mask = maskCanvasRef.current;
    if (!img || !mask) return;

    // Check if mask has any painted areas
    const maskCtx = mask.getContext("2d")!;
    const maskData = maskCtx.getImageData(0, 0, mask.width, mask.height);
    let hasMask = false;
    for (let i = 3; i < maskData.data.length; i += 4) {
      if (maskData.data[i] > 128) { hasMask = true; break; }
    }
    if (!hasMask) {
      setError("Draw over the areas you want to blur first.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Create blurred version of entire image
      const blurredCanvas = document.createElement("canvas");
      blurredCanvas.width = w;
      blurredCanvas.height = h;
      const bCtx = blurredCanvas.getContext("2d")!;
      const pad = blurValue * 2;
      bCtx.filter = `blur(${blurValue}px)`;
      bCtx.drawImage(img, -pad, -pad, w + pad * 2, h + pad * 2);
      bCtx.filter = "none";

      // Composite: use mask to combine original + blurred
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = w;
      finalCanvas.height = h;
      const fCtx = finalCanvas.getContext("2d")!;

      // Draw original image
      fCtx.drawImage(img, 0, 0);

      // Use mask as clip — draw blurred only where mask is white
      fCtx.globalCompositeOperation = "source-over";

      // Create a temporary canvas with blurred image masked by the mask
      const maskedBlurCanvas = document.createElement("canvas");
      maskedBlurCanvas.width = w;
      maskedBlurCanvas.height = h;
      const mbCtx = maskedBlurCanvas.getContext("2d")!;

      // Draw blurred image
      mbCtx.drawImage(blurredCanvas, 0, 0);

      // Use destination-in to keep only masked areas
      mbCtx.globalCompositeOperation = "destination-in";
      mbCtx.drawImage(mask, 0, 0);

      // Draw masked blur on top of original
      fCtx.drawImage(maskedBlurCanvas, 0, 0);

      // Generate output
      const outputBlob = await new Promise<Blob | null>((resolve) =>
        finalCanvas.toBlob(resolve, "image/png")
      );

      if (outputBlob) {
        const url = URL.createObjectURL(outputBlob);
        setDownloadUrl(url);

        // Preview
        const previewCanvas = document.createElement("canvas");
        const maxPreviewDim = 600;
        const pScale = Math.min(1, maxPreviewDim / Math.max(w, h));
        previewCanvas.width = Math.round(w * pScale);
        previewCanvas.height = Math.round(h * pScale);
        const pCtx = previewCanvas.getContext("2d")!;
        pCtx.drawImage(finalCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
        const previewBlob = await new Promise<Blob | null>((resolve) =>
          previewCanvas.toBlob(resolve, "image/jpeg", 0.85)
        );
        if (previewBlob) {
          setPreviewUrl(URL.createObjectURL(previewBlob));
        }
        setDone(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process image. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [blurValue]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setError("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setDownloadUrl(null);
    setPreviewUrl(null);
    setImageLoaded(false);
    imgRef.current = null;
    maskCanvasRef.current = null;
    rectStartRef.current = null;
    rectCurrentRef.current = null;
    setRectStart(null);
    setRectCurrent(null);
  }, [downloadUrl, previewUrl]);

  const handleClearMask = useCallback(() => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const ctx = mask.getContext("2d")!;
    ctx.clearRect(0, 0, mask.width, mask.height);
    renderDisplayCanvas();
  }, [renderDisplayCanvas]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={EyeOff}
          title="Blur Face"
          description="Blur faces and sensitive areas in your photos for privacy. Draw rectangles or paint over areas to anonymize — free, instant, and private."
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
              {files.length === 0 && (
                <FileUpload
                  accept=".jpg,.jpeg,.png,.webp"
                  files={files}
                  onFilesChange={setFiles}
                  label="Drop your image here"
                  description="or click to browse — JPG, PNG, WebP supported"
                />
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in-up">
                  <span className="text-danger text-xs">{error}</span>
                </div>
              )}

              {/* Canvas + Controls when image loaded */}
              {files.length > 0 && imageLoaded && (
                <div className="animate-fade-in-up space-y-6">
                  {/* Top controls row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Draw mode toggle */}
                    <div className="flex items-center gap-1 bg-surface-1 rounded-lg p-1">
                      <button
                        onClick={() => setDrawMode("rectangle")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${drawMode === "rectangle" ? "bg-primary text-white shadow-sm" : "text-foreground-secondary hover:bg-surface-2"}`}
                      >
                        <Square className="w-3.5 h-3.5" /> Rectangle
                      </button>
                      <button
                        onClick={() => setDrawMode("paint")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${drawMode === "paint" ? "bg-primary text-white shadow-sm" : "text-foreground-secondary hover:bg-surface-2"}`}
                      >
                        <Paintbrush className="w-3.5 h-3.5" /> Paint
                      </button>
                    </div>

                    {/* Brush size (paint mode only) */}
                    {drawMode === "paint" && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-foreground-muted">Brush:</label>
                        <input type="range" min={10} max={120} value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-20 h-1.5 accent-primary" />
                        <span className="text-xs text-foreground-muted font-mono">{brushSize}</span>
                      </div>
                    )}

                    <button onClick={handleClearMask} className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-surface-1 text-foreground-muted transition-colors">
                  Clear Areas
                    </button>
                  </div>

                  {/* Canvas */}
                  <div ref={containerRef} className="relative border border-border rounded-xl overflow-hidden bg-surface-1 flex justify-center">
                    <canvas
                      ref={displayCanvasRef}
                      className="max-w-full max-h-[500px]"
                      style={{ cursor: drawMode === "paint" ? "crosshair" : "crosshair" }}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                    />
                  </div>

                  <p className="text-xs text-foreground-muted text-center">
                    {drawMode === "rectangle" ? "Draw rectangles over faces or sensitive areas to mark them for blurring." : "Paint over faces or sensitive areas to mark them for blurring."}
                  </p>

                  {/* Blur Intensity */}
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-primary" /> Blur Intensity
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {BLUR_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setBlurPreset(preset.id)}
                          className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                            blurPreset === preset.id
                              ? "border-primary bg-primary-muted shadow-sm"
                              : "border-border hover:border-primary-border hover:bg-surface-2"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              blurPreset === preset.id ? "border-primary bg-primary" : "border-border"
                            }`}>
                              {blurPreset === preset.id && <Check className="w-2 h-2 text-white" />}
                            </div>
                            <span className="font-semibold text-xs text-foreground">{preset.label}</span>
                          </div>
                          <p className="text-[11px] text-foreground-secondary ml-[22px] leading-tight">{preset.description}</p>
                        </button>
                      ))}
                    </div>

                    {blurPreset === "custom" && (
                      <div className="mt-4 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-foreground">Blur Radius</label>
                          <span className="text-xs text-primary font-semibold">{customBlur}px</span>
                        </div>
                        <input type="range" min="4" max="60" step="1" value={customBlur} onChange={(e) => setCustomBlur(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary" />
                      </div>
                    )}
                  </div>

                  {/* Processing Status */}
                  {processing && (
                    <div className="p-5 bg-primary-muted border border-primary-border rounded-xl animate-fade-in-up">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="text-xs font-semibold text-foreground">Blurring selected areas...</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {!processing && (
                    <div className="flex flex-col items-center animate-fade-in-up">
                      <button onClick={handleProcess} className="btn btn-primary inline-flex items-center gap-2">
                        <EyeOff className="w-5 h-5" />
                        Blur Selected Areas
                      </button>
                      <p className="text-xs text-foreground-muted mt-2">
                        Only the areas you mark will be blurred — the rest stays sharp
                      </p>
                    </div>
                  )}
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
                  Faces Blurred Successfully!
                </h3>
                <p className="text-foreground-secondary">
                  The selected areas have been anonymized. Download the result or try different settings.
                </p>
              </div>

              {previewUrl && (
                <div className="mb-6 flex justify-center">
                  <div className="relative inline-block rounded-xl overflow-hidden border border-border shadow-lg max-w-full">
                    <img src={previewUrl} alt="Blurred result" className="max-h-[400px] w-auto object-contain" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Preview
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {downloadUrl && (
                  <a href={downloadUrl} download={`blurred-${files[0]?.name.replace(/\.[^/.]+$/, "")}.png`} className="btn btn-primary inline-flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> Download Image
                  </a>
                )}
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center justify-center gap-2">
                  <RotateCw className="w-5 h-5" /> Blur Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Privacy First</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All processing happens in your browser. Your photos never leave your device — perfect for sensitive documents and personal photos.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Rectangle & Paint Modes</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Draw rectangles for quick face blurring or paint freehand for irregular shapes. Adjustable blur intensity from subtle to heavy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
