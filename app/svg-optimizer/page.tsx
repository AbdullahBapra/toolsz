"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Sparkles,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw as ResetIcon,
  FileCode,
  ArrowRight,
  Copy,
  X,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface OptimizedFile {
  originalName: string;
  originalSize: number;
  originalContent: string;
  optimizedContent: string;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  blob: Blob;
  url: string;
  status: "done" | "error";
  errorMsg?: string;
}

interface SvgoPlugin {
  name: string;
  description: string;
  enabled: boolean;
  category: "safety" | "quality" | "cleanup" | "advanced";
}

const DEFAULT_PLUGINS: SvgoPlugin[] = [
  { name: "removeDoctype", description: "Remove XML doctype declaration", enabled: true, category: "cleanup" },
  { name: "removeXMLProcInst", description: "Remove XML processing instructions", enabled: true, category: "cleanup" },
  { name: "removeComments", description: "Remove comments", enabled: true, category: "cleanup" },
  { name: "removeMetadata", description: "Remove <metadata>", enabled: true, category: "cleanup" },
  { name: "removeEditorsNSData", description: "Remove editor namespaces & elements", enabled: true, category: "cleanup" },
  { name: "cleanupAttrs", description: "Clean trailing whitespace in attributes", enabled: true, category: "cleanup" },
  { name: "mergeStyles", description: "Merge multiple <style> elements", enabled: true, category: "cleanup" },
  { name: "inlineStyles", description: "Move CSS to inline styles", enabled: true, category: "quality" },
  { name: "minifyStyles", description: "Minify CSS in <style> and inline", enabled: true, category: "quality" },
  { name: "cleanupIds", description: "Remove unused IDs, minify remaining", enabled: true, category: "cleanup" },
  { name: "removeUselessDefs", description: "Remove unused <defs> content", enabled: true, category: "cleanup" },
  { name: "cleanupNumericValues", description: "Round numeric values to 2 decimals", enabled: true, category: "quality" },
  { name: "convertColors", description: "Convert colors to shortest format", enabled: true, category: "quality" },
  { name: "removeUnknownsAndDefaults", description: "Remove unknown attrs & default values", enabled: true, category: "cleanup" },
  { name: "removeNonInheritableGroupAttrs", description: "Remove non-inheritable group attributes", enabled: true, category: "cleanup" },
  { name: "removeUselessStrokeAndFill", description: "Remove useless stroke/fill attrs", enabled: true, category: "cleanup" },
  { name: "removeViewBox", description: "Remove viewBox if matches width/height", enabled: false, category: "advanced" },
  { name: "cleanupEnableBackground", description: "Remove enable-background attr", enabled: true, category: "cleanup" },
  { name: "removeHiddenElems", description: "Remove hidden elements (display=none)", enabled: true, category: "cleanup" },
  { name: "removeEmptyText", description: "Remove empty <text> elements", enabled: true, category: "cleanup" },
  { name: "convertShapeToPath", description: "Convert basic shapes to <path>", enabled: true, category: "quality" },
  { name: "convertEllipseToCircle", description: "Convert <ellipse> to <circle>", enabled: true, category: "quality" },
  { name: "moveElemsAttrsToGroup", description: "Move common attrs to parent group", enabled: true, category: "advanced" },
  { name: "moveGroupAttrsToElems", description: "Move group attrs to child elements", enabled: false, category: "advanced" },
  { name: "collapseGroups", description: "Collapse useless <g> wrappers", enabled: true, category: "cleanup" },
  { name: "removeRasterImages", description: "Remove embedded raster images", enabled: false, category: "safety" },
  { name: "mergePaths", description: "Merge multiple <path> into one", enabled: true, category: "quality" },
  { name: "convertTransform", description: "Convert transforms to shorthand", enabled: true, category: "quality" },
  { name: "removeEmptyAttrs", description: "Remove empty attributes", enabled: true, category: "cleanup" },
  { name: "removeEmptyContainers", description: "Remove empty container elements", enabled: true, category: "cleanup" },
  { name: "removeUnusedNS", description: "Remove unused namespace declarations", enabled: true, category: "cleanup" },
  { name: "prefixIds", description: "Prefix IDs with filename (avoid conflicts)", enabled: false, category: "safety" },
  { name: "sortAttrs", description: "Sort attributes for better gzip", enabled: true, category: "quality" },
  { name: "sortDefsChildren", description: "Sort <defs> children for gzip", enabled: true, category: "quality" },
  { name: "removeDimensions", description: "Remove width/height, keep viewBox", enabled: false, category: "advanced" },
];

