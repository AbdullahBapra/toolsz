"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Barcode as BarcodeIcon,
  Shield,
  Zap,
  Download,
  Copy,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

type BarcodeFormat = "CODE128" | "CODE39" | "EAN13" | "UPC" | "ITF14" | "MSI" | "codabar";

const FORMATS: { id: BarcodeFormat; label: string; desc: string; example: string }[] = [
  { id: "CODE128", label: "Code 128", desc: "Most versatile — any ASCII text", example: "Hello-123" },
  { id: "CODE39", label: "Code 39", desc: "Alphanumeric, widely used", example: "HELLO123" },
  { id: "EAN13", label: "EAN-13", desc: "European product barcode (13 digits)", example: "5901234123457" },
  { id: "UPC", label: "UPC-A", desc: "US product barcode (12 digits)", example: "123456789012" },
  { id: "ITF14", label: "ITF-14", desc: "Shipping carton code (14 digits)", example: "12345678901231" },
  { id: "MSI", label: "MSI", desc: "Inventory tracking (digits only)", example: "1234567" },
  { id: "codabar", label: "Codabar", desc: "Libraries, blood banks, FedEx", example: "A12345B" },
];

export default function BarcodePage() {
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [value, setValue] = useState("Hello-123");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const containerRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(async () => {
    if (!containerRef.current || !value.trim()) return;
    try {
      const JsBarcode = (await import("jsbarcode")).default;
      containerRef.current.innerHTML = "";
      const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      containerRef.current.appendChild(svgEl);
      JsBarcode(svgEl, value, {
        format,
        width: barWidth,
        height,
        displayValue: showText,
        fontSize,
        lineColor: fgColor,
        background: bgColor,
        margin: 10,
      });
    } catch {
      containerRef.current.innerHTML = `<p style="color:#ef4444;font-size:12px;padding:20px;">Invalid value for ${format} format. Check the example.</p>`;
    }
  }, [value, format, barWidth, height, showText, fontSize, fgColor, bgColor]);

  useEffect(() => { generate(); }, [generate]);

  const handleDownload = useCallback((fmt: "png" | "svg") => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    if (fmt === "svg") {
      const data = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([data], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "barcode.svg"; a.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement("canvas");
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        const a = document.createElement("a"); a.href = canvas.toDataURL("image/png"); a.download = "barcode.png"; a.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)));
    }
  }, []);

  const handleCopy = useCallback(async () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    await navigator.clipboard.writeText(data);
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={BarcodeIcon} title="Barcode Generator" description="Generate barcodes in 7 formats — Code128, EAN-13, UPC-A, ITF-14, MSI, Codabar — with PNG and SVG export. Free and instant." backHref="/dev-tools" backLabel="Back to Developer Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Format</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FORMATS.map((f) => (
                  <button key={f.id} onClick={() => { setFormat(f.id); setValue(f.example); }} className={`px-2.5 py-2 rounded-lg border text-left transition-all ${format === f.id ? "bg-primary-muted border-primary-border" : "bg-surface-1 border-border hover:bg-surface-2"}`}>
                    <div className={`text-xs font-semibold ${format === f.id ? "text-primary" : "text-foreground"}`}>{f.label}</div>
                    <div className="text-xs text-foreground-muted">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Value</label>
              <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p className="text-xs text-foreground-muted mt-1">Example: {FORMATS.find((f) => f.id === format)?.example}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-foreground mb-1">Foreground</label><div className="flex items-center gap-2"><input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" /><input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs text-foreground font-mono" /></div></div>
              <div><label className="block text-xs font-semibold text-foreground mb-1">Background</label><div className="flex items-center gap-2"><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" /><input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs text-foreground font-mono" /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-foreground mb-1">Bar Width: {barWidth}px</label><input type="range" min={1} max={5} value={barWidth} onChange={(e) => setBarWidth(parseInt(e.target.value))} className="w-full" /></div>
              <div><label className="block text-xs font-semibold text-foreground mb-1">Height: {height}px</label><input type="range" min={40} max={200} value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className="w-full" /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} className="w-4 h-4 rounded border-border text-primary" /><span className="text-xs font-semibold text-foreground">Show text below barcode</span></label>
            {showText && <div><label className="block text-xs font-semibold text-foreground mb-1">Font Size: {fontSize}px</label><input type="range" min={10} max={28} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full" /></div>}
          </div>
          <div className="glass-panel rounded-[16px] p-6 flex flex-col items-center justify-center">
            <div ref={containerRef} className="min-h-[120px] flex items-center justify-center w-full" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleDownload("png")} className="btn btn-primary inline-flex items-center gap-1.5 text-xs"><Download className="w-3.5 h-3.5" />PNG</button>
              <button onClick={() => handleDownload("svg")} className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"><Download className="w-3.5 h-3.5" />SVG</button>
              <button onClick={handleCopy} className="btn btn-secondary inline-flex items-center gap-1.5 text-xs px-3"><Copy className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5"><div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div><div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">7 Barcode Formats</h4><p className="text-foreground-muted text-sm leading-relaxed">Code128, Code39, EAN-13, UPC-A, ITF-14, MSI, and Codabar — covers retail, shipping, inventory, and library use cases.</p></div></div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5"><div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div><div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Print-Ready Export</h4><p className="text-foreground-muted text-sm leading-relaxed">Download as PNG or scalable SVG. Customize bar width, height, colors, and font size for perfect label printing.</p></div></div>
        </div>
      </div>
    </div>
  );
}
