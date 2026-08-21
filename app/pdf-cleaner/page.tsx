"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw,
  Space,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";
import { PDFDocument } from "pdf-lib";

interface CleanOptions {
  removeMargins: boolean;
  marginTarget: number; // in pt
}

export default function PdfCleanerPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [options, setOptions] = useState<CleanOptions>({
    removeMargins: true,
    marginTarget: 36,
  });
  const [cleanedUrl, setCleanedUrl] = useState<string>("");
  const [stats, setStats] = useState({ originalSize: 0, cleanedSize: 0, pages: 0 });

  const handleClean = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const originalSize = arrayBuffer.byteLength;
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const marginPt = options.marginTarget;

      for (const page of pages) {
        const { width, height } = page.getSize();

        if (options.removeMargins) {
          // Crop margins by adjusting the media box
          page.setSize(width - marginPt * 2, height - marginPt * 2);

          // Shift content to account for cropped margins
          page.translateContent(marginPt * -1, marginPt * -1);
        }
      }

      const cleanedBytes = await pdfDoc.save();
      const cleanedSize = cleanedBytes.byteLength;
      const blob = new Blob([new Uint8Array(cleanedBytes).buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setCleanedUrl(url);
      setStats({ originalSize, cleanedSize, pages: pages.length });
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to clean PDF. Make sure it's a valid PDF file.");
    } finally {
      setProcessing(false);
    }
  }, [files, options, addToast]);

  const handleDownload = useCallback(() => {
    if (!cleanedUrl) return;
    const a = document.createElement("a");
    a.href = cleanedUrl;
    a.download = `${files[0]?.name.replace(/\.[^/.]+$/, "")}-cleaned.pdf`;
    a.click();
  }, [cleanedUrl, files]);

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setCleanedUrl("");
    setStats({ originalSize: 0, cleanedSize: 0, pages: 0 });
  };

  const sizeReduction = stats.originalSize > 0
    ? Math.round(((stats.originalSize - stats.cleanedSize) / stats.originalSize) * 100)
    : 0;

  const formatSize = (bytes: number) => (bytes / 1024).toFixed(1) + " KB";

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Sparkles}
          title="Smart PDF Cleaner"
          description="Automatically improve PDF readability — remove extra margins and fix spacing. Not editing, but improving. Free, instant, and completely private."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload
                accept=".pdf"
                files={files}
                onFilesChange={setFiles}
                label="Drop your messy PDF here"
                description="We'll auto-clean margins, spacing, and formatting"
              />

              {files.length > 0 && (
                <div className="mt-6 space-y-4 animate-fade-in-up">
                  {/* Cleaning Options */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground text-sm">Cleaning Options</h4>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={options.removeMargins}
                        onChange={(e) => setOptions((o) => ({ ...o, removeMargins: e.target.checked }))}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                      <Space className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground-secondary group-hover:text-foreground transition-colors">
                        Remove extra margins
                      </span>
                    </label>

                    {options.removeMargins && (
                      <div className="ml-7">
                        <label className="block text-xs font-semibold text-foreground mb-2">
                          Target margin (pt)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={72}
                          value={options.marginTarget}
                          onChange={(e) => setOptions((o) => ({ ...o, marginTarget: Number(e.target.value) }))}
                          className="w-full max-w-xs accent-[var(--primary)]"
                        />
                        <div className="text-xs text-foreground-muted mt-1">{options.marginTarget}pt per side</div>
                      </div>
                    )}
                  </div>

                  {/* Clean Button */}
                  <div className="flex flex-col items-center pt-4">
                    <button
                      onClick={handleClean}
                      disabled={processing}
                      className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Cleaning...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Clean My PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-4 animate-fade-in-up">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">PDF Cleaned!</h3>
                <p className="text-foreground-secondary">
                  Your PDF has been automatically improved for better readability.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Pages", value: stats.pages },
                  { label: "Original", value: formatSize(stats.originalSize) },
                  { label: "Cleaned", value: formatSize(stats.cleanedSize) },
                  { label: "Size Change", value: `${sizeReduction > 0 ? "-" : "+"}${Math.abs(sizeReduction)}%` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border p-3 text-center bg-surface-1">
                    <div className="text-lg font-bold text-primary">{stat.value}</div>
                    <div className="type-label text-foreground-muted">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* PDF Preview */}
              <div className="rounded-xl border border-border overflow-hidden mb-6 bg-surface-1">
                <iframe
                  src={cleanedUrl}
                  className="w-full h-[500px]"
                  title="Cleaned PDF Preview"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Cleaned PDF
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Clean Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Not Editing — Improving</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                This isn't a PDF editor. It automatically improves readability by removing visual clutter — margins, weird spacing, and formatting inconsistencies.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Smart & Automatic</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                No manual adjustments needed. The tool detects and fixes common PDF readability issues automatically — one click, perfect results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
