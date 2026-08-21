"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Scissors,
  Check,
  Loader2,
  Shield,
  Zap,
  Info,
  Download,
  FileText,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type SplitMode = "ranges" | "every" | "extract";

interface SplitOutput {
  name: string;
  blob: Blob;
  url: string;
  pageCount: number;
}

const splitModeOptions: {
  id: SplitMode;
  label: string;
  description: string;
}[] = [
  {
    id: "ranges",
    label: "By Page Ranges",
    description: "Split using custom ranges like 1-3, 5-7, 10",
  },
  {
    id: "every",
    label: "Every N Pages",
    description: "Split into equal chunks of N pages each",
  },
  {
    id: "extract",
    label: "Extract Pages",
    description: "Pick specific pages to extract into one PDF",
  },
];

export default function SplitPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("ranges");
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  // Input states
  const [rangeInput, setRangeInput] = useState("1-3, 4-6, 7-end");
  const [everyN, setEveryN] = useState(1);
  const [extractPages, setExtractPages] = useState("1, 3, 5");

  // Output
  const [outputs, setOutputs] = useState<SplitOutput[]>([]);
  const outputsRef = useRef<SplitOutput[]>([]);

  // Keep ref in sync for cleanup
  useEffect(() => {
    outputsRef.current = outputs;
  }, [outputs]);

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      outputsRef.current.forEach((o) => URL.revokeObjectURL(o.url));
    };
  }, []);

  // Parse range string like "1-3, 5-7, 10-end" into array of {start, end}
  const parseRanges = useCallback(
    (input: string, maxPage: number): { start: number; end: number }[] => {
      const ranges: { start: number; end: number }[] = [];
      const parts = input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      for (const part of parts) {
        if (part.includes("-")) {
          const [startStr, endStr] = part.split("-").map((s) => s.trim());
          const start = parseInt(startStr, 10);
          if (isNaN(start) || start < 1) continue;
          const end =
            endStr.toLowerCase() === "end"
              ? maxPage
              : parseInt(endStr, 10);
          if (isNaN(end) || end < start) continue;
          ranges.push({
            start: Math.max(1, start),
            end: Math.min(maxPage, end),
          });
        } else {
          const page = parseInt(part, 10);
          if (!isNaN(page) && page >= 1 && page <= maxPage) {
            ranges.push({ start: page, end: page });
          }
        }
      }
      return ranges;
    },
    []
  );

  // Parse comma-separated page numbers
  const parsePageList = useCallback(
    (input: string, maxPage: number): number[] => {
      return input
        .split(",")
        .map((s) => s.trim())
        .map((s) => parseInt(s, 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= maxPage);
    },
    []
  );

  // Load PDF to get page count
  const handleFileChange = useCallback(
    async (newFiles: File[]) => {
      setFiles(newFiles);
      if (newFiles.length === 0) {
        setPageCount(0);
        return;
      }
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const count = pdf.getPageCount();
        setPageCount(count);
        setEveryN(Math.max(1, Math.floor(count / 2)));
        setRangeInput(
          count <= 3
            ? `1-${count}`
            : `1-${Math.ceil(count / 2)}, ${Math.ceil(count / 2) + 1}-${count}`
        );
        setExtractPages(`1, ${count}`);
      } catch {
        setPageCount(0);
      }
    },
    []
  );

  const handleSplit = useCallback(async () => {
    if (files.length === 0 || pageCount === 0) return;
    setProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const results: SplitOutput[] = [];
      const baseName = files[0].name.replace(/\.pdf$/i, "");

      if (splitMode === "ranges") {
        const ranges = parseRanges(rangeInput, pageCount);
        if (ranges.length === 0) {
          addToast("warning", "Invalid page ranges. Use format: 1-3, 5-7, 10-end");
          setProcessing(false);
          return;
        }
        for (const range of ranges) {
          const newPdf = await PDFDocument.create();
          const indices = [];
          for (let i = range.start - 1; i < range.end; i++) {
            indices.push(i);
          }
          const copiedPages = await newPdf.copyPages(sourcePdf, indices);
          copiedPages.forEach((p) => newPdf.addPage(p));
          const bytes = await newPdf.save();
          const blob = new Blob([bytes], { type: "application/pdf" });
          results.push({
            name: `${baseName}_pages_${range.start}-${range.end}.pdf`,
            blob,
            url: URL.createObjectURL(blob),
            pageCount: indices.length,
          });
        }
      } else if (splitMode === "every") {
        const n = Math.max(1, everyN);
        let chunkIdx = 0;
        for (let start = 0; start < pageCount; start += n) {
          const end = Math.min(start + n, pageCount);
          const newPdf = await PDFDocument.create();
          const indices = [];
          for (let i = start; i < end; i++) indices.push(i);
          const copiedPages = await newPdf.copyPages(sourcePdf, indices);
          copiedPages.forEach((p) => newPdf.addPage(p));
          const bytes = await newPdf.save();
          const blob = new Blob([bytes], { type: "application/pdf" });
          chunkIdx++;
          results.push({
            name: `${baseName}_part${chunkIdx}.pdf`,
            blob,
            url: URL.createObjectURL(blob),
            pageCount: indices.length,
          });
        }
      } else if (splitMode === "extract") {
        const pageNums = parsePageList(extractPages, pageCount);
        if (pageNums.length === 0) {
          addToast("warning", "No valid page numbers. Use format: 1, 3, 5, 7");
          setProcessing(false);
          return;
        }
        const newPdf = await PDFDocument.create();
        const indices = pageNums.map((p) => p - 1);
        const copiedPages = await newPdf.copyPages(sourcePdf, indices);
        copiedPages.forEach((p) => newPdf.addPage(p));
        const bytes = await newPdf.save();
        const blob = new Blob([bytes], { type: "application/pdf" });
        results.push({
          name: `${baseName}_extracted.pdf`,
          blob,
          url: URL.createObjectURL(blob),
          pageCount: indices.length,
        });
      }

      // Revoke previous output URLs before setting new ones
      outputsRef.current.forEach((o) => URL.revokeObjectURL(o.url));
      setOutputs(results);
      setDone(true);
    } catch (err) {
      console.error("Split error:", err);
      addToast("error", "An error occurred while splitting the PDF. Please ensure it's a valid PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, pageCount, splitMode, rangeInput, everyN, extractPages, parseRanges, parsePageList, addToast]); 

  const downloadAll = async () => {
    if (outputs.length === 1) {
      // Single file — direct download
      const a = document.createElement("a");
      a.href = outputs[0].url;
      a.download = outputs[0].name;
      a.click();
      return;
    }
    // Multiple files — zip them
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const out of outputs) {
        const arr = await out.blob.arrayBuffer();
        zip.file(out.name, arr);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${files[0]?.name.replace(/\.pdf$/i, "")}_split.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error("Zip error:", err);
      addToast("error", "Failed to create ZIP file.");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setPageCount(0);
    setOutputs([]);
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Scissors}
          title="Split PDF"
          description="Split a PDF into multiple smaller files by page ranges, every N pages, or extract specific pages — free, instant, and private. No account required."
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
                onFilesChange={handleFileChange}
                label="Drop your PDF here"
                description="or click to browse — PDF files only"
              />

              {/* Page count indicator */}
              {pageCount > 0 && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-muted border border-primary-border animate-fade-in-up">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {pageCount} page{pageCount !== 1 ? "s" : ""} detected
                  </span>
                </div>
              )}

              {/* Split Mode Selection */}
              {pageCount > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Split Mode
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {splitModeOptions.map((option) => (
                      <button
                        key={option.id}
                        role="radio"
                        aria-checked={splitMode === option.id}
                        onClick={() => setSplitMode(option.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          splitMode === option.id
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border hover:border-primary-border hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              splitMode === option.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {splitMode === option.id && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                          <span className="font-semibold text-xs text-foreground">
                            {option.label}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-muted ml-6">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode-specific inputs */}
              {pageCount > 0 && (
                <div className="mt-6 animate-fade-in-up">
                  {splitMode === "ranges" && (
                    <div>
                      <label className="text-xs font-semibold text-foreground-secondary mb-2 block">
                        Page Ranges
                      </label>
                      <input
                        type="text"
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder="e.g. 1-3, 4-6, 7-end"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                      />
                      <p className="mt-2 text-xs text-foreground-muted">
                        Separate ranges with commas. Use &quot;end&quot; for the last
                        page (page {pageCount}).
                      </p>
                    </div>
                  )}

                  {splitMode === "every" && (
                    <div>
                      <label className="text-xs font-semibold text-foreground-secondary mb-2 block">
                        Split every N pages
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={1}
                          max={pageCount}
                          value={everyN}
                          onChange={(e) =>
                            setEveryN(
                              Math.max(
                                1,
                                Math.min(pageCount, parseInt(e.target.value) || 1)
                              )
                            )
                          }
                          className="w-24 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                        />
                        <span className="text-xs text-foreground-secondary">
                          pages per file →{" "}
                          <strong className="text-foreground">
                            {Math.ceil(pageCount / everyN)} file
                            {Math.ceil(pageCount / everyN) !== 1 ? "s" : ""}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {splitMode === "extract" && (
                    <div>
                      <label className="text-xs font-semibold text-foreground-secondary mb-2 block">
                        Pages to Extract
                      </label>
                      <input
                        type="text"
                        value={extractPages}
                        onChange={(e) => setExtractPages(e.target.value)}
                        placeholder="e.g. 1, 3, 5, 7"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                      />
                      <p className="mt-2 text-xs text-foreground-muted">
                        Separate page numbers with commas. All selected pages
                        will be combined into one PDF.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {pageCount > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleSplit}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Splitting PDF...
                      </>
                    ) : (
                      <>
                        <Scissors className="w-5 h-5" />
                        Split PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                PDF Split Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your PDF has been split into {outputs.length} file
                {outputs.length !== 1 ? "s" : ""}.
                Download individually or grab them all as a ZIP.
              </p>

              {/* Output files list */}
              <div className="max-w-md mx-auto space-y-2 mb-6">
                {outputs.map((out, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3 animate-fade-in-up"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {out.name}
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        {out.pageCount} page{out.pageCount !== 1 ? "s" : ""} •{" "}
                        {formatSize(out.blob.size)}
                      </p>
                    </div>
                    <a
                      href={out.url}
                      download={out.name}
                      className="p-2 rounded-lg hover:bg-primary-muted text-primary transition-colors flex-shrink-0"
                      aria-label={`Download ${out.name}`}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {outputs.length > 1 && (
                  <button
                    onClick={downloadAll}
                    className="btn btn-primary inline-flex items-center gap-2 text-center"
                  >
                    <Download className="w-5 h-5" />
                    Download All (ZIP)
                  </button>
                )}
                {outputs.length === 1 && (
                  <a
                    href={outputs[0].url}
                    download={outputs[0].name}
                    className="btn btn-primary inline-flex items-center gap-2 text-center"
                  >
                    <Download className="w-5 h-5" />
                    Download Split PDF
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  Split Another PDF
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
                Private & Secure
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Splitting happens entirely in your browser using pdf-lib. Your
                PDF is never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Flexible Splitting
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Split by custom ranges, every N pages, or extract specific
                pages. Download individually or as a ZIP archive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
