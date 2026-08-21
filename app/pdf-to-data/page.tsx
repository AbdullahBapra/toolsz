"use client";

import { useState, useMemo } from "react";
import {
  Table2,
  Check,
  Loader2,
  Shield,
  Zap,
  Copy,
  Download,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";
import { extractPdfLines } from "@/app/utils/extract-pdf-lines";

interface StructuredPage {
  page: number;
  sections: StructuredSection[];
}

interface StructuredSection {
  type: "heading" | "paragraph" | "list" | "table";
  content: string;
  level?: number;
  items?: string[];
  rows?: string[][];
}

function generateCsv(data: StructuredPage[]): string {
  const rows: string[][] = [
    ["Page", "Section Type", "Level", "Content", "Items", "Table Row"],
  ];

  for (const page of data) {
    for (const section of page.sections) {
      if (section.type === "heading") {
        rows.push([
          String(page.page),
          "heading",
          section.level ? `H${section.level}` : "",
          section.content,
          "",
          "",
        ]);
      } else if (section.type === "paragraph") {
        rows.push([
          String(page.page),
          "paragraph",
          "",
          section.content,
          "",
          "",
        ]);
      } else if (section.type === "list" && section.items) {
        for (let j = 0; j < section.items.length; j++) {
          rows.push([
            String(page.page),
            "list",
            "",
            "",
            `${j + 1}. ${section.items[j]}`,
            "",
          ]);
        }
      } else if (section.type === "table" && section.rows) {
        for (const row of section.rows) {
          rows.push([
            String(page.page),
            "table",
            "",
            "",
            "",
            row.join(" | "),
          ]);
        }
      }
    }
  }

  return rows
    .map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}

function parseTextToStructure(text: string, pageNum: number): StructuredPage {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const sections: StructuredSection[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Detect headings: short lines, possibly ALL CAPS or title case, or ending with colon
    const wordCount = line.split(/\s+/).length;
    const isHeading =
      line.length < 80 &&
      wordCount >= 2 &&
      (line === line.toUpperCase() ||
        /^(#{1,6}\s|[A-Z][a-z]+(\s[A-Z][a-z]+)*:)/.test(line) ||
        (line.endsWith(":") && line.length < 60));

    // Detect list items
    const isListItem = /^[-•▪▸▸→*]\s|^\d+[.)]\s/.test(line);

    // Detect table-like rows (tab-separated or pipe-separated)
    const isTableRow = line.includes("\t") || (line.includes("|") && line.split("|").length >= 3);

    if (isHeading && !isListItem) {
      sections.push({
        type: "heading",
        content: line.replace(/^#{1,6}\s/, "").replace(/:$/, ""),
        level: line === line.toUpperCase() ? 1 : 2,
      });
      i++;
    } else if (isListItem) {
      const items: string[] = [];
      while (i < lines.length && /^[-•▪▸▸→*]\s|^\d+[.)]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-•▪▸▸→*]\s|^\d+[.)]\s/, ""));
        i++;
      }
      sections.push({ type: "list", content: "", items });
    } else if (isTableRow) {
      const rows: string[][] = [];
      while (i < lines.length) {
        const row = lines[i].trim();
        if (row.includes("|")) {
          rows.push(row.split("|").map((c) => c.trim()).filter((c) => c.length > 0));
          i++;
        } else if (row.includes("\t")) {
          rows.push(row.split("\t").map((c) => c.trim()).filter((c) => c.length > 0));
          i++;
        } else {
          break;
        }
      }
      sections.push({ type: "table", content: "", rows });
    } else {
      // Collect consecutive lines as a paragraph
      const paraLines: string[] = [];
      
      // We already know lines[i] is a paragraph line
      paraLines.push(lines[i].trim());
      i++;
      
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        // Check if next line is structural
        const isNextListItem = /^[-•▪▸▸→*]\s|^\d+[.)]\s/.test(nextLine);
        const isNextTableRow = nextLine.includes("\t") || (nextLine.includes("|") && nextLine.split("|").length >= 3);
        const wordCount = nextLine.split(/\s+/).length;
        const isNextHeading =
          nextLine.length < 80 &&
          wordCount >= 2 &&
          (nextLine === nextLine.toUpperCase() ||
            /^(#{1,6}\s|[A-Z][a-z]+(\s[A-Z][a-z]+)*:)/.test(nextLine) ||
            (nextLine.endsWith(":") && nextLine.length < 60));

        if ((isNextHeading && !isNextListItem) || isNextListItem || isNextTableRow) {
          break; // Found a structural element, break paragraph collection
        }

        paraLines.push(nextLine);
        i++;
      }
      
      if (paraLines.length > 0) {
        sections.push({ type: "paragraph", content: paraLines.join(" ") });
      }
    }
  }

  return { page: pageNum, sections };
}

