"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Table2,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Plus,
  Trash2,
  Copy,
  Share2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";
import { useToast } from "@/app/components/Toast";

// ─── Table detection from OCR word data ───────────────────────────────────────

interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

function parseTableFromOCR(words: OcrWord[]): string[][] {
  const valid = words.filter((w) => w.text.trim().length > 0);
  if (!valid.length) return [[""]];

  // Adaptive metrics from word geometry
  const avgH  = valid.reduce((s, w) => s + (w.bbox.y1 - w.bbox.y0), 0) / valid.length;
  const avgCW = valid.reduce((s, w) => s + (w.bbox.x1 - w.bbox.x0) / Math.max(1, w.text.length), 0) / valid.length;
  const ROW_THRESH  = avgH  * 0.7;   // words within 70% word-height → same row
  const CELL_THRESH = avgCW * 2.5;   // x-gap > 2.5 char-widths → new cell
  const COL_THRESH  = avgCW * 4.0;   // x-pos within 4 char-widths → same column

  // 1. Sort words by y-center
  const byY = [...valid].sort((a, b) =>
    (a.bbox.y0 + a.bbox.y1) - (b.bbox.y0 + b.bbox.y1)
  );

  // 2. Group into rows
  const rawRows: OcrWord[][] = [];
  let cur: OcrWord[] = [byY[0]];
  let rowMidY = (byY[0].bbox.y0 + byY[0].bbox.y1) / 2;

  for (let i = 1; i < byY.length; i++) {
    const midY = (byY[i].bbox.y0 + byY[i].bbox.y1) / 2;
    if (Math.abs(midY - rowMidY) <= ROW_THRESH) {
      cur.push(byY[i]);
      rowMidY = cur.reduce((s, w) => s + (w.bbox.y0 + w.bbox.y1) / 2, 0) / cur.length;
    } else {
      rawRows.push([...cur].sort((a, b) => a.bbox.x0 - b.bbox.x0));
      cur = [byY[i]];
      rowMidY = midY;
    }
  }
  rawRows.push([...cur].sort((a, b) => a.bbox.x0 - b.bbox.x0));

  // 3. Merge adjacent words into cells (split on large x-gaps)
  type Cell = { text: string; x: number };
  const cellRows: Cell[][] = rawRows.map((row) => {
    const cells: Cell[] = [{ text: row[0].text, x: row[0].bbox.x0 }];
    for (let i = 1; i < row.length; i++) {
      const gap = row[i].bbox.x0 - row[i - 1].bbox.x1;
      if (gap > CELL_THRESH) {
        cells.push({ text: row[i].text, x: row[i].bbox.x0 });
      } else {
        cells[cells.length - 1].text += " " + row[i].text;
      }
    }
    return cells;
  });

  // 4. Cluster x-positions to find column boundaries
  const allX = cellRows.flatMap((r) => r.map((c) => c.x)).sort((a, b) => a - b);
  const colCenters: number[] = [];
  let cs = allX[0], cSum = allX[0], cN = 1;
  for (let i = 1; i < allX.length; i++) {
    if (allX[i] - cs <= COL_THRESH) { cSum += allX[i]; cN++; }
    else { colCenters.push(cSum / cN); cs = allX[i]; cSum = allX[i]; cN = 1; }
  }
  colCenters.push(cSum / cN);

  // 5. Assign each cell to its nearest column
  return cellRows.map((row) => {
    const out = new Array<string>(colCenters.length).fill("");
    for (const cell of row) {
      let best = 0, bestD = Infinity;
      for (let c = 0; c < colCenters.length; c++) {
        const d = Math.abs(cell.x - colCenters[c]);
        if (d < bestD) { bestD = d; best = c; }
      }
      out[best] = out[best] ? `${out[best]} ${cell.text}` : cell.text;
    }
    return out;
  });
}

// Fallback: parse raw text lines if word bbox data isn't available
function parseTableFromText(raw: string): string[][] {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [[""]];
  const rows = lines.map((line) =>
    line.split(/\t|  +/).map((c) => c.trim())
  );
  const maxCols = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => {
    while (r.length < maxCols) r.push("");
    return r;
  });
}

// ─── CSV / Excel helpers ───────────────────────────────────────────────────────

