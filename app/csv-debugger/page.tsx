"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Bug,
  Shield,
  Zap,
  Download,
  Copy,
  Check,
  AlertTriangle,
  FileWarning,
  Trash2,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";
import FileUpload from "@/app/components/FileUpload";

interface CsvIssue {
  type: "duplicate" | "empty" | "type_mismatch" | "inconsistent_length";
  row: number;
  col: number;
  message: string;
  severity: "error" | "warning" | "info";
}

interface CsvAnalysis {
  headers: string[];
  rows: string[][];
  issues: CsvIssue[];
  stats: {
    totalRows: number;
    totalCols: number;
    emptyCells: number;
    duplicateRows: number;
    typeIssues: number;
  };
  colStats: { name: string; filled: number; empty: number; unique: number; sample: string }[];
}

const SAMPLE_CSV = `name,email,age,city,salary
Alice,alice@example.com,30,New York,50000
Bob,,25,London,
Charlie,charlie@example.com,35,Paris,75000
Alice,alice@example.com,30,New York,50000
David,david@example.com,,Berlin,60000
Eve,eve@example.com,28,,55000
Frank,frank@example.com,32,,
,missing@example.com,40,Tokyo,80000
Grace,grace@example.com,30,New York,50000
Bob,bob2@example.com,27,London,48000`;

function parseCsv(text: string): string[][] {
  const lines = text.split("\n").filter((l) => l.trim());
  return lines.map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  });
}

function analyzeCsv(rows: string[][]): CsvAnalysis {
  if (rows.length < 2) {
    return { headers: [], rows, issues: [], stats: { totalRows: 0, totalCols: 0, emptyCells: 0, duplicateRows: 0, typeIssues: 0 }, colStats: [] };
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);
  const issues: CsvIssue[] = [];
  const totalCols = headers.length;
  let emptyCells = 0;
  let typeIssues = 0;

  // Detect empty cells
  dataRows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (!cell.trim()) {
        emptyCells++;
        issues.push({
          type: "empty",
          row: ri + 1,
          col: ci,
          message: `Empty value in "${headers[ci] || `col ${ci}`}" at row ${ri + 2}`,
          severity: "warning",
        });
      }
    });
  });

  // Detect duplicate rows
  const rowStrings = dataRows.map((r) => r.join("|||"));
  const seen = new Map<string, number[]>();
  rowStrings.forEach((str, i) => {
    if (!seen.has(str)) seen.set(str, []);
    seen.get(str)!.push(i);
  });
  let duplicateRows = 0;
  seen.forEach((indices, str) => {
    if (indices.length > 1) {
      duplicateRows += indices.length - 1;
      indices.slice(1).forEach((idx) => {
        issues.push({
          type: "duplicate",
          row: idx + 1,
          col: 0,
          message: `Duplicate of row ${indices[0] + 2} found at row ${idx + 2}`,
          severity: "error",
        });
      });
    }
  });

  // Detect type inconsistencies (numeric columns with mixed types)
  const colStats: CsvAnalysis["colStats"] = headers.map((header, ci) => {
    const values = dataRows.map((r) => r[ci] ?? "").filter((v) => v.trim());
    const empty = dataRows.length - values.length;
    const unique = new Set(values).size;
    const sample = values.slice(0, 3).join(", ");

    // Check if column looks numeric but has non-numeric values
    const numericCount = values.filter((v) => !isNaN(Number(v))).length;
    if (numericCount > values.length * 0.7 && numericCount < values.length) {
      values.forEach((v, ri) => {
        if (isNaN(Number(v))) {
          typeIssues++;
          issues.push({
            type: "type_mismatch",
            row: ri + 1,
            col: ci,
            message: `Non-numeric value "${v}" in numeric column "${header}" at row ${ri + 2}`,
            severity: "info",
          });
        }
      });
    }

    return { name: header, filled: values.length, empty, unique, sample };
  });

  // Detect inconsistent row lengths
  dataRows.forEach((row, ri) => {
    if (row.length !== totalCols) {
      issues.push({
        type: "inconsistent_length",
        row: ri + 1,
        col: row.length - 1,
        message: `Row ${ri + 2} has ${row.length} columns (expected ${totalCols})`,
        severity: "warning",
      });
    }
  });

  // Sort issues by severity
  const severityOrder = { error: 0, warning: 1, info: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    headers,
    rows: dataRows,
    issues,
    stats: { totalRows: dataRows.length, totalCols, emptyCells, duplicateRows, typeIssues },
    colStats,
  };
}

