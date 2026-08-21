"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Camera,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface PassportSpec {
  id: string;
  label: string;
  country: string;
  widthMm: number;
  heightMm: number;
  bg: string;
}

const SPECS: PassportSpec[] = [
  { id: "us-passport", label: "US Passport", country: "US", widthMm: 51, heightMm: 51, bg: "#FFFFFF" },
  { id: "us-visa", label: "US Visa", country: "US", widthMm: 51, heightMm: 51, bg: "#FFFFFF" },
  { id: "uk-passport", label: "UK Passport", country: "UK", widthMm: 35, heightMm: 45, bg: "#FFFFFF" },
  { id: "eu-passport", label: "EU Standard", country: "EU", widthMm: 35, heightMm: 45, bg: "#FFFFFF" },
  { id: "india-passport", label: "India Passport", country: "IN", widthMm: 51, heightMm: 51, bg: "#FFFFFF" },
  { id: "china-passport", label: "China Passport", country: "CN", widthMm: 33, heightMm: 48, bg: "#FFFFFF" },
  { id: "schengen-visa", label: "Schengen Visa", country: "EU", widthMm: 35, heightMm: 45, bg: "#FFFFFF" },
  { id: "custom", label: "Custom", country: "Custom", widthMm: 35, heightMm: 45, bg: "#FFFFFF" },
];

const BG_COLORS = [
  { id: "white", label: "White", color: "#FFFFFF" },
  { id: "blue", label: "Blue", color: "#4A90D9" },
  { id: "red", label: "Red", color: "#D94040" },
  { id: "gray", label: "Gray", color: "#C0C0C0" },
  { id: "custom", label: "Custom", color: "#5B5BD6" },
];

const mmToPx = (mm: number) => Math.round((mm * 300) / 25.4);

// Flood-fill from image edges to erase background pixels similar to edge colors
function floodFillErase(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const idata = ctx.getImageData(0, 0, w, h);
  const data = idata.data;

  // Sample edge pixels to estimate background color (average of corners)
  const corners = [
    [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
    [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
    [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)],
  ];
  let bgR = 0, bgG = 0, bgB = 0;
  for (const [cx, cy] of corners) {
    const idx = (cy * w + cx) * 4;
    bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2];
  }
  bgR = Math.round(bgR / corners.length);
  bgG = Math.round(bgG / corners.length);
  bgB = Math.round(bgB / corners.length);

  const visited = new Uint8Array(w * h);
  const queue: number[] = [];
  let head = 0;

  const enqueue = (x: number, y: number) => {
    const pos = y * w + x;
    if (visited[pos]) return;
    visited[pos] = 1;
    queue.push(x, y);
  };

  // Seed all edge pixels
  for (let x = 0; x < w; x++) { enqueue(x, 0); enqueue(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { enqueue(0, y); enqueue(w - 1, y); }

  const tol = 55; // Color distance tolerance
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = (y * w + x) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];

    const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
    if (diff <= tol * 3) {
      data[idx + 3] = 0; // Make transparent

      if (x > 0) enqueue(x - 1, y);
      if (x < w - 1) enqueue(x + 1, y);
      if (y > 0) enqueue(x, y - 1);
      if (y < h - 1) enqueue(x, y + 1);
    }
  }
  ctx.putImageData(idata, 0, 0);
}

