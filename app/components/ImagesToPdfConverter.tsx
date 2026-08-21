"use client";

import { useState, useCallback } from "react";
import {
  Check, Loader2, Shield, Zap, Download, FileImage,
  ChevronDown, ChevronUp, ArrowRight, Settings,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

const LAYOUTS = [
  { id: "fit", label: "Fit to Page", desc: "Scale to fit A4, preserve ratio" },
  { id: "fill", label: "Fill Page", desc: "Crop to fill entire A4 page" },
  { id: "original", label: "Original Size", desc: "Page size matches image size" },
] as const;

async function toEmbeddable(file: File): Promise<{ data: Uint8Array; kind: "jpeg" | "png" }> {
  const t = file.type;
  if (t === "image/jpeg") return { data: new Uint8Array(await file.arrayBuffer()), kind: "jpeg" };
  if (t === "image/png") return { data: new Uint8Array(await file.arrayBuffer()), kind: "png" };

  if (t === "image/heic" || t === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif")) {
    // @ts-ignore
    const heic2any = (await import("heic2any")).default;
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.95 }) as Blob;
    return { data: new Uint8Array(await blob.arrayBuffer()), kind: "jpeg" };
  }

  // All other formats: render to canvas → JPEG
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(async blob => {
        if (!blob) { reject(new Error("Canvas conversion failed")); return; }
        resolve({ data: new Uint8Array(await blob.arrayBuffer()), kind: "jpeg" });
      }, "image/jpeg", 0.95);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

export interface ImagesToPdfProps {
  fromFormat: string;
  fromExts: string;
  isBulk?: boolean;
  title: string;
  description: string;
  faqs: { q: string; a: string }[];
  relatedTools: { name: string; href: string }[];
}

export default function ImagesToPdfConverter({
  fromFormat, fromExts, isBulk = true,
  title, description, faqs, relatedTools,
}: ImagesToPdfProps) {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [layout, setLayout] = useState<"fit" | "fill" | "original">("fit");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const A4W = 595.28, A4H = 841.89;

      for (const file of files) {
        const { data, kind } = await toEmbeddable(file);
        const img = kind === "jpeg" ? await pdf.embedJpg(data) : await pdf.embedPng(data);
        const iw = img.width, ih = img.height;

        if (layout === "original") {
          const page = pdf.addPage([iw, ih]);
          page.drawImage(img, { x: 0, y: 0, width: iw, height: ih });
        } else if (layout === "fit") {
          const page = pdf.addPage([A4W, A4H]);
          const sc = Math.min(A4W / iw, A4H / ih);
          page.drawImage(img, { x: (A4W - iw * sc) / 2, y: (A4H - ih * sc) / 2, width: iw * sc, height: ih * sc });
        } else {
          const page = pdf.addPage([A4W, A4H]);
          const sc = Math.max(A4W / iw, A4H / ih);
          page.drawImage(img, { x: (A4W - iw * sc) / 2, y: (A4H - ih * sc) / 2, width: iw * sc, height: ih * sc });
        }
      }

      const bytes = await pdf.save();
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      setDownloadUrl(url);
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Conversion failed. Please check your image files.");
    } finally {
      setProcessing(false);
    }
  }, [files, layout, addToast]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setDone(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  }, [downloadUrl]);

  const baseName = files.length === 1 ? files[0].name.replace(/\.[^.]+$/, "") : fromFormat.toLowerCase();
  const dlName = `${baseName}-converted.pdf`;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={FileImage} title={title} description={description} backHref="/pdf-tools" backLabel="Back to PDF Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload
                accept={fromExts}
                multiple={isBulk}
                files={files}
                onFilesChange={setFiles}
                label={`Drop your ${fromFormat} ${isBulk ? "images" : "image"} here`}
                description={`or click to browse — ${fromFormat} files accepted`}
              />
              {files.length > 0 && (
                <>
                  <div className="mt-6 animate-fade-in-up">
                    <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" />Page Layout
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {LAYOUTS.map(l => (
                        <button key={l.id} onClick={() => setLayout(l.id as "fit"|"fill"|"original")}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${layout === l.id ? "border-primary bg-primary-muted" : "border-border hover:border-primary-border hover:bg-surface-2"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${layout === l.id ? "border-primary bg-primary" : "border-border"}`}>
                              {layout === l.id && <Check className="w-2 h-2 text-white" />}
                            </div>
                            <span className="font-semibold text-xs text-foreground">{l.label}</span>
                          </div>
                          <p className="text-xs text-foreground-muted ml-5">{l.desc}</p>
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-foreground-secondary text-xs">
                      {files.length} image{files.length !== 1 ? "s" : ""} selected — each becomes one PDF page.
                    </p>
                  </div>
                  <div className="mt-8 flex justify-center animate-fade-in-up">
                    <button onClick={handleConvert} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Converting...</> : <><FileImage className="w-5 h-5" />Convert to PDF</>}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">PDF Created!</h3>
              <p className="text-foreground-secondary text-sm mb-6">
                {files.length} {fromFormat} image{files.length !== 1 ? "s" : ""} combined into one PDF document.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a href={downloadUrl} download={dlName} className="btn btn-primary inline-flex items-center gap-2">
                    <Download className="w-5 h-5" />Download PDF
                  </a>
                )}
                <button onClick={handleReset} className="btn btn-secondary">Convert More Images</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-primary-muted border border-primary-border flex items-center justify-center shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Private — Runs in Your Browser</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">All PDF creation happens locally with pdf-lib. Your images never leave your device. No sign-up, no watermarks, no data collection.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-primary-muted border border-primary-border flex items-center justify-center shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Batch Convert — No Limits</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Upload multiple {fromFormat} images and combine them into a single multi-page PDF. Choose A4 fit, fill, or original dimensions per-page.</p>
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
