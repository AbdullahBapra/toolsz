"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Merge,
  Check,
  Loader2,
  Shield,
  Zap,
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  FileText,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import ToolHero from "@/app/components/ToolHero";

interface FileItem {
  id: string;
  file: File;
}

export default function MergePdfPage() {
  const { addToast } = useToast();
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const additions = Array.from(newFiles)
        .filter((f) => f.name.toLowerCase().endsWith(".pdf"))
        .map((file) => ({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
        }));
      setFileItems((prev) => [...prev, ...additions]);
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const moveItem = useCallback((id: string, direction: "up" | "down") => {
    setFileItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const newArr = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
      return newArr;
    });
  }, []);

  const handleMerge = async () => {
    if (fileItems.length < 2) return;
    setProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const item of fileItems) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setDone(true);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      addToast("error", "An error occurred while merging the files. Please ensure they are valid PDFs.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFileItems([]);
    setDone(false);
    setProcessing(false);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Merge}
          title="Merge PDF"
          description="Combine multiple PDF documents into one unified file — free, fast, and private. Drag and drop to reorder pages before merging. No account, no watermarks, no server uploads."
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
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="drop-zone rounded-2xl p-8 flex flex-col items-center justify-center min-h-[180px] cursor-pointer transition-all duration-200"
              >
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => addFiles(e.target.files)}
                  className="hidden"
                  id="merge-file-upload"
                />
                <label
                  htmlFor="merge-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <Merge className="w-8 h-8 text-purple-500/70" />
                  </div>
                  <p className="text-foreground font-semibold text-xs mb-1">
                    Drop PDF files here to merge
                  </p>
                  <p className="text-foreground-secondary text-xs">
                    or click to browse — select multiple PDF files
                  </p>
                </label>
              </div>

              {/* File List with Ordering */}
              {fileItems.length > 0 && (
                <div className="mt-6 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-primary" />
                    File Order ({fileItems.length} file
                    {fileItems.length !== 1 ? "s" : ""})
                  </h3>
                  <p className="text-foreground-secondary text-xs mb-4">
                    Arrange files in the order you want them merged. Use the arrows
                    to reorder.
                  </p>
                  <div className="space-y-2">
                    {fileItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3 animate-fade-in-up"
                      >
                        {/* Order number */}
                        <div className="w-8 h-8 rounded-lg bg-primary-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">
                            {index + 1}
                          </span>
                        </div>

                        {/* File icon */}
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-purple-500" />
                        </div>

                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-foreground-secondary">
                            {formatSize(item.file.size)}
                          </p>
                        </div>

                        {/* Order controls */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => moveItem(item.id, "up")}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveItem(item.id, "down")}
                            disabled={index === fileItems.length - 1}
                            className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-danger-muted text-foreground-secondary hover:text-danger transition-colors flex-shrink-0"
                          aria-label={`Remove ${item.file.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add more files */}
                  <div className="mt-4">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) => addFiles(e.target.files)}
                      className="hidden"
                      id="merge-add-more"
                    />
                    <label
                      htmlFor="merge-add-more"
                      className="inline-flex items-center gap-2 text-primary text-xs font-semibold cursor-pointer hover:text-primary-hover transition-colors"
                    >
                      + Add more files
                    </label>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {fileItems.length >= 2 && (
                <div className="mt-8 flex flex-col items-center gap-2 animate-fade-in-up">
                  <button
                    onClick={handleMerge}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Merging PDFs...
                      </>
                    ) : (
                      <>
                        <Merge className="w-5 h-5" />
                        Merge {fileItems.length} PDFs
                      </>
                    )}
                  </button>
                  {fileItems.length < 2 && (
                    <p className="text-foreground-muted text-xs">
                      Add at least 2 PDF files to merge
                    </p>
                  )}
                </div>
              )}

              {fileItems.length === 1 && (
                <div className="mt-6 text-center">
                  <p className="text-foreground-secondary text-xs">
                    Add at least one more PDF file to start merging.
                  </p>
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
                PDFs Merged Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your {fileItems.length} PDF files have been combined into a single
                document in the order you specified.
              </p>

              <div className="inline-flex items-center gap-2 bg-primary-muted border border-primary-border rounded-xl px-4 py-3 mb-6">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  merged-document.pdf
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download="merged-document.pdf"
                    className="btn btn-primary inline-flex items-center gap-2 text-center"
                  >
                    <FileText className="w-5 h-5" />
                    Download Merged PDF
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  Merge More Files
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
                Merged files are created securely and deleted automatically. Your
                documents remain private throughout the process.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                No Watermarks
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                The merged PDF is clean with no watermarks or modifications. You get
                exactly the document you expect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
