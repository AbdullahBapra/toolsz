"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  LayoutGrid,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw,
  Info,
  Trash2,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface ImageItem {
  id: string;
  file: File;
  url: string;
}

type Layout = "2-col" | "3-col" | "2-row" | "grid-2x2" | "grid-3x3" | "1-main" | "1-top-2-bot" | "2-top-1-bot";

const layouts: { id: Layout; label: string; slots: number }[] = [
  { id: "2-col", label: "2 Columns", slots: 2 },
  { id: "3-col", label: "3 Columns", slots: 3 },
  { id: "2-row", label: "2 Rows", slots: 2 },
  { id: "grid-2x2", label: "2×2 Grid", slots: 4 },
  { id: "grid-3x3", label: "3×3 Grid", slots: 9 },
  { id: "1-main", label: "1 Main + 2 Side", slots: 3 },
  { id: "1-top-2-bot", label: "1 Top + 2 Bottom", slots: 3 },
  { id: "2-top-1-bot", label: "2 Top + 1 Bottom", slots: 3 },
];

const bgColors = [
  { id: "white", label: "White", value: "#ffffff" },
  { id: "black", label: "Black", value: "#000000" },
  { id: "gray", label: "Gray", value: "#6b7280" },
  { id: "navy", label: "Navy", value: "#1e3a5f" },
  { id: "rose", label: "Rose", value: "#e11d48" },
  { id: "teal", label: "Teal", value: "#0d9488" },
];

