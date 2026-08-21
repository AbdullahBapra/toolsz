"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Crop,
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

type AspectRatio = "free" | "1:1" | "4:3" | "16:9" | "3:2" | "9:16" | "2:3";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const aspectRatios: { id: AspectRatio; label: string }[] = [
  { id: "free", label: "Free" },
  { id: "1:1", label: "1:1 Square" },
  { id: "4:3", label: "4:3" },
  { id: "16:9", label: "16:9" },
  { id: "3:2", label: "3:2" },
  { id: "9:16", label: "9:16 Portrait" },
  { id: "2:3", label: "2:3" },
];

function getRatioValue(ratio: AspectRatio): number | null {
  switch (ratio) {
    case "free": return null;
    case "1:1": return 1;
    case "4:3": return 4 / 3;
    case "16:9": return 16 / 9;
    case "3:2": return 3 / 2;
    case "9:16": return 9 / 16;
    case "2:3": return 2 / 3;
  }
}

export default function CropImagePage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setFiles(newFiles);
    setDone(false);
    setOutputUrl(null);

    if (newFiles.length === 0) { setImageUrl(null); return; }

    const url = URL.createObjectURL(newFiles[0]);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setCrop({ x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  }, [imageUrl, outputUrl]);

  const handleCropChange = useCallback((field: keyof CropArea, value: number) => {
    setCrop((prev) => {
      const next = { ...prev, [field]: Math.max(0, value) };
      const ratio = getRatioValue(aspectRatio);
      if (ratio && field === "width") {
        next.height = Math.round(next.width / ratio);
      } else if (ratio && field === "height") {
        next.width = Math.round(next.height * ratio);
      }
      return next;
    });
  }, [aspectRatio]);

  const handleAspectRatioChange = useCallback((ratio: AspectRatio) => {
    setAspectRatio(ratio);
    const r = getRatioValue(ratio);
    if (r && imageSize.width > 0) {
      let w = imageSize.width;
      let h = Math.round(w / r);
      if (h > imageSize.height) { h = imageSize.height; w = Math.round(h * r); }
      setCrop({ x: 0, y: 0, width: w, height: h });
    }
  }, [imageSize]);

  const handleProcess = useCallback(async () => {
    if (!imageUrl || !files.length) return;
    setProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

      canvas.toBlob((blob) => {
        if (!blob) { addToast("error", "Failed to crop image."); setProcessing(false); return; }
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setDone(true);
        setProcessing(false);
      }, "image/png");
    } catch {
      addToast("error", "Failed to crop image. Please try again.");
      setProcessing(false);
    }
  }, [imageUrl, crop, files, addToast]);

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setFiles([]); setDone(false); setProcessing(false); setImageUrl(null); setOutputUrl(null);
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={Crop} title="Crop Image" description="Crop images with precision — free aspect ratio or lock 1:1, 4:3, 16:9, and more presets. Instant preview, any format, free and private." backHref="/image-tools" backLabel="Back to Image Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept="image/*" files={files} onFilesChange={handleFileChange} label="Drop your image here" description="or click to browse — PNG, JPG, WebP, etc." />
              {imageUrl && (
                <div className="mt-8 animate-fade-in-up space-y-6">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-muted border border-primary-border">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">{imageSize.width} × {imageSize.height}px</span>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative inline-block border border-border rounded-xl overflow-hidden bg-surface-2" style={{ maxWidth: "100%", maxHeight: "300px" }}>
                      <img ref={imgRef} src={imageUrl} alt="Preview" className="max-w-full max-h-[300px] object-contain" />
                      <div className="absolute border-2 border-primary bg-primary/10 pointer-events-none" style={{
                        left: `${(crop.x / imageSize.width) * 100}%`,
                        top: `${(crop.y / imageSize.height) * 100}%`,
                        width: `${(crop.width / imageSize.width) * 100}%`,
                        height: `${(crop.height / imageSize.height) * 100}%`,
                      }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Crop className="w-5 h-5 text-primary" />Aspect Ratio</h3>
                    <div className="flex flex-wrap gap-2">
                      {aspectRatios.map((r) => (
                        <button key={r.id} onClick={() => handleAspectRatioChange(r.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${aspectRatio === r.id ? "bg-primary text-white" : "border border-border text-foreground hover:border-primary-border"}`}>{r.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">X Offset</label><input type="number" min={0} max={imageSize.width} value={crop.x} onChange={(e) => handleCropChange("x", parseInt(e.target.value) || 0)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">Y Offset</label><input type="number" min={0} max={imageSize.height} value={crop.y} onChange={(e) => handleCropChange("y", parseInt(e.target.value) || 0)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">Width</label><input type="number" min={1} max={imageSize.width} value={crop.width} onChange={(e) => handleCropChange("width", parseInt(e.target.value) || 1)} className={inputClass} /></div>
                    <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">Height</label><input type="number" min={1} max={imageSize.height} value={crop.height} onChange={(e) => handleCropChange("height", parseInt(e.target.value) || 1)} className={inputClass} /></div>
                  </div>
                </div>
              )}
              {imageUrl && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Cropping...</> : <><Crop className="w-5 h-5" />Crop Image</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-success" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Image Cropped!</h3>
              <p className="text-foreground-secondary mb-6">{crop.width} × {crop.height}px</p>
              {outputUrl && (
                <div className="flex justify-center mb-6"><img src={outputUrl} alt="Cropped" className="max-w-full max-h-64 rounded-xl border border-border" /></div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={outputUrl!} download={`cropped-${files[0]?.name || "image.png"}`} className="btn btn-primary inline-flex items-center gap-2 text-center"><Download className="w-5 h-5" />Download</a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center"><RotateCcw className="w-4 h-4" />Crop Another</button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4><p className="text-foreground-muted text-sm leading-relaxed">Cropping happens entirely in your browser. Your image is never uploaded.</p></div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Aspect Ratio Presets</h4><p className="text-foreground-muted text-sm leading-relaxed">Quick presets for social media, profile pics, and common print sizes.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
