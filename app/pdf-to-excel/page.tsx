"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Table2,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  FileText,
  RotateCcw,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface OutputFile {
  name: string;
  blob: Blob;
  url: string;
}

export default function PdfToExcelPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [output, setOutput] = useState<OutputFile | null>(null);
  const outputRef = useRef<OutputFile | null>(null);

  useEffect(() => { outputRef.current = output; }, [output]);
  useEffect(() => {
    return () => { if (outputRef.current) URL.revokeObjectURL(outputRef.current.url); };
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
      const XLSX = await import("xlsx");

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

      const wb = XLSX.utils.book_new();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items by Y position to form rows
        const items = textContent.items
          .filter((item: any) => item.str.trim())
          .map((item: any) => ({
            str: item.str.trim(),
            x: Math.round(item.transform[4]),
            y: Math.round(item.transform[5]),
          }))
          .sort((a: any, b: any) => b.y - a.y || a.x - b.x); // top-to-bottom, left-to-right

        // Cluster by Y position (within 5px tolerance)
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let lastY = -Infinity;

        for (const item of items) {
          if (Math.abs(item.y - lastY) > 5 && currentRow.length > 0) {
            rows.push(currentRow);
            currentRow = [];
          }
          currentRow.push(item.str);
          lastY = item.y;
        }
        if (currentRow.length > 0) rows.push(currentRow);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
      }

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
      const result: OutputFile = { name: `${baseName}.xlsx`, blob, url: URL.createObjectURL(blob) };
      setOutput(result); setDone(true);
    } catch (err) {
      console.error("PDF to Excel error:", err);
      addToast("error", "Failed to convert PDF to Excel. Please ensure it's a valid PDF with text content.");
    } finally {
      setProcessing(false);
    }
  }, [files, addToast]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]); setDone(false); setProcessing(false); setOutput(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={Table2} title="PDF to Excel" description="Convert PDF tables to XLSX with smart row grouping — free, client-side, and private. A premium feature elsewhere — completely free here." backHref="/pdf-tools" backLabel="Back to PDF Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept=".pdf" files={files} onFilesChange={setFiles} label="Drop your PDF here" description="or click to browse — PDFs with tables work best" />
              {files.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-surface-2 border border-border animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground-muted leading-relaxed">Works best with text-based PDFs containing tables. Scanned PDFs will have limited accuracy — use PDF OCR first for better results.</p>
                  </div>
                </div>
              )}
              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Converting...</> : <><Table2 className="w-5 h-5" />Convert to Excel</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-success" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Converted to Excel!</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">Your PDF has been converted to an XLSX spreadsheet.</p>
              {output && (
                <div className="max-w-sm mx-auto mb-6">
                  <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0"><Table2 className="w-5 h-5 text-green-500" /></div>
                    <div className="flex-1 min-w-0 text-left"><p className="text-xs font-semibold text-foreground truncate">{output.name}</p><p className="text-xs text-foreground-secondary">{formatSize(output.blob.size)}</p></div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={output?.url} download={output?.name} className="btn btn-primary inline-flex items-center gap-2 text-center"><Download className="w-5 h-5" />Download XLSX</a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center"><RotateCcw className="w-4 h-4" />Convert Another PDF</button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Free & Private</h4><p className="text-foreground-muted text-sm leading-relaxed">Other sites charge for PDF to Excel. We do it free, in your browser, with no uploads.</p></div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Spreadsheet Ready</h4><p className="text-foreground-muted text-sm leading-relaxed">Get a proper .xlsx file with each PDF page as a separate sheet, ready for Excel or Google Sheets.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
