"use client";

import { useState, useCallback } from "react";
import {
  ArrowRightLeft,
  Check,
  Shield,
  Zap,
  Download,
  Copy,
  FileJson,
  Table2,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

type Direction = "json2csv" | "csv2json";
type Delimiter = "," | ";" | "\t" | "|";

function jsonToCsv(json: string, delim: Delimiter): string {
  const data = JSON.parse(json);
  const arr = Array.isArray(data) ? data : [data];
  if (arr.length === 0) return "";
  const keys = [...new Set(arr.flatMap((obj: Record<string, unknown>) => Object.keys(obj)))];
  const escape = (v: string) => {
    const s = String(v ?? "");
    if (s.includes(delim) || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const header = keys.map(escape).join(delim);
  const rows = arr.map((obj: Record<string, unknown>) =>
    keys.map((k) => escape(obj[k] as string)).join(delim)
  );
  return [header, ...rows].join("\n");
}

function csvToJson(csv: string, delim: Delimiter): string {
  const lines = csv.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return "[]";
  const parseRow = (line: string): string[] => {
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
        } else if (ch === delim) {
          result.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  };
  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
  return JSON.stringify(rows, null, 2);
}

const SAMPLE_JSON = `[
  { "name": "Alice", "age": "30", "city": "New York" },
  { "name": "Bob", "age": "25", "city": "London" },
  { "name": "Charlie", "age": "35", "city": "Paris" }
]`;

const SAMPLE_CSV = `name,age,city
Alice,30,New York
Bob,25,London
Charlie,35,Paris`;

export default function JsonCsvPage() {
  const [direction, setDirection] = useState<Direction>("json2csv");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    setError(null);
    try {
      if (direction === "json2csv") {
        const result = jsonToCsv(input, delimiter);
        setOutput(result);
      } else {
        const result = csvToJson(input, delimiter);
        setOutput(result);
      }
    } catch (e) {
      setError(direction === "json2csv" ? "Invalid JSON input" : "Invalid CSV input");
    }
  }, [input, direction, delimiter]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    const ext = direction === "json2csv" ? "csv" : "json";
    const mime = direction === "json2csv" ? "text/csv" : "application/json";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, direction]);

  const handleSwap = useCallback(() => {
    const newDir = direction === "json2csv" ? "csv2json" : "json2csv";
    setDirection(newDir);
    setInput(output || (newDir === "json2csv" ? SAMPLE_JSON : SAMPLE_CSV));
    setOutput("");
    setError(null);
  }, [direction, output]);

  const textareaCls =
    "w-full h-64 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground font-mono placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y";

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={ArrowRightLeft}
          title="JSON ↔ CSV Converter"
          description="Convert between JSON and CSV formats with custom delimiters — bidirectional and instant. Free, client-side, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
          {/* Direction toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDirection("json2csv")}
              className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                direction === "json2csv"
                  ? "bg-primary-muted border-primary-border text-primary"
                  : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              JSON → CSV
            </button>
            <button onClick={handleSwap} className="p-2 rounded-lg border border-border hover:bg-surface-2 transition-colors">
              <ArrowRightLeft className="w-4 h-4 text-foreground-secondary" />
            </button>
            <button
              onClick={() => setDirection("csv2json")}
              className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                direction === "csv2json"
                  ? "bg-primary-muted border-primary-border text-primary"
                  : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              CSV → JSON
            </button>
          </div>

          {/* Delimiter */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">Delimiter</label>
            <div className="flex gap-2">
              {([",", ";", "\t", "|"] as Delimiter[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDelimiter(d)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    delimiter === d
                      ? "bg-primary-muted border-primary-border text-primary"
                      : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                  }`}
                >
                  {d === "\t" ? "Tab" : d}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {direction === "json2csv" ? "JSON Input" : "CSV Input"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === "json2csv" ? "Paste JSON here…" : "Paste CSV here…"}
              className={textareaCls}
            />
          </div>

          {/* Convert */}
          <button
            onClick={handleConvert}
            className="btn btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Convert
          </button>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Output */}
          {output && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {direction === "json2csv" ? "CSV Output" : "JSON Output"}
              </label>
              <textarea
                value={output}
                readOnly
                className={textareaCls}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-1 justify-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-1 justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Bidirectional Conversion</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Convert JSON arrays to CSV and back. Handles nested objects, quoted fields, and special characters correctly.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Custom Delimiters</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Choose comma, semicolon, tab, or pipe delimiters. Handles quoted fields and escaped characters properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
