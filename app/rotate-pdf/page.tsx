"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import {
  RotateCw,
  RotateCcw,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  FileText,
  RotateCcw as ResetIcon,
  FlipHorizontal2,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type RotationAngle = 0 | 90 | 180 | 270;

interface PageInfo {
  index: number;
  rotation: RotationAngle;
}

interface OutputFile {
  name: string;
  blob: Blob;
  url: string;
}

const batchOptions: {
  angle: RotationAngle;
  label: string;
  icon: typeof RotateCw;
}[] = [
  { angle: 90, label: "90° Clockwise", icon: RotateCw },
  { angle: 270, label: "90° Counter-CW", icon: RotateCcw },
  { angle: 180, label: "180°", icon: FlipHorizontal2 },
];

export default function RotatePdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  // Per-page rotation state
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [initialRotations, setInitialRotations] = useState<RotationAngle[]>([]);

  // Output
  const [output, setOutput] = useState<OutputFile | null>(null);
  const outputRef = useRef<OutputFile | null>(null);

  // Keep ref in sync for cleanup
  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    };
  }, []);

  // Load PDF to get page count and initialize rotation state
  const handleFileChange = useCallback(async (newFiles: File[]) => {
    // Revoke previous output URL
    if (outputRef.current) {
      URL.revokeObjectURL(outputRef.current.url);
      setOutput(null);
    }

    setFiles(newFiles);
    setDone(false);

    if (newFiles.length === 0) {
      setPageCount(0);
      setPages([]);
      setInitialRotations([]);
      return;
    }

    try {
      const arrayBuffer = await newFiles[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();

      // Read existing rotations from the PDF
      const initialPages: PageInfo[] = [];
      for (let i = 0; i < count; i++) {
        const page = pdf.getPage(i);
        const rot = page.getRotation().angle;
        // Normalize to 0, 90, 180, 270
        const normalized = ((rot % 360) + 360) % 360;
        initialPages.push({
          index: i,
          rotation: normalized as RotationAngle,
        });
      }

      setPageCount(count);
      setPages(initialPages);
      setInitialRotations(initialPages.map((p) => p.rotation));
    } catch {
      setPageCount(0);
      setPages([]);
      setInitialRotations([]);
    }
  }, []);

  // Rotate a single page
  const rotatePage = useCallback((pageIndex: number, direction: "cw" | "ccw") => {
    setPages((prev) =>
      prev.map((p, i) => {
        if (i !== pageIndex) return p;
        const delta = direction === "cw" ? 90 : 270;
        const newRotation = ((p.rotation + delta) % 360) as RotationAngle;
        return { ...p, rotation: newRotation };
      })
    );
  }, []);

  // Batch rotate all pages
  const rotateAll = useCallback((angle: RotationAngle) => {
    setPages((prev) =>
      prev.map((p) => {
        const newRotation = ((p.rotation + angle) % 360) as RotationAngle;
        return { ...p, rotation: newRotation };
      })
    );
  }, []);

  // Reset all rotations to their initial state
  const resetAll = useCallback(() => {
    setPages((prev) =>
      prev.map((p, i) => ({
        ...p,
        rotation: (initialRotations[i] ?? 0) as RotationAngle,
      }))
    );
  }, [initialRotations]);

  // Check if any page has been rotated from its initial state
  const hasChanges = pages.some(
    (p, i) => p.rotation !== (initialRotations[i] ?? 0)
  );

  // Generate rotated PDF
  const handleProcess = useCallback(async () => {
    if (files.length === 0 || pages.length === 0) return;
    setProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
        // Apply the cumulative rotation
        copiedPage.setRotation(degrees(pages[i].rotation));
        newPdf.addPage(copiedPage);
      }

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");

      // Revoke previous URL
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);

      const result: OutputFile = {
        name: `${baseName}_rotated.pdf`,
        blob,
        url: URL.createObjectURL(blob),
      };

      setOutput(result);
      setDone(true);
    } catch (err) {
      console.error("Rotate error:", err);
      addToast("error", "An error occurred while rotating the PDF. Please ensure it's a valid PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, pages, addToast]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setPageCount(0);
    setPages([]);
    setInitialRotations([]);
    setOutput(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const rotationLabel = (angle: RotationAngle) => {
    if (angle === 0) return "0°";
    if (angle === 90) return "90°";
    if (angle === 180) return "180°";
    return "270°";
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={RotateCw}
          title="Rotate PDF"
          description="Rotate individual or all PDF pages clockwise, counter-clockwise, or 180° — free, instant, and private. Works on any page without changing the rest."
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

              {/* Batch Rotation Controls */}
              {pages.length > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Rotate All Pages
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {batchOptions.map((opt) => (
                      <button
                        key={opt.angle}
                        onClick={() => rotateAll(opt.angle)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-xs font-semibold hover:border-primary-border hover:bg-primary-muted transition-all duration-200"
                      >
                        <opt.icon className="w-4 h-4 text-primary" />
                        {opt.label}
                      </button>
                    ))}
                    {hasChanges && (
                      <button
                        onClick={resetAll}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground-muted text-xs font-semibold hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                      >
                        <ResetIcon className="w-4 h-4" />
                        Reset All
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Per-Page Rotation Grid */}
              {pages.length > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <RotateCw className="w-5 h-5 text-primary" />
                    Individual Page Rotation
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {pages.map((page, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl border-2 p-3 transition-all duration-200 ${
                          page.rotation !== 0
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border hover:border-primary-border"
                        }`}
                      >
                        {/* Page thumbnail placeholder */}
                        <div className="aspect-[3/4] bg-surface-2 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
                          <FileText className="w-8 h-8 text-foreground-muted" />
                          {/* Rotation indicator overlay */}
                          {page.rotation !== 0 && (
                            <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <RotateCw className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {/* Visual rotation preview */}
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              transform: `rotate(${page.rotation}deg)`,
                              transition: "transform 0.3s ease",
                            }}
                          >
                            <div className="w-10 h-14 border-2 border-foreground-muted/30 rounded bg-white/50 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-foreground-muted">
                                {idx + 1}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Page label */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold text-foreground-secondary">
                            Page {idx + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              page.rotation !== 0
                                ? "bg-primary/10 text-primary"
                                : "text-foreground-muted"
                            }`}
                          >
                            {rotationLabel(page.rotation)}
                          </span>
                        </div>

                        {/* Rotation buttons */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => rotatePage(idx, "ccw")}
                            className="flex-1 flex items-center justify-center py-1.5 rounded-lg border border-border hover:border-primary-border hover:bg-primary-muted text-foreground-muted hover:text-primary transition-all duration-200"
                            aria-label={`Rotate page ${idx + 1} counter-clockwise`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => rotatePage(idx, "cw")}
                            className="flex-1 flex items-center justify-center py-1.5 rounded-lg border border-border hover:border-primary-border hover:bg-primary-muted text-foreground-muted hover:text-primary transition-all duration-200"
                            aria-label={`Rotate page ${idx + 1} clockwise`}
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {pages.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleProcess}
                    disabled={processing || !hasChanges}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Rotating PDF...
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-5 h-5" />
                        Apply & Download
                      </>
                    )}
                  </button>
                </div>
              )}

              {!hasChanges && pages.length > 0 && (
                <p className="text-center text-xs text-foreground-muted mt-3">
                  Rotate some pages first, then click Apply & Download.
                </p>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                PDF Rotated Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your PDF has been rotated and is ready to download.
              </p>

              {/* Output file */}
              {output && (
                <div className="max-w-sm mx-auto mb-6">
                  <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {output.name}
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        {pageCount} page{pageCount !== 1 ? "s" : ""} •{" "}
                        {formatSize(output.blob.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={output?.url}
                  download={output?.name}
                  className="btn btn-primary inline-flex items-center gap-2 text-center"
                >
                  <Download className="w-5 h-5" />
                  Download Rotated PDF
                </a>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  <ResetIcon className="w-4 h-4" />
                  Rotate Another PDF
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
                Rotation happens entirely in your browser using pdf-lib. Your
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
                Per-Page Control
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Rotate individual pages clockwise or counter-clockwise, or batch
                rotate all pages at once. Original quality is preserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
