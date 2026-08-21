"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  PenTool,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Type,
  Pen,
  Upload,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type SigMode = "draw" | "type" | "upload";

const SIGNATURE_FONTS = [
  { id: "cursive", label: "Cursive", family: "Dancing Script, cursive" },
  { id: "elegant", label: "Elegant", family: "Great Vibes, cursive" },
  { id: "formal", label: "Formal", family: "Caveat, cursive" },
];

export default function SignPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [sigMode, setSigMode] = useState<SigMode>("draw");
  const [sigText, setSigText] = useState("Your Name");
  const [sigFont, setSigFont] = useState("cursive");
  const [sigColor, setSigColor] = useState("#000000");
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [sigPosition, setSigPosition] = useState<{ x: number; y: number } | null>(null);
  const [sigSize, setSigSize] = useState(150);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  const urlsRef = useRef<{ sig: string | null; dl: string | null; pg: string | null }>({ sig: null, dl: null, pg: null });
  useEffect(() => {
    urlsRef.current = { sig: uploadedSigUrl, dl: downloadUrl, pg: pageImage };
    return () => {
      if (urlsRef.current.sig) URL.revokeObjectURL(urlsRef.current.sig);
      if (urlsRef.current.dl) URL.revokeObjectURL(urlsRef.current.dl);
      if (urlsRef.current.pg) URL.revokeObjectURL(urlsRef.current.pg);
    };
  }, [uploadedSigUrl, downloadUrl, pageImage]);

  // Load PDF and render pages
  useEffect(() => {
    if (files.length === 0) return;
    let cancelled = false;

    const loadPdf = async () => {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setPdfBytes(bytes);

      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      if (cancelled) return;
      setTotalPages(pdf.numPages);
      setPageNum(1);
    };

    loadPdf();
    return () => { cancelled = true; };
  }, [files]);

  // Render current page
  useEffect(() => {
    if (files.length === 0 || pageNum < 1) return;
    let cancelled = false;

    const renderPage = async () => {
      try {
        // @ts-ignore
        const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

        const pdf = await pdfjsLib.getDocument({ data: pdfBytes ?? (await files[0].arrayBuffer()) }).promise;
        const page = await pdf.getPage(pageNum);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport } as any).promise;
        if (!cancelled) setPageImage(canvas.toDataURL());
      } catch (err) {
        console.error("Failed to render page:", err);
      }
    };

    if (pdfBytes) renderPage();
    return () => { cancelled = true; };
  }, [pageNum, pdfBytes, files]);

  // Drawing canvas setup — clear canvas when switching sig mode or color
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [sigMode]);

  const handleDrawStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.strokeStyle = sigColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  }, [sigColor]);

  const handleDrawMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  }, []);

  const handleDrawEnd = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const clearDraw = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleSigUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedSigUrl(url);
  }, []);

  // Get signature as data URL
  const getSigDataUrl = useCallback((): string | null => {
    if (sigMode === "draw") {
      const canvas = drawCanvasRef.current;
      if (!canvas) return null;
      // Check if canvas has content
      const ctx = canvas.getContext("2d")!;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const hasContent = Array.from(data).some((v, i) => i % 4 === 3 && v > 0);
      if (!hasContent) return null;
      return canvas.toDataURL("image/png");
    }
    if (sigMode === "type") {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext("2d")!;
      const font = SIGNATURE_FONTS.find(f => f.id === sigFont);
      ctx.font = `48px ${font?.family ?? "cursive"}`;
      ctx.fillStyle = sigColor;
      ctx.textBaseline = "middle";
      ctx.fillText(sigText, 20, 60);
      return canvas.toDataURL("image/png");
    }
    if (sigMode === "upload" && uploadedSigUrl) {
      return uploadedSigUrl;
    }
    return null;
  }, [sigMode, sigText, sigFont, sigColor, uploadedSigUrl]);

  // Click on page to place signature
  const handlePageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSigPosition({ x, y });
  }, []);

  const handleSign = useCallback(async () => {
    if (!pdfBytes || !sigPosition) return;
    setProcessing(true);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPage(pageNum - 1);
      const { width, height } = page.getSize();

      const sigDataUrl = getSigDataUrl();
      if (!sigDataUrl) {
        setErrorState("Please create a signature first");
        setProcessing(false);
        return;
      }

      const sigBytes = await fetch(sigDataUrl).then(r => r.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigBytes);
      const sigDims = sigImage.scale(1);
      const scale = sigSize / Math.max(sigDims.width, sigDims.height);
      const scaledW = sigDims.width * scale;
      const scaledH = sigDims.height * scale;

      // Map click position (relative to rendered image) to PDF coordinates
      const imgEl = document.querySelector<HTMLImageElement>("[data-page-image]");
      if (imgEl) {
        const imgRect = imgEl.getBoundingClientRect();
        const relX = (sigPosition.x - (imgRect.left - imgRect.width / 2)) / imgRect.width;
        const relY = (sigPosition.y - imgRect.top) / imgRect.height;
        const pdfX = relX * width;
        const pdfY = height - relY * height - scaledH;
        page.drawImage(sigImage, { x: pdfX, y: pdfY, width: scaledW, height: scaledH });
      }

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDone(true);
    } catch (err) {
      console.error("Signing failed:", err);
    } finally {
      setProcessing(false);
    }
  }, [pdfBytes, sigPosition, pageNum, getSigDataUrl, sigSize]);

  const handleReset = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    if (uploadedSigUrl) URL.revokeObjectURL(uploadedSigUrl);
    if (pageImage) URL.revokeObjectURL(pageImage);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setDownloadUrl(null);
    setPageNum(1);
    setTotalPages(0);
    setPageImage(null);
    setSigPosition(null);
    setPdfBytes(null);
    setErrorState(null);
  }, [downloadUrl, uploadedSigUrl, pageImage]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={PenTool}
          title="Sign PDF"
          description="Draw, type, or upload your signature and place it on any PDF page — free, unlimited, and no account needed. Completely private with no watermarks on your signed document."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            files.length === 0 ? (
              <FileUpload
                accept=".pdf"
                files={files}
                onFilesChange={setFiles}
                label="Drop your PDF here"
                description="Upload a PDF to sign — no account needed"
              />
            ) : (
              <div className="space-y-5">
                {/* Page navigation */}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">
                    Page {pageNum} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1} className="btn btn-ghost p-2 disabled:opacity-30">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPageNum(p => Math.min(totalPages, p + 1))} disabled={pageNum >= totalPages} className="btn btn-ghost p-2 disabled:opacity-30">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* PDF page preview - click to place signature */}
                <div
                  className="relative border border-border rounded-lg overflow-hidden bg-surface-1 cursor-crosshair flex justify-center"
                  onClick={handlePageClick}
                  style={{ minHeight: 300 }}
                >
                  {pageImage && (
                    <img
                      src={pageImage}
                      alt={`Page ${pageNum}`}
                      data-page-image
                      className="max-w-full max-h-[500px] object-contain"
                    />
                  )}
                  {sigPosition && pageImage && (
                    <div
                      className="absolute pointer-events-none border-2 border-primary border-dashed rounded bg-primary-muted/20"
                      style={{
                        left: sigPosition.x - sigSize / 2,
                        top: sigPosition.y - sigSize / 4,
                        width: sigSize,
                        height: sigSize / 2,
                      }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-primary font-semibold">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-foreground-muted text-center">Click on the page to place your signature</p>

                {/* Signature creation */}
                <div className="border-t border-border pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground">Create Signature</h4>
                    <div className="flex gap-2">
                      {([["draw", "Draw", Pen], ["type", "Type", Type], ["upload", "Upload", Upload]] as const).map(([id, label, Icon]) => (
                        <button
                          key={id}
                          onClick={() => setSigMode(id as SigMode)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            sigMode === id
                              ? "bg-primary-muted border-primary-border text-primary"
                              : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Draw mode */}
                  {sigMode === "draw" && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-semibold text-foreground">Color</label>
                        <input type="color" value={sigColor} onChange={(e) => setSigColor(e.target.value)} className="w-6 h-6 rounded border border-border cursor-pointer" />
                        <button onClick={clearDraw} className="ml-auto text-xs text-foreground-muted hover:text-danger flex items-center gap-1 transition-colors">
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      </div>
                      <canvas
                        ref={drawCanvasRef}
                        width={400}
                        height={120}
                        className="w-full h-[120px] rounded-lg border border-border bg-white cursor-crosshair touch-none"
                        onMouseDown={handleDrawStart}
                        onMouseMove={handleDrawMove}
                        onMouseUp={handleDrawEnd}
                        onMouseLeave={handleDrawEnd}
                        onTouchStart={handleDrawStart}
                        onTouchMove={handleDrawMove}
                        onTouchEnd={handleDrawEnd}
                      />
                    </div>
                  )}

                  {/* Type mode */}
                  {sigMode === "type" && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={sigText}
                        onChange={(e) => setSigText(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <div className="flex gap-2">
                        {SIGNATURE_FONTS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setSigFont(f.id)}
                            className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                              sigFont === f.id
                                ? "bg-primary-muted border-primary-border text-primary"
                                : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                            }`}
                            style={{ fontFamily: f.family }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                      <div className="p-4 rounded-lg border border-border bg-white">
                        <p
                          className="text-3xl"
                          style={{
                            fontFamily: SIGNATURE_FONTS.find(f => f.id === sigFont)?.family,
                            color: sigColor,
                          }}
                        >
                          {sigText}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload mode */}
                  {sigMode === "upload" && (
                    <div>
                      <input ref={sigInputRef} type="file" accept="image/*" onChange={handleSigUpload} className="hidden" />
                      {!uploadedSigUrl ? (
                        <button
                          onClick={() => sigInputRef.current?.click()}
                          className="w-full p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-surface-1 hover:bg-primary-muted/30 transition-all text-xs text-foreground-secondary hover:text-primary flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" /> Upload signature image
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <img src={uploadedSigUrl} alt="Signature" className="h-16 object-contain bg-white rounded-lg border border-border p-2" />
                          <button onClick={() => setUploadedSigUrl(null)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Signature color + size */}
                  {sigMode !== "upload" && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-foreground">Color</label>
                      <input type="color" value={sigColor} onChange={(e) => setSigColor(e.target.value)} className="w-6 h-6 rounded border border-border cursor-pointer" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Signature Size: {sigSize}px</label>
                    <input type="range" min={80} max={300} value={sigSize} onChange={(e) => setSigSize(parseInt(e.target.value))} className="w-full" />
                  </div>
                </div>

                {errorState && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">{errorState}</div>
                )}

                {/* Action */}
                <div className="flex justify-center gap-3 pt-2">
                  <button onClick={handleSign} disabled={processing || !sigPosition} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing...</> : <><PenTool className="w-5 h-5" /> Sign PDF</>}
                  </button>
                  <button onClick={handleReset} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">PDF Signed Successfully!</h3>
              <p className="text-foreground-secondary mb-6">Your signature has been placed on page {pageNum}.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a href={downloadUrl} download={`signed-${files[0]?.name ?? "document.pdf"}`} className="btn btn-primary inline-flex items-center gap-2">
                    <Download className="w-5 h-5" /> Download Signed PDF
                  </a>
                )}
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2">
                  <RotateCw className="w-5 h-5" /> Sign Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Free & Unlimited</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                No DocuSign account, no 3-document limit. Sign as many PDFs as you want — draw, type, or upload your signature.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Precise Placement</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Click anywhere on any page to place your signature. Adjust size, switch pages, and download — all in your browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
