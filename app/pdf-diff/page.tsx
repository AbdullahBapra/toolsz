"use client";

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/app/components/Toast";
import {
  GitCompare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  Zap,
  RotateCcw as ResetIcon,
  FileText,
  ArrowLeftRight,
  Plus,
  Minus,
  Equal,
  Info,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface DiffLine {
  type: "same" | "added" | "removed";
  left: string;
  right: string;
  lineNum: number;
}

// Simple line-by-line diff using LCS-inspired approach
function computeDiff(leftLines: string[], rightLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];

  // Simple approach: align by line number, mark differences
  // For a proper diff we'd use Myers' algorithm, but LCS is sufficient for readability
  let li = 0;
  let ri = 0;

  // Build a simple map of right lines for matching
  const rightMap = new Map<string, number[]>();
  rightLines.forEach((line, idx) => {
    const key = line.trim();
    if (!rightMap.has(key)) rightMap.set(key, []);
    rightMap.get(key)!.push(idx);
  });

  const leftUsed = new Set<number>();
  const rightUsed = new Set<number>();

  // Find matching lines (greedy, in order)
  const matches: { left: number; right: number }[] = [];
  let lastRightIdx = -1;
  for (let i = 0; i < leftLines.length; i++) {
    const key = leftLines[i].trim();
    const candidates = rightMap.get(key);
    if (candidates) {
      const matchIdx = candidates.find((c) => c > lastRightIdx && !rightUsed.has(c));
      if (matchIdx !== undefined) {
        matches.push({ left: i, right: matchIdx });
        leftUsed.add(i);
        rightUsed.add(matchIdx);
        lastRightIdx = matchIdx;
      }
    }
  }

  // Build diff output from matches
  let prevLeft = 0;
  let prevRight = 0;

  for (const match of matches) {
    // Emit removed lines (left only) between prevLeft and match.left
    while (prevLeft < match.left) {
      if (!leftUsed.has(prevLeft)) {
        result.push({ type: "removed", left: leftLines[prevLeft], right: "", lineNum: prevLeft + 1 });
      }
      prevLeft++;
    }
    // Emit added lines (right only) between prevRight and match.right
    while (prevRight < match.right) {
      if (!rightUsed.has(prevRight)) {
        result.push({ type: "added", left: "", right: rightLines[prevRight], lineNum: prevRight + 1 });
      }
      prevRight++;
    }
    // Emit the matching line
    result.push({ type: "same", left: leftLines[match.left], right: rightLines[match.right], lineNum: match.left + 1 });
    prevLeft = match.left + 1;
    prevRight = match.right + 1;
  }

  // Remaining left lines
  while (prevLeft < leftLines.length) {
    if (!leftUsed.has(prevLeft)) {
      result.push({ type: "removed", left: leftLines[prevLeft], right: "", lineNum: prevLeft + 1 });
    }
    prevLeft++;
  }
  // Remaining right lines
  while (prevRight < rightLines.length) {
    if (!rightUsed.has(prevRight)) {
      result.push({ type: "added", left: "", right: rightLines[prevRight], lineNum: prevRight + 1 });
    }
    prevRight++;
  }

  return result;
}

type ViewMode = "side-by-side" | "unified";

