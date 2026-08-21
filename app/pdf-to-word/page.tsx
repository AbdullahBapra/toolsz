"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  FileDown,
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

export default function PdfToWordPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [output, setOutput] = useState<OutputFile | null>(null);
  const [usedClientFallback, setUsedClientFallback] = useState(false);
  const outputRef = useRef<OutputFile | null>(null);

  useEffect(() => { outputRef.current = output; }, [output]);
  useEffect(() => {
    return () => { if (outputRef.current) URL.revokeObjectURL(outputRef.current.url); };
  }, []);

  // Real layout-preserving conversion (paragraphs, tables, images, basic
  // columns) via a server-side Python function using pdf2docx — genuinely
  // reconstructs PDF structure instead of guessing from text positions.
  // This is the primary path; the PDF is sent to our server for this one
  // step (processed transiently, not stored) and never otherwise.
  const convertViaServer = useCallback(async (file: File): Promise<Blob> => {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/pdf-to-docx", { method: "POST", body });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || "Server-side conversion failed");
    }
    return await res.blob();
  }, []);

  // Fallback only: basic client-side text extraction if the server path is
  // unavailable for any reason. No layout, tables, or images — just readable
  // text with correct line breaks, font sizing, and best-effort bold/italic.
  const convertViaClient = useCallback(async (file: File): Promise<Blob> => {
    // @ts-ignore
    const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

      interface Line {
        text: string;
        fontSize: number;
        bold: boolean;
        italic: boolean;
      }

      // Extract text from each page, reconstructing real lines and basic
      // formatting instead of treating every text fragment as its own
      // paragraph (which is what made output an unreadable flat wall of text).
      const pages: Line[][] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        interface RawItem { str: string; x: number; y: number; fontSize: number; fontName: string }
        const rawItems: RawItem[] = (textContent.items as any[])
          .filter((it) => it.str && it.str.trim())
          .map((it) => {
            const t: number[] = it.transform;
            // Font size = length of the transformed unit x-vector (standard
            // pdf.js convention) — the transform matrix scales/positions each
            // glyph run; t[0]/t[1] give horizontal scale+skew.
            const fontSize = Math.hypot(t[0], t[1]) || 10;
            return { str: it.str, x: t[4], y: t[5], fontSize, fontName: it.fontName || "" };
          });

        // Group fragments into lines by vertical proximity. PDF y-coordinates
        // grow upward, so sort descending; tolerance scales with font size so
        // large headings and tiny footnotes both group correctly.
        rawItems.sort((a, b) => b.y - a.y || a.x - b.x);
        const rows: RawItem[][] = [];
        for (const item of rawItems) {
          const currentRow = rows[rows.length - 1];
          const tolerance = Math.max(2, item.fontSize * 0.35);
          if (currentRow && Math.abs(currentRow[0].y - item.y) <= tolerance) {
            currentRow.push(item);
          } else {
            rows.push([item]);
          }
        }

        const lines: Line[] = rows.map((row) => {
          row.sort((a, b) => a.x - b.x);
          const text = row.map((it) => it.str).join(" ").replace(/\s+/g, " ").trim();
          const fontSize = row.reduce((sum, it) => sum + it.fontSize, 0) / row.length;
          // pdf.js fontName is often an internal subset id (e.g. "g_d0_f1"),
          // not always the real PostScript name, so this is best-effort —
          // it catches it when the name IS preserved (common for
          // non-subsetted fonts), and just quietly misses it otherwise.
          const bold = row.some((it) => /bold|black|heavy/i.test(it.fontName));
          const italic = row.some((it) => /italic|oblique/i.test(it.fontName));
          return { text, fontSize, bold, italic };
        }).filter((l) => l.text);

        pages.push(lines);
        setProgress(Math.round((i / pdf.numPages) * 50));
      }

      // Build DOCX
      const docx = await import("docx");
      // docx sizes are in half-points; clamp to a sane range so a
      // mis-detected huge/tiny fontSize can't produce a broken document.
      const toDocxSize = (pt: number) => Math.round(Math.min(48, Math.max(8, pt)) * 2);

      const paragraphs = pages.flatMap((lines, pageIdx) => [
        new docx.Paragraph({
          children: [new docx.TextRun({ text: `Page ${pageIdx + 1}`, bold: true, size: 20, color: "999999" })],
          spacing: { before: pageIdx === 0 ? 0 : 400, after: 200 },
        }),
        ...lines.map((line) =>
          new docx.Paragraph({
            children: [new docx.TextRun({
              text: line.text,
              size: toDocxSize(line.fontSize),
              bold: line.bold,
              italics: line.italic,
            })],
            spacing: { after: 80 },
          })
        ),
      ]);

      const doc = new docx.Document({
        sections: [{ properties: {}, children: paragraphs }],
      });

      return await docx.Packer.toBlob(doc);
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true); setProgress(20); setUsedClientFallback(false);
    const file = files[0];

    try {
      let blob: Blob;
      try {
        blob = await convertViaServer(file);
        setProgress(90);
      } catch (serverErr) {
        console.warn("Server-side PDF-to-Word conversion failed, falling back to basic client-side extraction:", serverErr);
        setUsedClientFallback(true);
        setProgress(20);
        blob = await convertViaClient(file);
      }

      const baseName = file.name.replace(/\.pdf$/i, "");
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
      const result: OutputFile = { name: `${baseName}.docx`, blob, url: URL.createObjectURL(blob) };
      setOutput(result); setDone(true);
      setProgress(100);
    } catch (err) {
      console.error("PDF to Word error:", err);
      addToast("error", "Failed to convert PDF to Word. Please ensure it's a valid PDF with text content.");
    } finally {
      setProcessing(false);
    }
  }, [files, addToast, convertViaServer, convertViaClient]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]); setDone(false); setProcessing(false); setProgress(0); setOutput(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={FileDown} title="PDF to Word" description="Convert PDF to editable DOCX with real layout — paragraphs, tables, and images preserved, not just plain text. A premium feature elsewhere — completely free here." backHref="/pdf-tools" backLabel="Back to PDF Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept=".pdf" files={files} onFilesChange={setFiles} label="Drop your PDF here" description="or click to browse — text-based PDFs work best" />
              {files.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-surface-2 border border-border animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground-muted leading-relaxed">Best results with text-based PDFs. Scanned/image PDFs will have limited text extraction. For scanned PDFs, use the PDF OCR tool first.</p>
                  </div>
                </div>
              )}
              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Converting... {progress}%</> : <><FileDown className="w-5 h-5" />Convert to Word</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-success" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Converted to Word!</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                {usedClientFallback
                  ? "Basic text extraction was used as a fallback — layout, tables, and images were not preserved. Please report this if it keeps happening."
                  : "Your PDF has been converted to a DOCX file with layout, tables, and images preserved."}
              </p>
              {output && (
                <div className="max-w-sm mx-auto mb-6">
                  <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-blue-500" /></div>
                    <div className="flex-1 min-w-0 text-left"><p className="text-xs font-semibold text-foreground truncate">{output.name}</p><p className="text-xs text-foreground-secondary">{formatSize(output.blob.size)}</p></div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={output?.url} download={output?.name} className="btn btn-primary inline-flex items-center gap-2 text-center"><Download className="w-5 h-5" />Download DOCX</a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center"><RotateCcw className="w-4 h-4" />Convert Another PDF</button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Free & Not Stored</h4><p className="text-foreground-muted text-sm leading-relaxed">Other sites charge for real layout-preserving PDF to Word. We do it free — your file is processed to build the DOCX and never saved.</p></div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Real Layout Preserved</h4><p className="text-foreground-muted text-sm leading-relaxed">Paragraphs, tables, and images are reconstructed — not just plain text — so the result actually looks like your PDF.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
