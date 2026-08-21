"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  MessageSquare,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw,
  Info,
  Type,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type FontSize = "small" | "medium" | "large" | "xlarge";
type Position = "top-bottom" | "top" | "bottom" | "center";

const fontSizes: { id: FontSize; label: string; value: number }[] = [
  { id: "small", label: "Small", value: 32 },
  { id: "medium", label: "Medium", value: 48 },
  { id: "large", label: "Large", value: 64 },
  { id: "xlarge", label: "Extra Large", value: 80 },
];

const positions: { id: Position; label: string }[] = [
  { id: "top-bottom", label: "Top & Bottom" },
  { id: "top", label: "Top Only" },
  { id: "bottom", label: "Bottom Only" },
  { id: "center", label: "Center" },
];

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";
  for (let i = 1; i < words.length; i++) {
    const testLine = `${currentLine} ${words[i]}`;
    if (ctx.measureText(testLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

export default function MemeGeneratorPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState<FontSize>("large");
  const [position, setPosition] = useState<Position>("top-bottom");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#ffffff");
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

  const currentFontSize = fontSizes.find((f) => f.id === fontSize)?.value ?? 64;

  const handleProcess = useCallback(async () => {
    if (!imageUrl || files.length === 0) {
      addToast("error", "Please upload an image first");
      return;
    }
    if (!topText && !bottomText) {
      addToast("error", "Add at least top or bottom text");
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

      // Scale font size relative to image width
      const scale = canvas.width / 800;
      const scaledFontSize = Math.round(currentFontSize * scale);

      ctx.font = `bold ${scaledFontSize}px Impact, "Arial Black", sans-serif`;
      ctx.textAlign = "center";
      ctx.lineWidth = scaledFontSize / 8;
      ctx.lineJoin = "round";

      // Draw image
      ctx.drawImage(img, 0, 0);

      const padding = scaledFontSize;
      const maxWidth = canvas.width - padding * 2;

      // Draw text based on position
      const drawWithScaled = (
        text: string,
        x: number,
        y: number,
        maxW: number
      ) => {
        if (!text) return;
        const lines = wrapText(ctx, text.toUpperCase(), maxW);
        const lineHeight = scaledFontSize * 1.2;
        lines.forEach((line, i) => {
          const lineY = y + i * lineHeight;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = scaledFontSize / 8;
          ctx.lineJoin = "round";
          ctx.strokeText(line, x, lineY, maxW);
          ctx.fillStyle = fillColor;
          ctx.fillText(line, x, lineY, maxW);
        });
      };

      switch (position) {
        case "top-bottom":
        case "top":
          drawWithScaled(topText, canvas.width / 2, padding + scaledFontSize, maxWidth);
          if (position === "top") break;
          // fall through to also draw bottom
          drawWithScaled(bottomText, canvas.width / 2, canvas.height - padding - scaledFontSize * 0.3, maxWidth);
          break;
        case "bottom":
          drawWithScaled(bottomText, canvas.width / 2, canvas.height - padding - scaledFontSize * 0.3, maxWidth);
          break;
        case "center":
          drawWithScaled(
            topText || bottomText,
            canvas.width / 2,
            canvas.height / 2,
            maxWidth
          );
          break;
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      const url = URL.createObjectURL(blob);
      if (outputRef.current) URL.revokeObjectURL(outputRef.current);
      outputRef.current = url;
      setOutputUrl(url);
      setDone(true);
      addToast("success", "Meme created!");
    } catch (err) {
      console.error("Meme creation failed:", err);
      addToast("error", "Failed to create meme. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [imageUrl, files, topText, bottomText, currentFontSize, position, strokeColor, fillColor, addToast]);

  const handleDownload = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = "meme.png";
    a.click();
  }, [outputUrl]);

  const handleReset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    setFiles([]);
    setImageUrl(null);
    setOutputUrl(null);
    setTopText("");
    setBottomText("");
    setDone(false);
    outputRef.current = null;
  }, [imageUrl]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={MessageSquare}
          title="Meme Generator"
          description="Add bold Impact text to any image — top, bottom, or center placement with custom colors and font size. Free, instant, and private."
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
                label="Drop an image here or click to upload"
                description="or click to browse — PNG, JPG, WebP supported"
              />

            {imageUrl && (
              <div className="mt-8 animate-fade-in-up space-y-6">
                {/* Live preview */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Preview
                  </h3>
                  <div className="relative flex justify-center">
                    <img
                      src={imageUrl}
                      alt="Meme preview"
                      className="max-w-full max-h-96 rounded-lg"
                    />
                  </div>
                </div>

                {/* Text inputs */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" /> Text
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-foreground-secondary mb-1">Top Text</label>
                      <input
                        type="text"
                        value={topText}
                        onChange={(e) => setTopText(e.target.value)}
                        placeholder="TOP TEXT"
                        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-secondary mb-1">Bottom Text</label>
                      <input
                        type="text"
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value)}
                        placeholder="BOTTOM TEXT"
                        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
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
                      <label className="block text-xs text-foreground-secondary mb-1">Font Size</label>
                      <div className="flex gap-1.5">
                        {fontSizes.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFontSize(f.id)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                              fontSize === f.id
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border hover:border-accent/50"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-secondary mb-1">Position</label>
                      <div className="flex flex-wrap gap-1.5">
                        {positions.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setPosition(p.id)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                              position === p.id
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border hover:border-accent/50"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-secondary mb-1">Colors</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs">
                          Fill
                          <input
                            type="color"
                            value={fillColor}
                            onChange={(e) => setFillColor(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer"
                          />
                        </label>
                        <label className="flex items-center gap-1.5 text-xs">
                          Stroke
                          <input
                            type="color"
                            value={strokeColor}
                            onChange={(e) => setStrokeColor(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleProcess}
                    disabled={processing || (!topText && !bottomText)}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        Create Meme
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
            <h3 className="text-2xl font-bold text-foreground mb-2">Meme Created!</h3>
            <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
              Your meme is ready. Download it and share it anywhere.
            </p>
            <div className="flex justify-center mb-6">
              <img
                src={outputUrl!}
                alt="Generated Meme"
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
                Meme creation happens entirely in your browser. Your image is never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Classic Meme Style</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Uses classic Impact font with customizable position, size, and colors. Font size automatically scales to your image dimensions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
