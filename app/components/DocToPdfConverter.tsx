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

export type DocConversionType = "csv" | "txt" | "json" | "xml" | "markdown" | "excel" | "doc" | "epub";

function csvToHtml(csv: string): string {
  const rows = csv.split("\n").filter(r => r.trim());
  const tableRows = rows.map((row, i) => {
    const cells = row.split(",").map(c => c.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
    const tag = i === 0 ? "th" : "td";
    return `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join("")}</tr>`;
  }).join("");
  return `<table>${tableRows}</table>`;
}

function markdownToHtml(md: string): string {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

const BASE_STYLES = `
  body{font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#333;padding:20px}
  h1,h2,h3{color:#111;margin:16px 0 8px}
  table{border-collapse:collapse;width:100%;margin:12px 0;font-size:11px}
  td,th{border:1px solid #ccc;padding:5px 8px;text-align:left}
  th{background:#f0f0f0;font-weight:bold}
  code{background:#f5f5f5;padding:1px 4px;border-radius:3px;font-size:11px}
  pre{background:#f5f5f5;padding:12px;border-radius:4px;overflow:auto;font-size:11px}
  li{margin:4px 0}
  p{margin:8px 0}
`;

async function convertToPdfBlob(htmlContent: string, filename: string): Promise<Blob> {
  const html2pdf = (await import("html2pdf.js")).default;
  const el = document.createElement("div");
  el.innerHTML = `<style>${BASE_STYLES}</style>${htmlContent}`;
  document.body.appendChild(el);
  const opt = {
    margin: 12,
    filename,
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };
  const blob: Blob = await html2pdf().set(opt).from(el).outputBlob();
  document.body.removeChild(el);
  return blob;
}

export interface DocToPdfProps {
  conversionType: DocConversionType;
  fromFormat: string;
  fromExts: string;
  title: string;
  description: string;
  faqs: { q: string; a: string }[];
  relatedTools: { name: string; href: string }[];
}

export default function DocToPdfConverter({
  conversionType, fromFormat, fromExts,
  title, description, faqs, relatedTools,
}: DocToPdfProps) {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const file = files[0];
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const outName = `${baseName}.pdf`;
      let html = "";

      if (conversionType === "csv") {
        const text = await file.text();
        html = `<h1>${baseName}</h1>${csvToHtml(text)}`;
      } else if (conversionType === "txt") {
        const text = await file.text();
        html = `<h1>${baseName}</h1><pre>${text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`;
      } else if (conversionType === "json") {
        const text = await file.text();
        try {
          const parsed = JSON.parse(text);
          html = `<h1>${baseName}</h1><pre>${JSON.stringify(parsed, null, 2).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`;
        } catch {
          html = `<h1>${baseName}</h1><pre>${text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`;
        }
      } else if (conversionType === "xml") {
        const text = await file.text();
        html = `<h1>${baseName}</h1><pre>${text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`;
      } else if (conversionType === "markdown") {
        const text = await file.text();
        html = `<div>${markdownToHtml(text)}</div>`;
      } else if (conversionType === "excel") {
        const XLSX = (await import("xlsx")).default;
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheetHtmlParts: string[] = [];
        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const sheetHtml = XLSX.utils.sheet_to_html(ws, { editable: false });
          sheetHtmlParts.push(`<h2>${sheetName}</h2>${sheetHtml}`);
        }
        html = `<h1>${baseName}</h1>${sheetHtmlParts.join("<br>")}`;
      } else if (conversionType === "doc") {
        const mammoth = await import("mammoth");
        const buf = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buf });
        html = result.value;
      } else if (conversionType === "epub") {
        const JSZip = (await import("jszip")).default;
        const buf = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buf);
        const htmlParts: string[] = [];
        const htmlFiles: string[] = [];
        zip.forEach((path) => {
          if (path.endsWith(".html") || path.endsWith(".xhtml") || path.endsWith(".htm")) {
            htmlFiles.push(path);
          }
        });
        htmlFiles.sort();
        for (const path of htmlFiles.slice(0, 30)) {
          const content = await zip.file(path)!.async("text");
          const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          htmlParts.push(bodyMatch ? bodyMatch[1] : content);
        }
        html = htmlParts.join('<div style="page-break-after:always"></div>');
      }

      const blob = await convertToPdfBlob(html, outName);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(outName);
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Conversion failed. Please check your file and try again.");
    } finally {
      setProcessing(false);
    }
  }, [files, conversionType, addToast]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setDone(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
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
              <FileUpload
                accept={fromExts}
                files={files}
                onFilesChange={setFiles}
                label={`Drop your ${fromFormat} file here`}
                description={`or click to browse — ${fromFormat} files accepted`}
              />
              {files.length > 0 && (
                <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                  {processing && <p className="text-xs text-foreground-secondary mb-3 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />Building PDF...</p>}
                  <button onClick={handleConvert} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Converting...</> : <><FileText className="w-5 h-5" />Convert to PDF</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">PDF Created!</h3>
              <p className="text-foreground-secondary text-sm mb-6">Your {fromFormat} file has been converted to a PDF document.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a href={downloadUrl} download={downloadName} className="btn btn-primary inline-flex items-center gap-2">
                    <Download className="w-5 h-5" />Download PDF
                  </a>
                )}
                <button onClick={handleReset} className="btn btn-secondary">Convert Another File</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-primary-muted border border-primary-border flex items-center justify-center shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Private — Browser-Based</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Your {fromFormat} file is converted entirely in your browser. No data leaves your device, no accounts required.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-primary-muted border border-primary-border flex items-center justify-center shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Clean PDF Output</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Content is formatted with clean typography on A4 pages. Download a professional PDF ready to share or print — no watermarks ever.</p>
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
