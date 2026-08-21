"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Smartphone,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Share2,
  Camera,
  Bird,
  Briefcase,
  BookOpen,
  Play,
  Music,
  Globe,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface PlatformPreset {
  id: string;
  platform: string;
  type: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const PRESETS: PlatformPreset[] = [
  { id: "ig-square", platform: "Instagram", type: "Square Post", width: 1080, height: 1080, icon: <Camera className="w-4 h-4" /> },
  { id: "ig-portrait", platform: "Instagram", type: "Portrait Post", width: 1080, height: 1350, icon: <Camera className="w-4 h-4" /> },
  { id: "ig-story", platform: "Instagram", type: "Story/Reel", width: 1080, height: 1920, icon: <Camera className="w-4 h-4" /> },
  { id: "tw-header", platform: "Twitter/X", type: "Header", width: 1500, height: 500, icon: <Bird className="w-4 h-4" /> },
  { id: "tw-post", platform: "Twitter/X", type: "Post Image", width: 1200, height: 675, icon: <Bird className="w-4 h-4" /> },
  { id: "li-banner", platform: "LinkedIn", type: "Banner", width: 1584, height: 396, icon: <Briefcase className="w-4 h-4" /> },
  { id: "li-post", platform: "LinkedIn", type: "Post Image", width: 1200, height: 627, icon: <Briefcase className="w-4 h-4" /> },
  { id: "fb-cover", platform: "Facebook", type: "Cover", width: 820, height: 312, icon: <BookOpen className="w-4 h-4" /> },
  { id: "fb-post", platform: "Facebook", type: "Post", width: 1200, height: 630, icon: <BookOpen className="w-4 h-4" /> },
  { id: "yt-thumb", platform: "YouTube", type: "Thumbnail", width: 1280, height: 720, icon: <Play className="w-4 h-4" /> },
  { id: "tt-video", platform: "TikTok", type: "Video Cover", width: 1080, height: 1920, icon: <Music className="w-4 h-4" /> },
  { id: "og-image", platform: "Web", type: "OG Image", width: 1200, height: 630, icon: <Globe className="w-4 h-4" /> },
];

type FitMode = "cover" | "contain" | "stretch" | "center";

export default function SocialImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState<PlatformPreset>(PRESETS[0]);
  const [fitMode, setFitMode] = useState<FitMode>("cover");
  const [bgColor, setBgColor] = useState("#000000");
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1080);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);

    try {
      const file = files[0];
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      const targetW = isCustom ? customW : preset.width;
      const targetH = isCustom ? customH : preset.height;

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetW, targetH);

      if (fitMode === "stretch") {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      } else if (fitMode === "contain") {
        const scale = Math.min(targetW / img.naturalWidth, targetH / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (targetW - w) / 2, (targetH - h) / 2, w, h);
      } else if (fitMode === "center") {
        const scale = Math.min(targetW / img.naturalWidth, targetH / img.naturalHeight, 1);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (targetW - w) / 2, (targetH - h) / 2, w, h);
      } else {
        // cover — fill entire area, crop excess
        const scale = Math.max(targetW / img.naturalWidth, targetH / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (targetW - w) / 2, (targetH - h) / 2, w, h);
      }

      const url = canvas.toDataURL("image/png");
      setResultUrl(url);
      URL.revokeObjectURL(img.src);
      setDone(true);
    } catch (err) {
      console.error("Resize failed:", err);
      setError("Failed to resize image.");
    } finally {
      setProcessing(false);
    }
  }, [files, preset, fitMode, bgColor, customW, customH, isCustom]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `social-${preset.id}.png`;
    a.click();
  }, [resultUrl, preset]);

  // Cleanup blob URLs on unmount
  const urlRef = useRef<string | null>(null);
  useEffect(() => {
    urlRef.current = resultUrl;
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
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
          icon={Smartphone}
          title="Social Image Resizer"
          description="One-click presets for Instagram, Twitter, LinkedIn, YouTube, TikTok — smart crop and fit your images instantly. Free and private."
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
                description="Any format — we'll resize to platform specs"
              />

              {files.length > 0 && !processing && (
                <div className="mt-8 space-y-5 animate-fade-in-up">
                  {/* Platform presets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground">Platform</label>
                      <button onClick={() => setIsCustom(!isCustom)} className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${isCustom ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"}`}>
                        Custom Size
                      </button>
                    </div>
                    {!isCustom ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PRESETS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setPreset(p)}
                            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left ${
                              preset.id === p.id
                                ? "bg-primary-muted border-primary-border text-primary"
                                : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                            }`}
                          >
                            <span className="flex items-center gap-1">{p.icon} {p.platform}</span>
                            <span className="block text-[10px] opacity-70 mt-0.5">{p.type} — {p.width}×{p.height}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">Width (px)</label>
                          <input type="number" min={100} max={5000} value={customW} onChange={(e) => setCustomW(parseInt(e.target.value) || 1080)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">Height (px)</label>
                          <input type="number" min={100} max={5000} value={customH} onChange={(e) => setCustomH(parseInt(e.target.value) || 1080)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fit mode */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Fit Mode</label>
                    <div className="flex gap-2 flex-wrap">
                      {([["cover", "Cover (crop)"], ["contain", "Contain (fit)"], ["stretch", "Stretch"], ["center", "Center"]] as [FitMode, string][]).map(([id, label]) => (
                        <button key={id} onClick={() => setFitMode(id)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          fitMode === id ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                        }`}>{label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Background color */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-foreground">Background</label>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-6 h-6 rounded border border-border cursor-pointer" />
                    <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-20 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs text-foreground font-mono" />
                  </div>

                  <div className="flex justify-center pt-2">
                    <button onClick={handleProcess} className="btn btn-primary inline-flex items-center gap-2">
                      <Share2 className="w-5 h-5" /> Resize Image
                    </button>
                  </div>
                </div>
              )}

              {processing && (
                <div className="mt-8 text-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-foreground-secondary">Resizing...</p>
                </div>
              )}
              {error && <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center">{error}</div>}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Resized!</h3>
              <p className="text-foreground-secondary mb-6">{isCustom ? `${customW}×${customH}` : `${preset.platform} ${preset.type}`} — {isCustom ? customW : preset.width}×{isCustom ? customH : preset.height}px</p>
              {resultUrl && <div className="mb-6 flex justify-center"><img src={resultUrl} alt="Resized" className="max-w-full max-h-[400px] rounded-lg border border-border" /></div>}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={handleDownload} className="btn btn-primary inline-flex items-center gap-2"><Download className="w-5 h-5" /> Download PNG</button>
                <button onClick={handleReset} className="btn btn-secondary">Resize Another</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">12 Platform Presets</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Instagram, Twitter/X, LinkedIn, Facebook, YouTube, TikTok, and Open Graph — exact recommended dimensions.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Smart Fit Modes</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Cover (crop to fill), Contain (fit with padding), Stretch, or Center — choose how your image fits the target.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
