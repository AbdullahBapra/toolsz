"use client";

import { useState, useCallback } from "react";
import {
  Palette,
  Check,
  Shield,
  Zap,
  Copy,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

type GradientType = "linear" | "radial" | "conic";

interface ColorStop {
  color: string;
  position: number; // 0-100
}

const PRESETS: { name: string; stops: ColorStop[]; angle: number; type: GradientType }[] = [
  { name: "Sunset", stops: [{ color: "#f97316", position: 0 }, { color: "#ec4899", position: 100 }], angle: 135, type: "linear" },
  { name: "Ocean", stops: [{ color: "#06b6d4", position: 0 }, { color: "#3b82f6", position: 100 }], angle: 135, type: "linear" },
  { name: "Forest", stops: [{ color: "#22c55e", position: 0 }, { color: "#16a34a", position: 50 }, { color: "#065f46", position: 100 }], angle: 180, type: "linear" },
  { name: "Purple Haze", stops: [{ color: "#a855f7", position: 0 }, { color: "#6366f1", position: 100 }], angle: 135, type: "linear" },
  { name: "Fire", stops: [{ color: "#ef4444", position: 0 }, { color: "#f97316", position: 50 }, { color: "#eab308", position: 100 }], angle: 90, type: "linear" },
  { name: "Night Sky", stops: [{ color: "#1e1b4b", position: 0 }, { color: "#312e81", position: 50 }, { color: "#4338ca", position: 100 }], angle: 180, type: "linear" },
  { name: "Peach", stops: [{ color: "#fda4af", position: 0 }, { color: "#fcd34d", position: 100 }], angle: 135, type: "linear" },
  { name: "Aurora", stops: [{ color: "#2dd4bf", position: 0 }, { color: "#818cf8", position: 50 }, { color: "#c084fc", position: 100 }], angle: 135, type: "linear" },
  { name: "Radial Burst", stops: [{ color: "#fbbf24", position: 0 }, { color: "#f97316", position: 50 }, { color: "#dc2626", position: 100 }], angle: 0, type: "radial" },
  { name: "Conic Wheel", stops: [{ color: "#ef4444", position: 0 }, { color: "#eab308", position: 25 }, { color: "#22c55e", position: 50 }, { color: "#3b82f6", position: 75 }, { color: "#ef4444", position: 100 }], angle: 0, type: "conic" },
];

function generateCSS(type: GradientType, stops: ColorStop[], angle: number): string {
  const stopsStr = stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");
  switch (type) {
    case "linear":
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    case "radial":
      return `radial-gradient(circle, ${stopsStr})`;
    case "conic":
      return `conic-gradient(from ${angle}deg, ${stopsStr})`;
  }
}

export default function GradientGeneratorPage() {
  const [type, setType] = useState<GradientType>("linear");
  const [stops, setStops] = useState<ColorStop[]>([
    { color: "#3b82f6", position: 0 },
    { color: "#8b5cf6", position: 100 },
  ]);
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState<string | null>(null);

  const css = generateCSS(type, stops, angle);
  const fullCSS = `background: ${css};`;

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const addStop = useCallback(() => {
    const lastPos = stops[stops.length - 1]?.position ?? 50;
    const newPos = Math.min(lastPos, 90);
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    setStops((s) => [...s, { color: randomColor, position: newPos + 10 }]);
  }, [stops]);

  const removeStop = useCallback((idx: number) => {
    if (stops.length <= 2) return;
    setStops((s) => s.filter((_, i) => i !== idx));
  }, [stops]);

  const updateStop = useCallback((idx: number, field: keyof ColorStop, value: string | number) => {
    setStops((s) => {
      const updated = [...s];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  }, []);

  const applyPreset = useCallback((preset: typeof PRESETS[number]) => {
    setType(preset.type);
    setStops(preset.stops.map((s) => ({ ...s })));
    setAngle(preset.angle);
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Palette}
          title="CSS Gradient Generator"
          description="Build CSS gradients visually — linear, radial, conic with 10 presets and copy-paste CSS output. Free, instant, and private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          {/* Left: Controls */}
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Gradient Type</label>
              <div className="flex gap-2">
                {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-4 py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                      type === t
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Angle */}
            {type !== "radial" && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Angle: {angle}°</label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground-muted mt-1">
                  <span>0°</span>
                  <span>360°</span>
                </div>
              </div>
            )}

            {/* Color Stops */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground">Color Stops</label>
                <button onClick={addStop} className="text-xs text-primary hover:underline">+ Add Stop</button>
              </div>
              <div className="space-y-2">
                {stops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateStop(i, "color", e.target.value)}
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateStop(i, "color", e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs font-mono text-foreground"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) => updateStop(i, "position", parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-xs text-foreground-muted w-8">{stop.position}%</span>
                    {stops.length > 2 && (
                      <button onClick={() => removeStop(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Output */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">CSS</label>
                <button onClick={() => handleCopy(fullCSS, "css")} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  {copied === "css" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <code className="block p-3 rounded-lg bg-surface-1 border border-border text-xs font-mono text-foreground break-all select-all">
                {fullCSS}
              </code>
            </div>
          </div>

          {/* Right: Preview + Presets */}
          <div className="space-y-6">
            {/* Preview */}
            <div
              className="glass-panel rounded-[16px] p-1 aspect-square max-h-[320px]"
              style={{ background: css }}
            />

            {/* Presets */}
            <div className="glass-panel rounded-[16px] p-4 space-y-3">
              <h4 className="text-xs font-semibold text-foreground">Presets</h4>
              <div className="grid grid-cols-5 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="aspect-square rounded-lg border border-border hover:border-primary transition-all hover:scale-105 relative group"
                    style={{ background: generateCSS(p.type, p.stops, p.angle) }}
                    title={p.name}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-white mix-blend-difference">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">3 Gradient Types</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Linear, radial, and conic gradients with unlimited color stops, angle control, and live preview.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">10 Curated Presets</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Beautiful gradient presets from Sunset to Aurora. Click to apply, customize, and copy the CSS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
