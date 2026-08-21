"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { useToast } from "@/app/components/Toast";
import {
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  Shield,
  Zap,
  Download,
  FileText,
  RotateCcw as ResetIcon,
  Trash2,
  MousePointer,
  Square,
  Info,
  Check,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

// Redaction rectangle stored in PDF coordinate space
interface RedactRect {
  id: string;
  // PDF coordinates (bottom-left origin)
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OutputFile {
  name: string;
  blob: Blob;
  url: string;
}

type ActiveTool = "select" | "redact";

export default function RedactPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [editorReady, setEditorReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  // PDF state
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  const scaleRef = useRef(1.5);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Redaction rects per page (PDF coords)
  const redactionsRef = useRef<Map<number, RedactRect[]>>(new Map());
  const [currentRedactions, setCurrentRedactions] = useState<RedactRect[]>([]);
  const [totalRedactionCount, setTotalRedactionCount] = useState(0);

  // Drawing state
  const [activeTool, setActiveTool] = useState<ActiveTool>("redact");
  const activeToolRef = useRef<ActiveTool>("redact");
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef({ x: 0, y: 0 });
  const [drawingRect, setDrawingRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Zoom
  const [zoom, setZoom] = useState(1);

  // Output
  const [output, setOutput] = useState<OutputFile | null>(null);
  const outputRef = useRef<OutputFile | null>(null);

  // Keep refs in sync
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    };
  }, []);

  // ─── Render PDF page to canvas ─────────────────────────────────
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDocRef.current || !canvasElRef.current) return;
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(
        /* webpackIgnore: true */ "/pdfjs-viewer.min.mjs"
      );
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const page = await pdfDocRef.current.getPage(pageNum);
      const vp = page.getViewport({ scale: 1.0 });
      const scale = Math.min(1.5, 900 / vp.width);
      scaleRef.current = scale;

      const viewport = page.getViewport({ scale });
      const canvas = canvasElRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Size overlay canvas to match
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = viewport.width;
        overlayCanvasRef.current.height = viewport.height;
      }
    },
    []
  );

  // ─── Draw redaction overlays ───────────────────────────────────
  const drawOverlays = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d")!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const scale = scaleRef.current;

    // Draw existing redaction rects
    for (const rect of currentRedactions) {
      const isSelected = rect.id === selectedId;
      // Convert PDF coords → canvas coords
      const cx = rect.x * scale;
      const cy = overlay.height - (rect.y + rect.height) * scale;
      const cw = rect.width * scale;
      const ch = rect.height * scale;

      // Black fill
      ctx.fillStyle = "#000000";
      ctx.fillRect(cx, cy, cw, ch);

      // Selection border
      if (isSelected) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(cx, cy, cw, ch);
        ctx.setLineDash([]);
      }
    }

    // Draw in-progress drawing rect
    if (drawingRect) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(drawingRect.x, drawingRect.y, drawingRect.w, drawingRect.h);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(drawingRect.x, drawingRect.y, drawingRect.w, drawingRect.h);
    }
  }, [currentRedactions, drawingRect, selectedId]);

  useEffect(() => {
    drawOverlays();
  }, [drawOverlays]);

  // ─── Switch page ────────────────────────────────────────────────
  const switchToPage = useCallback(
    async (pageNum: number) => {
      if (pageNum < 1 || pageNum > numPages) return;
      setIsLoadingPage(true);
      try {
        await renderPage(pageNum);
        setCurrentPage(pageNum);
        const rects = redactionsRef.current.get(pageNum) || [];
        setCurrentRedactions(rects);
        setSelectedId(null);
        setDrawingRect(null);
      } finally {
        setIsLoadingPage(false);
      }
    },
    [numPages, renderPage]
  );

  // ─── Load PDF ──────────────────────────────────────────────────
  const handleFileChange = useCallback(
    async (newFiles: File[]) => {
      if (outputRef.current) {
        URL.revokeObjectURL(outputRef.current.url);
        setOutput(null);
      }

      setFiles(newFiles);
      setDone(false);
      redactionsRef.current.clear();
      setCurrentRedactions([]);
      setTotalRedactionCount(0);

      if (newFiles.length === 0) {
        setEditorReady(false);
        setNumPages(0);
        setCurrentPage(1);
        pdfDocRef.current = null;
        return;
      }

      try {
        // @ts-ignore
        const pdfjsLib: typeof import("pdfjs-dist") = await import(
          /* webpackIgnore: true */ "/pdfjs-viewer.min.mjs"
        );
        pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdf = await pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
        }).promise;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setEditorReady(true);
        // renderPage needs the canvas in the DOM, which only happens after editorReady is set
        // We use setTimeout to let React render the canvas first
        setTimeout(() => renderPage(1), 50);
        setCurrentRedactions([]);
      } catch (err) {
        console.error("PDF load error:", err);
        addToast("error", "Failed to load PDF. Please ensure it's a valid PDF file.");
      }
    },
    [renderPage, addToast]
  );

  // ─── Canvas mouse events for drawing redaction rects ───────────
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay || !editorReady) return;

    const getCanvasPos = (e: MouseEvent) => {
      const rect = overlay.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (overlay.width / rect.width),
        y: (e.clientY - rect.top) * (overlay.height / rect.height),
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (activeToolRef.current === "redact") {
        e.preventDefault();
        const pos = getCanvasPos(e);
        isDrawingRef.current = true;
        drawStartRef.current = pos;
        setSelectedId(null);
      } else if (activeToolRef.current === "select") {
        // Hit-test: check if click falls inside any redaction rect
        e.preventDefault();
        const pos = getCanvasPos(e);
        const scale = scaleRef.current;
        const canvasH = overlay.height;
        // Convert canvas coords → PDF coords for hit testing
        const pdfX = pos.x / scale;
        const pdfY = (canvasH - pos.y) / scale;

        // Check rects in reverse order (top-most first)
        const rects = redactionsRef.current.get(currentPage) || [];
        let foundId: string | null = null;
        for (let i = rects.length - 1; i >= 0; i--) {
          const r = rects[i];
          if (
            pdfX >= r.x &&
            pdfX <= r.x + r.width &&
            pdfY >= r.y &&
            pdfY <= r.y + r.height
          ) {
            foundId = r.id;
            break;
          }
        }
        setSelectedId(foundId);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;
      const pos = getCanvasPos(e);
      const start = drawStartRef.current;
      setDrawingRect({
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        w: Math.abs(pos.x - start.x),
        h: Math.abs(pos.y - start.y),
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      const pos = getCanvasPos(e);
      const start = drawStartRef.current;

      const x = Math.min(start.x, pos.x);
      const y = Math.min(start.y, pos.y);
      const w = Math.abs(pos.x - start.x);
      const h = Math.abs(pos.y - start.y);

      // Minimum size threshold (5px)
      if (w < 5 || h < 5) {
        setDrawingRect(null);
        return;
      }

      // Convert canvas coords → PDF coords
      const canvasH = overlay.height;
      const scale = scaleRef.current;
      const pdfX = x / scale;
      const pdfY = (canvasH - y - h) / scale;
      const pdfW = w / scale;
      const pdfH = h / scale;

      const newRect: RedactRect = {
        id: `r${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
      };

      // Add to current page
      const existing = redactionsRef.current.get(currentPage) || [];
      const updated = [...existing, newRect];
      redactionsRef.current.set(currentPage, updated);
      setCurrentRedactions(updated);

      // Update total count
      let total = 0;
      redactionsRef.current.forEach((rects) => (total += rects.length));
      setTotalRedactionCount(total);

      setDrawingRect(null);
    };

    const onMouseLeave = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        setDrawingRect(null);
      }
    };

    overlay.addEventListener("mousedown", onMouseDown);
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseup", onMouseUp);
    overlay.addEventListener("mouseleave", onMouseLeave);

    return () => {
      overlay.removeEventListener("mousedown", onMouseDown);
      overlay.removeEventListener("mousemove", onMouseMove);
      overlay.removeEventListener("mouseup", onMouseUp);
      overlay.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [editorReady, currentPage]);

  // ─── Delete selected redaction ─────────────────────────────────
  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const existing = redactionsRef.current.get(currentPage) || [];
    const updated = existing.filter((r) => r.id !== selectedId);
    redactionsRef.current.set(currentPage, updated);
    setCurrentRedactions(updated);
    setSelectedId(null);

    let total = 0;
    redactionsRef.current.forEach((rects) => (total += rects.length));
    setTotalRedactionCount(total);
  }, [currentPage, selectedId]);

  // Keyboard delete
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        editorReady &&
        selectedId
      ) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editorReady, deleteSelected]);

  // ─── Clear all redactions on current page ──────────────────────
  const clearPageRedactions = useCallback(() => {
    redactionsRef.current.set(currentPage, []);
    setCurrentRedactions([]);
    setSelectedId(null);

    let total = 0;
    redactionsRef.current.forEach((rects) => (total += rects.length));
    setTotalRedactionCount(total);
  }, [currentPage]);

  // ─── Export: burn redaction rectangles into PDF ─────────────────
  const handleExport = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const rects = redactionsRef.current.get(i + 1);
        if (!rects || rects.length === 0) continue;

        for (const rect of rects) {
          pages[i].drawRectangle({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            color: rgb(0, 0, 0),
            opacity: 1,
          });
        }
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");

      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);

      const result: OutputFile = {
        name: `${baseName}_redacted.pdf`,
        blob,
        url: URL.createObjectURL(blob),
      };

      setOutput(result);
      setDone(true);
    } catch (err) {
      console.error("Redaction export error:", err);
      addToast("error", "An error occurred while applying redactions. Please ensure it's a valid PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, addToast]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]);
    setEditorReady(false);
    setDone(false);
    setProcessing(false);
    setNumPages(0);
    setCurrentPage(1);
    setCurrentRedactions([]);
    setTotalRedactionCount(0);
    setDrawingRect(null);
    setOutput(null);
    redactionsRef.current.clear();
    pdfDocRef.current = null;
    setSelectedId(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={EyeOff}
          title="Redact PDF"
          description="Permanently black out sensitive information from your PDF — true redaction, not just a visual overlay. Free, instant, and completely private. No other free tool does this properly."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!editorReady && !done ? (
          /* Upload Area */
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept=".pdf"
              files={files}
              onFilesChange={handleFileChange}
              label="Drop your PDF here"
              description="or click to browse — PDF files only"
            />
            {files.length > 0 && !editorReady && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground-secondary">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading PDF...
              </div>
            )}
          </div>
        ) : done ? (
          /* Success State */
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 text-center py-8 animate-fade-in-up">
            <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              PDF Redacted Successfully!
            </h3>
            <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
              {totalRedactionCount} redaction
              {totalRedactionCount !== 1 ? "s" : ""} applied across your PDF.
              The content beneath each black bar is permanently hidden.
            </p>

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
                      {numPages} page{numPages !== 1 ? "s" : ""} •{" "}
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
                Download Redacted PDF
              </a>
              <button
                onClick={handleReset}
                className="btn btn-secondary inline-flex items-center gap-2 text-center"
              >
                <ResetIcon className="w-4 h-4" />
                Redact Another PDF
              </button>
            </div>
          </div>
        ) : (
          /* Editor */
          <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-2 flex-wrap gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setActiveTool("redact")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTool === "redact"
                      ? "bg-primary text-white"
                      : "bg-primary-muted text-primary hover:bg-primary/20"
                  }`}
                >
                  <Square className="w-3.5 h-3.5" /> Redact
                </button>
                <button
                  onClick={() => setActiveTool("select")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTool === "select"
                      ? "bg-primary text-white"
                      : "bg-primary-muted text-primary hover:bg-primary/20"
                  }`}
                >
                  <MousePointer className="w-3.5 h-3.5" /> Select
                </button>

                <div className="w-px h-5 bg-border mx-1" />

                {currentRedactions.length > 0 && (
                  <>
                    <button
                      onClick={deleteSelected}
                      disabled={!selectedId}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    <button
                      onClick={clearPageRedactions}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Page
                    </button>
                  </>
                )}
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.15, 0.3))}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-foreground-secondary min-w-[2.5rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.15, 4))}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
                >
                  <ResetIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Page navigation */}
            <div className="flex items-center justify-center gap-3 px-3 py-2 border-b border-border bg-surface-2">
              <button
                onClick={() => switchToPage(currentPage - 1)}
                disabled={currentPage <= 1 || isLoadingPage}
                className="p-1.5 rounded-lg hover:bg-surface-1 text-foreground-secondary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-foreground-secondary">
                Page {currentPage} of {numPages}
              </span>
              <button
                onClick={() => switchToPage(currentPage + 1)}
                disabled={currentPage >= numPages || isLoadingPage}
                className="p-1.5 rounded-lg hover:bg-surface-1 text-foreground-secondary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {isLoadingPage && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              <span className="text-xs text-primary font-semibold ml-4">
                {currentRedactions.length} redaction
                {currentRedactions.length !== 1 ? "s" : ""} on this page
              </span>
            </div>

            {/* Canvas area */}
            <div
              className="overflow-auto bg-surface-2"
              style={{ maxHeight: "70vh" }}
            >
              <div className="flex items-start justify-center p-4 min-h-[400px]">
                <div
                  style={{
                    position: "relative",
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <canvas ref={canvasElRef} style={{ display: "block" }} />
                  <canvas
                    ref={overlayCanvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      cursor:
                        activeTool === "redact" ? "crosshair" : "pointer"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t border-border bg-surface-2 gap-3">
              <div className="flex items-center gap-2">
                {totalRedactionCount > 0 && (
                  <span className="text-xs text-foreground-secondary">
                    <strong className="text-primary">
                      {totalRedactionCount}
                    </strong>{" "}
                    total redaction{totalRedactionCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-xs"
                >
                  <ResetIcon className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={processing || totalRedactionCount === 0}
                  className="btn btn-primary inline-flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Applying
                      Redactions...
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" /> Apply Redactions & Download
                    </>
                  )}
                </button>
              </div>
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                True Redaction — Private & Secure
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Redaction happens entirely in your browser using pdf-lib. Black
                rectangles are permanently burned into the PDF — the underlying
                content cannot be recovered. Your file never leaves your device.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Easy Draw-to-Redact
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Simply draw rectangles over any content you want to hide. Select
                and delete mistakes, navigate between pages, and apply all
                redactions at once when you&apos;re ready.
              </p>
            </div>
          </div>
        </div>

        {/* How-to tip */}
        {editorReady && !done && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 animate-fade-in-up">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-blue-800 mb-1">
                How to redact
              </h4>
              <ul className="text-xs text-blue-700 leading-relaxed space-y-1">
                <li>
                  <strong>Draw:</strong> Click and drag on the PDF to draw a
                  black rectangle over sensitive content.
                </li>
                <li>
                  <strong>Delete:</strong> Switch to Select mode, click a
                  redaction to select it, then press Delete or click the Delete
                  button.
                </li>
                <li>
                  <strong>Apply:</strong> When ready, click &quot;Apply
                  Redactions&quot; to permanently burn all black bars into the
                  PDF and download.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
