"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ScanSearch,
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

export default function PdfOcrPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [output, setOutput] = useState<OutputFile | null>(null);
  const [textPreview, setTextPreview] = useState("");
  const outputRef = useRef<OutputFile | null>(null);

  useEffect(() => { outputRef.current = output; }, [output]);
  useEffect(() => {
    return () => { if (outputRef.current) URL.revokeObjectURL(outputRef.current.url); };
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true); setProgress(0);

    try {
      const Tesseract = await import("tesseract.js");
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const newPdf = await PDFDocument.create();
      const font = await newPdf.embedFont(StandardFonts.Helvetica);
      let allText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;

        const result = await Tesseract.recognize(canvas, "eng", {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(((i - 1 + m.progress) / pdf.numPages) * 100));
            }
          },
        });

        const text = result.data.text || "";
        allText += text;

        // Render original page image into new PDF
        const imgBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
        if (imgBlob) {
          const imgBytes = await imgBlob.arrayBuffer();
          const jpgImage = await newPdf.embedJpg(imgBytes);
          const origViewport = page.getViewport({ scale: 1.0 });
          const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
          newPage.drawImage(jpgImage, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });

          // Add invisible text layer for searchability
          const lines = text.split("\n").filter((l: string) => l.trim());
          const fontSize = 2;
          const lineHeight = fontSize * 1.2;
          let yPos = origViewport.height - 10;
          for (const line of lines) {
            if (yPos < 10) break;
            try {
              newPage.drawText(line.substring(0, 200), {
                x: 10, y: yPos, size: fontSize, font,
                color: rgb(1, 1, 1), // white = invisible on white bg
                opacity: 0.01,
              });
            } catch { /* skip lines with chars not in Helvetica */ }
            yPos -= lineHeight;
          }
        }
      }

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
      const result: OutputFile = { name: `${baseName}_searchable.pdf`, blob, url: URL.createObjectURL(blob) };
      setOutput(result);
      setTextPreview(allText.substring(0, 2000));
      setDone(true);
    } catch (err) {
      console.error("OCR error:", err);
      addToast("error", "Failed to OCR PDF. Please try a valid scanned PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, addToast]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]); setDone(false); setProcessing(false); setProgress(0); setOutput(null); setTextPreview("");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={ScanSearch} title="PDF OCR" description="Make scanned PDFs searchable by adding an invisible text layer using Tesseract OCR. A premium feature elsewhere — completely free here. No signup, 100% client-side." backHref="/pdf-tools" backLabel="Back to PDF Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept=".pdf" files={files} onFilesChange={setFiles} label="Drop your scanned PDF here" description="or click to browse — works best with scanned/image PDFs" />
              {files.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-surface-2 border border-border animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground-muted leading-relaxed">OCR runs Tesseract.js in your browser. Large PDFs may take a few minutes. The output preserves the original pages and adds an invisible text layer for searchability.</p>
                  </div>
                </div>
              )}
              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />OCR Processing... {progress}%</> : <><ScanSearch className="w-5 h-5" />Run OCR</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-success" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">PDF is Now Searchable!</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">An invisible text layer has been added. You can now search and copy text from the PDF.</p>
              {output && (
                <div className="max-w-sm mx-auto mb-4">
                  <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-purple-500" /></div>
                    <div className="flex-1 min-w-0 text-left"><p className="text-xs font-semibold text-foreground truncate">{output.name}</p><p className="text-xs text-foreground-secondary">{formatSize(output.blob.size)}</p></div>
                  </div>
                </div>
              )}
              {textPreview && (
                <div className="max-w-lg mx-auto mb-6 p-4 rounded-xl bg-surface-2 border border-border text-left">
                  <p className="text-xs font-semibold text-foreground mb-2">Extracted Text Preview:</p>
                  <p className="text-xs text-foreground-muted leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto">{textPreview}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={output?.url} download={output?.name} className="btn btn-primary inline-flex items-center gap-2 text-center"><Download className="w-5 h-5" />Download Searchable PDF</a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center"><RotateCcw className="w-4 h-4" />OCR Another PDF</button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4><p className="text-foreground-muted text-sm leading-relaxed">OCR runs entirely in your browser using Tesseract.js. Your scanned documents never leave your device.</p></div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Searchable Output</h4><p className="text-foreground-muted text-sm leading-relaxed">Adds an invisible text layer over scanned pages so you can search, select, and copy text in any PDF reader.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