const CATEGORIES = [
  { id: "cleanup", label: "Cleanup", color: "text-blue-500" },
  { id: "quality", label: "Quality", color: "text-green-500" },
  { id: "safety", label: "Safety", color: "text-amber-500" },
  { id: "advanced", label: "Advanced", color: "text-purple-500" },
] as const;

export default function SvgOptimizerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [optimized, setOptimized] = useState<OptimizedFile[]>([]);
  const [plugins, setPlugins] = useState<SvgoPlugin[]>(DEFAULT_PLUGINS);
  const [prettyOutput, setPrettyOutput] = useState(false);
  const [showPlugins, setShowPlugins] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);

  const optimizedRef = useRef<OptimizedFile[]>([]);
  useEffect(() => { optimizedRef.current = optimized; }, [optimized]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      optimizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    };
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    optimizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    setOptimized([]);
    setDone(false);
    setFiles(newFiles);
    setPreviewIdx(0);
  }, []);

  const togglePlugin = useCallback((name: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.name === name ? { ...p, enabled: !p.enabled } : p))
    );
  }, []);

  const toggleCategory = useCallback((category: string, enabled: boolean) => {
    setPlugins((prev) =>
      prev.map((p) => (p.category === category ? { ...p, enabled } : p))
    );
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);

    optimizedRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });

    try {
      // Dynamic import of SVGO
      const { optimize } = await import("svgo");

      const enabledPlugins = plugins.filter((p) => p.enabled).map((p) => p.name);
      const svgoConfig = {
        plugins: enabledPlugins.map((name) => ({ name: name as any })),
        js2svg: {
          pretty: prettyOutput,
          indent: 2,
        },
      };

      const results: OptimizedFile[] = [];

      for (const file of files) {
        try {
          const content = await file.text();
          const result = optimize(content, svgoConfig);

          if ("error" in result && result.error) {
            results.push({
              originalName: file.name,
              originalSize: file.size,
              originalContent: content,
              optimizedContent: "",
              optimizedSize: 0,
              savings: 0,
              savingsPercent: 0,
              blob: new Blob(),
              url: "",
              status: "error",
              errorMsg: String(result.error),
            });
            continue;
          }

          const optimizedContent = result.data;
          const blob = new Blob([optimizedContent], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const optimizedSize = blob.size;
          const savings = file.size - optimizedSize;
          const savingsPercent = file.size > 0 ? Math.round((savings / file.size) * 100) : 0;

          results.push({
            originalName: file.name,
            originalSize: file.size,
            originalContent: content,
            optimizedContent,
            optimizedSize,
            savings: Math.max(0, savings),
            savingsPercent: Math.max(0, savingsPercent),
            blob,
            url,
            status: "done",
          });
        } catch (err) {
          results.push({
            originalName: file.name,
            originalSize: file.size,
            originalContent: "",
            optimizedContent: "",
            optimizedSize: 0,
            savings: 0,
            savingsPercent: 0,
            blob: new Blob(),
            url: "",
            status: "error",
            errorMsg: err instanceof Error ? err.message : "Optimization failed",
          });
        }
      }

      setOptimized(results);
      setDone(true);
      setPreviewIdx(0);
    } catch (err) {
      console.error("SVGO import failed:", err);
    } finally {
      setProcessing(false);
    }
  }, [files, plugins, prettyOutput]);

  const handleDownloadAll = useCallback(async () => {
    const successFiles = optimized.filter((f) => f.status === "done");
    if (successFiles.length === 1) {
      const f = successFiles[0];
      const a = document.createElement("a");
      a.href = f.url;
      a.download = f.originalName;
      a.click();
      return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const f of successFiles) {
      zip.file(f.originalName, f.blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized_svgs.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [optimized]);

  const handleReset = useCallback(() => {
    optimized.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
    setFiles([]);
    setOptimized([]);
    setDone(false);
    setProcessing(false);
    setPreviewIdx(0);
    setShowDiff(false);
  }, [optimized]);

  const handleCopyCode = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const totalOriginal = optimized.reduce((s, f) => s + f.originalSize, 0);
  const totalOptimized = optimized.filter((f) => f.status === "done").reduce((s, f) => s + f.optimizedSize, 0);
  const totalSavings = Math.max(0, totalOriginal - totalOptimized);
  const successCount = optimized.filter((f) => f.status === "done").length;
  const activeFile = optimized[previewIdx];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Sparkles}
          title="SVG Optimizer"
          description="Clean and optimize SVG files — remove bloat from Figma/Illustrator exports with 30+ optimization plugins. Free, instant, and private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept=".svg"
              files={files}
              onFilesChange={handleFileChange}
              label="Drop your SVG files here"
              description="or click to browse — one or multiple SVG files"
              multiple
            />

            {files.length > 0 && (
              <div className="mt-6 space-y-5 animate-fade-in-up">
                {/* File count */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-primary" />
                    {files.length} SVG{files.length !== 1 ? "s" : ""} selected
                  </h3>
                  <span className="text-xs text-foreground-secondary">
                    {formatSize(files.reduce((s, f) => s + f.size, 0))} total
                  </span>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-surface-1 border border-border cursor-pointer hover:bg-surface-2 transition-colors">
                    <input
                      type="checkbox"
                      checked={prettyOutput}
                      onChange={(e) => setPrettyOutput(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                    />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Pretty print output</p>
                      <p className="text-xs text-foreground-secondary">Indent SVG output for readability (slightly larger files).</p>
                    </div>
                  </label>

                  {/* Plugin toggles */}
                  <button
                    onClick={() => setShowPlugins(!showPlugins)}
                    className="w-full p-3 rounded-lg bg-surface-1 border border-border hover:bg-surface-2 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Optimization Plugins</p>
                        <p className="text-xs text-foreground-secondary">
                          {plugins.filter((p) => p.enabled).length}/{plugins.length} enabled — click to configure
                        </p>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-foreground-muted transition-transform ${showPlugins ? "rotate-90" : ""}`} />
                    </div>
                  </button>

                  {showPlugins && (
                    <div className="space-y-4 p-4 rounded-lg border border-border bg-surface-1 animate-fade-in-up">
                      {/* Category bulk toggles */}
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => {
                          const catPlugins = plugins.filter((p) => p.category === cat.id);
                          const allEnabled = catPlugins.every((p) => p.enabled);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => toggleCategory(cat.id, !allEnabled)}
                              className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all ${
                                allEnabled
                                  ? "bg-primary-muted border-primary-border text-primary"
                                  : "bg-surface-2 border-border text-foreground-secondary"
                              }`}
                            >
                              {cat.label} ({catPlugins.length})
                            </button>
                          );
                        })}
                      </div>

                      {/* Plugin list */}
                      <div className="space-y-1 max-h-80 overflow-y-auto">
                        {CATEGORIES.map((cat) => (
                          <div key={cat.id}>
                            <h5 className={`text-xs font-semibold ${cat.color} mt-3 mb-1`}>{cat.label}</h5>
                            {plugins
                              .filter((p) => p.category === cat.id)
                              .map((plugin) => (
                                <label
                                  key={plugin.name}
                                  className="flex items-center gap-2 py-1 px-2 rounded hover:bg-surface-2 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={plugin.enabled}
                                    onChange={() => togglePlugin(plugin.name)}
                                    className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/30"
                                  />
                                  <span className="text-xs font-medium text-foreground min-w-[160px]">
                                    {plugin.name}
                                  </span>
                                  <span className="text-xs text-foreground-muted">{plugin.description}</span>
                                </label>
                              ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Process Button */}
                <div className="flex flex-col items-center pt-2">
                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Optimizing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Optimize {files.length} SVG{files.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {/* Summary */}
            <div className="glass-panel rounded-[16px] p-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">{successCount} optimized</span>
              </div>
              {optimized.some((f) => f.status === "error") && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-semibold text-red-700">
                    {optimized.filter((f) => f.status === "error").length} failed
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
                <span className="text-xs font-semibold text-foreground-secondary">
                  {formatSize(totalOriginal)} → {formatSize(totalOptimized)}
                  {totalSavings > 0 && (
                    <span className="text-success ml-1">({totalSavings > 1024 ? formatSize(totalSavings) : `${totalSavings} B`} saved)</span>
                  )}
                </span>
              </div>
              <div className="flex-1" />
              <button
                onClick={handleDownloadAll}
                className="btn btn-primary inline-flex items-center gap-2 text-xs"
              >
                <Download className="w-4 h-4" /> {successCount === 1 ? "Download" : "Download ZIP"}
              </button>
            </div>

            {/* File tabs for multiple files */}
            {optimized.length > 1 && (
              <div className="flex gap-1 overflow-x-auto pb-1">
                {optimized.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewIdx(i)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all ${
                      previewIdx === i
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                  >
                    {f.originalName}
                    {f.status === "done" && (
                      <span className="text-success ml-1">-{f.savingsPercent}%</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Active file detail */}
            {activeFile && activeFile.status === "done" && (
              <div className="glass-panel rounded-[16px] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{activeFile.originalName}</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDiff(!showDiff)}
                      className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all ${
                        showDiff
                          ? "bg-primary-muted border-primary-border text-primary"
                          : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                      }`}
                    >
                      {showDiff ? "Preview" : "View Code"}
                    </button>
                    <button
                      onClick={() => handleCopyCode(activeFile.optimizedContent)}
                      className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Savings badge */}
                <div className="flex gap-3">
                  <div className="px-3 py-2 rounded-lg bg-surface-1 border border-border">
                    <p className="text-xs text-foreground-muted">Original</p>
                    <p className="text-sm font-semibold text-foreground">{formatSize(activeFile.originalSize)}</p>
                  </div>
                  <div className="flex items-center text-foreground-muted">→</div>
                  <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-100">
                    <p className="text-xs text-green-600">Optimized</p>
                    <p className="text-sm font-semibold text-green-700">{formatSize(activeFile.optimizedSize)}</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-primary-muted border border-primary-border">
                    <p className="text-xs text-primary">Saved</p>
                    <p className="text-sm font-semibold text-primary">{activeFile.savingsPercent}%</p>
                  </div>
                </div>

                {showDiff ? (
                  /* Code view */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground-secondary mb-1">Original</p>
                      <pre className="text-xs bg-surface-1 border border-border rounded-lg p-3 overflow-auto max-h-64 text-foreground-secondary whitespace-pre-wrap break-all">
                        {activeFile.originalContent.substring(0, 2000)}
                        {activeFile.originalContent.length > 2000 && "..."}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground-secondary mb-1">Optimized</p>
                      <pre className="text-xs bg-surface-1 border border-border rounded-lg p-3 overflow-auto max-h-64 text-foreground-secondary whitespace-pre-wrap break-all">
                        {activeFile.optimizedContent.substring(0, 2000)}
                        {activeFile.optimizedContent.length > 2000 && "..."}
                      </pre>
                    </div>
                  </div>
                ) : (
                  /* Visual preview */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground-secondary mb-1">Original</p>
                      <div
                        className="bg-white border border-border rounded-lg p-4 flex items-center justify-center min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: activeFile.originalContent }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground-secondary mb-1">Optimized</p>
                      <div
                        className="bg-white border border-border rounded-lg p-4 flex items-center justify-center min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: activeFile.optimizedContent }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeFile && activeFile.status === "error" && (
              <div className="glass-panel rounded-[16px] p-5 border-red-200">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">{activeFile.originalName}</p>
                    <p className="text-xs text-red-500 mt-1">{activeFile.errorMsg}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2">
                <ResetIcon className="w-4 h-4" /> Optimize More SVGs
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">100% Client-Side — No Upload</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All SVG optimization runs in your browser using SVGO (WebAssembly). Your design files never leave your device.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">30+ Optimization Plugins</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Remove bloat from Figma & Illustrator exports — useless metadata, editor namespaces, redundant attributes, and more. Toggle each plugin on or off.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
