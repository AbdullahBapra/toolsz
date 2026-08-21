"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Film,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Upload,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

export default function VideoToGifPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  const [width, setWidth] = useState(480);
  const [fps, setFps] = useState(10);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");

  const QUALITY_MAP = { low: 60, medium: 80, high: 100 };

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setProgress("Loading FFmpeg...");

    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(`Converting... ${Math.round(p * 100)}%`);
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setProgress("Reading video file...");
      const inputData = await fetchFile(files[0]);
      await ffmpeg.writeFile("input.mp4", inputData);

      setProgress("Converting to GIF...");
      const q = QUALITY_MAP[quality];
      await ffmpeg.exec([
        "-ss", String(startTime),
        "-t", String(duration),
        "-i", "input.mp4",
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=maxcolors=${q}[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3`,
        "-loop", "0",
        "output.gif",
      ]);

      const data = await ffmpeg.readFile("output.gif");
      const blob = new Blob([data as BlobPart], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setDone(true);
    } catch (err) {
      console.error("Conversion failed:", err);
      setError("Failed to convert video. Make sure your browser supports SharedArrayBuffer (requires Chrome/Edge with COOP/COEP headers).");
    } finally {
      setProcessing(false);
    }
  }, [files, width, fps, startTime, duration, quality]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${files[0]?.name?.replace(/\.[^.]+$/, "") ?? "video"}.gif`;
    a.click();
  }, [resultUrl, files]);

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
    setProgress("");
  }, [resultUrl]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Film}
          title="Video to GIF"
          description="Convert video clips to GIFs — trim, resize, adjust FPS. Client-side with FFmpeg, no upload needed. Free, instant, and completely private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload
                accept="video/*"
                files={files}
                onFilesChange={setFiles}
                label="Drop your video here"
                description="MP4, WebM, MOV — processed entirely in your browser"
              />

              {files.length > 0 && !processing && (
                <div className="mt-8 space-y-5 animate-fade-in-up">
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-1 border border-border">
                    <Film className="w-10 h-10 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{files[0].name}</p>
                      <p className="text-xs text-foreground-muted">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Width: {width}px</label>
                      <input type="range" min={200} max={800} step={20} value={width} onChange={(e) => setWidth(parseInt(e.target.value))} className="w-full" />
                      <div className="flex justify-between text-xs text-foreground-muted mt-0.5"><span>200</span><span>800</span></div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">FPS: {fps}</label>
                      <input type="range" min={5} max={30} step={1} value={fps} onChange={(e) => setFps(parseInt(e.target.value))} className="w-full" />
                      <div className="flex justify-between text-xs text-foreground-muted mt-0.5"><span>5</span><span>30</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Start Time: {startTime}s</label>
                      <input type="number" min={0} max={300} step={0.5} value={startTime} onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Duration: {duration}s</label>
                      <input type="number" min={0.5} max={30} step={0.5} value={duration} onChange={(e) => setDuration(parseFloat(e.target.value) || 5)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Quality</label>
                    <div className="flex gap-2">
                      {(["low", "medium", "high"] as const).map((q) => (
                        <button key={q} onClick={() => setQuality(q)} className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all capitalize ${
                          quality === q ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                        }`}>{q} ({QUALITY_MAP[q]} colors)</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button onClick={handleProcess} className="btn btn-primary inline-flex items-center gap-2">
                      <Film className="w-5 h-5" /> Convert to GIF
                    </button>
                  </div>
                </div>
              )}

              {processing && (
                <div className="mt-8 text-center py-12 animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full bg-primary-muted border border-primary-border flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Converting video...</h3>
                  <p className="text-xs text-foreground-secondary">{progress}</p>
                  <p className="text-xs text-foreground-muted mt-2">This may take 30-60 seconds for longer clips.</p>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center">{error}</div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">GIF Created!</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                {width}×auto, {fps} FPS, {duration}s clip
              </p>
              {resultUrl && (
                <div className="mb-6 flex justify-center">
                  <img src={resultUrl} alt="Generated GIF" className="max-w-full max-h-[400px] rounded-lg border border-border" />
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={handleDownload} className="btn btn-primary inline-flex items-center gap-2">
                  <Download className="w-5 h-5" /> Download GIF
                </button>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2">
                  <Upload className="w-5 h-5" /> Convert Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Client-Side</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Video never leaves your browser. FFmpeg runs in WebAssembly — no upload, no server processing, no file size limit.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Fine-Tuned Controls</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Trim start time, duration, width, FPS, and palette quality. Generate optimized GIFs with dithering for best visual quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
