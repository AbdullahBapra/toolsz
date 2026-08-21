"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Palette,
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

type ColorPreset = "natural" | "warm" | "cool" | "vintage" | "dramatic" | "custom";

const colorPresets: { id: ColorPreset; label: string; settings: ColorSettings }[] = [
  { id: "natural", label: "Natural Tones", settings: { sepia: 60, hue: 30, saturation: 80, lightness: 5, warmth: 20 } },
  { id: "warm", label: "Warm Sunset", settings: { sepia: 50, hue: 15, saturation: 100, lightness: 8, warmth: 40 } },
  { id: "cool", label: "Cool Ocean", settings: { sepia: 50, hue: 200, saturation: 70, lightness: 5, warmth: -20 } },
  { id: "vintage", label: "Vintage Photo", settings: { sepia: 80, hue: 25, saturation: 50, lightness: 0, warmth: 15 } },
  { id: "dramatic", label: "Dramatic", settings: { sepia: 40, hue: 340, saturation: 120, lightness: 10, warmth: 10 } },
  { id: "custom", label: "Custom", settings: { sepia: 50, hue: 30, saturation: 80, lightness: 5, warmth: 0 } },
];

interface ColorSettings {
  sepia: number;
  hue: number;
  saturation: number;
  lightness: number;
  warmth: number;
}

export default function ColorizeImagePage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<ColorPreset>("natural");
  const [settings, setSettings] = useState<ColorSettings>(colorPresets[0].settings);
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
    if (newFiles.length === 0) { setImageUrl(null); return; }
    setImageUrl(URL.createObjectURL(newFiles[0]));
  }, [imageUrl]);

  const selectPreset = useCallback((id: ColorPreset) => {
    setPreset(id);
    const p = colorPresets.find((p) => p.id === id);
    if (p) setSettings(p.settings);
  }, []);

  const updateSetting = useCallback((key: keyof ColorSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setPreset("custom");
  }, []);

  const getFilterString = useCallback((s: ColorSettings) => {
    return `sepia(${s.sepia}%) hue-rotate(${s.hue + s.warmth}deg) saturate(${s.saturation}%) brightness(${100 + s.lightness}%)`;
  }, []);

  const handleProcess = useCallback(async () => {
    if (!imageUrl || files.length === 0) {
      addToast("error", "Please upload a black & white image first");
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
      setProgress(30);

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;

      // Step 1: Apply CSS filter to get base colorization
      ctx.filter = getFilterString(settings);
      ctx.drawImage(img, 0, 0);
      setProgress(60);

      // Step 2: Blend with original for more natural look
      // Get pixel data and adjust based on original luminance
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Load original for luminance comparison
      const origCanvas = document.createElement("canvas");
      origCanvas.width = img.naturalWidth;
      origCanvas.height = img.naturalHeight;
      const origCtx = origCanvas.getContext("2d")!;
      origCtx.drawImage(img, 0, 0);
      const origData = origCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      setProgress(80);

      // Blend: use colorized version but modulate by original brightness
      for (let i = 0; i < data.length; i += 4) {
        const origLum = (origData[i] * 0.299 + origData[i + 1] * 0.587 + origData[i + 2] * 0.114) / 255;
        // Modulate colorized values by original luminance
        data[i] = Math.min(255, Math.round(data[i] * (0.4 + 0.6 * origLum)));       // R
        data[i + 1] = Math.min(255, Math.round(data[i + 1] * (0.4 + 0.6 * origLum))); // G
        data[i + 2] = Math.min(255, Math.round(data[i + 2] * (0.4 + 0.6 * origLum))); // B
      }

      ctx.putImageData(imageData, 0, 0);
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
      addToast("success", "Image colorized!");
    } catch (err) {
      console.error("Colorization failed:", err);
      addToast("error", "Failed to colorize image. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [imageUrl, files, settings, getFilterString, addToast]);

  const handleDownload = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = "colorized-image.png";
    a.click();
  }, [outputUrl]);

  const handleReset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    setFiles([]);
    setImageUrl(null);
    setOutputUrl(null);
    setDone(false);
    setPreset("natural");
    setSettings(colorPresets[0].settings);
    outputRef.current = null;
  }, [imageUrl]);

  const sliders: { key: keyof ColorSettings; label: string; min: number; max: number; step: number; unit: string }[] = [
    { key: "sepia", label: "Color Base", min: 0, max: 100, step: 1, unit: "%" },
    { key: "hue", label: "Hue", min: 0, max: 360, step: 1, unit: "°" },
    { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1, unit: "%" },
    { key: "lightness", label: "Brightness", min: -20, max: 30, step: 1, unit: "%" },
    { key: "warmth", label: "Warmth", min: -40, max: 40, step: 1, unit: "°" },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Palette}
          title="Colorize Image"
          description="Add color to black and white photos — sepia toning plus hue rotation with luminance-aware blending. Free, instant, and private."
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
                label="Drop a B&W image here or click to upload"
                description="or click to browse — PNG, JPG, WebP supported"
              />

            {imageUrl && (
              <div className="mt-8 animate-fade-in-up space-y-6">
                {/* Preview with live filter */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Live Preview
                  </h3>
                  <div className="flex justify-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-w-full max-h-80 rounded-lg"
                      style={{ filter: getFilterString(settings) }}
                    />
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Color Presets
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {colorPresets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => selectPreset(p.id)}
                        className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition ${
                          preset === p.id
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom sliders */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Fine-Tune Colors
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {sliders.map((s) => (
                      <div key={s.key}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs text-foreground-secondary">{s.label}</label>
                          <span className="text-xs text-foreground-muted">
                            {settings[s.key]}{s.unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={s.min}
                          max={s.max}
                          step={s.step}
                          value={settings[s.key]}
                          onChange={(e) => updateSetting(s.key, Number(e.target.value))}
                          className="w-full accent-accent"
                        />
                      </div>
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
                        Colorizing... {progress}%
                      </>
                    ) : (
                      <>
                        <Palette className="w-5 h-5" />
                        Colorize Image
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
            <h3 className="text-2xl font-bold text-foreground mb-2">Image Colorized!</h3>
            <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
              Your black & white photo has been colorized. Download it and compare the before and after.
            </p>

            <div className="flex items-start justify-center gap-6 flex-wrap mb-6">
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground-muted mb-2">Original (B&W)</p>
                <img src={imageUrl!} alt="Original" className="w-56 h-56 object-contain rounded-lg border border-border bg-surface-1" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-primary mb-2">Colorized</p>
                <img src={outputUrl!} alt="Colorized" className="w-56 h-56 object-contain rounded-lg border border-primary-border bg-surface-1" />
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
                Colorize Another
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
                Colorization happens entirely in your browser. Your image is never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Luminance-Aware Blending</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Uses sepia toning with hue rotation and luminance-aware blending for natural-looking color. Adjust the Color Base slider to control intensity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
