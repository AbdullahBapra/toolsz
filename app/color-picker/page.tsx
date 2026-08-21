"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Palette,
  Check,
  Shield,
  Zap,
  Copy,
  Image as ImageIcon,
  Pipette,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  const l1 = getLuminance(c1.r, c1.g, c1.b);
  const l2 = getLuminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function generatePalette(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors: string[] = [];
  for (let i = -2; i <= 2; i++) {
    const h = (hsl.h + i * 30 + 360) % 360;
    colors.push(`hsl(${h}, ${hsl.s}%, ${hsl.l}%)`);
  }
  return colors;
}

export default function ColorPickerPage() {
  const [hex, setHex] = useState("#3B82F6");
  const [copied, setCopied] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File[]>([]);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const contrastWhite = rgb ? getContrastRatio(rgb, { r: 255, g: 255, b: 255 }) : 0;
  const contrastBlack = rgb ? getContrastRatio(rgb, { r: 0, g: 0, b: 0 }) : 0;
  const palette = generatePalette(hex);

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // Extract colors from image + render display canvas
  useEffect(() => {
    if (imageFile.length === 0) return;
    const img = new Image();
    const url = URL.createObjectURL(imageFile[0]);
    img.onload = () => {
      const canvas = canvasRef.current;
      const displayCanvas = displayCanvasRef.current;
      if (!canvas || !displayCanvas) { URL.revokeObjectURL(url); return; }

      // Extraction canvas (small for speed)
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 100, 100);
      const data = ctx.getImageData(0, 0, 100, 100).data;
      const colorMap: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 16) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = rgbToHex(r, g, b);
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      const sorted = Object.entries(colorMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([color]) => color);
      setExtractedColors(sorted);

      // Display canvas for click-to-pick
      const MAX_WIDTH = 500;
      const scale = Math.min(MAX_WIDTH / img.width, 1);
      displayCanvas.width = Math.round(img.width * scale);
      displayCanvas.height = Math.round(img.height * scale);
      const dCtx = displayCanvas.getContext("2d")!;
      dCtx.drawImage(img, 0, 0, displayCanvas.width, displayCanvas.height);

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [imageFile]);

  // Click on image to pick color
  const handleImageClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const picked = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setHex(picked);
    setPickedColor(picked);
    setTimeout(() => setPickedColor(null), 1500);
  }, []);

  const copyRow = (label: string, value: string, id: string) => (
    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-1 border border-border">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-xs font-mono text-foreground-secondary">{value}</code>
        <button onClick={() => handleCopy(value, id)} className="p-1 rounded hover:bg-surface-2 transition-colors">
          {copied === id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-foreground-muted" />}
        </button>
      </div>
    </div>
  );

  const wcagLevel = (ratio: number) => {
    if (ratio >= 7) return { label: "AAA", color: "#059669" };
    if (ratio >= 4.5) return { label: "AA", color: "#16a34a" };
    if (ratio >= 3) return { label: "AA Large", color: "#ca8a04" };
    return { label: "Fail", color: "#ef4444" };
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Palette}
          title="Color Picker & Palette"
          description="Pick colors with hex, RGB, HSL conversion, WCAG contrast checker, and image palette extraction — free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          {/* Left: Picker & Conversions */}
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Pick a Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-16 h-16 rounded-xl border border-border cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9a-f]{0,6}$/i.test(v)) setHex(v);
                    }}
                    className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              {pickedColor && (
                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-muted border border-primary-border animate-fade-in">
                  <Pipette className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Picked {pickedColor}</span>
                </div>
              )}
            </div>

            {/* Conversions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground">Color Values</h4>
              {rgb && copyRow("HEX", hex, "hex")}
              {rgb && copyRow("RGB", `${rgb.r}, ${rgb.g}, ${rgb.b}`, "rgb")}
              {hsl && copyRow("HSL", `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`, "hsl")}
              {rgb && copyRow("CSS", `rgb(${rgb.r} ${rgb.g} ${rgb.b})`, "css")}
            </div>

            {/* Contrast Checker */}
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-semibold text-foreground">WCAG Contrast</h4>
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg p-3 text-center" style={{ backgroundColor: hex }}>
                  <span className="text-xs font-bold" style={{ color: "#fff" }}>Aa</span>
                  <div className="text-xs mt-1" style={{ color: "#fff" }}>
                    {contrastWhite.toFixed(1)}:1 — <span style={{ color: wcagLevel(contrastWhite).color }}>{wcagLevel(contrastWhite).label}</span>
                  </div>
                </div>
                <div className="flex-1 rounded-lg p-3 text-center" style={{ backgroundColor: hex }}>
                  <span className="text-xs font-bold" style={{ color: "#000" }}>Aa</span>
                  <div className="text-xs mt-1" style={{ color: "#000" }}>
                    {contrastBlack.toFixed(1)}:1 — <span style={{ color: wcagLevel(contrastBlack).color }}>{wcagLevel(contrastBlack).label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Palette & Image Extraction */}
          <div className="space-y-6">
            {/* Palette */}
            <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-4">
              <h4 className="text-xs font-semibold text-foreground">Generated Palette</h4>
              <div className="flex rounded-lg overflow-hidden border border-border">
                {palette.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => handleCopy(color, `pal-${i}`)}
                    className="flex-1 h-16 transition-all hover:flex-[2] relative group"
                    style={{ backgroundColor: color }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono font-bold mix-blend-difference text-white">
                      {copied === `pal-${i}` ? <Check className="w-4 h-4" /> : color}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Color Extraction with click-to-pick */}
            <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-4">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Extract from Image
              </h4>
              <FileUpload
                accept="image/*"
                multiple={false}
                files={imageFile}
                onFilesChange={setImageFile}
                label="Drop an image"
                description="Extract dominant colors & click to pick any pixel"
              />
              <canvas ref={canvasRef} className="hidden" />

              {imageFile.length > 0 && (
                <div className="mt-4 border border-border bg-surface-2 rounded-lg p-3 overflow-hidden flex flex-col items-center space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase text-foreground-secondary tracking-wider font-semibold">
                    <Pipette className="w-3 h-3" />
                    Click anywhere to pick color
                  </div>
                  <canvas
                    ref={displayCanvasRef}
                    onClick={handleImageClick}
                    className="max-w-full h-auto cursor-crosshair rounded shadow-sm border border-border/50"
                  />
                </div>
              )}

              {extractedColors.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] uppercase text-foreground-secondary tracking-wider font-semibold mb-2">Dominant Colors</p>
                  <div className="flex rounded-lg overflow-hidden border border-border">
                    {extractedColors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => { setHex(color); handleCopy(color, `ext-${i}`); }}
                        className="flex-1 h-12 transition-all hover:flex-[2] relative group"
                        style={{ backgroundColor: color }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono font-bold mix-blend-difference text-white">
                          {copied === `ext-${i}` ? <Check className="w-3 h-3" /> : color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">WCAG Contrast Checker</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Check text readability against white and black. Shows contrast ratio and WCAG AA/AAA compliance level.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Image Color Picker</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Upload any image to extract its dominant colors or click on any pixel to instantly grab its exact color value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
