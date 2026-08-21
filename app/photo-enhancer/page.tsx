"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Sparkles,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw,
  Info,
  Sun,
  Contrast,
  Droplets,
  Palette,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type Preset = "auto" | "vivid" | "warm" | "cool" | "bw" | "vintage" | "dramatic" | "custom";

const presets: { id: Preset; label: string; icon: React.ElementType; settings: FilterSettings }[] = [
  { id: "auto", label: "Auto Fix", icon: Sparkles, settings: { brightness: 110, contrast: 110, saturation: 115, hue: 0, blur: 0, sepia: 0 } },
  { id: "vivid", label: "Vivid", icon: Palette, settings: { brightness: 105, contrast: 120, saturation: 140, hue: 0, blur: 0, sepia: 0 } },
  { id: "warm", label: "Warm", icon: Sun, settings: { brightness: 108, contrast: 105, saturation: 120, hue: 10, blur: 0, sepia: 15 } },
  { id: "cool", label: "Cool", icon: Droplets, settings: { brightness: 105, contrast: 110, saturation: 110, hue: -10, blur: 0, sepia: 0 } },
  { id: "bw", label: "Black & White", icon: Contrast, settings: { brightness: 110, contrast: 130, saturation: 0, hue: 0, blur: 0, sepia: 0 } },
  { id: "vintage", label: "Vintage", icon: Palette, settings: { brightness: 95, contrast: 90, saturation: 70, hue: 0, blur: 0, sepia: 40 } },
  { id: "dramatic", label: "Dramatic", icon: Contrast, settings: { brightness: 90, contrast: 150, saturation: 130, hue: 0, blur: 0, sepia: 0 } },
  { id: "custom", label: "Custom", icon: Sparkles, settings: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sepia: 0 } },
];

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
}

export default function PhotoEnhancerPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>("auto");
  const [settings, setSettings] = useState<FilterSettings>(presets[0].settings);
  const [processing, setProcessing] = useState(false);
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

  const selectPreset = useCallback((id: Preset) => {
    setPreset(id);
    const p = presets.find((p) => p.id === id);
    if (p) setSettings(p.settings);
  }, []);

  const updateSetting = useCallback((key: keyof FilterSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setPreset("custom");
  }, []);

  const getFilterString = useCallback((s: FilterSettings) => {
    return `brightness(${s.brightness}%) contrast(${s.contrast}%) saturate(${s.saturation}%) hue-rotate(${s.hue}deg) blur(${s.blur}px) sepia(${s.sepia}%)`;
  }, []);

  const handleProcess = useCallback(async () => {
    if (!imageUrl || files.length === 0) {
      addToast("error", "Please upload an image first");
      return;
    }
    setProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl!;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;

      ctx.filter = getFilterString(settings);
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      const url = URL.createObjectURL(blob);
      if (outputRef.current) URL.revokeObjectURL(outputRef.current);
      outputRef.current = url;
      setOutputUrl(url);
      setDone(true);
      addToast("success", "Photo enhanced!");
    } catch (err) {
      console.error("Enhancement failed:", err);
      addToast("error", "Failed to enhance photo. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [imageUrl, files, settings, getFilterString, addToast]);

  const handleDownload = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = "enhanced-photo.png";
    a.click();
  }, [outputUrl]);

  const handleReset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    setFiles([]);
    setImageUrl(null);
    setOutputUrl(null);
    setDone(false);
    setPreset("auto");
    setSettings(presets[0].settings);
    outputRef.current = null;
  }, [imageUrl]);

  const sliders: { key: keyof FilterSettings; label: string; min: number; max: number; step: number; unit: string }[] = [
    { key: "brightness", label: "Brightness", min: 0, max: 200, step: 1, unit: "%" },
    { key: "contrast", label: "Contrast", min: 0, max: 200, step: 1, unit: "%" },
    { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1, unit: "%" },
    { key: "hue", label: "Hue Rotate", min: -180, max: 180, step: 1, unit: "°" },
    { key: "blur", label: "Blur", min: 0, max: 10, step: 0.5, unit: "px" },
    { key: "sepia", label: "Sepia", min: 0, max: 100, step: 1, unit: "%" },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Sparkles}
          title="Photo Enhancer"
          description="One-click auto-fix or fine-tune brightness, contrast, saturation, hue, blur, and sepia with live preview — free, instant, and private."
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
                label="Drop a photo here or click to upload"
                description="or click to browse — PNG, JPG, WebP supported"
              />

            {imageUrl && (
              <div className="mt-8 animate-fade-in-up space-y-6">
                {/* Preview with live filter */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Preview
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
                    Quick Presets
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => selectPreset(p.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition ${
                          preset === p.id
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <p.icon className="w-4 h-4" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom sliders */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Contrast className="w-5 h-5 text-primary" />
                    Fine-Tune
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
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Enhance Photo
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
            <h3 className="text-2xl font-bold text-foreground mb-2">Photo Enhanced!</h3>
            <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
              Your photo has been enhanced with the {preset !== "custom" ? preset : "Custom"} preset.
            </p>

            <div className="flex items-start justify-center gap-6 flex-wrap mb-6">
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground-muted mb-2">Original</p>
                <img src={imageUrl!} alt="Original" className="w-52 h-52 object-contain rounded-lg border border-border bg-surface-1" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-primary mb-2">Enhanced ({preset !== "custom" ? preset : "Custom"})</p>
                <img src={outputUrl!} alt="Enhanced" className="w-52 h-52 object-contain rounded-lg border border-primary-border bg-surface-1" />
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
                Enhance Another
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
                Photo enhancement happens entirely in your browser. Your image is never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Real-Time Preview</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Use quick presets for one-click enhancement, or fine-tune each parameter manually. The preview updates in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
