"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
} from "pdf-lib";
import {
  Droplets,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  FileText,
  RotateCcw as ResetIcon,
  Type,
  Palette,
  Eye,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type WatermarkPosition = "center" | "top" | "bottom";
type WatermarkRotation = 0 | 45 | -45 | 90;

interface OutputFile {
  name: string;
  blob: Blob;
  url: string;
}

const presetColors = [
  { label: "Gray", value: "#9CA3AF", rgb: rgb(0.61, 0.64, 0.69) },
  { label: "Red", value: "#EF4444", rgb: rgb(0.94, 0.27, 0.27) },
  { label: "Blue", value: "#3B82F6", rgb: rgb(0.23, 0.51, 0.96) },
  { label: "Green", value: "#22C55E", rgb: rgb(0.13, 0.77, 0.37) },
  { label: "Purple", value: "#A855F7", rgb: rgb(0.66, 0.33, 0.97) },
  { label: "Orange", value: "#F97316", rgb: rgb(0.98, 0.45, 0.09) },
  { label: "Black", value: "#000000", rgb: rgb(0, 0, 0) },
];

const rotationOptions: {
  value: WatermarkRotation;
  label: string;
}[] = [
  { value: 0, label: "Horizontal" },
  { value: 45, label: "Diagonal ↘" },
  { value: -45, label: "Diagonal ↗" },
  { value: 90, label: "Vertical" },
];

const positionOptions: {
  value: WatermarkPosition;
  label: string;
}[] = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
];

