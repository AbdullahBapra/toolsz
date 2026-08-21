"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  FileDown,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw as ResetIcon,
  Code,
  Eye,
  Settings,
  Copy,
  Info,
  X,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

type InputMode = "html" | "url";
type PageSize = "a4" | "letter" | "legal";
type Orientation = "portrait" | "landscape";

interface OutputFile {
  url: string;
  name: string;
  blob: Blob;
}

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; padding: 40px; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
    h2 { color: #3B82F6; }
    .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
    .section { margin-bottom: 24px; }
    ul { line-height: 1.8; }
    .highlight { background: #EFF6FF; padding: 12px 16px; border-left: 3px solid #3B82F6; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Project Report</h1>
  <div class="meta">Generated on ${new Date().toLocaleDateString()} &middot; Sample Document</div>
  
  <div class="section">
    <h2>Executive Summary</h2>
    <p>This report summarizes the key findings from our Q4 analysis. Revenue increased by 23% year-over-year, driven by strong growth in the enterprise segment.</p>
  </div>
  
  <div class="section">
    <h2>Key Metrics</h2>
    <table>
      <tr><th>Metric</th><th>Q3</th><th>Q4</th><th>Change</th></tr>
      <tr><td>Revenue</td><td>$2.1M</td><td>$2.6M</td><td>+23%</td></tr>
      <tr><td>Users</td><td>45,000</td><td>62,000</td><td>+38%</td></tr>
      <tr><td>Conversion</td><td>3.2%</td><td>4.1%</td><td>+28%</td></tr>
    </table>
  </div>
  
  <div class="highlight">
    <strong>Key Insight:</strong> Enterprise contracts now represent 40% of total revenue, up from 28% in Q3.
  </div>
  
  <div class="section">
    <h2>Recommendations</h2>
    <ul>
      <li>Expand enterprise sales team by 3 FTEs</li>
      <li>Invest in self-serve onboarding to support user growth</li>
      <li>Launch API tier to capture developer segment</li>
    </ul>
  </div>
</body>
</html>`;

export default function HtmlToPdfPage() {
  const [inputMode, setInputMode] = useState<InputMode>("html");
  const [htmlContent, setHtmlContent] = useState(SAMPLE_HTML);
  const [urlInput, setUrlInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputFile, setOutputFile] = useState<OutputFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  // PDF settings
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState(10); // mm
  const [quality, setQuality] = useState(2); // 1=low, 2=normal, 3=high (DPI scale)
  const [filename, setFilename] = useState("document");

  const outputFileRef = useRef<OutputFile | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => { outputFileRef.current = outputFile; }, [outputFile]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (outputFileRef.current?.url) URL.revokeObjectURL(outputFileRef.current.url);
    };
  }, []);

  // Update preview when HTML changes
  useEffect(() => {
    if (showPreview && previewRef.current && inputMode === "html") {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [showPreview, htmlContent, inputMode]);

  const handleProcess = useCallback(async () => {
    setProcessing(true);
    setError(null);

    if (outputFileRef.current?.url) URL.revokeObjectURL(outputFileRef.current.url);
    setOutputFile(null);
    setDone(false);

    try {
      // Dynamic import of html2pdf.js
      const html2pdf = (await import("html2pdf.js")).default;

      let htmlStr = htmlContent;

      // If URL mode, fetch the content
      if (inputMode === "url" && urlInput.trim()) {
        // We can't fetch arbitrary URLs due to CORS, so we create a simple wrapper
        // In practice, users paste the HTML from the URL
        htmlStr = `<!DOCTYPE html>
<html>
<head><base href="${urlInput.trim()}"></head>
<body>
<p style="color:#999;font-family:sans-serif;text-align:center;padding:40px;">
  Due to browser security (CORS), direct URL fetching is limited.<br>
  Please paste the page's HTML source in HTML mode instead.<br><br>
  <strong>Tip:</strong> Right-click the page → View Page Source → Copy All → Paste here.
</p>
</body>
</html>`;
      }

      // Create a temporary container
      const container = document.createElement("div");
      container.innerHTML = htmlStr;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      document.body.appendChild(container);

      const opt = {
        margin: margin,
        filename: `${filename}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: quality,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm" as const,
          format: pageSize as string,
          orientation: orientation as string,
        },
      };

      const blob: Blob = await html2pdf()
        .set(opt)
        .from(container)
        .outputPdf("blob");

      document.body.removeChild(container);

      const url = URL.createObjectURL(blob);
      setOutputFile({ url, name: `${filename}.pdf`, blob });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert HTML to PDF");
    } finally {
      setProcessing(false);
    }
  }, [inputMode, htmlContent, urlInput, pageSize, orientation, margin, quality, filename]);

  const handleReset = useCallback(() => {
    if (outputFileRef.current?.url) URL.revokeObjectURL(outputFileRef.current.url);
    setOutputFile(null);
    setDone(false);
    setError(null);
    setProcessing(false);
    setShowPreview(false);
  }, []);

  const handleCopyHtml = useCallback(async () => {
    await navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [htmlContent]);

  const qualityLabels = { 1: "Low (fast)", 2: "Normal", 3: "High (slow)" };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileDown}
          title="HTML to PDF"
          description="Convert HTML markup to a clean PDF — free, instant, and private. Customize page size, margins, and quality with no watermarks on your output."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            {/* Input mode tabs */}
            <div className="flex gap-2 mb-4">
              {(["html", "url"] as InputMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    inputMode === mode
                      ? "bg-primary-muted border-primary-border text-primary"
                      : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                  }`}
                >
                  {mode === "html" ? (
                    <><Code className="w-3.5 h-3.5 inline mr-1.5" />HTML Code</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5 inline mr-1.5" />From URL</>
                  )}
                </button>
              ))}
            </div>

            {inputMode === "html" ? (
              <div className="space-y-3">
                {/* Toolbar */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground-secondary">
                    Paste or edit your HTML below
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyHtml}
                      className="btn btn-secondary inline-flex items-center gap-1.5 text-xs px-2.5 py-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={`btn btn-secondary inline-flex items-center gap-1.5 text-xs px-2.5 py-1 ${
                        showPreview ? "bg-primary-muted border-primary-border text-primary" : ""
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      {showPreview ? "Hide Preview" : "Preview"}
                    </button>
                  </div>
                </div>

                {/* HTML textarea */}
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full h-64 rounded-lg border border-border bg-surface-1 px-4 py-3 font-mono text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                  placeholder="Paste your HTML here..."
                  spellCheck={false}
                />

                {/* Live preview */}
                {showPreview && (
                  <div className="rounded-lg border border-border overflow-hidden animate-fade-in-up">
                    <div className="bg-surface-1 px-3 py-1.5 border-b border-border">
                      <span className="text-xs font-semibold text-foreground-secondary">Live Preview</span>
                    </div>
                    <iframe
                      ref={previewRef}
                      className="w-full h-64 bg-white"
                      sandbox="allow-same-origin"
                      title="HTML Preview"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100 flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-700">CORS Limitation</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Browsers block fetching most websites directly. For best results, copy the page's
                      HTML source (Right-click → View Page Source) and paste it in HTML mode.
                    </p>
                  </div>
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-border bg-surface-1 px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            {/* Settings */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full p-3 rounded-lg bg-surface-1 border border-border hover:bg-surface-2 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-foreground-secondary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">PDF Settings</p>
                      <p className="text-xs text-foreground-secondary">
                        {pageSize.toUpperCase()} · {orientation} · {margin}mm margins · {qualityLabels[quality as 1|2|3]}
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              {showSettings && (
                <div className="p-4 rounded-lg border border-border bg-surface-1 space-y-4 animate-fade-in-up">
                  {/* Page Size & Orientation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-2">Page Size</label>
                      <div className="flex gap-2">
                        {(["a4", "letter", "legal"] as PageSize[]).map((size) => (
                          <button
                            key={size}
                            onClick={() => setPageSize(size)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                              pageSize === size
                                ? "bg-primary-muted border-primary-border text-primary"
                                : "bg-surface-2 border-border text-foreground-secondary hover:bg-surface-2"
                            }`}
                          >
                            {size.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-2">Orientation</label>
                      <div className="flex gap-2">
                        {(["portrait", "landscape"] as Orientation[]).map((o) => (
                          <button
                            key={o}
                            onClick={() => setOrientation(o)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                              orientation === o
                                ? "bg-primary-muted border-primary-border text-primary"
                                : "bg-surface-2 border-border text-foreground-secondary hover:bg-surface-2"
                            }`}
                          >
                            {o.charAt(0).toUpperCase() + o.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Margins */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Margins: {margin}mm
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-foreground-muted mt-1">
                      <span>0mm</span><span>15mm</span><span>30mm</span>
                    </div>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Render Quality</label>
                    <div className="flex gap-2">
                      {([1, 2, 3] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            quality === q
                              ? "bg-primary-muted border-primary-border text-primary"
                              : "bg-surface-2 border-border text-foreground-secondary hover:bg-surface-2"
                          }`}
                        >
                          {qualityLabels[q]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filename */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Filename</label>
                    <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") || "document")}
                      className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="document"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Conversion failed</p>
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Process Button */}
            <div className="flex flex-col items-center mt-6">
              <button
                onClick={handleProcess}
                disabled={processing || (!htmlContent.trim() && !urlInput.trim())}
                className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating PDF…
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5" />
                    Generate PDF
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {/* Success */}
            <div className="glass-panel rounded-[16px] p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">PDF Generated</h3>
              <p className="text-sm text-foreground-secondary mb-1">
                {outputFile?.name} — {((outputFile?.blob.size ?? 0) / 1024).toFixed(1)} KB
              </p>
              <p className="text-xs text-foreground-muted mb-4">
                {pageSize.toUpperCase()} {orientation} · {margin}mm margins · No watermark
              </p>
              <a
                href={outputFile?.url}
                download={outputFile?.name}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download PDF
              </a>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2">
                <ResetIcon className="w-4 h-4" /> Convert Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">No Watermark — 100% Free</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your PDF is generated clean, with no watermarks or branding. All processing happens in your browser — your HTML content never leaves your device.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Custom Page Settings</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Choose page size (A4, Letter, Legal), orientation, margins, and render quality. Live preview lets you see your document before converting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