export default function PdfDiffPage() {
  const { addToast } = useToast();
  const [leftFile, setLeftFile] = useState<File[]>([]);
  const [rightFile, setRightFile] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  // Extracted text
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);

  // Page navigation
  const [leftPages, setLeftPages] = useState(0);
  const [rightPages, setRightPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");

  // Rendered canvases
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  // Cache loaded PDF documents for efficient page navigation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leftPdfRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rightPdfRef = useRef<any>(null);

  // Stats
  const addedCount = diffLines.filter((d) => d.type === "added").length;
  const removedCount = diffLines.filter((d) => d.type === "removed").length;
  const sameCount = diffLines.filter((d) => d.type === "same").length;

  const renderPdfPage = useCallback(async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDoc: any,
    pageNum: number,
    canvas: HTMLCanvasElement | null
  ) => {
    if (!canvas || !pdfDoc) return;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.2 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }, []);

  const handleProcess = useCallback(async () => {
    if (leftFile.length === 0 || rightFile.length === 0) return;
    setProcessing(true);
    setDone(false);

    try {
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(
        /* webpackIgnore: true */ "/pdfjs-viewer.min.mjs"
      );
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
      // Load left PDF
      const leftBuffer = await leftFile[0].arrayBuffer();
      const leftPdf = await pdfjsLib.getDocument({ data: new Uint8Array(leftBuffer) }).promise;
      const leftPageCount = leftPdf.numPages;
      setLeftPages(leftPageCount);

      // Load right PDF
      const rightBuffer = await rightFile[0].arrayBuffer();
      const rightPdf = await pdfjsLib.getDocument({ data: new Uint8Array(rightBuffer) }).promise;
      const rightPageCount = rightPdf.numPages;
      setRightPages(rightPageCount);

      // Extract text from all pages
      let leftFullText = "";
      for (let i = 1; i <= leftPageCount; i++) {
        const page = await leftPdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.str)
          .join(" ");
        leftFullText += pageText + "\n";
      }

      let rightFullText = "";
      for (let i = 1; i <= rightPageCount; i++) {
        const page = await rightPdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.str)
          .join(" ");
        rightFullText += pageText + "\n";
      }

      setLeftText(leftFullText);
      setRightText(rightFullText);

      // Compute diff
      const leftLines = leftFullText.split("\n");
      const rightLines = rightFullText.split("\n");
      const diff = computeDiff(leftLines, rightLines);
      setDiffLines(diff);

      // Cache PDF documents for page navigation
      leftPdfRef.current = leftPdf;
      rightPdfRef.current = rightPdf;

      // Render first page of each
      setCurrentPage(1);
      setTimeout(() => {
        renderPdfPage(leftPdf, 1, leftCanvasRef.current);
        renderPdfPage(rightPdf, 1, rightCanvasRef.current);
      }, 100);

      setDone(true);
    } catch (err) {
      console.error("PDF diff error:", err);
      addToast("error", "Failed to process PDFs. Make sure both files are valid PDFs.");
    } finally {
      setProcessing(false);
    }
  }, [leftFile, rightFile, renderPdfPage, addToast]);

  const handlePageChange = useCallback(
    async (delta: number) => {
      const newPage = currentPage + delta;
      const maxPage = Math.max(leftPages, rightPages);
      if (newPage < 1 || newPage > maxPage) return;
      setCurrentPage(newPage);

      // Re-render pages using cached PDF documents
      try {
        if (newPage <= leftPages && leftPdfRef.current) {
          await renderPdfPage(leftPdfRef.current, newPage, leftCanvasRef.current);
        }
        if (newPage <= rightPages && rightPdfRef.current) {
          await renderPdfPage(rightPdfRef.current, newPage, rightCanvasRef.current);
        }
      } catch (err) {
        console.error("Page render error:", err);
      }
    },
    [currentPage, leftPages, rightPages, renderPdfPage]
  );

  const handleReset = useCallback(() => {
    leftPdfRef.current = null;
    rightPdfRef.current = null;
    setLeftFile([]);
    setRightFile([]);
    setProcessing(false);
    setDone(false);
    setLeftText("");
    setRightText("");
    setDiffLines([]);
    setLeftPages(0);
    setRightPages(0);
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={GitCompare}
          title="PDF Diff"
          description="Compare two PDFs side by side with visual and line-by-line text diff highlighting — free and private. Spot every change instantly without uploading files to any server."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            {/* Two upload areas side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  Original PDF (Older Version)
                </h3>
                <FileUpload
                  accept=".pdf"
                  files={leftFile}
                  onFilesChange={setLeftFile}
                  label="Drop original PDF here"
                  description="or click to browse — the older version"
                />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-500" />
                  Modified PDF (Newer Version)
                </h3>
                <FileUpload
                  accept=".pdf"
                  files={rightFile}
                  onFilesChange={setRightFile}
                  label="Drop modified PDF here"
                  description="or click to browse — the newer version"
                />
              </div>
            </div>

            {leftFile.length > 0 && rightFile.length > 0 && (
              <div className="mt-6 flex flex-col items-center animate-fade-in-up">
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Comparing PDFs...
                    </>
                  ) : (
                    <>
                      <GitCompare className="w-5 h-5" />
                      Compare PDFs
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {/* Stats bar */}
            <div className="glass-panel rounded-[16px] p-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                <Plus className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">{addedCount} added</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                <Minus className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-700">{removedCount} removed</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
                <Equal className="w-4 h-4 text-foreground-secondary" />
                <span className="text-xs font-semibold text-foreground-secondary">{sameCount} unchanged</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("side-by-side")}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    viewMode === "side-by-side"
                      ? "bg-primary-muted border-primary-border text-primary"
                      : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                  }`}
                >
                  Side by Side
                </button>
                <button
                  onClick={() => setViewMode("unified")}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    viewMode === "unified"
                      ? "bg-primary-muted border-primary-border text-primary"
                      : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                  }`}
                >
                  Unified
                </button>
              </div>
            </div>

            {/* Visual comparison - PDF page render */}
            <div className="glass-panel rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-primary" />
                  Visual Comparison — Page {currentPage} of {Math.max(leftPages, rightPages)}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(-1)}
                    disabled={currentPage <= 1}
                    className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center hover:bg-surface-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-foreground px-2">
                    {currentPage} / {Math.max(leftPages, rightPages)}
                  </span>
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage >= Math.max(leftPages, rightPages)}
                    className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center hover:bg-surface-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-red-500 font-semibold mb-2">Original</span>
                  <div className="border border-border rounded-lg overflow-auto max-h-[500px] bg-white">
                    <canvas ref={leftCanvasRef} className="max-w-full h-auto" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-green-500 font-semibold mb-2">Modified</span>
                  <div className="border border-border rounded-lg overflow-auto max-h-[500px] bg-white">
                    <canvas ref={rightCanvasRef} className="max-w-full h-auto" />
                  </div>
                </div>
              </div>
            </div>

            {/* Text diff */}
            <div className="glass-panel rounded-[16px] p-5">
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-primary" />
                Text Diff
              </h3>

              {viewMode === "side-by-side" ? (
                <div className="grid grid-cols-2 gap-0 overflow-x-auto border border-border rounded-xl">
                  <div className="border-r border-border">
                    <div className="bg-red-50 px-3 py-2 border-b border-border">
                      <span className="text-xs font-semibold text-red-700">Original</span>
                    </div>
                    <div className="font-mono text-xs leading-6 max-h-96 overflow-y-auto">
                      {diffLines.map((line, i) => (
                        <div
                          key={i}
                          className={`px-3 whitespace-pre-wrap break-all ${
                            line.type === "removed"
                              ? "bg-red-50 text-red-800"
                              : line.type === "same"
                              ? "text-foreground-secondary"
                              : "bg-surface-1 text-foreground-muted"
                          }`}
                        >
                          {line.type === "removed" && (
                            <Minus className="w-3 h-3 inline-block mr-1 text-red-500" />
                          )}
                          {line.type === "same" && "  "}
                          {line.type === "added" && "  "}
                          {line.left || "\u00A0"}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="bg-green-50 px-3 py-2 border-b border-border">
                      <span className="text-xs font-semibold text-green-700">Modified</span>
                    </div>
                    <div className="font-mono text-xs leading-6 max-h-96 overflow-y-auto">
                      {diffLines.map((line, i) => (
                        <div
                          key={i}
                          className={`px-3 whitespace-pre-wrap break-all ${
                            line.type === "added"
                              ? "bg-green-50 text-green-800"
                              : line.type === "same"
                              ? "text-foreground-secondary"
                              : "bg-surface-1 text-foreground-muted"
                          }`}
                        >
                          {line.type === "added" && (
                            <Plus className="w-3 h-3 inline-block mr-1 text-green-500" />
                          )}
                          {line.type === "same" && "  "}
                          {line.type === "removed" && "  "}
                          {line.right || "\u00A0"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-x-auto">
                  <div className="font-mono text-xs leading-6 max-h-96 overflow-y-auto">
                    {diffLines.map((line, i) => (
                      <div
                        key={i}
                        className={`px-3 whitespace-pre-wrap break-all ${
                          line.type === "added"
                            ? "bg-green-50 text-green-800"
                            : line.type === "removed"
                            ? "bg-red-50 text-red-800"
                            : "text-foreground-secondary"
                        }`}
                      >
                        {line.type === "added" && (
                          <Plus className="w-3 h-3 inline-block mr-1 text-green-500" />
                        )}
                        {line.type === "removed" && (
                          <Minus className="w-3 h-3 inline-block mr-1 text-red-500" />
                        )}
                        {line.type === "same" && (
                          <Equal className="w-3 h-3 inline-block mr-1 text-foreground-muted" />
                        )}
                        {line.type === "added" ? line.right : line.left}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleReset}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <ResetIcon className="w-4 h-4" /> Compare Different PDFs
              </button>
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
                100% Private Comparison
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Both PDFs are processed entirely in your browser. No files are
                uploaded to any server. Perfect for comparing sensitive legal or
                business documents.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Visual + Text Diff
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                See side-by-side page renders for visual comparison, plus a
                line-by-line text diff highlighting exactly what changed between
                versions. Ideal for contract review and version tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-amber-800 mb-1">
              Tips for best results
            </h4>
            <ul className="text-xs text-amber-700 leading-relaxed space-y-1">
              <li>
                <strong>Text-based PDFs</strong> work best. Scanned PDFs (images)
                may not have extractable text for the diff view.
              </li>
              <li>
                <strong>Visual comparison</strong> shows the actual rendered pages
                side by side — useful for catching layout changes even if text is
                identical.
              </li>
              <li>
                The diff algorithm matches lines by content, so reordered
                paragraphs will show as additions and removals.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