export default function WatermarkPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  // Watermark settings
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [selectedColor, setSelectedColor] = useState(0);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState<WatermarkRotation>(45);
  const [position, setPosition] = useState<WatermarkPosition>("center");

  // Output
  const [output, setOutput] = useState<OutputFile | null>(null);
  const outputRef = useRef<OutputFile | null>(null);

  // Keep ref in sync for cleanup
  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    };
  }, []);

  // Load PDF to get page count
  const handleFileChange = useCallback(async (newFiles: File[]) => {
    if (outputRef.current) {
      URL.revokeObjectURL(outputRef.current.url);
      setOutput(null);
    }

    setFiles(newFiles);
    setDone(false);

    if (newFiles.length === 0) {
      setPageCount(0);
      return;
    }

    try {
      const arrayBuffer = await newFiles[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      setPageCount(pdf.getPageCount());
    } catch {
      setPageCount(0);
    }
  }, []);

  // Compute text position for a given page
  const getTextPosition = useCallback(
    (pageWidth: number, pageHeight: number, textWidth: number, pos: WatermarkPosition, rot: WatermarkRotation) => {
      const centerX = pageWidth / 2 - textWidth / 2;
      // For diagonal rotations, shift y to visually center the rotated bounding box
      const diagonalOffset =
        rot === 45 || rot === -45 ? textWidth * Math.sin(Math.PI / 4) / 4 : 0;
      switch (pos) {
        case "center":
          return { x: centerX, y: pageHeight / 2 - fontSize / 2 - diagonalOffset };
        case "top":
          return { x: centerX, y: pageHeight - fontSize - 40 };
        case "bottom":
          return { x: centerX, y: 40 };
      }
    },
    [fontSize]
  );

  // Apply watermark and generate PDF
  const handleProcess = useCallback(async () => {
    if (files.length === 0 || !watermarkText.trim()) return;
    setProcessing(true);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pages = pdfDoc.getPages();
      const color = presetColors[selectedColor].rgb;

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const { x, y } = getTextPosition(width, height, textWidth, position, rotation);

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color,
          opacity,
          rotate: degrees(rotation),
        });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");

      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);

      const result: OutputFile = {
        name: `${baseName}_watermarked.pdf`,
        blob,
        url: URL.createObjectURL(blob),
      };

      setOutput(result);
      setDone(true);
    } catch (err) {
      console.error("Watermark error:", err);
      addToast("error", "An error occurred while adding the watermark. Please ensure it's a valid PDF.");
    } finally {
      setProcessing(false);
    }
  }, [
    files,
    addToast,
    watermarkText,
    fontSize,
    selectedColor,
    opacity,
    rotation,
    position,
    getTextPosition,
  ]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setPageCount(0);
    setOutput(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isValid = files.length > 0 && watermarkText.trim().length > 0;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Droplets}
          title="Watermark PDF"
          description="Add custom text watermarks to your PDF with adjustable size, color, opacity, and rotation — free and private. Your original content stays intact with no added watermarks from us."
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
                onFilesChange={handleFileChange}
                label="Drop your PDF here"
                description="or click to browse — PDF files only"
              />

              {/* Page count indicator */}
              {pageCount > 0 && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-muted border border-primary-border animate-fade-in-up">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {pageCount} page{pageCount !== 1 ? "s" : ""} detected
                  </span>
                </div>
              )}

              {/* Watermark Settings */}
              {pageCount > 0 && (
                <div className="mt-8 space-y-6 animate-fade-in-up">
                  {/* Text Input */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-primary" />
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      maxLength={60}
                    />
                    <p className="mt-1.5 text-[10px] text-foreground-muted text-right">
                      {watermarkText.length}/60
                    </p>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-primary" />
                      Font Size
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={12}
                        max={120}
                        value={fontSize}
                        onChange={(e) =>
                          setFontSize(parseInt(e.target.value, 10))
                        }
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs font-bold text-primary w-12 text-right tabular-nums">
                        {fontSize}pt
                      </span>
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map((color, idx) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(idx)}
                          className={`w-9 h-9 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                            selectedColor === idx
                              ? "border-primary scale-110 shadow-md"
                              : "border-border hover:border-primary-border"
                          }`}
                          style={{ backgroundColor: color.value }}
                          aria-label={`Select ${color.label} color`}
                        >
                          {selectedColor === idx && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opacity */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      Opacity
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0.05}
                        max={1}
                        step={0.05}
                        value={opacity}
                        onChange={(e) =>
                          setOpacity(parseFloat(e.target.value))
                        }
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs font-bold text-primary w-12 text-right tabular-nums">
                        {Math.round(opacity * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Rotation */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Rotation
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {rotationOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setRotation(opt.value)}
                          className={`px-4 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                            rotation === opt.value
                              ? "border-primary bg-primary-muted text-primary shadow-sm"
                              : "border-border text-foreground hover:border-primary-border"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Position
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {positionOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setPosition(opt.value)}
                          className={`px-4 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                            position === opt.value
                              ? "border-primary bg-primary-muted text-primary shadow-sm"
                              : "border-border text-foreground hover:border-primary-border"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      Preview
                    </label>
                    <div className="relative w-full aspect-[3/4] max-w-[280px] mx-auto bg-white border-2 border-border rounded-xl shadow-md overflow-hidden">
                      {/* Faint grid lines to simulate page */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="h-px bg-black top-[25%] absolute w-full" />
                        <div className="h-px bg-black top-[50%] absolute w-full" />
                        <div className="h-px bg-black top-[75%] absolute w-full" />
                        <div className="w-px bg-black left-[33%] absolute h-full" />
                        <div className="w-px bg-black left-[66%] absolute h-full" />
                      </div>
                      {/* Watermark preview */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          justifyContent:
                            position === "top"
                              ? "flex-start"
                              : position === "bottom"
                              ? "flex-end"
                              : "center",
                          paddingTop:
                            position === "top" ? "10%" : undefined,
                          paddingBottom:
                            position === "bottom" ? "10%" : undefined,
                        }}
                      >
                        <span
                          style={{
                            fontSize: `${Math.max(8, fontSize / 5)}px`,
                            color: presetColors[selectedColor].value,
                            opacity,
                            transform: `rotate(${rotation}deg)`,
                            transition: "all 0.3s ease",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            userSelect: "none",
                            textAlign: "center",
                          }}
                        >
                          {watermarkText || "WATERMARK"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {pageCount > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleProcess}
                    disabled={processing || !isValid}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding Watermark...
                      </>
                    ) : (
                      <>
                        <Droplets className="w-5 h-5" />
                        Apply Watermark & Download
                      </>
                    )}
                  </button>
                </div>
              )}

              {!isValid && pageCount > 0 && (
                <p className="text-center text-xs text-foreground-muted mt-3">
                  Enter watermark text to continue.
                </p>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Watermark Applied!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your PDF has been watermarked with &ldquo;{watermarkText}
                &rdquo; across all {pageCount} page
                {pageCount !== 1 ? "s" : ""} and is ready to download.
              </p>

              {/* Output file */}
              {output && (
                <div className="max-w-sm mx-auto mb-6">
                  <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {output.name}
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        {pageCount} page{pageCount !== 1 ? "s" : ""} •{" "}
                        {formatSize(output.blob.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={output?.url}
                  download={output?.name}
                  className="btn btn-primary inline-flex items-center gap-2 text-center"
                >
                  <Download className="w-5 h-5" />
                  Download Watermarked PDF
                </a>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  <ResetIcon className="w-4 h-4" />
                  Watermark Another PDF
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
                Private & Secure
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Watermarking happens entirely in your browser using pdf-lib.
                Your PDF is never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Fully Customizable
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Control every detail — text, font size, color, opacity,
                rotation angle, and position. Live preview shows exactly how it
                will look.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