function toCSV(table: string[][]): string {
  return table.map((row) =>
    row.map((cell) => {
      const s = cell.replace(/"/g, '""');
      return /[,"\n\r]/.test(s) ? `"${s}"` : s;
    }).join(",")
  ).join("\r\n");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScreenshotToTablePage() {
  const { addToast } = useToast();
  const [files, setFiles]           = useState<File[]>([]);
  const [step, setStep]             = useState<"upload" | "result">("upload");
  const [table, setTable]           = useState<string[][]>([]);
  const [hasHeader, setHasHeader]   = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress]     = useState<{ label: string; pct: number } | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [origUrl, setOrigUrl]       = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workerRef = useRef<any>(null);
  const origUrlRef = useRef<string | null>(null);

  useEffect(() => {
    origUrlRef.current = origUrl;
    return () => { if (origUrlRef.current) URL.revokeObjectURL(origUrlRef.current); };
  }, [origUrl]);

  useEffect(() => {
    return () => { if (workerRef.current) workerRef.current.terminate(); };
  }, []);

  const handleExtract = useCallback(async () => {
    if (!files.length) return;
    setProcessing(true);
    setError(null);
    setProgress({ label: "Loading OCR engine…", pct: 0 });

    try {
      const file  = files[0];
      const imgUrl = URL.createObjectURL(file);
      setOrigUrl(imgUrl);

      const Tesseract = (await import("tesseract.js")).default;
      const worker = await Tesseract.createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgress({ label: "Reading table…", pct: Math.round(m.progress * 100) });
          } else {
            setProgress({ label: "Loading OCR engine…", pct: Math.round(m.progress * 40) });
          }
        },
      });
      workerRef.current = worker;

      const result = await worker.recognize(imgUrl);
      await worker.terminate();
      workerRef.current = null;

      // Try word-level bbox parsing first, fall back to text parsing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const words: OcrWord[] = (result.data.words as any[]).filter(
        (w: OcrWord) => w.text.trim() && w.bbox
      );

      const parsed = words.length >= 2
        ? parseTableFromOCR(words)
        : parseTableFromText(result.data.text);

      if (!parsed.length || !parsed[0].length) {
        setError("No table content could be detected. Make sure the image contains a clear table.");
        setProcessing(false);
        setProgress(null);
        return;
      }

      setTable(parsed);
      setStep("result");
    } catch (err) {
      console.error(err);
      setError("OCR failed. Please try a clearer image — high-contrast tables work best.");
    } finally {
      setProcessing(false);
      setProgress(null);
    }
  }, [files]);

  // ── Table editing ──────────────────────────────────────────────────────────

  const updateCell = useCallback((r: number, c: number, val: string) => {
    setTable((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
  }, []);

  const addRow = useCallback(() => {
    setTable((prev) => [...prev, new Array(prev[0]?.length ?? 1).fill("")]);
  }, []);

  const deleteRow = useCallback((r: number) => {
    setTable((prev) => prev.length > 1 ? prev.filter((_, i) => i !== r) : prev);
  }, []);

  const addCol = useCallback(() => {
    setTable((prev) => prev.map((row) => [...row, ""]));
  }, []);

  const deleteCol = useCallback((c: number) => {
    setTable((prev) => {
      if ((prev[0]?.length ?? 0) <= 1) return prev;
      return prev.map((row) => row.filter((_, i) => i !== c));
    });
  }, []);

  // ── Exports ────────────────────────────────────────────────────────────────

  const downloadCSV = useCallback(() => {
    const csv = toCSV(table);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `table-${files[0]?.name?.replace(/\.[^.]+$/, "") ?? "data"}.csv`;
    a.click();
  }, [table, files]);

  const downloadExcel = useCallback(async () => {
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.aoa_to_sheet(table);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Table");
      XLSX.writeFile(wb, `table-${files[0]?.name?.replace(/\.[^.]+$/, "") ?? "data"}.xlsx`);
    } catch {
      addToast("error", "Excel export failed.");
    }
  }, [table, files, addToast]);

  const copyCSV = useCallback(() => {
    navigator.clipboard.writeText(toCSV(table));
    addToast("success", "Table copied as CSV!");
  }, [table, addToast]);

  const handleReset = useCallback(() => {
    if (origUrlRef.current) { URL.revokeObjectURL(origUrlRef.current); origUrlRef.current = null; }
    setFiles([]); setStep("upload"); setTable([]); setError(null);
    setOrigUrl(null); setShowOriginal(false);
  }, []);

  const numRows = table.length;
  const numCols = table[0]?.length ?? 0;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Table2}
          title="Screenshot to Editable Table"
          description="Paste a screenshot of any table — reports, PDFs, websites — and get a clean, editable CSV or Excel file in seconds. Powered by client-side OCR. 100% private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8 space-y-5">
        {step === "upload" ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept="image/*"
              files={files}
              onFilesChange={setFiles}
              label="Drop a screenshot or photo of a table"
              description="JPG, PNG, WebP — screenshots work best with high contrast"
            />

            {files.length > 0 && !processing && (
              <div className="mt-8 flex justify-center animate-fade-in-up">
                <button onClick={handleExtract} className="btn btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
                  <Table2 className="w-5 h-5" />
                  Extract Table
                </button>
              </div>
            )}

            {processing && (
              <div className="mt-8 text-center py-10">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-foreground mb-3">{progress?.label}</p>
                {progress && (
                  <div className="w-full max-w-sm mx-auto">
                    <div className="flex justify-between text-xs text-foreground-muted mb-1.5">
                      <span>OCR progress</span>
                      <span>{progress.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2">
                      <div
                        className="h-2 rounded-full bg-primary transition-all duration-200"
                        style={{ width: `${progress.pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>
            )}
          </div>
        ) : (
          <>
            {/* ── Result header ── */}
            <div className="glass-panel rounded-[16px] p-5 sm:p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Stats */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Table extracted</p>
                    <p className="text-xs text-foreground-muted">
                      {numRows} rows × {numCols} columns detected
                    </p>
                  </div>
                </div>

                {/* Export + actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={copyCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-1 text-xs font-semibold text-foreground-secondary hover:bg-surface-2 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy CSV
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-1 text-xs font-semibold text-foreground-secondary hover:bg-surface-2 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    onClick={downloadExcel}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-success/30 bg-success/5 text-xs font-semibold text-success hover:bg-success/10 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Excel (.xlsx)
                  </button>
                  <button
                    onClick={handleReset}
                    className="btn btn-secondary text-xs px-3 py-1.5"
                  >
                    New Image
                  </button>
                </div>
              </div>

              {/* Header toggle + show original */}
              <div className="mt-4 flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-xs text-foreground-secondary font-medium">First row is header</span>
                </label>
                {origUrl && (
                  <button
                    onClick={() => setShowOriginal((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-primary transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {showOriginal ? "Hide" : "Show"} original image
                    {showOriginal ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Original image preview */}
              {showOriginal && origUrl && (
                <div className="mt-4 rounded-xl border border-border overflow-hidden animate-fade-in-up">
                  <div className="bg-surface-1 px-3 py-1.5 text-xs text-foreground-muted border-b border-border">Original image</div>
                  <div className="p-3 bg-surface-2/50 flex justify-center">
                    <img src={origUrl} alt="Original" className="max-h-64 max-w-full rounded-lg" />
                  </div>
                </div>
              )}
            </div>

            {/* ── Editable table ── */}
            <div className="glass-panel rounded-[16px] overflow-hidden">
              <div className="overflow-auto max-h-[60vh]">
                <table className="border-collapse text-sm w-max min-w-full">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      {/* Row-number column header */}
                      <th className="border border-border bg-surface-2 w-8 min-w-[2rem]" />
                      {table[0]?.map((_, ci) => (
                        <th key={ci} className="border border-border bg-surface-2 p-0 min-w-[100px]">
                          <div className="flex items-center justify-between px-1 py-0.5 group">
                            <span className="text-[10px] text-foreground-muted font-normal mx-auto">
                              {String.fromCharCode(65 + ci) /* A, B, C… */}
                            </span>
                            <button
                              onClick={() => deleteCol(ci)}
                              className="text-foreground-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              title="Delete column"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          {/* First-row header cell if hasHeader */}
                          {hasHeader && (
                            <div className="border-t border-border px-1.5 py-1 bg-primary-muted/40">
                              <input
                                value={table[0][ci]}
                                onChange={(e) => updateCell(0, ci, e.target.value)}
                                className="w-full bg-transparent text-xs font-semibold text-foreground text-center focus:outline-none min-w-[80px]"
                                placeholder="Header"
                              />
                            </div>
                          )}
                        </th>
                      ))}
                      {/* Add column button */}
                      <th className="border border-border bg-surface-2 w-8">
                        <button
                          onClick={addCol}
                          className="w-full h-full flex items-center justify-center text-foreground-muted hover:text-primary transition-colors p-1"
                          title="Add column"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.slice(hasHeader ? 1 : 0).map((row, ri) => {
                      const actualRi = hasHeader ? ri + 1 : ri;
                      return (
                        <tr key={actualRi} className="group/row hover:bg-surface-1/50">
                          {/* Row number */}
                          <td className="border border-border bg-surface-1 text-center">
                            <div className="flex items-center justify-center gap-0.5 px-1">
                              <span className="text-[10px] text-foreground-muted w-4 text-center">{ri + 1}</span>
                              <button
                                onClick={() => deleteRow(actualRi)}
                                className="text-foreground-muted hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                title="Delete row"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          {row.map((cell, ci) => (
                            <td key={ci} className="border border-border p-0">
                              <input
                                value={cell}
                                onChange={(e) => updateCell(actualRi, ci, e.target.value)}
                                className="w-full px-2 py-1.5 bg-transparent text-xs text-foreground focus:outline-none focus:bg-primary-muted/20 min-w-[80px]"
                              />
                            </td>
                          ))}
                          <td className="border border-border bg-surface-1 w-8" />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add row button */}
              <button
                onClick={addRow}
                className="w-full px-4 py-2.5 text-xs font-semibold text-foreground-muted hover:text-primary hover:bg-primary-muted/20 transition-all border-t border-border flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add row
              </button>
            </div>

            {/* ── Quick tips ── */}
            <div className="flex items-start gap-2 px-1 text-xs text-foreground-muted">
              <Share2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/50" />
              <span>Click any cell to edit it. Hover a row/column to delete it. All changes export to your downloaded file.</span>
            </div>
          </>
        )}

        {/* ── Info cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Table2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Spatial Column Detection</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">
                Uses word-level bounding boxes from OCR to detect column alignment — not just line-splitting. Works on uneven tables.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">100% Private</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">
                Tesseract OCR runs entirely in your browser via WebAssembly. Your screenshot never leaves your device.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Edit Before Export</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">
                Click any cell to fix OCR errors before downloading. Add rows, delete columns, toggle headers — all in-browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
