"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Eye,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type CbType = "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

const CB_TYPES: { id: CbType; label: string; desc: string }[] = [
  { id: "protanopia", label: "Protanopia", desc: "No red cones (1% males)" },
  { id: "deuteranopia", label: "Deuteranopia", desc: "No green cones (1% males)" },
  { id: "tritanopia", label: "Tritanopia", desc: "No blue cones (rare)" },
  { id: "achromatopsia", label: "Achromatopsia", desc: "Total color blindness (rare)" },
];

// Color blindness simulation matrices (Viénot, Brettel & Mollon)
const MATRICES: Record<CbType, number[][]> = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
};

function simulateCb(r: number, g: number, b: number, type: CbType): [number, number, number] {
  const m = MATRICES[type];
  return [
    Math.min(255, Math.max(0, Math.round(m[0][0] * r + m[0][1] * g + m[0][2] * b))),
    Math.min(255, Math.max(0, Math.round(m[1][0] * r + m[1][1] * g + m[1][2] * b))),
    Math.min(255, Math.max(0, Math.round(m[2][0] * r + m[2][1] * g + m[2][2] * b))),
  ];
}

export default function ColorBlindSimulatorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Record<CbType, string | null>>({
    protanopia: null,
    deuteranopia: null,
    tritanopia: null,
    achromatopsia: null,
  });
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CbType>("protanopia");

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);

    try {
      const file = files[0];
      const img = new Image();
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      img.src = url;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const newResults: Record<CbType, string | null> = {
        protanopia: null,
        deuteranopia: null,
        tritanopia: null,
        achromatopsia: null,
      };

      for (const type of Object.keys(MATRICES) as CbType[]) {
        const newImageData = new ImageData(new Uint8ClampedArray(data), canvas.width, canvas.height);
        const nd = newImageData.data;
        for (let i = 0; i < nd.length; i += 4) {
          const [r, g, b] = simulateCb(nd[i], nd[i + 1], nd[i + 2], type);
          nd[i] = r;
          nd[i + 1] = g;
          nd[i + 2] = b;
        }
        const simCanvas = document.createElement("canvas");
        simCanvas.width = canvas.width;
        simCanvas.height = canvas.height;
        simCanvas.getContext("2d")!.putImageData(newImageData, 0, 0);
        newResults[type] = simCanvas.toDataURL("image/png");
      }

      setResults(newResults);
    } catch (err) {
      console.error("Simulation failed:", err);
      setError("Failed to process image.");
    } finally {
      setProcessing(false);
    }
  }, [files]);

  const handleDownload = useCallback((type: CbType) => {
    const url = results[type];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-simulation.png`;
    a.click();
  }, [results]);

  // Cleanup blob URLs on unmount
  const urlRef = useRef<string | null>(null);
  useEffect(() => {
    urlRef.current = originalUrl;
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [originalUrl]);

  const handleReset = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFiles([]);
    setProcessing(false);
    setResults({ protanopia: null, deuteranopia: null, tritanopia: null, achromatopsia: null });
    setOriginalUrl(null);
    setError(null);
  }, [originalUrl]);

  const hasResults = Object.values(results).some(v => v !== null);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Eye}
          title="Color Blindness Simulator"
          description="See how your designs look to people with Protanopia, Deuteranopia, Tritanopia, and more color vision deficiencies — free accessibility testing tool."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!hasResults ? (
            <>
              <FileUpload
                accept="image/*"
                files={files}
                onFilesChange={setFiles}
                label="Drop your image here"
                description="PNG, JPG, WebP — we'll simulate all 4 types"
              />

              {files.length > 0 && !processing && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} className="btn btn-primary inline-flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Simulate Color Blindness
                  </button>
                </div>
              )}

              {processing && (
                <div className="mt-8 text-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-foreground-secondary">Simulating 4 types of color blindness...</p>
                </div>
              )}

              {error && <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center">{error}</div>}
            </>
          ) : (
            <>
              {/* Type selector tabs */}
              <div className="flex gap-2 flex-wrap mb-4">
                {CB_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      selected === t.id
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                  >
                    {t.label}
                    <span className="block text-[10px] opacity-70">{t.desc}</span>
                  </button>
                ))}
              </div>

              {/* Before/After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {originalUrl && (
                  <div>
                    <p className="text-xs font-semibold text-foreground-muted mb-2">Original</p>
                    <img src={originalUrl} alt="Original" className="w-full rounded-lg border border-border" />
                  </div>
                )}
                {results[selected] && (
                  <div>
                    <p className="text-xs font-semibold text-primary mb-2">{CB_TYPES.find(t => t.id === selected)?.label} View</p>
                    <img src={results[selected]!} alt={selected} className="w-full rounded-lg border border-primary-border" />
                  </div>
                )}
              </div>

              {/* All 4 thumbnails */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {CB_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    className={`rounded-lg border overflow-hidden transition-all ${
                      selected === t.id ? "border-primary ring-2 ring-primary/30" : "border-border"
                    }`}
                  >
                    {results[t.id] && <img src={results[t.id]!} alt={t.label} className="w-full" />}
                    <p className="text-[10px] font-semibold p-1 truncate">{t.label}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={() => handleDownload(selected)} className="btn btn-primary inline-flex items-center gap-2">
                  <Download className="w-5 h-5" /> Download {CB_TYPES.find(t => t.id === selected)?.label}
                </button>
                <button onClick={handleReset} className="btn btn-secondary">Simulate Another</button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">WCAG Accessibility</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Ensure your designs are accessible to the 8% of men and 0.5% of women with color vision deficiency. Essential for compliance.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">4 Simulation Types</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Protanopia (red), Deuteranopia (green), Tritanopia (blue), and Achromatopsia (total) — using scientifically accurate transformation matrices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
