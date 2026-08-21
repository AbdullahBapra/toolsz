"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  LayoutList,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  FileText,
  RotateCcw,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface PageItem {
  index: number;
  label: string;
}

interface OutputFile {
  name: string;
  blob: Blob;
  url: string;
  pageCount: number;
}

export default function OrganizePdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [output, setOutput] = useState<OutputFile | null>(null);
  const outputRef = useRef<OutputFile | null>(null);

  useEffect(() => { outputRef.current = output; }, [output]);
  useEffect(() => {
    return () => { if (outputRef.current) URL.revokeObjectURL(outputRef.current.url); };
  }, []);

  const handleFileChange = useCallback(async (newFiles: File[]) => {
    if (outputRef.current) { URL.revokeObjectURL(outputRef.current.url); setOutput(null); }
    setFiles(newFiles);
    setDone(false);

    if (newFiles.length === 0) { setPages([]); return; }

    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await newFiles[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      const pageItems: PageItem[] = Array.from({ length: count }, (_, i) => ({
        index: i,
        label: `Page ${i + 1}`,
      }));
      setPages(pageItems);
    } catch {
      setPages([]);
    }
  }, []);

  const movePage = useCallback((fromIdx: number, direction: "up" | "down") => {
    setPages((prev) => {
      const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= prev.length) return prev;
      const next = [...prev];
      [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
      return next;
    });
  }, []);

  const deletePage = useCallback((idx: number) => {
    setPages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const duplicatePage = useCallback((idx: number) => {
    setPages((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, { ...prev[idx], label: `${prev[idx].label} (copy)` });
      return next;
    });
  }, []);

  const hasChanges = files.length > 0 && pages.length > 0;

  const handleProcess = useCallback(async () => {
    if (files.length === 0 || pages.length === 0) return;
    setProcessing(true);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await files[0].arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(sourcePdf, pages.map((p) => p.index));
      copiedPages.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");

      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);

      const result: OutputFile = {
        name: `${baseName}_organized.pdf`,
        blob,
        url: URL.createObjectURL(blob),
        pageCount: pages.length,
      };
      setOutput(result);
      setDone(true);
    } catch (err) {
      console.error("Organize error:", err);
      addToast("error", "Failed to organize PDF. Please ensure it's a valid PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, pages, addToast]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setPages([]);
    setOutput(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={LayoutList}
          title="Organize PDF"
          description="Reorder, delete, and duplicate PDF pages with a drag-and-drop interface — free, instant, and private. Manage your document structure without uploading to any server."
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
                onFilesChange={handleFileChange}
                label="Drop your PDF here"
                description="or click to browse — PDF files only"
              />

              {pages.length > 0 && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-muted border border-primary-border animate-fade-in-up">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {pages.length} page{pages.length !== 1 ? "s" : ""} — use arrows to reorder, trash to delete
                  </span>
                </div>
              )}

              {pages.length > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Page Order
                  </h3>
                  <div className="space-y-2">
                    {pages.map((page, idx) => (
                      <div
                        key={`${page.index}-${idx}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-2 hover:border-primary-border transition-all duration-200 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-primary-muted border border-primary-border flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-xs font-semibold text-foreground">{page.label}</span>
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => movePage(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg hover:bg-primary-muted text-foreground-muted hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => movePage(idx, "down")}
                            disabled={idx === pages.length - 1}
                            className="p-1.5 rounded-lg hover:bg-primary-muted text-foreground-muted hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicatePage(idx)}
                            className="p-1.5 rounded-lg hover:bg-primary-muted text-foreground-muted hover:text-primary transition-colors"
                            aria-label="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deletePage(idx)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-foreground-muted hover:text-red-500 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasChanges && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Organizing PDF...
                      </>
                    ) : (
                      <>
                        <LayoutList className="w-5 h-5" />
                        Apply & Download
                      </>
                    )}
                  </button>
                </div>
              )}

              {pages.length === 0 && files.length > 0 && (
                <p className="text-center text-xs text-foreground-muted mt-3">
                  All pages deleted — upload a new PDF to start over.
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                PDF Organized Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your PDF has been reorganized with {output?.pageCount} page{output?.pageCount !== 1 ? "s" : ""}.
              </p>
              {output && (
                <div className="max-w-sm mx-auto mb-6">
                  <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground truncate">{output.name}</p>
                      <p className="text-xs text-foreground-secondary">{output.pageCount} pages &bull; {formatSize(output.blob.size)}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={output?.url} download={output?.name} className="btn btn-primary inline-flex items-center gap-2 text-center">
                  <Download className="w-5 h-5" />
                  Download Organized PDF
                </a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center">
                  <RotateCcw className="w-4 h-4" />
                  Organize Another PDF
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
                All page operations happen in your browser. Your PDF is never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Full Control</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Reorder, delete, and duplicate pages to get your document exactly the way you want it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