export default function CollageMakerPage() {
  const { addToast } = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [layout, setLayout] = useState<Layout>("grid-2x2");
  const [gap, setGap] = useState(8);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [canvasSize, setCanvasSize] = useState(1200);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const imagesRef = useRef<ImageItem[]>([]);
  const outputRef = useRef<string | null>(null);

  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
      if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    };
  }, []);

  const currentLayout = layouts.find((l) => l.id === layout)!;

  const handleFileChange = useCallback((newFiles: File[]) => {
    const newImages: ImageItem[] = newFiles.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    setDone(false);
    if (outputRef.current) { URL.revokeObjectURL(outputRef.current); setOutputUrl(null); }
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
    setDone(false);
  }, []);

  const getSlots = useCallback((): { x: number; y: number; w: number; h: number }[] => {
    const S = canvasSize;
    const G = gap;
    const totalGap = (n: number) => G * (n + 1);

    switch (layout) {
      case "2-col":
        return [
          { x: G, y: G, w: (S - totalGap(2)) / 2, h: S - totalGap(1) },
          { x: G + (S - totalGap(2)) / 2 + G, y: G, w: (S - totalGap(2)) / 2, h: S - totalGap(1) },
        ];
      case "3-col":
        return [0, 1, 2].map((i) => ({
          x: G + i * ((S - totalGap(3)) / 3 + G),
          y: G,
          w: (S - totalGap(3)) / 3,
          h: S - totalGap(1),
        }));
      case "2-row":
        return [0, 1].map((i) => ({
          x: G,
          y: G + i * ((S - totalGap(2)) / 2 + G),
          w: S - totalGap(1),
          h: (S - totalGap(2)) / 2,
        }));
      case "grid-2x2":
        return [0, 1, 2, 3].map((i) => ({
          x: G + (i % 2) * ((S - totalGap(2)) / 2 + G),
          y: G + Math.floor(i / 2) * ((S - totalGap(2)) / 2 + G),
          w: (S - totalGap(2)) / 2,
          h: (S - totalGap(2)) / 2,
        }));
      case "grid-3x3":
        return Array.from({ length: 9 }, (_, i) => ({
          x: G + (i % 3) * ((S - totalGap(3)) / 3 + G),
          y: G + Math.floor(i / 3) * ((S - totalGap(3)) / 3 + G),
          w: (S - totalGap(3)) / 3,
          h: (S - totalGap(3)) / 3,
        }));
      case "1-main": {
        const sideW = (S - totalGap(2)) / 3;
        const mainW = sideW * 2 + G;
        const fullH = S - totalGap(1);
        const sideH = (fullH - G) / 2;
        return [
          { x: G, y: G, w: mainW, h: fullH },
          { x: mainW + 2 * G, y: G, w: sideW, h: sideH },
          { x: mainW + 2 * G, y: sideH + 2 * G, w: sideW, h: sideH },
        ];
      }
      case "1-top-2-bot": {
        const topH = (S - totalGap(2)) * 0.6;
        const botH = (S - totalGap(2)) * 0.4;
        const halfW = (S - totalGap(2)) / 2;
        return [
          { x: G, y: G, w: S - totalGap(1), h: topH },
          { x: G, y: topH + 2 * G, w: halfW, h: botH },
          { x: halfW + 2 * G, y: topH + 2 * G, w: halfW, h: botH },
        ];
      }
      case "2-top-1-bot": {
        const topH = (S - totalGap(2)) * 0.4;
        const botH = (S - totalGap(2)) * 0.6;
        const halfW = (S - totalGap(2)) / 2;
        return [
          { x: G, y: G, w: halfW, h: topH },
          { x: halfW + 2 * G, y: G, w: halfW, h: topH },
          { x: G, y: topH + 2 * G, w: S - totalGap(1), h: botH },
        ];
      }
    }
  }, [layout, canvasSize, gap]);

  const handleProcess = useCallback(async () => {
    const slots = getSlots();
    if (images.length === 0) {
      addToast("error", "Add at least one image");
      return;
    }
    setProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d")!;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // Draw images into slots
      for (let i = 0; i < Math.min(images.length, slots.length); i++) {
        const slot = slots[i];
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = images[i].url;
        });

        // Cover: fill the slot maintaining aspect ratio
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const slotRatio = slot.w / slot.h;
        let drawW: number, drawH: number, drawX: number, drawY: number;

        if (imgRatio > slotRatio) {
          drawH = slot.h;
          drawW = slot.h * imgRatio;
          drawX = slot.x - (drawW - slot.w) / 2;
          drawY = slot.y;
        } else {
          drawW = slot.w;
          drawH = slot.w / imgRatio;
          drawX = slot.x;
          drawY = slot.y - (drawH - slot.h) / 2;
        }

        // Clip to slot
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(slot.x, slot.y, slot.w, slot.h, 4);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      const url = URL.createObjectURL(blob);
      if (outputRef.current) URL.revokeObjectURL(outputRef.current);
      outputRef.current = url;
      setOutputUrl(url);
      setDone(true);
      addToast("success", "Collage created!");
    } catch (err) {
      console.error("Collage creation failed:", err);
      addToast("error", "Failed to create collage. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [images, getSlots, canvasSize, bgColor, addToast]);

  const handleDownload = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = "collage.png";
    a.click();
  }, [outputUrl]);

  const handleReset = useCallback(() => {
    imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    setImages([]);
    setOutputUrl(null);
    setDone(false);
    outputRef.current = null;
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={LayoutGrid}
          title="Collage Maker"
          description="Create photo collages with 8 layouts — 2×2, 3×3, feature layouts with custom gap and background. Free, instant, and private."
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
                multiple
                files={images.map((i) => i.file)}
                onFilesChange={handleFileChange}
                label="Drop images here or click to add"
                description="or click to browse — PNG, JPG, WebP supported"
              />

            {images.length > 0 && (
              <div className="mt-8 animate-fade-in-up space-y-6">
                {/* Layout selection */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-primary" />
                    Layout
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {layouts.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setLayout(l.id)}
                        className={`px-3 py-2 text-xs rounded-lg border transition ${
                          layout === l.id
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-foreground-secondary mb-1">Gap (px)</label>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={gap}
                        onChange={(e) => setGap(Number(e.target.value))}
                        className="w-full accent-accent"
                      />
                      <p className="text-xs text-foreground-muted mt-1">{gap}px</p>
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-secondary mb-1">Background</label>
                      <div className="flex gap-1.5">
                        {bgColors.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setBgColor(c.value)}
                            className={`w-7 h-7 rounded-full border-2 transition ${
                              bgColor === c.value ? "border-accent scale-110" : "border-border"
                            }`}
                            style={{ backgroundColor: c.value }}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-secondary mb-1">Canvas Size</label>
                      <select
                        value={canvasSize}
                        onChange={(e) => setCanvasSize(Number(e.target.value))}
                        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs"
                      >
                        <option value={800}>800px</option>
                        <option value={1200}>1200px</option>
                        <option value={1920}>1920px</option>
                        <option value={2048}>2048px</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Image thumbnails */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-primary" />
                      Images ({images.length}/{currentLayout.slots})
                    </h3>
                    <FileUpload
                      accept="image/*"
                      multiple
                      onFiles={handleFileChange}
                      label="Add more"
                      compact
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {images.slice(0, currentLayout.slots).map((img, idx) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt={`Image ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-border"
                        />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, currentLayout.slots - images.length) }, (_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-foreground-muted text-xs"
                      >
                        {images.length + i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleProcess}
                    disabled={processing || images.length === 0}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <LayoutGrid className="w-5 h-5" />
                        Create Collage
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
            <h3 className="text-2xl font-bold text-foreground mb-2">Collage Created!</h3>
            <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
              Your photo collage is ready. Download it and share anywhere.
            </p>
            <div className="flex justify-center mb-6">
              <img
                src={outputUrl!}
                alt="Generated Collage"
                className="max-w-md max-h-80 rounded-lg border border-border"
              />
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
                Create Another
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
                Collage creation happens entirely in your browser. Your images are never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Multiple Layouts</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Choose from 8 layout options with adjustable gaps and background colors for the perfect collage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
