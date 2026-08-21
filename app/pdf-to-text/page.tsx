"use client";

import { useState } from "react";
import {
  FileText,
  Check,
  Loader2,
  Shield,
  Zap,
  Copy,
  Download,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";
import { extractPdfLines } from "@/app/utils/extract-pdf-lines";

export default function PdfToTextPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleExtract = async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPageCount(pdf.numPages);

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const lines = extractPdfLines(textContent.items);
        const pageText = lines.map((l) => l.text).join("\n");
        fullText += `--- Page ${i} ---\n${pageText.trim()}\n\n`;
      }

      setExtractedText(fullText.trim());
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to extract text from PDF. Make sure it's a valid PDF file.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = extractedText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${files[0]?.name.replace(/\.[^/.]+$/, "")}-text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setExtractedText("");
    setPageCount(0);
    setCopied(false);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileText}
          title="PDF to Text"
          description="Extract raw text from any PDF for copying or saving — free, instant, and fully private. Works with scanned and native PDFs right in your browser."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              {/* Upload Area */}
              <FileUpload
                accept=".pdf"
                files={files}
                onFilesChange={setFiles}

                label="Drop your PDF here"
                description="or click to browse — PDF files only"
              />

              {/* Action Button */}
              {files.length > 0 && (
                <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                  <button
                    onClick={handleExtract}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Extracting Text...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Extract Text
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="py-4 animate-fade-in-up">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Text Extracted Successfully!
                </h3>
                <p className="text-foreground-secondary">
                  We&apos;ve extracted text from {pageCount} page
                  {pageCount !== 1 ? "s" : ""}. Copy it or save as a text file.
                </p>
              </div>

              {/* Result Area */}
              <div className="mb-6">
                <textarea
                  className="w-full h-64 p-4 rounded-xl border border-border bg-background text-foreground text-xs resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted text will appear here..."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleCopy}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  {copied ? "Copied!" : "Copy Text"}
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Save as .txt
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Extract Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Total Privacy
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your PDF is processed entirely in your browser. No data is
                uploaded to any server — your documents stay private.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Instant Extraction
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Extract text from every page in seconds. The output preserves
                page boundaries so you can easily navigate the content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