const severityColors = {
  error: "bg-red-50 border-red-200 text-red-700",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
};

const severityBg = {
  error: "bg-red-100 text-red-600",
  warning: "bg-amber-100 text-amber-600",
  info: "bg-blue-100 text-blue-600",
};

export default function CsvDebuggerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [useFile, setUseFile] = useState(false);

  const handleAnalyze = useCallback(() => {
    const rows = parseCsv(csvText);
    const result = analyzeCsv(rows);
    setAnalysis(result);
  }, [csvText]);

  const handleFileLoad = useCallback(async (fileList: File[]) => {
    if (fileList.length === 0) return;
    setFiles(fileList);
    const text = await fileList[0].text();
    setCsvText(text);
    setUseFile(true);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!analysis) return;
    const report = analysis.issues.map((i) => `[${i.severity.toUpperCase()}] ${i.message}`).join("\n");
    await navigator.clipboard.writeText(report || "No issues found!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [analysis]);

  const handleDownload = useCallback(() => {
    if (!analysis) return;
    const report = [
      "CSV Debug Report",
      "================",
      `Total Rows: ${analysis.stats.totalRows}`,
      `Total Columns: ${analysis.stats.totalCols}`,
      `Empty Cells: ${analysis.stats.emptyCells}`,
      `Duplicate Rows: ${analysis.stats.duplicateRows}`,
      `Type Issues: ${analysis.stats.typeIssues}`,
      "",
      "Issues:",
      ...analysis.issues.map((i) => `[${i.severity.toUpperCase()}] ${i.message}`),
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "csv-debug-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [analysis]);

  const errorCount = analysis?.issues.filter((i) => i.severity === "error").length ?? 0;
  const warningCount = analysis?.issues.filter((i) => i.severity === "warning").length ?? 0;
  const infoCount = analysis?.issues.filter((i) => i.severity === "info").length ?? 0;

  const getCellStyle = (rowIdx: number, colIdx: number) => {
    if (!analysis) return "";
    const isIssue = analysis.issues.some(
      (i) => i.row === rowIdx && (i.col === colIdx || i.type === "duplicate")
    );
    const isEmpty = !analysis.rows[rowIdx]?.[colIdx]?.trim();
    const isDuplicate = analysis.issues.some(
      (i) => i.type === "duplicate" && i.row === rowIdx
    );

    if (isDuplicate) return "bg-red-50/70";
    if (isEmpty) return "bg-amber-50/70";
    return "";
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Bug}
          title="CSV Visual Debugger"
          description="Upload CSV and instantly spot data problems — highlight duplicates, detect empty values, show column issues. Not just a CSV viewer, a data problem finder."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
          {/* Upload or paste */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUseFile(false)}
              className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                !useFile ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
              }`}
            >
              Paste CSV
            </button>
            <button
              onClick={() => setUseFile(true)}
              className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                useFile ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
              }`}
            >
              Upload File
            </button>
          </div>

          {useFile ? (
            <FileUpload
              accept=".csv,.tsv,.txt"
              files={files}
              onFilesChange={handleFileLoad}
              label="Drop your CSV here"
              description="or click to browse — CSV, TSV, or TXT files"
            />
          ) : (
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste your CSV data here…"
              className="w-full h-48 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground font-mono placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          )}

          <button
            onClick={handleAnalyze}
            className="btn btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            <Bug className="w-4 h-4" />
            Analyze CSV
          </button>
        </div>

        {analysis && (
          <div className="mt-6 space-y-6 animate-fade-in-up">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Rows", value: analysis.stats.totalRows, color: "text-foreground" },
                { label: "Columns", value: analysis.stats.totalCols, color: "text-foreground" },
                { label: "Errors", value: errorCount, color: "text-red-600" },
                { label: "Warnings", value: warningCount, color: "text-amber-600" },
                { label: "Info", value: infoCount, color: "text-blue-600" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border p-3 text-center bg-surface-1">
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="type-label text-foreground-muted">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Column Stats */}
            <div className="glass-panel rounded-[16px] p-6">
              <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-primary" />
                Column Health
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold text-foreground-secondary">Column</th>
                      <th className="text-right py-2 px-3 font-semibold text-foreground-secondary">Filled</th>
                      <th className="text-right py-2 px-3 font-semibold text-foreground-secondary">Empty</th>
                      <th className="text-right py-2 px-3 font-semibold text-foreground-secondary">Unique</th>
                      <th className="text-left py-2 px-3 font-semibold text-foreground-secondary">Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.colStats.map((col) => (
                      <tr key={col.name} className="border-b border-border/50 hover:bg-surface-1 transition-colors">
                        <td className="py-2 px-3 font-semibold text-foreground">{col.name}</td>
                        <td className="py-2 px-3 text-right text-green-600">{col.filled}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={col.empty > 0 ? "text-amber-600 font-semibold" : "text-foreground-muted"}>
                            {col.empty}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-foreground-secondary">{col.unique}</td>
                        <td className="py-2 px-3 text-foreground-muted truncate max-w-[200px]">{col.sample}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Table with Highlights */}
            <div className="glass-panel rounded-[16px] p-6">
              <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                Data Preview (highlighted issues)
              </h3>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left font-semibold text-foreground-muted w-12">#</th>
                      {analysis.headers.map((h) => (
                        <th key={h} className="py-2 px-3 text-left font-semibold text-foreground-secondary whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.rows.slice(0, 50).map((row, ri) => (
                      <tr
                        key={ri}
                        className={`border-b border-border/30 transition-colors ${getCellStyle(ri, 0)}`}
                      >
                        <td className="py-1.5 px-3 font-mono text-foreground-muted">{ri + 2}</td>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={`py-1.5 px-3 whitespace-nowrap max-w-[200px] truncate ${getCellStyle(ri, ci)} ${
                              !cell.trim() ? "italic text-foreground-muted" : "text-foreground"
                            }`}
                          >
                            {cell.trim() || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {analysis.rows.length > 50 && (
                <p className="text-xs text-foreground-muted mt-2">Showing first 50 of {analysis.rows.length} rows</p>
              )}
            </div>

            {/* Issues List */}
            {analysis.issues.length > 0 && (
              <div className="glass-panel rounded-[16px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-primary" />
                    All Issues ({analysis.issues.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="btn btn-secondary inline-flex items-center gap-1.5 text-xs !py-2 !px-3"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Report
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn btn-secondary inline-flex items-center gap-1.5 text-xs !py-2 !px-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {analysis.issues.slice(0, 100).map((issue, i) => (
                    <div
                      key={i}
                      className={`rounded-lg border p-3 text-xs flex items-start gap-2 ${severityColors[issue.severity]}`}
                    >
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${severityBg[issue.severity]}`}>
                        {issue.severity}
                      </span>
                      <span>{issue.message}</span>
                    </div>
                  ))}
                  {analysis.issues.length > 100 && (
                    <p className="text-xs text-foreground-muted text-center py-2">
                      Showing first 100 of {analysis.issues.length} issues
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-50/70 border border-red-200" /> Duplicate rows
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-50/70 border border-amber-200" /> Empty cells
              </span>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Not Just a CSV Viewer</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                This is a data problem finder. It highlights duplicates, detects empty values, shows column inconsistencies, and flags type mismatches — all visually.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Instant Analysis</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Upload your CSV and get a full quality report in seconds. Color-coded cells make it easy to spot problems at a glance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