export default function PdfToDataPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [structuredData, setStructuredData] = useState<StructuredPage[]>([]);
  const [jsonOutput, setJsonOutput] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [copied, setCopied] = useState(false);

  const handleExtract = async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPageCount(pdf.numPages);

      const pages: StructuredPage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const lineMap = extractPdfLines(textContent.items);

        if (lineMap.length === 0) {
          pages.push({ page: i, sections: [] });
          continue;
        }

        const pageText = lineMap.map((l) => l.text).join("\n");
        const structured = parseTextToStructure(pageText, i);
        pages.push(structured);
      }

      setStructuredData(pages);
      const json = JSON.stringify(
        {
          filename: files[0].name,
          totalPages: pdf.numPages,
          pages: pages.map((p) => ({
            page: p.page,
            sections: p.sections.map((s) => {
              const out: Record<string, unknown> = { type: s.type };
              if (s.type === "heading") {
                out.level = s.level;
                out.text = s.content;
              } else if (s.type === "paragraph") {
                out.text = s.content;
              } else if (s.type === "list") {
                out.items = s.items;
              } else if (s.type === "table") {
                out.rows = s.rows;
              }
              return out;
            }),
          })),
        },
        null,
        2
      );
      setJsonOutput(json);
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to extract data from PDF. Make sure it's a valid PDF file.");
    } finally {
      setProcessing(false);
    }
  };

  const csvOutput = useMemo(() => generateCsv(structuredData), [structuredData]);
  const currentOutput = exportFormat === "json" ? jsonOutput : csvOutput;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = currentOutput;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const isCsv = exportFormat === "csv";
    const mimeType = isCsv ? "text/csv" : "application/json";
    const ext = isCsv ? "csv" : "json";
    const blob = new Blob([currentOutput], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${files[0]?.name.replace(/\.[^/.]+$/, "")}-structured.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setStructuredData([]);
    setJsonOutput("");
    setPageCount(0);
    setCopied(false);
    setExportFormat("json");
  };

  const sectionTypeLabel = (type: string) => {
    switch (type) {
      case "heading":
        return "Heading";
      case "paragraph":
        return "Paragraph";
      case "list":
        return "List";
      case "table":
        return "Table";
      default:
        return type;
    }
  };

  const sectionTypeColor = (type: string) => {
    switch (type) {
      case "heading":
        return "bg-primary-muted text-primary";
      case "paragraph":
        return "bg-success-muted text-success";
      case "list":
        return "bg-purple-50 text-primary";
      case "table":
        return "bg-warning-muted text-warning";
      default:
        return "bg-foreground-muted/20 text-foreground-secondary";
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Table2}
          title="PDF to Structured Data"
          description="Transform PDF content into structured JSON or CSV data — free, instant, and private. Smart parsing preserves tables and document structure without uploading anything to a server."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              {/* Upload Area */}
              <FileUpload
                accept=".pdf"
                files={files}
                onFilesChange={setFiles}

                label="Drop your PDF here"
                description="or click to browse — PDF files only"
              />

              {/* Action Button */}
              {files.length > 0 && (
                <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                  <button
                    onClick={handleExtract}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Extracting Data...
                      </>
                    ) : (
                      <>
                        <Table2 className="w-5 h-5" />
                        Extract Structured Data
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="py-4 animate-fade-in-up">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Data Extracted Successfully!
                </h3>
                <p className="text-foreground-secondary">
                  Structured data extracted from {pageCount} page
                  {pageCount !== 1 ? "s" : ""}. Review the visual preview below
                  or copy the output.
                </p>
              </div>

              {/* Visual Preview */}
              <div className="mb-6 space-y-6">
                {structuredData.map((page) => (
                  <div key={page.page} className="border border-border rounded-xl overflow-hidden">
                    <div className="bg-primary-muted px-4 py-2 border-b border-border">
                      <span className="text-xs font-semibold text-foreground">
                        Page {page.page}
                      </span>
                      <span className="text-xs text-foreground-muted ml-2">
                        {page.sections.length} section
                        {page.sections.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {page.sections.length === 0 && (
                        <p className="text-xs text-foreground-muted italic">No text content found on this page.</p>
                      )}
                      {page.sections.map((section, idx) => (
                        <div key={idx} className="animate-fade-in-up">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${sectionTypeColor(section.type)}`}>
                              {sectionTypeLabel(section.type)}
                            </span>
                            {section.type === "heading" && section.level && (
                              <span className="text-[10px] text-foreground-secondary">H{section.level}</span>
                            )}
                          </div>

                          {section.type === "heading" && (
                            <p className={`font-bold text-foreground ${section.level === 1 ? "text-xs" : "text-xs"}`}>
                              {section.content}
                            </p>
                          )}

                          {section.type === "paragraph" && (
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              {section.content}
                            </p>
                          )}

                          {section.type === "list" && section.items && (
                            <ul className="list-disc list-inside text-xs text-foreground/80 space-y-0.5">
                              {section.items.map((item, itemIdx) => (
                                <li key={itemIdx}>{item}</li>
                              ))}
                            </ul>
                          )}

                          {section.type === "table" && section.rows && section.rows.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="text-xs border-collapse w-full">
                                <tbody>
                                  {section.rows.map((row, rowIdx) => (
                                    <tr key={rowIdx} className={rowIdx === 0 ? "bg-primary-muted font-semibold" : ""}>
                                      {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className="border border-border px-2 py-1 text-foreground/80">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Output */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-foreground">Output</h4>
                  <div className="flex items-center bg-surface-2 border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExportFormat("json")}
                      className={`px-3 py-1 text-xs font-semibold transition-colors ${
                        exportFormat === "json"
                          ? "bg-primary text-white"
                          : "text-foreground-secondary hover:text-foreground"
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setExportFormat("csv")}
                      className={`px-3 py-1 text-xs font-semibold transition-colors border-l border-border ${
                        exportFormat === "csv"
                          ? "bg-primary text-white"
                          : "text-foreground-secondary hover:text-foreground"
                      }`}
                    >
                      CSV
                    </button>
                  </div>
                </div>
                <textarea
                  className="w-full h-48 p-4 rounded-xl border border-border bg-background text-foreground text-xs resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                  value={currentOutput}
                  onChange={(e) => {
                    if (exportFormat === "json") setJsonOutput(e.target.value);
                  }}
                  readOnly={exportFormat === "csv"}
                  placeholder={`${exportFormat.toUpperCase()} output will appear here...`}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleCopy}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  {copied ? "Copied!" : `Copy ${exportFormat.toUpperCase()}`}
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Save as .{exportFormat}
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Extract Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Total Privacy
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your PDF is processed entirely in your browser. No data is
                uploaded to any server — your documents stay private.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Smart Parsing
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Automatically detects headings, paragraphs, bullet lists, and
                tables. Export clean JSON or CSV ready for your applications or
                databases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
