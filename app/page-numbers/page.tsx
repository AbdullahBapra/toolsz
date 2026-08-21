"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ListOrdered,
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

type Position = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
type Format = "1" | "Page 1" | "1 of N" | "Page 1 of N" | "- 1 -" | "1/N";

interface OutputFile {
  name: string;
  blob: Blob;
  url: string;
}

const positionOptions: { id: Position; label: string }[] = [
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-right", label: "Bottom Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "top-center", label: "Top Center" },
  { id: "top-right", label: "Top Right" },
  { id: "top-left", label: "Top Left" },
];

const formatOptions: { id: Format; example: string }[] = [
  { id: "1", example: "1" },
  { id: "Page 1", example: "Page 1" },
  { id: "1 of N", example: "1 of 10" },
  { id: "Page 1 of N", example: "Page 1 of 10" },
  { id: "- 1 -", example: "- 1 -" },
  { id: "1/N", example: "1/10" },
];

export default function PageNumbersPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<Format>("1 of N");
  const [fontSize, setFontSize] = useState(12);
  const [startPage, setStartPage] = useState(1);
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
    if (newFiles.length === 0) { setPageCount(0); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await newFiles[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch { setPageCount(0); }
  }, []);

  const formatPageNum = (num: number, total: number): string => {
    switch (format) {
      case "1": return `${num}`;
      case "Page 1": return `Page ${num}`;
      case "1 of N": return `${num} of ${total}`;
      case "Page 1 of N": return `Page ${num} of ${total}`;
      case "- 1 -": return `- ${num} -`;
      case "1/N": return `${num}/${total}`;
    }
  };

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const total = pdf.getPageCount();

      for (let i = startPage - 1; i < total; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        const text = formatPageNum(i + 1, total);
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const margin = 30;
        let x: number, y: number;

        if (position.startsWith("bottom")) y = margin;
        else y = height - margin;

        if (position.endsWith("center")) x = (width - textWidth) / 2;
        else if (position.endsWith("right")) x = width - textWidth - margin;
        else x = margin;

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
      const result: OutputFile = { name: `${baseName}_numbered.pdf`, blob, url: URL.createObjectURL(blob) };
      setOutput(result);
      setDone(true);
    } catch (err) {
      console.error("Page numbers error:", err);
      addToast("error", "Failed to add page numbers. Please ensure it's a valid PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, position, format, fontSize, startPage, addToast]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]); setDone(false); setProcessing(false); setPageCount(0); setOutput(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={ListOrdered} title="Add Page Numbers" description="Insert page numbers in any position and format — bottom-center, top-right, or custom start page. Free, instant, and completely private." backHref="/pdf-tools" backLabel="Back to PDF Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept=".pdf" files={files} onFilesChange={handleFileChange} label="Drop your PDF here" description="or click to browse — PDF files only" />
              {pageCount > 0 && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-muted border border-primary-border animate-fade-in-up">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">{pageCount} page{pageCount !== 1 ? "s" : ""} detected</span>
                </div>
              )}
              {pageCount > 0 && (
                <div className="mt-8 animate-fade-in-up space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Info className="w-5 h-5 text-primary" />Position</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {positionOptions.map((opt) => (
                        <button key={opt.id} onClick={() => setPosition(opt.id)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${position === opt.id ? "bg-primary text-white border-primary" : "border border-border text-foreground hover:border-primary-border"}`}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-3">Format</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {formatOptions.map((opt) => (
                        <button key={opt.id} onClick={() => setFormat(opt.id)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${format === opt.id ? "bg-primary text-white border-primary" : "border border-border text-foreground hover:border-primary-border"}`}>{opt.example}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground-secondary mb-2 block">Font Size</label>
                      <input type="number" min={8} max={24} value={fontSize} onChange={(e) => setFontSize(Math.max(8, Math.min(24, parseInt(e.target.value) || 12)))} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground-secondary mb-2 block">Start from Page</label>
                      <input type="number" min={1} max={pageCount} value={startPage} onChange={(e) => setStartPage(Math.max(1, Math.min(pageCount, parseInt(e.target.value) || 1)))} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                    </div>
                  </div>
                </div>
              )}
              {pageCount > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Adding Numbers...</> : <><ListOrdered className="w-5 h-5" />Add Page Numbers</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-success" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Page Numbers Added!</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">Your PDF now has page numbers on every page.</p>
              {output && (
                <div className="max-w-sm mx-auto mb-6">
                  <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-purple-500" /></div>
                    <div className="flex-1 min-w-0 text-left"><p className="text-xs font-semibold text-foreground truncate">{output.name}</p><p className="text-xs text-foreground-secondary">{formatSize(output.blob.size)}</p></div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={output?.url} download={output?.name} className="btn btn-primary inline-flex items-center gap-2 text-center"><Download className="w-5 h-5" />Download PDF</a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center"><RotateCcw className="w-4 h-4" />Add Numbers to Another PDF</button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4><p className="text-foreground-muted text-sm leading-relaxed">Page numbers are added entirely in your browser. Your PDF never leaves your device.</p></div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Customizable</h4><p className="text-foreground-muted text-sm leading-relaxed">Choose position, format, font size, and which page to start numbering from.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
