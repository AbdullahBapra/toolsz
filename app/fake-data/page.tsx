"use client";

import { useState, useCallback } from "react";
import { faker as fakerCore } from "@faker-js/faker";
import {
  Database,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw as ResetIcon,
  Copy,
  Plus,
  Minus,
  Columns3,
  FileText,
  FileJson,
  FileCode,
  Table,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

type ExportFormat = "csv" | "json" | "sql";

interface ColumnConfig {
  id: string;
  name: string;
  fakerMethod: string;
  enabled: boolean;
}

const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: "firstName", name: "First Name", fakerMethod: "person.firstName", enabled: true },
  { id: "lastName", name: "Last Name", fakerMethod: "person.lastName", enabled: true },
  { id: "fullName", name: "Full Name", fakerMethod: "person.fullName", enabled: true },
  { id: "email", name: "Email", fakerMethod: "internet.email", enabled: true },
  { id: "username", name: "Username", fakerMethod: "internet.username", enabled: false },
  { id: "phone", name: "Phone", fakerMethod: "phone.number", enabled: true },
  { id: "street", name: "Street Address", fakerMethod: "location.streetAddress", enabled: false },
  { id: "city", name: "City", fakerMethod: "location.city", enabled: false },
  { id: "state", name: "State", fakerMethod: "location.state", enabled: false },
  { id: "zipCode", name: "Zip Code", fakerMethod: "location.zipCode", enabled: false },
  { id: "country", name: "Country", fakerMethod: "location.country", enabled: false },
  { id: "company", name: "Company", fakerMethod: "company.name", enabled: false },
  { id: "jobTitle", name: "Job Title", fakerMethod: "person.jobTitle", enabled: false },
  { id: "website", name: "Website", fakerMethod: "internet.domainName", enabled: false },
  { id: "avatar", name: "Avatar URL", fakerMethod: "image.avatarLegacy", enabled: false },
  { id: "lorem", name: "Paragraph", fakerMethod: "lorem.paragraph", enabled: false },
  { id: "productName", name: "Product Name", fakerMethod: "commerce.productName", enabled: false },
  { id: "price", name: "Price", fakerMethod: "commerce.price", enabled: false },
  { id: "dateRecent", name: "Recent Date", fakerMethod: "date.recent", enabled: false },
  { id: "uuid", name: "UUID", fakerMethod: "string.uuid", enabled: false },
  { id: "ip", name: "IP Address", fakerMethod: "internet.ip", enabled: false },
  { id: "mac", name: "MAC Address", fakerMethod: "internet.mac", enabled: false },
  { id: "color", name: "Color", fakerMethod: "color.human", enabled: false },
  { id: "animal", name: "Animal", fakerMethod: "animal.type", enabled: false },
];

function getFakerValue(method: string): string {
  try {
    const parts = method.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = fakerCore;
    for (const part of parts) {
      current = current[part];
      if (current === undefined) return "N/A";
    }
    if (typeof current === "function") {
      const result = current();
      return result instanceof Date ? result.toISOString() : String(result);
    }
    return String(current);
  } catch {
    return "N/A";
  }
}

function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function generateCSV(columns: ColumnConfig[], rows: Record<string, string>[]): string {
  const header = columns.map((c) => c.name).map(escapeCSV).join(",");
  const data = rows.map((row) =>
    columns.map((c) => escapeCSV(row[c.id] ?? "")).join(",")
  );
  return [header, ...data].join("\n");
}

function generateJSON(columns: ColumnConfig[], rows: Record<string, string>[]): string {
  const mapped = rows.map((row) => {
    const obj: Record<string, string> = {};
    for (const col of columns) {
      obj[col.name] = row[col.id] ?? "";
    }
    return obj;
  });
  return JSON.stringify(mapped, null, 2);
}

