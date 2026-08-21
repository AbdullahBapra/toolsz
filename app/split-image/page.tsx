"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Grid3x3,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface SplitPiece {
  url: string;
  row: number;
  col: number;
}

const gridOptions = [
  { rows: 1, cols: 2, label: "1×2" },
  { rows: 1, cols: 3, label: "1×3" },
  { rows: 2, cols: 1, label: "2×1" },
  { rows: 2, cols: 2, label: "2×2" },
  { rows: 3, cols: 1, label: "3×1" },
  { rows: 1, cols: 5, label: "1×5 (IG Carousel)" },
  { rows: 3, cols: 3, label: "3×3 (IG Grid)" },
];

export default function SplitImagePage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(3);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [pieces, setPieces] = useState<SplitPiece[]>([]);
  const piecesRef = useRef<SplitPiece[]>([]);

  useEffect(() => { piecesRef.current = pieces; }, [pieces]);
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      piecesRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    piecesRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles(newFiles); setDone(false); setPieces([]);
    if (newFiles.length === 0) { setImageUrl(null); return; }
    const url = URL.createObjectURL(newFiles[0]);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
  }, [imageUrl]);

  const handleProcess = useCallback(async () => {
    if (!imageUrl || !files.length) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = imageUrl; });

      const pieceW = Math.floor(img.naturalWidth / cols);
      const pieceH = Math.floor(img.naturalHeight / rows);
      const result: SplitPiece[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement("canvas");
          canvas.width = pieceW;
          canvas.height = pieceH;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.drawImage(img, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
          if (blob) result.push({ url: URL.createObjectURL(blob), row: r, col: c });
        }
      }

      piecesRef.current.forEach((p) => URL.revokeObjectURL(p.url));
      setPieces(result); setDone(true);
    } catch {
      addToast("error", "Failed to split image.");
    } finally {
      setProcessing(false);
    }
  }, [imageUrl, rows, cols, files, addToast]);

  const downloadAll = async () => {
    if (pieces.length === 1) {
      const a = document.createElement("a");
      a.href = pieces[0].url;
      a.download = `piece_${pieces[0].row}_${pieces[0].col}.png`;
      a.click();
      return;
    }
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const p of pieces) {
        const res = await fetch(p.url);
        zip.file(`piece_r${p.row}_c${p.col}.png`, await res.blob());
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${files[0]?.name.replace(/\.\w+$/, "")}_split.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch { addToast("error", "Failed to create ZIP."); }
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    piecesRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles([]); setDone(false); setProcessing(false); setImageUrl(null); setPieces([]);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={Grid3x3} title="Split Image" description="Split images into grids — 1×3, 2×2, 3×3 for Instagram carousels. Download all or individually. Free, instant, and private." backHref="/image-tools" backLabel="Back to Image Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept="image/*" files={files} onFilesChange={handleFileChange} label="Drop your image here" description="or click to browse — PNG, JPG, WebP, etc." />
              {imageUrl && (
                <div className="mt-8 animate-fade-in-up space-y-6">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-muted border border-primary-border">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">{imageSize.width} × {imageSize.height}px</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Grid3x3 className="w-5 h-5 text-primary" />Grid Presets</h3>
                    <div className="flex flex-wrap gap-2">
                      {gridOptions.map((opt) => (
                        <button key={opt.label} onClick={() => { setRows(opt.rows); setCols(opt.cols); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${rows === opt.rows && cols === opt.cols ? "bg-primary text-white" : "border border-border text-foreground hover:border-primary-border"}`}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">Rows</label><input type="number" min={1} max={10} value={rows} onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:border-primary transition-colors" /></div>
                    <div><label className="text-xs font-semibold text-foreground-secondary mb-1 block">Columns</label><input type="number" min={1} max={10} value={cols} onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:border-primary transition-colors" /></div>
                  </div>
                  <p className="text-xs text-foreground-muted text-center">{rows * cols} pieces &bull; each ~{Math.round(imageSize.width / cols)}×{Math.round(imageSize.height / rows)}px</p>
                </div>
              )}
              {imageUrl && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Splitting...</> : <><Grid3x3 className="w-5 h-5" />Split Image</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-success" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Image Split!</h3>
              <p className="text-foreground-secondary mb-6">{pieces.length} pieces</p>
              <div className="grid gap-2 mb-6 max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {pieces.map((p, i) => (
                  <a key={i} href={p.url} download={`piece_r${p.row}_c${p.col}.png`} className="rounded-lg border border-border overflow-hidden hover:border-primary transition-all">
                    <img src={p.url} alt={`Row ${p.row + 1}, Col ${p.col + 1}`} className="w-full h-auto" />
                  </a>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={downloadAll} className="btn btn-primary inline-flex items-center gap-2 text-center"><Download className="w-5 h-5" />Download All (ZIP)</button>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center"><RotateCcw className="w-4 h-4" />Split Another</button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5"><div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div><div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4><p className="text-foreground-muted text-sm leading-relaxed">Splitting happens entirely in your browser. Your image is never uploaded.</p></div></div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5"><div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div><div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Instagram Ready</h4><p className="text-foreground-muted text-sm leading-relaxed">1×5 carousel and 3×3 grid presets for perfect Instagram posts.</p></div></div>
        </div>
      </div>
    </div>
  );
}
