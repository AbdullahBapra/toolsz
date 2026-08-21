"use client";

import { useState, useCallback } from "react";
import {
  Check, Loader2, Shield, Zap, Download,
  FileText, ChevronDown, ChevronUp, ArrowRight, FileArchive, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

const SCALES = [
  { id: "low", label: "Normal (72 DPI)", scale: 1.0 },
  { id: "medium", label: "Good (150 DPI)", scale: 2.0 },
  { id: "high", label: "Excellent (300 DPI)", scale: 4.0 },
] as const;

export interface PdfToImageProps {
  toMime: string;
  toExt: string;
  isAnimatedGif?: boolean;
  notBrowserNative?: string;
  title: string;
  description: string;
  faqs: { q: string; a: string }[];
  relatedTools: { name: string; href: string }[];
}

export default function PdfToImageConverter({
  toMime, toExt, isAnimatedGif, notBrowserNative,
  title, description, faqs, relatedTools,
}: PdfToImageProps) {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
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

      const scale = SCALES.find(s => s.id === quality)?.scale ?? 2.0;
      const file = files[0];
      const baseName = file.name.replace(/\.pdf$/i, "");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const total = pdf.numPages;
      setPageCount(total);

      if (isAnimatedGif) {
        const GIFEncoder = (await import("gif-encoder-2")).default;
        const firstPage = await pdf.getPage(1);
        const vp0 = firstPage.getViewport({ scale: 1.5 });
        const w = Math.round(vp0.width);
        const h = Math.round(vp0.height);
        const encoder = new GIFEncoder(w, h, "neuquant", true, total);
        encoder.start();
        encoder.setDelay(1000);
        encoder.setRepeat(0);
        encoder.setQuality(10);
        for (let i = 1; i <= total; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, w, h);
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          encoder.addFrame(ctx);
        }
        encoder.finish();
        const blob = new Blob([encoder.out.getData()], { type: "image/gif" });
        setDownloadUrl(URL.createObjectURL(blob));
        setDownloadName(`${baseName}.gif`);
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        for (let i = 1; i <= total; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(vp.width);
          canvas.height = Math.round(vp.height);
          const ctx = canvas.getContext("2d")!;
          if (toMime === "image/jpeg") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, toMime, 0.95));
          if (blob) zip.file(total === 1 ? `${baseName}.${toExt}` : `${baseName}-page-${i}.${toExt}`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setDownloadUrl(URL.createObjectURL(zipBlob));
        setDownloadName(total === 1 ? `${baseName}.${toExt}` : `${baseName}-pages.zip`);
      }
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to convert PDF. Please ensure it's a valid PDF file.");
    } finally {
      setProcessing(false);
    }
  }, [files, quality, toMime, toExt, isAnimatedGif, addToast]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setDone(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setPageCount(0);
  }, [downloadUrl]);

  if (notBrowserNative) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
          <ToolHero icon={FileText} title={title} description={description} backHref="/pdf-tools" backLabel="Back to PDF Tools" />
        </div>
        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
          <div className="glass-panel rounded-[16px] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Browser Limitation</h3>
            <p className="text-foreground-secondary text-sm max-w-md mx-auto mb-6">{notBrowserNative}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/pdf-to-png" className="btn btn-primary">Convert to PNG instead</Link>
              <Link href="/pdf-to-jpg" className="btn btn-secondary">Convert to JPG instead</Link>
            </div>
          </div>
          <div className="mt-8">
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
          <div className="mt-8 mb-4">
            <h2 className="text-sm font-bold text-foreground mb-3">Related Converters</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map(t => <Link key={t.href} href={t.href} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary text-xs font-medium transition-colors bg-white">{t.name}<ArrowRight className="w-3 h-3" /></Link>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              {files.length > 0 && !isAnimatedGif && (
                <div className="mt-6 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-3">Output Quality</h3>
                  <div className="flex gap-2 flex-wrap">
                    {SCALES.map(s => (
                      <button key={s.id} onClick={() => setQuality(s.id as "low"|"medium"|"high")}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${quality === s.id ? "border-primary bg-primary-muted text-primary" : "border-border hover:border-primary-border text-foreground-secondary"}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {files.length > 0 && (
                <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                  {processing && <p className="text-xs text-foreground-secondary mb-3 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />Converting pages...</p>}
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
              <h3 className="text-2xl font-bold text-foreground mb-2">Conversion Complete!</h3>
              <p className="text-foreground-secondary text-sm mb-6">
                {isAnimatedGif ? `${pageCount} pages → animated GIF slideshow` : `${pageCount} page${pageCount !== 1 ? "s" : ""} converted to ${toExt.toUpperCase()}`}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a href={downloadUrl} download={downloadName} className="btn btn-primary inline-flex items-center gap-2">
                    {pageCount > 1 && !isAnimatedGif ? <FileArchive className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    {pageCount > 1 && !isAnimatedGif ? "Download ZIP" : `Download ${toExt.toUpperCase()}`}
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Private — No Server Upload</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">PDF rendering uses pdf.js entirely in your browser. Your PDF never leaves your device — zero uploads, zero data retention.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-primary-muted border border-primary-border flex items-center justify-center shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">All Pages Converted Automatically</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Every PDF page is rendered at your chosen quality. Multi-page PDFs are delivered as a ZIP archive. No page limits, no file size limits.</p>
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