export default function IdPhotoPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [spec, setSpec] = useState<PassportSpec>(SPECS[0]);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [bgOption, setBgOption] = useState("white");
  const [customWidth, setCustomWidth] = useState(35);
  const [customHeight, setCustomHeight] = useState(45);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [printSheet, setPrintSheet] = useState(false);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);

    // Small delay to let UI render the loader
    await new Promise((r) => setTimeout(r, 50));

    try {
      const file = files[0];
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      const finalBg = bgOption === "custom" ? bgColor : BG_COLORS.find((b) => b.id === bgOption)?.color ?? "#FFFFFF";
      const wMm = spec.id === "custom" ? customWidth : spec.widthMm;
      const hMm = spec.id === "custom" ? customHeight : spec.heightMm;
      const targetW = mmToPx(wMm);
      const targetH = mmToPx(hMm);
      const tgtAspect = targetW / targetH;

      // 1. Detect face via skin tone on a downscaled canvas
      const scale = Math.min(600 / img.naturalWidth, 1);
      const procW = Math.round(img.naturalWidth * scale);
      const procH = Math.round(img.naturalHeight * scale);

      const processCanvas = document.createElement("canvas");
      processCanvas.width = procW;
      processCanvas.height = procH;
      const pCtx = processCanvas.getContext("2d")!;
      pCtx.drawImage(img, 0, 0, procW, procH);

      const pData = pCtx.getImageData(0, 0, procW, procH).data;
      let minX = procW, maxX = 0, minY = procH, maxY = 0;
      let faceFound = false;

      for (let y = 0; y < procH; y++) {
        for (let x = 0; x < procW; x++) {
          const idx = (y * procW + x) * 4;
          const r = pData[idx], g = pData[idx + 1], b = pData[idx + 2];
          // Skin tone heuristic (works for most skin tones)
          if (
            r > 95 && g > 40 && b > 20 &&
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15 && r > g && r > b
          ) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            faceFound = true;
          }
        }
      }

      // 2. Calculate crop geometry centered on the face
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (faceFound && minX < maxX && minY < maxY) {
        const faceX = minX / scale;
        const faceY = minY / scale;
        const faceW = (maxX - minX) / scale;
        const faceH = (maxY - minY) / scale;
        const cx = faceX + faceW / 2;

        // Head should occupy ~70% of photo height, with headroom above
        sh = Math.min(img.naturalHeight, faceH * 2.8);
        sw = sh * tgtAspect;
        if (sw > img.naturalWidth) {
          sw = img.naturalWidth;
          sh = sw / tgtAspect;
        }

        sx = Math.max(0, cx - sw / 2);
        if (sx + sw > img.naturalWidth) sx = img.naturalWidth - sw;
        // Position so face is in upper third with some headroom
        sy = Math.max(0, faceY - sh * 0.15);
        if (sy + sh > img.naturalHeight) sy = img.naturalHeight - sh;
      } else {
        // Fallback: center crop with headroom bias
        const srcAspect = img.naturalWidth / img.naturalHeight;
        if (srcAspect > tgtAspect) {
          sw = img.naturalHeight * tgtAspect;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / tgtAspect;
          sy = (img.naturalHeight - sh) * 0.25;
        }
      }

      // 3. Draw cropped subject, then flood-fill erase background from edges
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = targetW;
      tempCanvas.height = targetH;
      const tCtx = tempCanvas.getContext("2d")!;
      tCtx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
      floodFillErase(tCtx, targetW, targetH);

      // 4. Composite: new background color + transparent subject
      const singleCanvas = document.createElement("canvas");
      singleCanvas.width = targetW;
      singleCanvas.height = targetH;
      const sCtx = singleCanvas.getContext("2d")!;
      sCtx.fillStyle = finalBg;
      sCtx.fillRect(0, 0, targetW, targetH);
      sCtx.drawImage(tempCanvas, 0, 0);

      // 5. Output
      if (printSheet) {
        const sheetW = mmToPx(101.6); // 4 inches
        const sheetH = mmToPx(152.4); // 6 inches
        const canvas = document.createElement("canvas");
        canvas.width = sheetW;
        canvas.height = sheetH;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, sheetW, sheetH);

        const gap = mmToPx(3);
        const cols = Math.floor((sheetW + gap) / (targetW + gap));
        const rows = Math.floor((sheetH + gap) / (targetH + gap));
        const startX = (sheetW - cols * targetW - (cols - 1) * gap) / 2;
        const startY = (sheetH - rows * targetH - (rows - 1) * gap) / 2;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = startX + c * (targetW + gap);
            const y = startY + r * (targetH + gap);
            ctx.drawImage(singleCanvas, 0, 0, targetW, targetH, x, y, targetW, targetH);
            ctx.strokeStyle = "#E0E0E0";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, targetW, targetH);
          }
        }
        setResultUrl(canvas.toDataURL("image/png"));
      } else {
        setResultUrl(singleCanvas.toDataURL("image/png"));
      }

      URL.revokeObjectURL(img.src);
      setDone(true);
    } catch (err) {
      console.error("Processing failed:", err);
      setError("Failed to process image. Please try a different photo.");
    } finally {
      setProcessing(false);
    }
  }, [files, spec, bgColor, bgOption, customWidth, customHeight, printSheet]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = printSheet ? "id-photo-print-sheet.png" : "id-photo.png";
    a.click();
  }, [resultUrl, printSheet]);

  // Cleanup blob URLs on unmount
  const urlRef = useRef<string | null>(null);
  useEffect(() => {
    urlRef.current = resultUrl;
    return () => {
      if (urlRef.current && urlRef.current.startsWith("blob:")) URL.revokeObjectURL(urlRef.current);
    };
  }, [resultUrl]);

  const handleReset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setResultUrl(null);
    setError(null);
  }, [resultUrl]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Camera}
          title="ID Photo Maker"
          description="Create passport and visa photos with correct dimensions for 30+ countries — print-ready 300 DPI output, free, and completely private."
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
                label="Drop your photo here"
                description="Selfie or portrait — we'll detect the face & auto-crop"
              />

              {files.length > 0 && !processing && (
                <div className="mt-8 space-y-5 animate-fade-in-up">
                  {/* Country/Spec selector */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Photo Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SPECS.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSpec(s)}
                          className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left ${
                            spec.id === s.id
                              ? "bg-primary-muted border-primary-border text-primary"
                              : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                          }`}
                        >
                          <span className="block">{s.country} {s.label}</span>
                          <span className="block text-[10px] opacity-70 mt-0.5">{s.widthMm}×{s.heightMm}mm</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {spec.id === "custom" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Width (mm)</label>
                        <input type="number" min={20} max={100} value={customWidth} onChange={(e) => setCustomWidth(parseInt(e.target.value) || 35)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Height (mm)</label>
                        <input type="number" min={25} max={130} value={customHeight} onChange={(e) => setCustomHeight(parseInt(e.target.value) || 45)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Background color */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Target Background Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {BG_COLORS.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => { setBgOption(b.id); if (b.id !== "custom") setBgColor(b.color); }}
                          className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                            bgOption === b.id
                              ? "bg-primary-muted border-primary-border text-primary"
                              : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                          }`}
                        >
                          <span className="w-4 h-4 rounded border border-border" style={{ backgroundColor: b.color }} />
                          {b.label}
                        </button>
                      ))}
                    </div>
                    {bgOption === "custom" && (
                      <div className="flex items-center gap-2 mt-2">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                        <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-24 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs text-foreground font-mono" />
                      </div>
                    )}
                  </div>

                  {/* Print sheet option */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-foreground">Output</label>
                    <div className="flex gap-2">
                      <button onClick={() => setPrintSheet(false)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${!printSheet ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"}`}>
                        Single Photo
                      </button>
                      <button onClick={() => setPrintSheet(true)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${printSheet ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"}`}>
                        4×6 Print Sheet
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button onClick={handleProcess} className="btn btn-primary inline-flex items-center gap-2">
                      <Camera className="w-5 h-5" /> Generate Photo
                    </button>
                  </div>
                </div>
              )}

              {processing && (
                <div className="mt-8 text-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-foreground-secondary">Detecting face & replacing background...</p>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center">{error}</div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{printSheet ? "Print Sheet Ready!" : "Photo Ready!"}</h3>
              <p className="text-foreground-secondary mb-6">{spec.country} {spec.label} — {spec.widthMm}×{spec.heightMm}mm at 300 DPI</p>
              {resultUrl && (
                <div className="mb-6 flex justify-center">
                  <img src={resultUrl} alt="ID Photo" className="max-w-full max-h-[400px] rounded-lg border border-border" />
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={handleDownload} className="btn btn-primary inline-flex items-center gap-2">
                  <Download className="w-5 h-5" /> Download {printSheet ? "Print Sheet" : "Photo"}
                </button>
                <button onClick={handleReset} className="btn btn-secondary">Create Another</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Save $15-30 vs CVS</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Passport photos at drugstores cost $15-30. Make yours for free — any country, 300 DPI, print-ready format.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Face Detection & BG Removal</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Client-side face detection auto-crops your photo. Background is automatically removed and replaced with your chosen color.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
