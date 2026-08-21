"use client";

import { useState, useCallback, useEffect } from "react";
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal2,
  FlipVertical2,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw as ResetIcon,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type Rotation = 0 | 90 | 180 | 270;

export default function RotateImagePage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setFiles(newFiles); setDone(false); setOutputUrl(null); setRotation(0); setFlipH(false); setFlipV(false);
    if (newFiles.length === 0) { setImageUrl(null); return; }
    setImageUrl(URL.createObjectURL(newFiles[0]));
  }, [imageUrl, outputUrl]);

  const rotateCw = () => setRotation((prev) => ((prev + 90) % 360) as Rotation);
  const rotateCcw = () => setRotation((prev) => ((prev + 270) % 360) as Rotation);

  const hasChanges = rotation !== 0 || flipH || flipV;

  const handleProcess = useCallback(async () => {
    if (!imageUrl || !files.length) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = imageUrl; });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas failed");

      const isRotated90or270 = rotation === 90 || rotation === 270;
      canvas.width = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      canvas.height = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob((blob) => {
        if (!blob) { addToast("error", "Failed to process image."); setProcessing(false); return; }
        const url = URL.createObjectURL(blob);
        setOutputUrl(url); setDone(true); setProcessing(false);
      }, "image/png");
    } catch {
      addToast("error", "Failed to process image.");
      setProcessing(false);
    }
  }, [imageUrl, rotation, flipH, flipV, files, addToast]);

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setFiles([]); setDone(false); setProcessing(false); setImageUrl(null); setOutputUrl(null);
    setRotation(0); setFlipH(false); setFlipV(false);
  };

  const transformStyle = {
    transform: `rotate(${rotation}deg)${flipH ? " scaleX(-1)" : ""}${flipV ? " scaleY(-1)" : ""}`,
    transition: "transform 0.3s ease",
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={RotateCw} title="Rotate & Flip Image" description="Rotate 90°, 180°, 270° and flip horizontally or vertically — instant preview, any format. Free, instant, and completely private." backHref="/image-tools" backLabel="Back to Image Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept="image/*" files={files} onFilesChange={handleFileChange} label="Drop your image here" description="or click to browse — PNG, JPG, WebP, etc." />
              {imageUrl && (
                <div className="mt-8 animate-fade-in-up space-y-6">
                  <div className="flex justify-center"><div className="border border-border rounded-xl overflow-hidden bg-surface-2 p-2"><img src={imageUrl} alt="Preview" className="max-w-full max-h-64 object-contain" style={transformStyle} /></div></div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button onClick={rotateCcw} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-xs font-semibold hover:border-primary-border hover:bg-primary-muted transition-all"><RotateCcw className="w-4 h-4 text-primary" />90° CCW</button>
                    <button onClick={rotateCw} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-xs font-semibold hover:border-primary-border hover:bg-primary-muted transition-all"><RotateCw className="w-4 h-4 text-primary" />90° CW</button>
                    <button onClick={() => setRotation(180)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-xs font-semibold hover:border-primary-border hover:bg-primary-muted transition-all">180°</button>
                    <button onClick={() => setFlipH(!flipH)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-foreground text-xs font-semibold transition-all ${flipH ? "border-primary bg-primary-muted" : "border-border bg-surface-2 hover:border-primary-border"}`}><FlipHorizontal2 className="w-4 h-4 text-primary" />Flip H</button>
                    <button onClick={() => setFlipV(!flipV)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-foreground text-xs font-semibold transition-all ${flipV ? "border-primary bg-primary-muted" : "border-border bg-surface-2 hover:border-primary-border"}`}><FlipVertical2 className="w-4 h-4 text-primary" />Flip V</button>
                    {hasChanges && <button onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground-muted text-xs font-semibold hover:border-red-300 hover:text-red-500 transition-all"><ResetIcon className="w-4 h-4" />Reset</button>}
                  </div>
                </div>
              )}
              {imageUrl && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} disabled={processing || !hasChanges} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : <><RotateCw className="w-5 h-5" />Apply & Download</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-success" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Image Rotated!</h3>
              <p className="text-foreground-secondary mb-6">{rotation}°{flipH ? " + Flip H" : ""}{flipV ? " + Flip V" : ""}</p>
              {outputUrl && <div className="flex justify-center mb-6"><img src={outputUrl} alt="Result" className="max-w-full max-h-64 rounded-xl border border-border" /></div>}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={outputUrl!} download={`rotated-${files[0]?.name || "image.png"}`} className="btn btn-primary inline-flex items-center gap-2 text-center"><Download className="w-5 h-5" />Download</a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center"><ResetIcon className="w-4 h-4" />Rotate Another</button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5"><div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div><div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4><p className="text-foreground-muted text-sm leading-relaxed">Rotation happens entirely in your browser. Your image is never uploaded.</p></div></div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5"><div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div><div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Live Preview</h4><p className="text-foreground-muted text-sm leading-relaxed">See rotation and flip changes in real-time before downloading.</p></div></div>
        </div>
      </div>
    </div>
  );
}
