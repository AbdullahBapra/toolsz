"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  GitCompare,
  Shield,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { createPatch } from "diff";
import ToolHero from "@/app/components/ToolHero";
import FileUpload from "@/app/components/FileUpload";

type DiffMode = "text" | "json" | "image";
type ViewMode = "unified" | "side-by-side";

export default function DiffCheckerPage() {
  const [diffMode, setDiffMode] = useState<DiffMode>("text");
  const [viewMode, setViewMode] = useState<ViewMode>("unified");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [imageFilesA, setImageFilesA] = useState<File[]>([]);
  const [imageFilesB, setImageFilesB] = useState<File[]>([]);
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedAll, setExpandedAll] = useState(true);

  const diffResult = useMemo(() => {
    if (!textA && !textB) return null;

    try {
      if (diffMode === "json") {
        let prettyA = textA;
        let prettyB = textB;
        try { prettyA = JSON.stringify(JSON.parse(textA), null, 2); } catch {}
        try { prettyB = JSON.stringify(JSON.parse(textB), null, 2); } catch {}
        return createPatch("file", prettyA, prettyB, "a", "b");
      }
      return createPatch("file", textA, textB, "a", "b");
    } catch {
      return null;
    }
  }, [textA, textB, diffMode]);

  const parsedHunks = useMemo(() => {
    if (!diffResult) return [];
    const lines = diffResult.split("\n");
    const hunks: { header: string; lines: { type: "add" | "del" | "ctx" | "header"; text: string }[] }[] = [];
    let currentHunk: { header: string; lines: { type: "add" | "del" | "ctx" | "header"; text: string }[] } | null = null;

    for (const line of lines) {
      if (line.startsWith("@@")) {
        if (currentHunk) hunks.push(currentHunk);
        currentHunk = { header: line, lines: [] };
        currentHunk.lines.push({ type: "header", text: line });
      } else if (currentHunk) {
        if (line.startsWith("+")) currentHunk.lines.push({ type: "add", text: line.slice(1) });
        else if (line.startsWith("-")) currentHunk.lines.push({ type: "del", text: line.slice(1) });
        else currentHunk.lines.push({ type: "ctx", text: line.slice(1) });
      }
    }
    if (currentHunk) hunks.push(currentHunk);
    return hunks;
  }, [diffResult]);

  const stats = useMemo(() => {
    if (!parsedHunks.length) return null;
    let added = 0, removed = 0, unchanged = 0;
    for (const h of parsedHunks) {
      for (const l of h.lines) {
        if (l.type === "add") added++;
        else if (l.type === "del") removed++;
        else if (l.type === "ctx") unchanged++;
      }
    }
    return { added, removed, unchanged };
  }, [parsedHunks]);

  // Cleanup image blob URLs on unmount
  const imgUrlsRef = useRef<{ a: string | null; b: string | null }>({ a: null, b: null });
  useEffect(() => {
    imgUrlsRef.current = { a: imageA, b: imageB };
    return () => {
      if (imgUrlsRef.current.a) URL.revokeObjectURL(imgUrlsRef.current.a);
      if (imgUrlsRef.current.b) URL.revokeObjectURL(imgUrlsRef.current.b);
    };
  }, [imageA, imageB]);

  const handleCopy = useCallback(async () => {
    if (!diffResult) return;
    await navigator.clipboard.writeText(diffResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [diffResult]);

  // Load images for diff
  const handleImageUpload = useCallback((side: "a" | "b", files: File[]) => {
    if (files.length === 0) return;
    const url = URL.createObjectURL(files[0]);
    if (side === "a") {
      if (imageA) URL.revokeObjectURL(imageA);
      setImageA(url);
      setImageFilesA(files);
    } else {
      if (imageB) URL.revokeObjectURL(imageB);
      setImageB(url);
      setImageFilesB(files);
    }
  }, [imageA, imageB]);

  const SAMPLE_A = `function hello() {
  console.log("Hello, World!");
  return true;
}

const items = [1, 2, 3, 4, 5];
items.forEach(item => {
  console.log(item);
});`;

  const SAMPLE_B = `function hello(name: string) {
  console.log(\`Hello, \${name}!\`);
  return true;
}

const items = [1, 2, 3, 4, 5, 6];
items.forEach(item => {
  console.log(item * 2);
});`;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={GitCompare}
          title="Diff Checker"
          description="Compare text, JSON, or images side by side with highlighted differences — no size limit. Free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mode tabs */}
        <div className="flex items-center gap-2 mb-4">
          {([["text", "Text"], ["json", "JSON"], ["image", "Image"]] as [DiffMode, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setDiffMode(id)}
              className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                diffMode === id
                  ? "bg-primary-muted border-primary-border text-primary"
                  : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {(diffMode === "text" || diffMode === "json") && (
          <>
            {/* Input panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">Original</label>
                  {!textA && !textB && (
                    <button onClick={() => { setTextA(SAMPLE_A); setTextB(SAMPLE_B); }} className="text-xs text-primary hover:underline">Load sample</button>
                  )}
                </div>
                <textarea
                  value={textA}
                  onChange={(e) => setTextA(e.target.value)}
                  placeholder={diffMode === "json" ? '{"key": "value"}' : "Paste original text..."}
                  rows={12}
                  className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground font-mono placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Modified</label>
                <textarea
                  value={textB}
                  onChange={(e) => setTextB(e.target.value)}
                  placeholder={diffMode === "json" ? '{"key": "changed"}' : "Paste modified text..."}
                  rows={12}
                  className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground font-mono placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                />
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="badge badge-primary">{stats.added} added</span>
                <span className="badge badge-danger">{stats.removed} removed</span>
                <span className="badge" style={{ background: "var(--surface-1)", color: "var(--foreground-secondary)", border: "1px solid var(--border)" }}>{stats.unchanged} unchanged</span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => setViewMode("unified")} className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${viewMode === "unified" ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"}`}>Unified</button>
                  <button onClick={() => setViewMode("side-by-side")} className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${viewMode === "side-by-side" ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"}`}>Side-by-side</button>
                  <button onClick={handleCopy} className="btn btn-ghost p-1.5">
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Diff output */}
            {parsedHunks.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <pre className="text-xs font-mono leading-relaxed p-4 bg-surface-1">
                    {viewMode === "unified" ? (
                      parsedHunks.map((hunk, i) => (
                        <div key={i}>
                          {hunk.lines.map((line, j) => (
                            <div
                              key={j}
                              className={`px-2 ${
                                line.type === "add" ? "bg-green-50 text-green-800" :
                                line.type === "del" ? "bg-red-50 text-red-800" :
                                line.type === "header" ? "bg-primary-muted text-primary font-semibold" :
                                ""
                              }`}
                            >
                              <span className="inline-block w-4 text-right mr-2 select-none opacity-50">
                                {line.type === "add" ? "+" : line.type === "del" ? "-" : line.type === "header" ? "@" : " "}
                              </span>
                              {line.text}
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        <div>
                          {parsedHunks.flatMap(h => h.lines).filter(l => l.type === "del" || l.type === "ctx" || l.type === "header").map((line, j) => (
                            <div key={j} className={`px-2 ${line.type === "del" ? "bg-red-50 text-red-800" : line.type === "header" ? "bg-primary-muted text-primary font-semibold" : ""}`}>
                              {line.text}
                            </div>
                          ))}
                        </div>
                        <div>
                          {parsedHunks.flatMap(h => h.lines).filter(l => l.type === "add" || l.type === "ctx" || l.type === "header").map((line, j) => (
                            <div key={j} className={`px-2 ${line.type === "add" ? "bg-green-50 text-green-800" : line.type === "header" ? "bg-primary-muted text-primary font-semibold" : ""}`}>
                              {line.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}

        {diffMode === "image" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Image A</label>
                <FileUpload
                  accept="image/*"
                  files={imageFilesA}
                  onFilesChange={(f) => handleImageUpload("a", f)}
                  label="Drop image A"
                  description="Original image"
                />
                {imageA && <img src={imageA} alt="A" className="mt-3 max-h-64 object-contain rounded-lg border border-border" />}
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Image B</label>
                <FileUpload
                  accept="image/*"
                  files={imageFilesB}
                  onFilesChange={(f) => handleImageUpload("b", f)}
                  label="Drop image B"
                  description="Modified image"
                />
                {imageB && <img src={imageB} alt="B" className="mt-3 max-h-64 object-contain rounded-lg border border-border" />}
              </div>
            </div>
            {imageA && imageB && (
              <div className="glass-panel rounded-lg p-4">
                <p className="text-xs font-semibold text-foreground mb-3">Visual Comparison</p>
                <div className="grid grid-cols-2 gap-4">
                  <img src={imageA} alt="A" className="w-full object-contain rounded-lg border border-border" />
                  <img src={imageB} alt="B" className="w-full object-contain rounded-lg border border-border" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">No Size Limit</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Unlike Diffchecker.com which limits free users to 1MB, there&apos;s no size limit here. Compare files of any size, entirely in your browser.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Text, JSON & Images</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Unified or side-by-side view for text and JSON diffs. Visual comparison for images. All client-side, no data retention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
