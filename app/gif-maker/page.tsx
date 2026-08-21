"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Film,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw,
  Info,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface ImageItem {
  id: string;
  file: File;
  url: string;
  delay: number;
}

export default function GifMakerPage() {
  const { addToast } = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [frameDelay, setFrameDelay] = useState(200);
  const [loop, setLoop] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const handleFileChange = useCallback((newFiles: File[]) => {
    const newImages: ImageItem[] = newFiles.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      url: URL.createObjectURL(file),
      delay: frameDelay,
    }));
    setImages((prev) => [...prev, ...newImages]);
    setDone(false);
    if (outputRef.current) { URL.revokeObjectURL(outputRef.current); setOutputUrl(null); }
  }, [frameDelay]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
    setDone(false);
  }, []);

  const moveImage = useCallback((id: string, direction: "up" | "down") => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  }, []);

  const handleProcess = useCallback(async () => {
    if (images.length < 2) {
      addToast("error", "Add at least 2 images to create a GIF");
      return;
    }
    setProcessing(true);
    setProgress(0);

    try {
      const GIFEncoder = (await import("gif-encoder-2")).default;

      // Load all images onto canvases to get dimensions
      const loadedImages: HTMLImageElement[] = [];
      let maxWidth = 0;
      let maxHeight = 0;

      for (let i = 0; i < images.length; i++) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image ${i + 1}`));
          img.src = images[i].url;
        });
        loadedImages.push(img);
        maxWidth = Math.max(maxWidth, img.naturalWidth);
        maxHeight = Math.max(maxHeight, img.naturalHeight);
      }

      // Cap dimensions for performance
      const maxDim = 1200;
      if (maxWidth > maxDim || maxHeight > maxDim) {
        const scale = maxDim / Math.max(maxWidth, maxHeight);
        maxWidth = Math.round(maxWidth * scale);
        maxHeight = Math.round(maxHeight * scale);
      }

      const encoder = new GIFEncoder(maxWidth, maxHeight, "neuquant", loop);
      // @ts-ignore - createReadStream exists at runtime but missing from types
      const stream = encoder.createReadStream();

      const chunks: Uint8Array[] = [];
      stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));

      const donePromise = new Promise<Blob>((resolve) => {
        stream.on("finish", () => {
          const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
          const result = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
          }
          resolve(new Blob([result], { type: "image/gif" }));
        });
      });

      encoder.start();

      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      const ctx = canvas.getContext("2d")!;

      for (let i = 0; i < loadedImages.length; i++) {
        ctx.clearRect(0, 0, maxWidth, maxHeight);
        const img = loadedImages[i];

        // Center and scale image
        const scale = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const x = Math.round((maxWidth - w) / 2);
        const y = Math.round((maxHeight - h) / 2);

        ctx.drawImage(img, x, y, w, h);
        encoder.setDelay(images[i].delay || frameDelay);
        encoder.addFrame(ctx);
        setProgress(Math.round(((i + 1) / loadedImages.length) * 90));
      }

      encoder.finish();
      const blob = await donePromise;

      const url = URL.createObjectURL(blob);
      if (outputRef.current) URL.revokeObjectURL(outputRef.current);
      outputRef.current = url;
      setOutputUrl(url);
      setDone(true);
      setProgress(100);
      addToast("success", "GIF created successfully!");
    } catch (err) {
      console.error("GIF creation failed:", err);
      addToast("error", "Failed to create GIF. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [images, frameDelay, loop, addToast]);

  const handleDownload = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = "animation.gif";
    a.click();
  }, [outputUrl]);

  const handleReset = useCallback(() => {
    imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    setImages([]);
    setOutputUrl(null);
    setDone(false);
    setProgress(0);
    outputRef.current = null;
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Film}
          title="GIF Maker"
          description="Create animated GIFs from multiple images — set frame delay, reorder frames, and loop. Free, client-side, no signup, and completely private."
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
                label="Drop images here or click to add frames"
                description="or click to browse — PNG, JPG, WebP supported"
              />

              {images.length > 0 && (
                <div className="mt-8 animate-fade-in-up space-y-6">
                  {/* Settings */}
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      Settings
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Frame Delay (ms)</label>
                        <input
                          type="range"
                          min={50}
                          max={2000}
                          step={50}
                          value={frameDelay}
                          onChange={(e) => setFrameDelay(Number(e.target.value))}
                          className="w-full accent-accent"
                        />
                        <p className="text-xs text-foreground-muted mt-1">{frameDelay}ms per frame</p>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs text-foreground-secondary mt-6">
                          <input
                            type="checkbox"
                            checked={loop}
                            onChange={(e) => setLoop(e.target.checked)}
                            className="accent-accent"
                          />
                          Loop animation
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Frame list */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                        <Film className="w-5 h-5 text-primary" />
                        Frames ({images.length})
                      </h3>
                      <FileUpload
                        accept="image/*"
                        multiple
                        onFiles={handleFileChange}
                        label="Add more"
                        compact
                      />
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {images.map((img, idx) => (
                        <div
                          key={img.id}
                          className="flex items-center gap-3 bg-surface-2 rounded-lg p-2 border border-border"
                        >
                          <GripVertical className="w-4 h-4 text-foreground-muted flex-shrink-0" />
                          <img
                            src={img.url}
                            alt={`Frame ${idx + 1}`}
                            className="w-12 h-12 object-contain rounded"
                          />
                          <span className="text-xs text-foreground-secondary flex-1">
                            Frame {idx + 1} — {img.file.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveImage(img.id, "up")}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-surface-1 disabled:opacity-30"
                            >
                              <Plus className="w-3.5 h-3.5 rotate-[-45deg]" />
                            </button>
                            <button
                              onClick={() => moveImage(img.id, "down")}
                              disabled={idx === images.length - 1}
                              className="p-1 rounded hover:bg-surface-1 disabled:opacity-30"
                            >
                              <Plus className="w-3.5 h-3.5 rotate-45" />
                            </button>
                            <button
                              onClick={() => removeImage(img.id)}
                              className="p-1 rounded hover:bg-red-500/20 text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {images.length >= 2 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating GIF... {progress}%
                      </>
                    ) : (
                      <>
                        <Film className="w-5 h-5" />
                        Create GIF
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">GIF Created Successfully!</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your animated GIF is ready. Download it and share anywhere.
              </p>
              <div className="flex justify-center mb-6">
                <img
                  src={outputUrl!}
                  alt="Generated GIF"
                  className="max-w-md max-h-80 rounded-lg border border-border"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className="btn btn-primary inline-flex items-center gap-2 text-center"
                >
                  <Download className="w-5 h-5" />
                  Download GIF
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  Create Another GIF
                </button>
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                GIF creation happens entirely in your browser. Your images are never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Custom Animation</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Control frame delay, reorder frames, and toggle looping for perfect animated GIFs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
