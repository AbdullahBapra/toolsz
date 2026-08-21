"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Droplets,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCw,
  SlidersHorizontal,
  Type,
  ImageIcon,
  Eye,
  Move,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type WatermarkMode = "text" | "image";
type WatermarkPosition = "center" | "tile" | "bottom-right" | "bottom-left" | "top-right" | "top-left";

export default function WatermarkImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Watermark settings
  const [mode, setMode] = useState<WatermarkMode>("text");
  const [watermarkText, setWatermarkText] = useState("© Toolsz");
  const [watermarkFontSize, setWatermarkFontSize] = useState(48);
  const [watermarkColor, setWatermarkColor] = useState("#ffffff");
  const [watermarkOpacity, setWatermarkOpacity] = useState(40);
  const [watermarkRotation, setWatermarkRotation] = useState(-30);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>("center");
  const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(null);
  const [watermarkImageScale, setWatermarkImageScale] = useState(25);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Track image load for re-render
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const watermarkImgRef = useRef<HTMLImageElement | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => renderPreview(), 50);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [files]);

  // Load watermark image
  useEffect(() => {
    if (!watermarkImageFile) {
      watermarkImgRef.current = null;
      return;
    }
    const url = URL.createObjectURL(watermarkImageFile);
    const img = new Image();
    img.onload = () => {
      watermarkImgRef.current = img;
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => renderPreview(), 50);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [watermarkImageFile]);

  // Re-render preview when settings change
  useEffect(() => {
    if (!imgRef.current) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => renderPreview(), 80);
  }, [mode, watermarkText, watermarkFontSize, watermarkColor, watermarkOpacity, watermarkRotation, watermarkPosition, watermarkImageScale, dragOffset]);

  const renderPreview = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fit canvas to container
    const maxW = 800;
    const maxH = 500;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);

    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply watermark
    ctx.save();
    ctx.globalAlpha = watermarkOpacity / 100;

    if (mode === "text") {
      const fontSize = Math.max(8, watermarkFontSize * scale);
      ctx.font = `bold ${fontSize}px "Inter", "DM Sans", sans-serif`;
      ctx.fillStyle = watermarkColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const text = watermarkText || "Watermark";

      if (watermarkPosition === "tile") {
        // Tile the watermark across the entire image
        const spacing = fontSize * 6;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((watermarkRotation * Math.PI) / 180);
        for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
          for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
            ctx.fillText(text, x, y);
          }
        }
      } else {
        // Single placement
        const pos = getPositionCoords(canvas.width, canvas.height, watermarkPosition, dragOffset, scale);
        ctx.translate(pos.x, pos.y);
        ctx.rotate((watermarkRotation * Math.PI) / 180);
        ctx.fillText(text, 0, 0);
      }
    } else if (mode === "image" && watermarkImgRef.current) {
      const wmImg = watermarkImgRef.current;
      const wmScale = (watermarkImageScale / 100) * Math.min(canvas.width, canvas.height) / Math.max(wmImg.naturalWidth, wmImg.naturalHeight);
      const wmW = wmImg.naturalWidth * wmScale;
      const wmH = wmImg.naturalHeight * wmScale;

      if (watermarkPosition === "tile") {
        const spacingX = wmW * 3;
        const spacingY = wmH * 3;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((watermarkRotation * Math.PI) / 180);
        for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
          for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
            ctx.drawImage(wmImg, -wmW / 2 + x, -wmH / 2 + y, wmW, wmH);
          }
        }
      } else {
        const pos = getPositionCoords(canvas.width, canvas.height, watermarkPosition, dragOffset, scale);
        ctx.translate(pos.x, pos.y);
        ctx.rotate((watermarkRotation * Math.PI) / 180);
        ctx.drawImage(wmImg, -wmW / 2, -wmH / 2, wmW, wmH);
      }
    }

    ctx.restore();
  }, [mode, watermarkText, watermarkFontSize, watermarkColor, watermarkOpacity, watermarkRotation, watermarkPosition, watermarkImageScale, dragOffset]);

  const getPositionCoords = (cw: number, ch: number, pos: WatermarkPosition, offset: { x: number; y: number }, scale: number) => {
    const margin = 40 * scale;
    switch (pos) {
      case "center": return { x: cw / 2 + offset.x, y: ch / 2 + offset.y };
      case "bottom-right": return { x: cw - margin + offset.x, y: ch - margin + offset.y };
      case "bottom-left": return { x: margin + offset.x, y: ch - margin + offset.y };
      case "top-right": return { x: cw - margin + offset.x, y: margin + offset.y };
      case "top-left": return { x: margin + offset.x, y: margin + offset.y };
      default: return { x: cw / 2 + offset.x, y: ch / 2 + offset.y };
    }
  };

  // Canvas drag for watermark positioning (only when not "tile")
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (watermarkPosition === "tile") return;
    setIsDragging(true);
  }, [watermarkPosition]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setDragOffset(prev => ({
      x: prev.x + e.movementX * scaleX,
      y: prev.y + e.movementY * scaleY,
    }));
  }, [isDragging]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleProcess = useCallback(async () => {
    const img = imgRef.current;
    if (!img) return;
    setProcessing(true);
    setError("");

    try {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = w;
      finalCanvas.height = h;
      const ctx = finalCanvas.getContext("2d")!;

      // Draw original at full resolution
      ctx.drawImage(img, 0, 0, w, h);

      // Apply watermark at full resolution
      ctx.save();
      ctx.globalAlpha = watermarkOpacity / 100;

      if (mode === "text") {
        const fontSize = Math.max(8, watermarkFontSize);
        ctx.font = `bold ${fontSize}px "Inter", "DM Sans", sans-serif`;
        ctx.fillStyle = watermarkColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const text = watermarkText || "Watermark";

        if (watermarkPosition === "tile") {
          const spacing = fontSize * 6;
          ctx.translate(w / 2, h / 2);
          ctx.rotate((watermarkRotation * Math.PI) / 180);
          for (let y = -h; y < h * 2; y += spacing) {
            for (let x = -w; x < w * 2; x += spacing) {
              ctx.fillText(text, x, y);
            }
          }
        } else {
          const pos = getPositionCoords(w, h, watermarkPosition, dragOffset, 1);
          ctx.translate(pos.x, pos.y);
          ctx.rotate((watermarkRotation * Math.PI) / 180);
          ctx.fillText(text, 0, 0);
        }
      } else if (mode === "image" && watermarkImgRef.current) {
        const wmImg = watermarkImgRef.current;
        const wmScale = (watermarkImageScale / 100) * Math.min(w, h) / Math.max(wmImg.naturalWidth, wmImg.naturalHeight);
        const wmW = wmImg.naturalWidth * wmScale;
        const wmH = wmImg.naturalHeight * wmScale;

        if (watermarkPosition === "tile") {
          const spacingX = wmW * 3;
          const spacingY = wmH * 3;
          ctx.translate(w / 2, h / 2);
          ctx.rotate((watermarkRotation * Math.PI) / 180);
          for (let y = -h; y < h * 2; y += spacingY) {
            for (let x = -w; x < w * 2; x += spacingX) {
              ctx.drawImage(wmImg, -wmW / 2 + x, -wmH / 2 + y, wmW, wmH);
            }
          }
        } else {
          const pos = getPositionCoords(w, h, watermarkPosition, dragOffset, 1);
          ctx.translate(pos.x, pos.y);
          ctx.rotate((watermarkRotation * Math.PI) / 180);
          ctx.drawImage(wmImg, -wmW / 2, -wmH / 2, wmW, wmH);
        }
      }

      ctx.restore();

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
  }, [mode, watermarkText, watermarkFontSize, watermarkColor, watermarkOpacity, watermarkRotation, watermarkPosition, watermarkImageScale, dragOffset]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setError("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setDownloadUrl(null);
    setPreviewUrl(null);
    setDragOffset({ x: 0, y: 0 });
    setImageLoaded(false);
    imgRef.current = null;
    watermarkImgRef.current = null;
    setWatermarkImageFile(null);
  }, [downloadUrl, previewUrl]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Droplets}
          title="Watermark Image"
          description="Add custom text or image watermarks to your photos — adjust position, opacity, size, rotation, and color. Free, instant, and private."
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
                  <span className="text-danger text-xs">{error}</span>
                </div>
              )}

              {/* Settings + Preview when image loaded */}
              {files.length > 0 && imageLoaded && (
                <div className="mt-8 animate-fade-in-up space-y-6">
                  {/* Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMode("text")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${mode === "text" ? "bg-primary text-white shadow-sm" : "bg-surface-1 text-foreground-secondary hover:bg-surface-2"}`}
                    >
                      <Type className="w-4 h-4" /> Text Watermark
                    </button>
                    <button
                      onClick={() => setMode("image")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${mode === "image" ? "bg-primary text-white shadow-sm" : "bg-surface-1 text-foreground-secondary hover:bg-surface-2"}`}
                    >
                      <ImageIcon className="w-4 h-4" /> Image Watermark
                    </button>
                  </div>

                  {/* Preview Canvas */}
                  <div className="border border-border rounded-xl overflow-hidden bg-surface-1 flex justify-center">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full cursor-move"
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                    />
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {mode === "text" && (
                      <>
                        {/* Watermark Text */}
                        <div>
                          <label className="text-xs font-semibold text-foreground mb-2 block">Watermark Text</label>
                          <input
                            type="text"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Enter watermark text"
                          />
                        </div>
                        {/* Font Size */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-foreground">Font Size</label>
                            <span className="text-xs text-primary font-semibold">{watermarkFontSize}px</span>
                          </div>
                          <input type="range" min="12" max="200" value={watermarkFontSize} onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary" />
                        </div>
                        {/* Color */}
                        <div>
                          <label className="text-xs font-semibold text-foreground mb-2 block">Color</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={watermarkColor} onChange={(e) => setWatermarkColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                            <span className="text-xs text-foreground-muted font-mono">{watermarkColor}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {mode === "image" && (
                      <>
                        {/* Upload Watermark Image */}
                        <div>
                          <label className="text-xs font-semibold text-foreground mb-2 block">Watermark Logo</label>
                          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border bg-surface-1 cursor-pointer hover:bg-surface-2 transition-colors text-xs text-foreground-secondary">
                            <ImageIcon className="w-4 h-4" />
                            {watermarkImageFile ? watermarkImageFile.name : "Choose logo image"}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setWatermarkImageFile(e.target.files?.[0] ?? null)} />
                          </label>
                        </div>
                        {/* Logo Scale */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-foreground">Logo Scale</label>
                            <span className="text-xs text-primary font-semibold">{watermarkImageScale}%</span>
                          </div>
                          <input type="range" min="5" max="80" value={watermarkImageScale} onChange={(e) => setWatermarkImageScale(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary" />
                        </div>
                      </>
                    )}

                    {/* Opacity */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-foreground">Opacity</label>
                        <span className="text-xs text-primary font-semibold">{watermarkOpacity}%</span>
                      </div>
                      <input type="range" min="5" max="100" value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary" />
                    </div>

                    {/* Rotation */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-foreground">Rotation</label>
                        <span className="text-xs text-primary font-semibold">{watermarkRotation}°</span>
                      </div>
                      <input type="range" min="-180" max="180" value={watermarkRotation} onChange={(e) => setWatermarkRotation(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary" />
                    </div>

                    {/* Position */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground mb-2 block">
                        <SlidersHorizontal className="w-4 h-4 text-primary inline mr-1" />
                        Position
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(["center", "tile", "bottom-right", "bottom-left", "top-right", "top-left"] as WatermarkPosition[]).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => { setWatermarkPosition(pos); setDragOffset({ x: 0, y: 0 }); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${watermarkPosition === pos ? "bg-primary text-white" : "bg-surface-1 text-foreground-secondary hover:bg-surface-2"}`}
                          >
                            {pos === "tile" ? "Tile (repeat)" : pos.replace("-", " ")}
                          </button>
                        ))}
                      </div>
                      {watermarkPosition !== "tile" && (
                        <p className="text-[11px] text-foreground-muted mt-2 flex items-center gap-1">
                          <Move className="w-3 h-3" /> Drag on the preview to fine-tune position
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Processing Status */}
                  {processing && (
                    <div className="p-5 bg-primary-muted border border-primary-border rounded-xl animate-fade-in-up">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="text-xs font-semibold text-foreground">Applying watermark...</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {!processing && (
                    <div className="flex flex-col items-center animate-fade-in-up">
                      <button onClick={handleProcess} className="btn btn-primary inline-flex items-center gap-2">
                        <Droplets className="w-5 h-5" />
                        Apply Watermark
                      </button>
                      <p className="text-xs text-foreground-muted mt-2">
                        Full-resolution output — no quality loss
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
                  Watermark Applied!
                </h3>
                <p className="text-foreground-secondary">
                  Your image has been watermarked. Download the result or try different settings.
                </p>
              </div>

              {/* Preview Image */}
              {previewUrl && (
                <div className="mb-6 flex justify-center">
                  <div className="relative inline-block rounded-xl overflow-hidden border border-border shadow-lg max-w-full">
                    <img src={previewUrl} alt="Watermarked result" className="max-h-[400px] w-auto object-contain" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Preview
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {downloadUrl && (
                  <a href={downloadUrl} download={`watermarked-${files[0]?.name.replace(/\.[^/.]+$/, "")}.png`} className="btn btn-primary inline-flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> Download Image
                  </a>
                )}
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center justify-center gap-2">
                  <RotateCw className="w-5 h-5" /> Watermark Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Total Privacy</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your images are processed entirely in your browser. No photos are uploaded to any server — your content stays private.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Text & Logo Watermarks</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Add custom text with any font size, color, and rotation — or upload your own logo image as a watermark. Tile across the entire image for maximum protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
