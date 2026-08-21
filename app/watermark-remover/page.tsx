"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Paintbrush,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCw,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

export default function WatermarkRemoverPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load image onto canvas
  useEffect(() => {
    if (files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imgRef.current = img;
      setImageUrl(url);

      // Create mask canvas
      const mc = document.createElement("canvas");
      mc.width = img.naturalWidth;
      mc.height = img.naturalHeight;
      setMaskCanvas(mc);
    };
  }, [files]);

  const drawOnMask = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const mc = maskCanvas;
    if (!mc) return;
    const ctx = mc.getContext("2d");
    if (!ctx) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = mc.width / rect.width;
    const scaleY = mc.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const size = brushSize * Math.max(scaleX, scaleY);

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Show mask overlay on visible canvas
    const vCtx = canvas.getContext("2d");
    if (!vCtx || !imgRef.current) return;
    vCtx.clearRect(0, 0, canvas.width, canvas.height);
    vCtx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    // Draw red mask overlay
    vCtx.save();
    vCtx.globalAlpha = 0.4;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = mc.width;
    tempCanvas.height = mc.height;
    const tCtx = tempCanvas.getContext("2d")!;
    tCtx.drawImage(mc, 0, 0);
    vCtx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    vCtx.restore();
  }, [maskCanvas, brushSize]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    drawOnMask(e);
  }, [drawOnMask]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    drawOnMask(e);
  }, [drawOnMask]);

  const handleCanvasMouseUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const handleProcess = useCallback(async () => {
    if (!maskCanvas || !imgRef.current) return;
    setProcessing(true);
    setError(null);

    // Small delay to let UI update
    await new Promise((r) => setTimeout(r, 50));

    try {
      const img = imgRef.current;
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Get mask data
      const maskCtx = maskCanvas.getContext("2d")!;
      const maskData = maskCtx.getImageData(0, 0, w, h);

      // Get original image data
      const origCanvas = document.createElement("canvas");
      origCanvas.width = w;
      origCanvas.height = h;
      const origCtx = origCanvas.getContext("2d")!;
      origCtx.drawImage(img, 0, 0);
      const origData = origCtx.getImageData(0, 0, w, h);

      const result = new Uint8ClampedArray(origData.data);
      const mask = maskData.data;

      // Track status: 0 = unmasked (safe to sample), 1 = masked (needs filling)
      const status = new Uint8Array(w * h);
      let remainingMasked = 0;
      for (let i = 0; i < w * h; i++) {
        if (mask[i * 4 + 3] > 128) {
          status[i] = 1;
          remainingMasked++;
        } else {
          status[i] = 0;
        }
      }

      // Inward Filling (Onion Peeling) — Samples ONLY from unmasked/filled pixels
      let iterations = 0;
      while (remainingMasked > 0 && iterations < 300) {
        iterations++;
        const toFill: { idx: number; r: number; g: number; b: number }[] = [];

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            if (status[idx] === 1) {
              let r = 0, g = 0, b = 0, count = 0;

              // 5x5 neighborhood sampling
              for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = x + dx;
                  const ny = y + dy;
                  if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    const nIdx = ny * w + nx;
                    if (status[nIdx] === 0) { // Only sample from safe pixels
                      r += result[nIdx * 4];
                      g += result[nIdx * 4 + 1];
                      b += result[nIdx * 4 + 2];
                      count++;
                    }
                  }
                }
              }

              if (count > 0) {
                toFill.push({
                  idx,
                  r: Math.round(r / count),
                  g: Math.round(g / count),
                  b: Math.round(b / count),
                });
              }
            }
          }
        }

        if (toFill.length === 0) break; // Break if stuck

        for (const item of toFill) {
          result[item.idx * 4] = item.r;
          result[item.idx * 4 + 1] = item.g;
          result[item.idx * 4 + 2] = item.b;
          result[item.idx * 4 + 3] = 255;
          status[item.idx] = 0; // Mark as safely filled for next layer
          remainingMasked--;
        }
      }

      // Localized Seam Smoothing (2 passes) — only blur originally masked area
      for (let pass = 0; pass < 2; pass++) {
        const tempResult = new Uint8ClampedArray(result);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            if (mask[idx * 4 + 3] > 128) {
              let r = 0, g = 0, b = 0, count = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const nx = x + dx;
                  const ny = y + dy;
                  if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    const nIdx = ny * w + nx;
                    r += result[nIdx * 4];
                    g += result[nIdx * 4 + 1];
                    b += result[nIdx * 4 + 2];
                    count++;
                  }
                }
              }
              tempResult[idx * 4] = Math.round(r / count);
              tempResult[idx * 4 + 1] = Math.round(g / count);
              tempResult[idx * 4 + 2] = Math.round(b / count);
            }
          }
        }
        result.set(tempResult);
      }

      const finalImageData = new ImageData(result, w, h);
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = w;
      finalCanvas.height = h;
      finalCanvas.getContext("2d")!.putImageData(finalImageData, 0, 0);

      const url = finalCanvas.toDataURL("image/png");
      setResultUrl(url);
      setDone(true);
    } catch (err) {
      console.error("Inpainting failed:", err);
      setError("Failed to process image.");
    } finally {
      setProcessing(false);
    }
  }, [maskCanvas]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `inpaint-${files[0]?.name ?? "image"}.png`;
    a.click();
  }, [resultUrl, files]);

  // Cleanup blob URLs on unmount
  const urlsRef = useRef<{ orig: string | null; res: string | null }>({ orig: null, res: null });
  useEffect(() => {
    urlsRef.current = { orig: originalUrl, res: resultUrl };
    return () => {
      if (urlsRef.current.orig) URL.revokeObjectURL(urlsRef.current.orig);
      if (urlsRef.current.res) URL.revokeObjectURL(urlsRef.current.res);
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
    setImageUrl(null);
    setMaskCanvas(null);
    imgRef.current = null;
  }, [originalUrl, resultUrl]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Paintbrush}
          title="Watermark Remover"
          description="Paint over watermarks and AI inpaints them away — client-side, no upload, completely private. Free and instant watermark removal."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            files.length === 0 ? (
              <FileUpload
                accept="image/*"
                files={files}
                onFilesChange={setFiles}
                label="Drop your image here"
                description="Paint over the watermark area to mark it for removal"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">Paint over the watermark to mark it for removal</p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-foreground-muted">Brush:</label>
                    <input type="range" min={5} max={60} value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-24" />
                    <span className="text-xs text-foreground-muted">{brushSize}px</span>
                  </div>
                </div>

                <div ref={containerRef} className="relative border border-border rounded-lg overflow-hidden bg-surface-1 flex justify-center">
                  {imageUrl && imgRef.current && (
                    <canvas
                      ref={canvasRef}
                      width={imgRef.current.naturalWidth}
                      height={imgRef.current.naturalHeight}
                      className="max-w-full max-h-[500px] cursor-crosshair"
                      style={{ cursor: "crosshair" }}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                    />
                  )}
                </div>

                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">{error}</div>}

                <div className="flex justify-center gap-3">
                  <button onClick={handleProcess} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Removing...</> : <><Paintbrush className="w-5 h-5" /> Remove Watermark</>}
                  </button>
                  <button onClick={handleReset} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Watermark Removed!</h3>
              <p className="text-foreground-secondary mb-6">The selected area has been inpainted.</p>
              {resultUrl && (
                <div className="mb-6 flex justify-center">
                  <img src={resultUrl} alt="Result" className="max-w-full max-h-[400px] rounded-lg border border-border" />
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={handleDownload} className="btn btn-primary inline-flex items-center gap-2"><Download className="w-5 h-5" /> Download</button>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2"><RotateCw className="w-5 h-5" /> Another Image</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Free & Private</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Paid watermark removers charge $5-20 and upload your images. This runs entirely in your browser — free and private.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Smart Inpainting</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Brush over the watermark area, then click Remove. Onion-peeling inpainting fills the area layer by layer from surrounding pixels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
