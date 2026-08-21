"use client";

import { useState, useCallback } from "react";
import {
  ArrowRightLeft,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Copy,
  FileText,
  Table2,
  FileJson,
  Image,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";
import { extractPdfLines } from "@/app/utils/extract-pdf-lines";

type OutputFormat = "text" | "table" | "json" | "images";

interface ConversionResult {
  text: string;
  table: string[][];
  json: Record<string, unknown>[];
  imageUrls: string[];
}

const formatTabs: { key: OutputFormat; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "text", label: "Text", icon: FileText },
  { key: "table", label: "Table", icon: Table2 },
  { key: "json", label: "JSON", icon: FileJson },
  { key: "images", label: "Images", icon: Image },
];

function textToTable(text: string): string[][] {
  const lines = text.split("\n").filter((l) => l.trim());
  return lines.map((line) => line.split(/\s{2,}|\t/).map((cell) => cell.trim()));
}

function tableToJson(table: string[][]): Record<string, unknown>[] {
  if (table.length < 2) return [];
  const headers = table[0];
  return table.slice(1).map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      obj[h || `col_${i}`] = row[i] ?? "";
    });
    return obj;
  });
}

export default function MultiConverterPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [activeFormat, setActiveFormat] = useState<OutputFormat>("text");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      const pdfjsLib: typeof import("pdfjs-dist") = await import(
        /* webpackIgnore: true */ "/pdfjs-viewer.min.mjs"
      );
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPageCount(pdf.numPages);

      let fullText = "";
      const imageUrls: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Extract text
        const textContent = await page.getTextContent();
        const lines = extractPdfLines(textContent.items);
        const pageText = lines.map((l) => l.text).join("\n");
        fullText += `${i > 1 ? "\n" : ""}--- Page ${i} ---\n${pageText.trim()}`;

        // Extract page as image
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/png");
        imageUrls.push(dataUrl);
      }

      const table = textToTable(fullText);
      const json = tableToJson(table);

      setResult({ text: fullText, table, json, imageUrls });
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to convert file. Make sure it's a valid PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, addToast]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    let content = "";
    switch (activeFormat) {
      case "text":
        content = result.text;
        break;
      case "table":
        content = result.table.map((row) => row.join("\t")).join("\n");
        break;
      case "json":
        content = JSON.stringify(result.json, null, 2);
        break;
      case "images":
        content = result.imageUrls.join("\n");
        break;
    }
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, activeFormat]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const baseName = files[0]?.name.replace(/\.[^/.]+$/, "") ?? "converted";

    if (activeFormat === "json") {
      const blob = new Blob([JSON.stringify(result.json, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (activeFormat === "text") {
      const blob = new Blob([result.text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (activeFormat === "table") {
      const csv = result.table.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (activeFormat === "images") {
      result.imageUrls.forEach((dataUrl, i) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${baseName}-page-${i + 1}.png`;
        a.click();
      });
    }
  }, [result, activeFormat, files]);

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setResult(null);
    setPageCount(0);
    setCopied(false);
    setActiveFormat("text");
  };

  const getOutputContent = () => {
    if (!result) return "";
    switch (activeFormat) {
      case "text":
        return result.text;
      case "json":
        return JSON.stringify(result.json, null, 2);
      case "table":
        return result.table.map((row) => row.join(" | ")).join("\n");
      default:
        return "";
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={ArrowRightLeft}
          title="Multi-Format Converter"
          description="Upload a PDF and convert to Text, Table, JSON, or Images — all in one interface. Other tools do one conversion at a time, you get everything at once."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload
                accept=".pdf"
                files={files}
                onFilesChange={setFiles}
                label="Drop your PDF here"
                description="One upload — Text, Table, JSON, and Images all at once"
              />

              {files.length > 0 && (
                <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                  <button
                    onClick={handleConvert}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-5 h-5" />
                        Convert to All Formats
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-4 animate-fade-in-up">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Conversion Complete!
                </h3>
                <p className="text-foreground-secondary">
                  Extracted from {pageCount} page{pageCount !== 1 ? "s" : ""} — choose your output format below.
                </p>
              </div>

              {/* Format Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {formatTabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveFormat(key)}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                      activeFormat === key
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Output Area */}
              {activeFormat === "images" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {result?.imageUrls.map((url, i) => (
                    <div key={i} className="rounded-xl border border-border overflow-hidden">
                      <img src={url} alt={`Page ${i + 1}`} className="w-full h-auto" />
                      <div className="p-2 bg-surface-1 text-center">
                        <span className="type-label text-foreground-muted">Page {i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full h-80 p-4 rounded-xl border border-border bg-background text-foreground text-xs resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono mb-6"
                  value={getOutputContent()}
                  readOnly
                />
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Pages", value: pageCount },
                  { label: "Text Lines", value: result?.text.split("\n").length ?? 0 },
                  { label: "Table Rows", value: result?.table.length ?? 0 },
                  { label: "JSON Records", value: result?.json.length ?? 0 },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border p-3 text-center bg-surface-1">
                    <div className="text-xl font-bold text-primary">{stat.value}</div>
                    <div className="type-label text-foreground-muted">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleCopy}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download {activeFormat.toUpperCase()}
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Convert Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">All-at-Once Conversion</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                One upload produces four output formats simultaneously — Text, Table, JSON, and Images. No need to convert one format at a time.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Client-Side</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All processing happens in your browser. Your files never leave your device — completely private and instant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
