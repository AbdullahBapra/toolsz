"use client";

import { useState, useRef, useCallback } from "react";
import {
  Code,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCw,
  Eye,
  Monitor,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

const DEFAULT_HTML = `<div style="
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', system-ui, sans-serif;
">
  <div style="
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 48px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    text-align: center;
    max-width: 480px;
  ">
    <h1 style="
      font-size: 32px;
      font-weight: 800;
      color: #1a1a2e;
      margin: 0 0 12px;
    ">Hello, World!</h1>
    <p style="
      font-size: 16px;
      color: #555;
      line-height: 1.6;
      margin: 0;
    ">This HTML will be rendered as a high-quality image. Edit the code on the left and see the preview update live.</p>
  </div>
</div>`;

type OutputFormat = "png" | "jpeg";

export default function HtmlToImagePage() {
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [viewportWidth, setViewportWidth] = useState(800);
  const [viewportHeight, setViewportHeight] = useState(600);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [jpegQuality, setJpegQuality] = useState(92);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRender = useCallback(async () => {
    setProcessing(true);
    setError("");

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default;

      // Create an offscreen iframe to render the HTML
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      iframe.style.width = `${viewportWidth}px`;
      iframe.style.height = `${viewportHeight}px`;
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      // Write HTML into iframe
      await new Promise<void>((resolve, reject) => {
        iframe.onload = () => resolve();
        iframe.onerror = () => reject(new Error("Failed to load iframe"));
        const doc = iframe.contentDocument!;
        doc.open();
        doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { width: ${viewportWidth}px; min-height: ${viewportHeight}px; overflow: hidden; }</style></head><body>${htmlCode}</body></html>`);
        doc.close();
      });

      // Wait for fonts and images to load
      await new Promise((r) => setTimeout(r, 300));

      // Render with html2canvas
      const canvas = await html2canvas(iframe.contentDocument!.body, {
        width: viewportWidth,
        height: viewportHeight,
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });

      // Clean up iframe
      document.body.removeChild(iframe);

      // Generate output
      const mimeType = outputFormat === "jpeg" ? "image/jpeg" : "image/png";
      const quality = outputFormat === "jpeg" ? jpegQuality / 100 : undefined;

      const outputBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mimeType, quality)
      );

      if (outputBlob) {
        const url = URL.createObjectURL(outputBlob);
        setDownloadUrl(url);

        // Preview
        const previewCanvas = document.createElement("canvas");
        const maxPreviewDim = 600;
        const pScale = Math.min(1, maxPreviewDim / Math.max(viewportWidth, viewportHeight));
        previewCanvas.width = Math.round(viewportWidth * pScale);
        previewCanvas.height = Math.round(viewportHeight * pScale);
        const pCtx = previewCanvas.getContext("2d")!;
        pCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
        const previewBlob = await new Promise<Blob | null>((resolve) =>
          previewCanvas.toBlob(resolve, "image/jpeg", 0.85)
        );
        if (previewBlob) {
          setPreviewUrl(URL.createObjectURL(previewBlob));
        }
        setDone(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to render HTML. Check your code for errors and try again.");
    } finally {
      setProcessing(false);
    }
  }, [htmlCode, viewportWidth, viewportHeight, outputFormat, jpegQuality]);

  const handleReset = useCallback(() => {
    setDone(false);
    setProcessing(false);
    setError("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setDownloadUrl(null);
    setPreviewUrl(null);
  }, [downloadUrl, previewUrl]);

  // Update iframe preview live
  const updateIframePreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { width: 100%; min-height: 100%; overflow: hidden; }</style></head><body>${htmlCode}</body></html>`);
    doc.close();
  }, [htmlCode]);

  // Debounced iframe update
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleChange = useCallback((value: string) => {
    setHtmlCode(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { width: 100%; min-height: 100%; overflow: hidden; }</style></head><body>${value}</body></html>`);
      doc.close();
    }, 300);
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Code}
          title="HTML to Image"
          description="Convert HTML and CSS code to high-quality images — live preview, custom viewport, PNG/JPG export. Free, instant, and private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <div className="space-y-6">
              {/* Editor + Preview side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Code Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary" /> HTML / CSS Code
                    </label>
                    <span className="text-[11px] text-foreground-muted font-mono">{htmlCode.length} chars</span>
                  </div>
                  <textarea
                    value={htmlCode}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full h-[400px] lg:h-[500px] px-4 py-3 rounded-xl border border-border bg-[#1e1e2e] text-[#cdd6f4] font-mono text-[13px] leading-relaxed resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Enter HTML and CSS code here..."
                    spellCheck={false}
                  />
                </div>

                {/* Live Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" /> Live Preview
                    </label>
                  </div>
                  <div className="border border-border rounded-xl overflow-hidden bg-white h-[400px] lg:h-[500px]">
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin"
                      title="HTML Preview"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Viewport Width */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5 text-primary" /> Width
                    </label>
                    <span className="text-xs text-primary font-semibold">{viewportWidth}px</span>
                  </div>
                  <input type="range" min="320" max="1920" step="10" value={viewportWidth} onChange={(e) => setViewportWidth(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary" />
                </div>

                {/* Viewport Height */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-foreground">Height</label>
                    <span className="text-xs text-primary font-semibold">{viewportHeight}px</span>
                  </div>
                  <input type="range" min="240" max="1080" step="10" value={viewportHeight} onChange={(e) => setViewportHeight(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary" />
                </div>

                {/* Output Format */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">Output Format</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOutputFormat("png")}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${outputFormat === "png" ? "bg-primary text-white" : "bg-surface-1 text-foreground-secondary hover:bg-surface-2"}`}
                    >
                      PNG
                    </button>
                    <button
                      onClick={() => setOutputFormat("jpeg")}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${outputFormat === "jpeg" ? "bg-primary text-white" : "bg-surface-1 text-foreground-secondary hover:bg-surface-2"}`}
                    >
                      JPEG
                    </button>
                    {outputFormat === "jpeg" && (
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-foreground-muted">Q:</span>
                        <input type="range" min="50" max="100" value={jpegQuality} onChange={(e) => setJpegQuality(parseInt(e.target.value))} className="w-16 h-1.5 accent-primary" />
                        <span className="text-xs text-foreground-muted font-mono">{jpegQuality}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in-up">
                  <span className="text-danger text-xs">{error}</span>
                </div>
              )}

              {/* Processing */}
              {processing && (
                <div className="p-5 bg-primary-muted border border-primary-border rounded-xl animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-xs font-semibold text-foreground">Rendering HTML to image...</span>
                  </div>
                </div>
              )}

              {/* Action */}
              {!processing && (
                <div className="flex flex-col items-center animate-fade-in-up">
                  <button onClick={handleRender} className="btn btn-primary inline-flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Render to Image
                  </button>
                  <p className="text-xs text-foreground-muted mt-2">
                    2× resolution output for crisp results
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Success State */
            <div className="py-4 animate-fade-in-up">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Image Rendered!
                </h3>
                <p className="text-foreground-secondary">
                  Your HTML has been converted to a {outputFormat.toUpperCase()} image ({viewportWidth}×{viewportHeight}).
                </p>
              </div>

              {previewUrl && (
                <div className="mb-6 flex justify-center">
                  <div className="relative inline-block rounded-xl overflow-hidden border border-border shadow-lg max-w-full">
                    <img src={previewUrl} alt="Rendered HTML" className="max-h-[400px] w-auto object-contain" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Preview
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {downloadUrl && (
                  <a href={downloadUrl} download={`html-render.${outputFormat}`} className="btn btn-primary inline-flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> Download {outputFormat.toUpperCase()}
                  </a>
                )}
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center justify-center gap-2">
                  <RotateCw className="w-5 h-5" /> Render Again
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Client-Side Rendering</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your HTML code is rendered entirely in your browser. No code is sent to any server — perfect for proprietary designs and sensitive content.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Live Preview & 2× Export</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                See your HTML render live as you type. Export at 2× resolution for crisp, retina-ready images in PNG or JPEG format.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
