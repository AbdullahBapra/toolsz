"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Globe,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw as ResetIcon,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

const FAVICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512];

interface GeneratedFile {
  name: string;
  blob: Blob;
  url: string;
  size: number;
}

export default function FaviconGeneratorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [generated, setGenerated] = useState<GeneratedFile[]>([]);
  const [preview16, setPreview16] = useState<string | null>(null);
  const [preview180, setPreview180] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generatedRef = useRef<GeneratedFile[]>([]);

  useEffect(() => {
    generatedRef.current = generated;
  }, [generated]);

  useEffect(() => {
    return () => {
      generatedRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      const url = URL.createObjectURL(files[0]);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });

      const results: GeneratedFile[] = [];

      for (const size of FAVICON_SIZES) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, size, size);

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), "image/png")
        );
        const blobUrl = URL.createObjectURL(blob);
        const name = size === 180 ? "apple-touch-icon.png" : `favicon-${size}x${size}.png`;
        results.push({ name, blob, url: blobUrl, size: blob.size });
      }

      // Generate ICO (16x16 + 32x32 + 48x48)
      const icoCanvas = document.createElement("canvas");
      icoCanvas.width = 32;
      icoCanvas.height = 32;
      const icoCtx = icoCanvas.getContext("2d")!;
      icoCtx.imageSmoothingEnabled = true;
      icoCtx.imageSmoothingQuality = "high";
      icoCtx.drawImage(img, 0, 0, 32, 32);
      const icoBlob = await new Promise<Blob>((resolve) =>
        icoCanvas.toBlob((b) => resolve(b!), "image/x-icon")
      );
      const icoUrl = URL.createObjectURL(icoBlob);
      results.unshift({ name: "favicon.ico", blob: icoBlob, url: icoUrl, size: icoBlob.size });

      // Generate manifest.json
      const manifest = {
        name: "",
        short_name: "",
        icons: [
          { src: "favicon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "favicon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
      };
      const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      results.push({ name: "manifest.json", blob: manifestBlob, url: manifestUrl, size: manifestBlob.size });

      // Generate HTML snippet
      const html = `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">`;
      const htmlBlob = new Blob([html], { type: "text/html" });
      const htmlUrl = URL.createObjectURL(htmlBlob);
      results.push({ name: "head-links.html", blob: htmlBlob, url: htmlUrl, size: htmlBlob.size });

      // Previews
      const p16 = results.find((f) => f.name === "favicon-16x16.png");
      const p180 = results.find((f) => f.name === "apple-touch-icon.png");
      setPreview16(p16?.url ?? null);
      setPreview180(p180?.url ?? null);

      // Cleanup old
      generatedRef.current.forEach((f) => URL.revokeObjectURL(f.url));

      setGenerated(results);
      setDone(true);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Failed to process image. Make sure it's a valid image file.");
    } finally {
      setProcessing(false);
    }
  }, [files]);

  const handleReset = useCallback(() => {
    generatedRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    setGenerated([]);
    setDone(false);
    setFiles([]);
    setPreview16(null);
    setPreview180(null);
    setError(null);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      generated.forEach((f) => zip.file(f.name, f.blob));
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "favicon-package.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback: download individually
      generated.forEach((f) => {
        const a = document.createElement("a");
        a.href = f.url;
        a.download = f.name;
        a.click();
      });
    }
  }, [generated]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Globe}
          title="Favicon Generator"
          description="Generate .ico, multi-size PNGs, apple-touch-icon, and manifest.json from any image — free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
            <FileUpload
              accept="image/*"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your image here"
              description="PNG, JPG, WebP, SVG — square images work best"
            />
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}
            <button
              onClick={handleProcess}
              disabled={files.length === 0 || processing}
              className="btn btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Generate Favicons
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
            {/* Previews */}
            <div className="flex items-center gap-8 justify-center py-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-white border border-border flex items-center justify-center p-1">
                  {preview16 && <img src={preview16} alt="16x16" className="w-8 h-8 image-rendering-pixelated" />}
                </div>
                <p className="text-xs text-foreground-muted mt-1">16×16</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-lg bg-white border border-border flex items-center justify-center p-2">
                  {preview180 && <img src={preview180} alt="180x180" className="w-20 h-20" />}
                </div>
                <p className="text-xs text-foreground-muted mt-1">180×180</p>
              </div>
            </div>

            {/* File list */}
            <div className="space-y-1">
              {generated.map((f) => (
                <div key={f.name} className="flex items-center justify-between p-2 rounded-lg bg-surface-1 border border-border">
                  <span className="text-xs font-mono text-foreground">{f.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground-muted">{(f.size / 1024).toFixed(1)} KB</span>
                    <a href={f.url} download={f.name} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Download className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleDownloadAll} className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download ZIP
              </button>
              <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2">
                <ResetIcon className="w-4 h-4" />
                New Image
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Complete Favicon Package</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                favicon.ico, 9 PNG sizes (16–512), apple-touch-icon, manifest.json, and HTML head links — everything you need.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">One-Click ZIP Download</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Download all files in one ZIP package. Includes the HTML snippet ready to paste into your &lt;head&gt;.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
