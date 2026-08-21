"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Loader2,
  Shield,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Columns3,
  List,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface PageData {
  dataUrl: string;
  width: number;
  height: number;
}

export default function FlipbookPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [spreadMode, setSpreadMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flippingRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    flippingRef.current = flipping;
  }, [flipping]);

  // Load PDF and render pages
  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(
        /* webpackIgnore: true */ "/pdfjs-viewer.min.mjs"
      );
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      const scale = 2.0;
      const renderedPages: PageData[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        if (!context) continue;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        renderedPages.push({
          dataUrl: canvas.toDataURL("image/jpeg", 0.92),
          width: viewport.width,
          height: viewport.height,
        });
      }

      setPages(renderedPages);
      setCurrentPage(0);
    } catch (err) {
      console.error("Error loading PDF:", err);
      addToast("error", "Failed to load PDF. Please ensure it's a valid PDF file.");
    } finally {
      setProcessing(false);
    }
  }, [files, addToast]);

  useEffect(() => {
    if (files.length > 0) handleProcess();
  }, [files, handleProcess]);

  // Flip animation — uses flippingRef to avoid dependency cascade
  const goToPage = useCallback(
    (page: number) => {
      if (flippingRef.current || page < 0 || page >= pages.length) return;
      const dir = page > currentPage ? "next" : "prev";
      setFlipDirection(dir);
      setFlipping(true);

      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = setTimeout(() => {
        setCurrentPage(page);
        setFlipping(false);
      }, 300);
    },
    [currentPage, pages.length]
  );

  const goNext = useCallback(() => {
    const step = spreadMode ? 2 : 1;
    goToPage(Math.min(currentPage + step, pages.length - 1));
  }, [currentPage, goToPage, pages.length, spreadMode]);

  const goPrev = useCallback(() => {
    const step = spreadMode ? 2 : 1;
    goToPage(Math.max(currentPage - step, 0));
  }, [currentPage, goToPage, spreadMode]);

  // Fullscreen — defined before keyboard useEffect to avoid TDZ
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (pages.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pages.length, goNext, goPrev, toggleFullscreen]);

  // Cleanup flip timeout on unmount
  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  // Zoom
  const handleZoom = (dir: "in" | "out" | "reset") => {
    if (dir === "reset") setZoom(1);
    else
      setZoom((z) =>
        dir === "in" ? Math.min(z + 0.25, 3) : Math.max(z - 0.25, 0.5)
      );
  };

  const handleReset = () => {
    setFiles([]);
    setPages([]);
    setCurrentPage(0);
    setZoom(1);
    setShowThumbnails(false);
    setSpreadMode(false);
    setIsFullscreen(false);
  };

  const pageAspectRatio =
    pages.length > 0 ? pages[0].width / pages[0].height : 0.707;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={BookOpen}
          title="PDF Flipbook Reader"
          description="Read any PDF as an interactive 3D flipbook with realistic page-turn animations — free, instant, and private. A reading experience no other PDF tool offers."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {pages.length === 0 ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept=".pdf"
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF here"
              description="or click to browse — PDF files only"
            />
            {processing && (
              <div className="mt-6 flex items-center justify-center gap-3 animate-fade-in-up">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-foreground-secondary">
                  Rendering pages for flipbook...
                </span>
              </div>
            )}
          </div>
        ) : (
          <div ref={containerRef} className="flex flex-col">
            {/* Toolbar */}
            <div className="glass-panel rounded-t-[16px] px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 border-b border-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    showThumbnails
                      ? "bg-primary text-white"
                      : "bg-primary-muted text-primary hover:bg-primary/20"
                  }`}
                >
                  <List className="w-3.5 h-3.5" /> Pages
                </button>
                <button
                  onClick={() => setSpreadMode(!spreadMode)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    spreadMode
                      ? "bg-primary text-white"
                      : "bg-primary-muted text-primary hover:bg-primary/20"
                  }`}
                >
                  <Columns3 className="w-3.5 h-3.5" />{" "}
                  {spreadMode ? "Single" : "Spread"}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                <span className="font-semibold">
                  Page {currentPage + 1} of {pages.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleZoom("out")}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-foreground-secondary min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => handleZoom("in")}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom("reset")}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-border mx-1" />
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Reader Area */}
            <div className="flex">
              {/* Thumbnails Sidebar */}
              {showThumbnails && (
                <div className="w-32 sm:w-40 flex-shrink-0 bg-surface-1 border-r border-border overflow-y-auto max-h-[75vh] p-2 space-y-2 animate-fade-in">
                  {pages.map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToPage(idx)}
                      className={`w-full rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        idx === currentPage
                          ? "border-primary shadow-md"
                          : "border-transparent hover:border-primary-border"
                      }`}
                    >
                      <div
                        className="w-full bg-white"
                        style={{ aspectRatio: pageAspectRatio }}
                      >
                        <img
                          src={page.dataUrl}
                          alt={`Page ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center py-1 text-[10px] font-semibold text-foreground-secondary">
                        {idx + 1}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Main Flipbook Area */}
              <div
                className="flex-1 bg-gradient-to-b from-surface-1 to-surface-2 flex flex-col items-center justify-center relative overflow-hidden"
                style={{ minHeight: "65vh" }}
              >
                {/* Book container */}
                <div
                  className="relative"
                  style={{
                    perspective: "2000px",
                    transform: `scale(${zoom})`,
                    transition: "transform 0.3s ease",
                  }}
                >
                  {spreadMode ? (
                    /* ─── Spread view (two pages side-by-side) ─── */
                    <div className="flex items-stretch shadow-2xl rounded-lg overflow-hidden">
                      {/* Left page */}
                      <div
                        className="bg-white shadow-inner"
                        style={{
                          width: `min(40vw, 500px)`,
                          aspectRatio: pageAspectRatio,
                        }}
                      >
                        {currentPage > 0 && (
                          <img
                            src={pages[currentPage - 1].dataUrl}
                            alt={`Page ${currentPage}`}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      {/* Spine shadow */}
                      <div className="w-1 bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 flex-shrink-0" />
                      {/* Right page */}
                      <div
                        className="bg-white shadow-inner"
                        style={{
                          width: `min(40vw, 500px)`,
                          aspectRatio: pageAspectRatio,
                        }}
                      >
                        {currentPage < pages.length && (
                          <img
                            src={pages[currentPage].dataUrl}
                            alt={`Page ${currentPage + 1}`}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    /* ─── Single-page 3D flip view ─── */
                    <div
                      className="relative"
                      style={{
                        width: `min(55vw, 650px)`,
                        aspectRatio: pageAspectRatio,
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {/* Current page (back) */}
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl"
                        style={{
                          backfaceVisibility: "hidden",
                          zIndex: flipping ? 1 : 2,
                        }}
                      >
                        <img
                          src={pages[currentPage].dataUrl}
                          alt={`Page ${currentPage + 1}`}
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>

                      {/* Flipping page overlay */}
                      {flipping && (
                        <div
                          className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl"
                          style={{
                            backfaceVisibility: "hidden",
                            transformOrigin:
                              flipDirection === "next"
                                ? "left center"
                                : "right center",
                            transform:
                              flipDirection === "next"
                                ? "rotateY(-180deg)"
                                : "rotateY(180deg)",
                            transition: "transform 0.3s ease-in-out",
                            zIndex: 3,
                          }}
                        >
                          <div
                            className="absolute inset-0 bg-white"
                            style={{
                              transform: "rotateY(180deg)",
                              backfaceVisibility: "hidden",
                            }}
                          >
                            <img
                              src={
                                pages[
                                  flipDirection === "next"
                                    ? Math.min(
                                        currentPage + 1,
                                        pages.length - 1
                                      )
                                    : Math.max(currentPage - 1, 0)
                                ].dataUrl
                              }
                              alt="Flipping page"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {/* Page curl shadow effect */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                flipDirection === "next"
                                  ? "linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 40%)"
                                  : "linear-gradient(to left, rgba(0,0,0,0.15) 0%, transparent 40%)",
                            }}
                          />
                        </div>
                      )}

                      {/* Page edge shadow for depth */}
                      <div
                        className="absolute top-0 bottom-0 w-6 pointer-events-none"
                        style={{
                          right: flipDirection === "next" ? "-6px" : undefined,
                          left: flipDirection === "prev" ? "-6px" : undefined,
                          background:
                            "linear-gradient(to right, rgba(0,0,0,0.08), transparent)",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={goPrev}
                  disabled={currentPage === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur border border-border flex items-center justify-center hover:bg-white hover:border-primary-border transition-all duration-200 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:border-border"
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <button
                  onClick={goNext}
                  disabled={currentPage >= pages.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur border border-border flex items-center justify-center hover:bg-white hover:border-primary-border transition-all duration-200 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:border-border"
                >
                  <ChevronRight className="w-6 h-6 text-foreground" />
                </button>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="glass-panel rounded-b-[16px] px-4 py-3 flex items-center justify-between border-t border-border">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-xs py-2 px-4"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> New PDF
                </button>
              </div>

              {/* Page progress dots */}
              <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-md">
                {pages.length <= 20 ? (
                  pages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToPage(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        idx === currentPage
                          ? "bg-primary w-6"
                          : "bg-border hover:bg-primary-border"
                      }`}
                    />
                  ))
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-40 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentPage + 1) / pages.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-foreground-secondary font-mono">
                      {currentPage + 1}/{pages.length}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-semibold">{pages.length} pages</span>
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
                100% Private Reader
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your PDF never leaves your browser. All rendering and page
                flipping happens locally — no uploads, no servers, no tracking.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Realistic 3D Page Flip
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Enjoy a natural reading experience with smooth 3D page-turn
                animations, spread mode, zoom, thumbnails, and fullscreen
                support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
