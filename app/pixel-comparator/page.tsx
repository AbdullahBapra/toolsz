"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Ruler,
  Shield,
  Zap,
  Upload,
  X,
  Maximize2,
  Grid3x3,
  SquareStack,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

interface ImageEntry {
  file: File;
  url: string;
  naturalWidth: number;
  naturalHeight: number;
}

export default function PixelComparatorPage() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showMarginOverlay, setShowMarginOverlay] = useState(false);
  const [marginPx, setMarginPx] = useState(16);
  const [paddingPx, setPaddingPx] = useState(16);
  const [showActualSize, setShowActualSize] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (fileList: FileList | File[]) => {
    const newImages: ImageEntry[] = [];

    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = url;
      });
      newImages.push({
        file,
        url,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const img = prev[index];
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 5)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.1)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  // Calculate display size based on a reference container
  const getDisplaySize = useCallback(
    (naturalW: number, naturalH: number) => {
      // Simulate display in a 600px wide container at 96 DPI
      const containerWidth = 600;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
      const maxDisplayWidth = containerWidth;
      const scale = Math.min(maxDisplayWidth / naturalW, 1);
      return {
        displayW: Math.round(naturalW * scale),
        displayH: Math.round(naturalH * scale),
        dpr,
        scaleToActual: dpr,
      };
    },
    []
  );

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Ruler}
          title="Real Pixel Size Comparator"
          description="Upload images and see actual pixel size vs display size with zoom comparison — understand visual scale with padding and margin overlays. Free, instant, and completely private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
          {/* Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="drop-zone py-12 px-6 text-center rounded-2xl cursor-pointer w-full"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-[10px] border border-border bg-surface-1 flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-foreground-secondary" />
                </div>
                <h3 className="type-h3 font-semibold mb-1 text-foreground">Upload Images to Compare</h3>
                <p className="type-small text-foreground-muted">Upload screenshots or any images — see real vs display size</p>
              </div>
            </button>
          </div>

          {images.length > 0 && (
            <>
              {/* Controls Bar */}
              <div className="flex flex-wrap gap-2 items-center">
                <button onClick={zoomIn} className="btn btn-secondary inline-flex items-center gap-1.5 !py-2 !px-3 text-xs">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={zoomOut} className="btn btn-secondary inline-flex items-center gap-1.5 !py-2 !px-3 text-xs">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button onClick={resetZoom} className="btn btn-secondary inline-flex items-center gap-1.5 !py-2 !px-3 text-xs">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span className="type-label text-foreground-muted">{Math.round(zoom * 100)}%</span>

                <div className="ml-auto flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowActualSize(!showActualSize)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      showActualSize ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Actual Size
                  </button>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      showGrid ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"
                    }`}
                  >
                    <Grid3x3 className="w-3.5 h-3.5" />
                    Grid
                  </button>
                  <button
                    onClick={() => setShowMarginOverlay(!showMarginOverlay)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      showMarginOverlay ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"
                    }`}
                  >
                    <SquareStack className="w-3.5 h-3.5" />
                    Margin/Padding
                  </button>
                </div>
              </div>

              {showMarginOverlay && (
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <label className="type-label text-foreground-muted block mb-1">Margin (px)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={marginPx}
                      onChange={(e) => setMarginPx(Number(e.target.value))}
                      className="w-32 accent-[var(--primary)]"
                    />
                    <span className="text-xs text-foreground ml-2">{marginPx}px</span>
                  </div>
                  <div>
                    <label className="type-label text-foreground-muted block mb-1">Padding (px)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={paddingPx}
                      onChange={(e) => setPaddingPx(Number(e.target.value))}
                      className="w-32 accent-[var(--primary)]"
                    />
                    <span className="text-xs text-foreground ml-2">{paddingPx}px</span>
                  </div>
                </div>
              )}

              {/* Image Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {images.map((img, index) => {
                  const display = getDisplaySize(img.naturalWidth, img.naturalHeight);
                  const renderW = showActualSize ? img.naturalWidth : Math.round(img.naturalWidth * zoom);
                  const renderH = showActualSize ? img.naturalHeight : Math.round(img.naturalHeight * zoom);

                  return (
                    <div key={index} className="space-y-3">
                      {/* Image Card */}
                      <div className="relative rounded-xl border border-border overflow-hidden bg-surface-1">
                        {/* Remove button */}
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-background/80 hover:bg-danger-muted text-foreground-muted hover:text-danger transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Margin overlay */}
                        {showMarginOverlay && (
                          <div
                            className="absolute z-[5] border-2 border-dashed border-red-400/50 bg-red-50/20 pointer-events-none"
                            style={{
                              top: marginPx * zoom,
                              left: marginPx * zoom,
                              right: marginPx * zoom,
                              bottom: marginPx * zoom,
                            }}
                          >
                            {/* Padding overlay inside */}
                            <div
                              className="w-full h-full border-2 border-dashed border-blue-400/50 bg-blue-50/20"
                              style={{
                                margin: paddingPx * zoom,
                              }}
                            />
                          </div>
                        )}

                        {/* Image */}
                        <div
                          className="overflow-auto"
                          style={{ maxHeight: 500 }}
                        >
                          <div
                            className="relative inline-flex"
                            style={{
                              width: showActualSize ? Math.min(renderW, 600) : "100%",
                              height: "auto",
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.file.name}
                              style={{
                                width: showActualSize ? `${renderW}px` : "100%",
                                height: "auto",
                                imageRendering: zoom > 2 ? "pixelated" : "auto",
                              }}
                              className="block"
                            />
                            {/* Grid overlay */}
                            {showGrid && (
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  backgroundImage: `linear-gradient(rgba(91,91,214,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(91,91,214,0.15) 1px, transparent 1px)`,
                                  backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Image Info */}
                      <div className="rounded-xl border border-border p-3 bg-surface-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">{img.file.name}</span>
                          <span className="type-label text-foreground-muted">{(img.file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-foreground-muted">Actual: </span>
                            <span className="font-semibold text-foreground">{img.naturalWidth} × {img.naturalHeight}px</span>
                          </div>
                          <div>
                            <span className="text-foreground-muted">Display: </span>
                            <span className="font-semibold text-primary">{display.displayW} × {display.displayH}px</span>
                          </div>
                          <div>
                            <span className="text-foreground-muted">DPR: </span>
                            <span className="font-semibold text-foreground">{display.dpr.toFixed(1)}×</span>
                          </div>
                          <div>
                            <span className="text-foreground-muted">Scale: </span>
                            <span className="font-semibold text-foreground">{(display.scaleToActual * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        {showMarginOverlay && (
                          <div className="mt-2 pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-red-400">Margin: </span>
                              <span className="font-semibold">{marginPx}px per side</span>
                            </div>
                            <div>
                              <span className="text-blue-400">Padding: </span>
                              <span className="font-semibold">{paddingPx}px per side</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add more */}
              <div className="flex justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Add More Images
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Understanding Visual Scale</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Images look different on every screen. See the actual pixel dimensions vs how they display, with device pixel ratio detection and zoom comparison.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Margin & Padding Overlays</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Visualize margin (red) and padding (blue) overlays on your images. Perfect for checking layout spacing and understanding CSS box model dimensions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