const exportFormats: { id: ExportFormat; label: string; icon: typeof FileText; description: string }[] = [
  { id: "csv", label: "CSV", icon: Table, description: "Comma-separated. Best for spreadsheets and databases." },
  { id: "json", label: "JSON", icon: FileJson, description: "Structured array of objects. Best for APIs and apps." },
  { id: "sql", label: "SQL", icon: FileCode, description: "INSERT statements. Best for database seeding." },
];

export default function FakeDataPage() {
  const [columns, setColumns] = useState<ColumnConfig[]>(
    AVAILABLE_COLUMNS.map((c) => ({ ...c }))
  );
  const [rowCount, setRowCount] = useState(50);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [generatedData, setGeneratedData] = useState<Record<string, string>[]>([]);
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [tableName, setTableName] = useState("users");

  const toggleColumn = useCallback((id: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
    if (done) {
      setDone(false);
      setOutput("");
      setGeneratedData([]);
    }
  }, [done]);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    // Use setTimeout to let the UI update before heavy work
    setTimeout(() => {
      const enabledCols = columns.filter((c) => c.enabled);
      if (enabledCols.length === 0) {
        setGenerating(false);
        return;
      }

      const rows: Record<string, string>[] = [];
      for (let i = 0; i < rowCount; i++) {
        const row: Record<string, string> = {};
        for (const col of enabledCols) {
          row[col.id] = getFakerValue(col.fakerMethod);
        }
        rows.push(row);
      }

      let result: string;
      switch (format) {
        case "csv":
          result = generateCSV(enabledCols, rows);
          break;
        case "json":
          result = generateJSON(enabledCols, rows);
          break;
        case "sql":
          result = generateSQLCustom(enabledCols, rows, tableName);
          break;
        default:
          result = generateCSV(enabledCols, rows);
      }

      setGeneratedData(rows);
      setOutput(result);
      setDone(true);
      setGenerating(false);
    }, 50);
  }, [columns, rowCount, format, tableName]);

  const generateSQLCustom = (
    enabledCols: ColumnConfig[],
    rows: Record<string, string>[],
    tblName: string
  ) => {
    const colNames = enabledCols
      .map((c) => `\`${c.name.replace(/\s+/g, "_").toLowerCase()}\``)
      .join(", ");
    const inserts = rows.map((row) => {
      const values = enabledCols
        .map((c) => {
          const val = row[c.id] ?? "";
          return `'${val.replace(/'/g, "''")}'`;
        })
        .join(", ");
      return `INSERT INTO \`${tblName}\` (${colNames}) VALUES (${values});`;
    });
    return inserts.join("\n");
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const handleDownload = useCallback(() => {
    const ext = format === "csv" ? "csv" : format === "json" ? "json" : "sql";
    const mime = format === "csv" ? "text/csv" : format === "json" ? "application/json" : "text/plain";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fake_data_${rowCount}_rows.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, format, rowCount]);

  const handleReset = useCallback(() => {
    setColumns(AVAILABLE_COLUMNS.map((c) => ({ ...c })));
    setRowCount(50);
    setFormat("csv");
    setTableName("users");
    setGeneratedData([]);
    setOutput("");
    setDone(false);
    setCopied(false);
  }, []);

  const enabledCount = columns.filter((c) => c.enabled).length;
  const previewRows = generatedData.slice(0, 5);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Database}
          title="Fake Data Generator"
          description="Generate realistic dummy data — users, emails, addresses — and export as CSV, JSON, or SQL. Free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Dev Tools"
        />
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {/* Row Count & Format Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Number of Rows
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRowCount((r) => Math.max(1, r - 10))}
                  className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center hover:bg-surface-3 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={rowCount}
                  onChange={(e) =>
                    setRowCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))
                  }
                  className="w-20 text-center rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => setRowCount((r) => Math.min(10000, r + 10))}
                  className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center hover:bg-surface-3 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Export Format
              </label>
              <div className="flex gap-2">
                {exportFormats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFormat(f.id);
                      if (done) {
                        setDone(false);
                        setOutput("");
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      format === f.id
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                  >
                    <f.icon className="w-3.5 h-3.5" />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {format === "sql" && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Table Name
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => {
                    setTableName(e.target.value);
                    if (done) {
                      setDone(false);
                      setOutput("");
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="users"
                />
              </div>
            )}
          </div>

          {/* Column Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Columns3 className="w-4 h-4 text-primary" />
                Columns ({enabledCount} enabled)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setColumns((prev) => prev.map((c) => ({ ...c, enabled: true })))
                  }
                  className="text-xs text-primary hover:underline"
                >
                  Enable All
                </button>
                <button
                  onClick={() =>
                    setColumns((prev) =>
                      prev.map((c) => ({
                        ...c,
                        enabled: AVAILABLE_COLUMNS.find((a) => a.id === c.id)?.enabled ?? false,
                      }))
                    )
                  }
                  className="text-xs text-primary hover:underline"
                >
                  Reset Default
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {columns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${
                    col.enabled
                      ? "bg-primary-muted border-primary-border text-primary"
                      : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      col.enabled
                        ? "bg-primary border-primary"
                        : "border-border"
                    }`}
                  >
                    {col.enabled && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleGenerate}
              disabled={generating || enabledCount === 0}
              className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Generate {rowCount} Rows
                </>
              )}
            </button>
            {enabledCount === 0 && (
              <p className="text-xs text-red-500 mt-2">Enable at least one column</p>
            )}
          </div>
        </div>

        {/* Results */}
        {done && (
          <div className="mt-6 space-y-4 animate-fade-in-up">
            {/* Preview Table */}
            {previewRows.length > 0 && (
              <div className="glass-panel rounded-[16px] p-5 overflow-x-auto">
                <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Table className="w-4 h-4 text-primary" />
                  Preview (first {previewRows.length} of {rowCount} rows)
                </h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {columns
                        .filter((c) => c.enabled)
                        .map((col) => (
                          <th
                            key={col.id}
                            className="text-left py-2 px-3 font-semibold text-foreground-secondary whitespace-nowrap"
                          >
                            {col.name}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {columns
                          .filter((c) => c.enabled)
                          .map((col) => (
                            <td
                              key={col.id}
                              className="py-2 px-3 text-foreground-secondary whitespace-nowrap max-w-[200px] truncate"
                            >
                              {row[col.id]}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rowCount > 5 && (
                  <p className="text-xs text-foreground-muted mt-2">
                    Showing 5 of {rowCount} rows. Download to get all data.
                  </p>
                )}
              </div>
            )}

            {/* Output */}
            <div className="glass-panel rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  {format === "csv" && <Table className="w-4 h-4 text-primary" />}
                  {format === "json" && <FileJson className="w-4 h-4 text-primary" />}
                  {format === "sql" && <FileCode className="w-4 h-4 text-primary" />}
                  Output — {format.toUpperCase()} ({(output.length / 1024).toFixed(1)} KB)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn btn-primary inline-flex items-center gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .{format}
                  </button>
                </div>
              </div>
              <pre className="bg-surface-1 rounded-xl p-4 text-xs font-mono text-foreground-secondary overflow-x-auto max-h-80 overflow-y-auto border border-border">
                {output.length > 50000
                  ? output.slice(0, 50000) + "\n\n... (truncated, download to see full output)"
                  : output}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleReset}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <ResetIcon className="w-4 h-4" /> Start Over
              </button>
              <button
                onClick={handleGenerate}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <Database className="w-4 h-4" /> Regenerate
              </button>
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                No Data Leaves Your Browser
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All data is generated locally using @faker-js/faker. Nothing is
                sent to any server. Perfect for generating test data without
                privacy concerns.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                CSV, JSON, or SQL — Your Choice
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Export in the format you need: CSV for spreadsheets, JSON for
                APIs, or SQL INSERT statements for database seeding. Up to
                10,000 rows generated instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
