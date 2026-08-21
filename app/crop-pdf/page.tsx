"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Crop,
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

export default function CropPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [unit, setUnit] = useState<"pt" | "mm" | "in">("mm");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [output, setOutput] = useState<OutputFile | null>(null);
  const outputRef = useRef<OutputFile | null>(null);

  useEffect(() => { outputRef.current = output; }, [output]);
  useEffect(() => {
    return () => { if (outputRef.current) URL.revokeObjectURL(outputRef.current.url); };
  }, []);

  const toPoints = (val: number): number => {
    if (unit === "pt") return val;
    if (unit === "mm") return val * 2.8346;
    return val * 72; // inches
  };

  const handleFileChange = useCallback(async (newFiles: File[]) => {
    if (outputRef.current) { URL.revokeObjectURL(outputRef.current.url); setOutput(null); }
    setFiles(newFiles); setDone(false);
    if (newFiles.length === 0) { setPageCount(0); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await newFiles[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch { setPageCount(0); }
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await files[0].arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const t = toPoints(top), b = toPoints(bottom), l = toPoints(left), r = toPoints(right);

      for (let i = 0; i < sourcePdf.getPageCount(); i++) {
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
        const { width, height } = copiedPage.getSize();
        copiedPage.setCropBox(l, b, width - l - r, height - t - b);
        newPdf.addPage(copiedPage);
      }

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
      const result: OutputFile = { name: `${baseName}_cropped.pdf`, blob, url: URL.createObjectURL(blob) };
      setOutput(result); setDone(true);
    } catch (err) {
      console.error("Crop error:", err);
      addToast("error", "Failed to crop PDF. Please ensure it's a valid PDF.");
    } finally { setProcessing(false); }
  }, [files, top, bottom, left, right, unit, addToast]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]); setDone(false); setProcessing(false); setPageCount(0);
    setTop(0); setBottom(0); setLeft(0); setRight(0); setOutput(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={Crop} title="Crop PDF" description="Trim PDF page margins and white space — crop top, bottom, left, right in pt, mm, or inches. Free, instant, and completely private." backHref="/pdf-tools" backLabel="Back to PDF Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept=".pdf" files={files} onFilesChange={handleFileChange} label="Drop your PDF here" description="or click to browse — PDF files only" />
              {pageCount > 0 && (
                <div className="mt-8 animate-fade-in-up space-y-6">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-muted border border-primary-border">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">{pageCount} page{pageCount !== 1 ? "s" : ""}</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Info className="w-5 h-5 text-primary" />Crop Margins</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs text-foreground-secondary">Unit:</span>
                      {(["pt", "mm", "in"] as const).map((u) => (
                        <button key={u} onClick={() => setUnit(u)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${unit === u ? "bg-primary text-white" : "border border-border text-foreground hover:border-primary-border"}`}>{u}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">Top</label><input type="number" min={0} step={unit === "in" ? 0.1 : 1} value={top} onChange={(e) => setTop(Math.max(0, parseFloat(e.target.value) || 0))} className={inputClass} /></div>
                      <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">Bottom</label><input type="number" min={0} step={unit === "in" ? 0.1 : 1} value={bottom} onChange={(e) => setBottom(Math.max(0, parseFloat(e.target.value) || 0))} className={inputClass} /></div>
                      <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">Left</label><input type="number" min={0} step={unit === "in" ? 0.1 : 1} value={left} onChange={(e) => setLeft(Math.max(0, parseFloat(e.target.value) || 0))} className={inputClass} /></div>
                      <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">Right</label><input type="number" min={0} step={unit === "in" ? 0.1 : 1} value={right} onChange={(e) => setRight(Math.max(0, parseFloat(e.target.value) || 0))} className={inputClass} /></div>
                    </div>
                  </div>
                </div>
              )}
              {pageCount > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Cropping...</> : <><Crop className="w-5 h-5" />Crop PDF</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-success" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">PDF Cropped!</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">Margins have been trimmed from your PDF.</p>
              {output && (
                <div className="max-w-sm mx-auto mb-6">
                  <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-purple-500" /></div>
                    <div className="flex-1 min-w-0 text-left"><p className="text-xs font-semibold text-foreground truncate">{output.name}</p><p className="text-xs text-foreground-secondary">{formatSize(output.blob.size)}</p></div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={output?.url} download={output?.name} className="btn btn-primary inline-flex items-center gap-2 text-center"><Download className="w-5 h-5" />Download</a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center"><RotateCcw className="w-4 h-4" />Crop Another PDF</button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4><p className="text-foreground-muted text-sm leading-relaxed">Cropping happens entirely in your browser. Your PDF is never uploaded.</p></div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Precise Control</h4><p className="text-foreground-muted text-sm leading-relaxed">Set exact margin values in points, millimeters, or inches for pixel-perfect cropping.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
