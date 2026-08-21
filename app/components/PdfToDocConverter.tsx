"use client";

import { useState, useCallback } from "react";
import {
  Check, Loader2, Shield, Zap, Download,
  FileText, ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

export type PdfDocFormat = "csv" | "html" | "json" | "markdown" | "xml" | "txt";

function formatOutput(pages: string[], format: PdfDocFormat, filename: string): { content: string; mime: string } {
  const title = filename.replace(/\.pdf$/i, "");
  switch (format) {
    case "csv": {
      const rows = ['"Page","Content"'];
      pages.forEach((text, i) => rows.push(`${i + 1},"${text.replace(/"/g, '""').replace(/\n/g, " ")}"`));
      return { content: rows.join("\n"), mime: "text/csv" };
    }
    case "html": {
      const body = pages.map((text, i) =>
        `<div class="page"><h2>Page ${i + 1}</h2><p>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p></div>`
      ).join("\n");
      return {
        content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}.page{border-bottom:1px solid #eee;margin-bottom:24px;padding-bottom:24px}h2{color:#333}</style></head><body><h1>${title}</h1>${body}</body></html>`,
        mime: "text/html",
      };
    }
    case "json": {
      const obj = { source: filename, pageCount: pages.length, pages: pages.map((text, i) => ({ page: i + 1, text })) };
      return { content: JSON.stringify(obj, null, 2), mime: "application/json" };
    }
    case "markdown": {
      const parts = [`# ${title}\n`];
      pages.forEach((text, i) => parts.push(`## Page ${i + 1}\n\n${text}\n`));
      return { content: parts.join("\n"), mime: "text/markdown" };
    }
    case "xml": {
      const pageNodes = pages.map((text, i) =>
        `  <page number="${i + 1}">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</page>`
      ).join("\n");
      return { content: `<?xml version="1.0" encoding="UTF-8"?>\n<document title="${title}" pages="${pages.length}">\n${pageNodes}\n</document>`, mime: "application/xml" };
    }
    case "txt":
    default:
      return { content: pages.join("\n\n--- Page Break ---\n\n"), mime: "text/plain" };
  }
}

export interface PdfToDocProps {
  toFormat: PdfDocFormat;
  toExt: string;
  title: string;
  description: string;
  faqs: { q: string; a: string }[];
  relatedTools: { name: string; href: string }[];
}

export default function PdfToDocConverter({ toFormat, toExt, title, description, faqs, relatedTools }: PdfToDocProps) {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const total = pdf.numPages;
      setPageCount(total);

      const pageTexts: string[] = [];
      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // @ts-ignore
        const pageText = content.items.map((item) => item.str).join(" ").trim();
        pageTexts.push(pageText);
      }

      const { content, mime } = formatOutput(pageTexts, toFormat, file.name);
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(`${file.name.replace(/\.pdf$/i, "")}.${toExt}`);
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to extract text from PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, toFormat, toExt, addToast]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setDone(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setPageCount(0);
  }, [downloadUrl]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={FileText} title={title} description={description} backHref="/pdf-tools" backLabel="Back to PDF Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept=".pdf" files={files} onFilesChange={setFiles} label="Drop your PDF here" description="or click to browse — PDF files only" />
              {files.length > 0 && (
                <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                  {processing && <p className="text-xs text-foreground-secondary mb-3 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />Extracting text...</p>}
                  <button onClick={handleConvert} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Converting...</> : <><FileText className="w-5 h-5" />Convert to {toExt.toUpperCase()}</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Extraction Complete!</h3>
              <p className="text-foreground-secondary text-sm mb-6">
                {pageCount} page{pageCount !== 1 ? "s" : ""} of text extracted and formatted as {toExt.toUpperCase()}.
              </p>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block mb-6">
                Note: Text extraction preserves content but may not preserve exact formatting or table structure.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a href={downloadUrl} download={downloadName} className="btn btn-primary inline-flex items-center gap-2">
                    <Download className="w-5 h-5" />Download {toExt.toUpperCase()}
                  </a>
                )}
                <button onClick={handleReset} className="btn btn-secondary">Convert Another PDF</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-primary-muted border border-primary-border flex items-center justify-center shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private Text Extraction</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Text is extracted in your browser using pdf.js. Your PDF file is never uploaded to any server. Completely private.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-primary-muted border border-primary-border flex items-center justify-center shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Structured {toExt.toUpperCase()} Output</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Each PDF page is extracted separately and organized into a clean {toExt.toUpperCase()} structure — perfect for data processing or editing.</p>
            </div>
          </div>
        </div>

        {faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-panel rounded-xl border border-border overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-1 transition-colors">
                    <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-foreground-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-foreground-muted shrink-0" />}
                  </button>
                  {openFaq === i && <div className="px-5 pb-4 border-t border-border"><p className="text-sm text-foreground-secondary leading-relaxed pt-3">{faq.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedTools.length > 0 && (
          <div className="mt-8 mb-4">
            <h2 className="text-sm font-bold text-foreground mb-3">Related Converters</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map(t => <Link key={t.href} href={t.href} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary text-xs font-medium transition-colors bg-white">{t.name}<ArrowRight className="w-3 h-3" /></Link>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
