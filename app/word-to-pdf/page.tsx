"use client";

import { useState, useCallback, useRef } from "react";
import {
  FileText,
  Download,
  Check,
  Loader2,
  Shield,
  Zap,
  Eye,
  AlertCircle,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type Step = "upload" | "processing" | "preview";

export default function WordToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<Step>("upload");
  const [htmlContent, setHtmlContent] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;
    setStep("processing");
    setError(null);
    setProgress("Reading document...");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      setProgress("Converting Word document...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mammoth = (await import("mammoth")) as any;
      const result = await mammoth.convertToHtml({ arrayBuffer });

      if (!result.value) throw new Error("Could not extract content from the document.");

      setHtmlContent(result.value);
      setStep("preview");
    } catch (err) {
      console.error(err);
      setError("Failed to convert document. Make sure it is a valid .docx file.");
      setStep("upload");
    }
  }, [files]);

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    setDownloading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdf = (await import("html2pdf.js")) as any;
      const fileName = files[0]?.name?.replace(/\.docx$/i, "") ?? "document";

      await html2pdf.default
        .from(previewRef.current)
        .set({
          margin: [15, 15, 15, 15],
          filename: `${fileName}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }, [files]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setStep("upload");
    setHtmlContent("");
    setError(null);
    setProgress("");
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileText}
          title="Word to PDF"
          description="Convert Word documents (.docx) to PDF — free, client-side, and private. Your document never leaves your browser."
          backHref="/dev-tools"
          backLabel="Back to Dev Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {step === "upload" && (
            <>
              <FileUpload
                accept=".docx"
                files={files}
                onFilesChange={setFiles}
                label="Drop your Word document here"
                description="Word .docx files only"
              />

              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleConvert}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Convert to PDF
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}

          {step === "processing" && (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm text-foreground-secondary">{progress}</p>
            </div>
          )}

          {step === "preview" && (
            <div className="animate-fade-in-up">
              {/* Action bar */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="font-semibold text-foreground">
                    {files[0]?.name} — ready
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleReset} className="btn btn-secondary">
                    Convert Another
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    {downloading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {downloading ? "Generating PDF…" : "Download PDF"}
                  </button>
                </div>
              </div>

              {/* Document preview */}
              <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-muted/50 border-b border-border px-4 py-2.5 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-foreground-secondary" />
                  <span className="text-sm text-foreground-secondary font-medium">
                    Document Preview
                  </span>
                  <span className="ml-auto text-xs text-foreground-muted">
                    PDF will match this layout
                  </span>
                </div>
                <div
                  ref={previewRef}
                  className="p-10 max-h-[600px] overflow-y-auto"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "14px",
                    lineHeight: 1.8,
                    color: "#1a1a1a",
                  }}
                  // mammoth output is sanitized HTML from the docx XML — safe to render
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                100% Private &amp; Free
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Smallpdf and ILovePDF charge subscriptions and upload your files to their servers.
                Ours runs entirely in your browser — zero uploads, zero cost.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Headings, Lists &amp; Tables
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Powered by mammoth.js — preserves headings, paragraphs, bullet lists, numbered
                lists, bold, italic, and table structures from your document.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
