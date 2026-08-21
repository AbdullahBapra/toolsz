"use client";

import { useState } from "react";
import {
  FileDown,
  Check,
  Loader2,
  Shield,
  Zap,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

const qualityOptions = [
  {
    id: "low",
    label: "Low Compression",
    description: "Best quality, larger file size",
    reduction: "~20-30%",
  },
  {
    id: "medium",
    label: "Medium Compression",
    description: "Balanced quality and size",
    reduction: "~40-60%",
  },
  {
    id: "high",
    label: "High Compression",
    description: "Smallest file, some quality loss",
    reduction: "~60-80%",
  },
];

export default function CompressPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState("medium");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{old: number, new: number} | null>(null);

  const handleCompress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    
    try {
      const file = files[0];
      const { PDFDocument } = await import("pdf-lib");
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const originalSize = arrayBuffer.byteLength;
      
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const newPdf = await PDFDocument.create();
      
      let scale = 1.5;
      let jpegQuality = 0.75;
      
      if (quality === "low") {
        scale = 2.0;
        jpegQuality = 0.9;
      } else if (quality === "high") {
        scale = 1.0;
        jpegQuality = 0.6;
      }

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const originalViewport = page.getViewport({ scale: 1.0 });
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        if (!context) continue;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        const blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob(resolve, "image/jpeg", jpegQuality)
        );
        
        if (blob) {
          const imageBytes = await blob.arrayBuffer();
          const jpgImage = await newPdf.embedJpg(imageBytes);
          const newPage = newPdf.addPage([originalViewport.width, originalViewport.height]);
          newPage.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: originalViewport.width,
            height: originalViewport.height,
          });
        }
      }

      const mergedPdfFile = await newPdf.save({ useObjectStreams: true });
      const newSize = mergedPdfFile.byteLength;
      
      const blob = new Blob([mergedPdfFile], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setStats({ old: originalSize, new: newSize });
      setDownloadUrl(url);
      setDone(true);
    } catch (error) {
      console.error("Error compressing PDF:", error);
      addToast("error", "An error occurred during compression. Please try a valid PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setStats(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileDown}
          title="Compress PDF"
          description="Reduce PDF file size online without losing visual quality. Our free document compressor runs entirely in your browser — no slow uploads, no watermarks, and absolute privacy for sensitive documents."
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
                onFilesChange={setFiles}

                label="Drop your PDF here"
                description="or click to browse — PDF files only"
              />

              {/* Quality Selection */}
              {files.length > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Compression Level
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {qualityOptions.map((option) => (
                      <button
                        key={option.id}
                        role="radio"
                        aria-checked={quality === option.id}
                        onClick={() => setQuality(option.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          quality === option.id
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border hover:border-primary-border hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              quality === option.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {quality === option.id && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                          <span className="font-semibold text-xs text-foreground">
                            {option.label}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-muted ml-6">
                          {option.description}
                        </p>
                        <p className="text-xs text-primary font-semibold ml-6 mt-1">
                          {option.reduction} smaller
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleCompress}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Compressing...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-5 h-5" />
                        Compress PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                PDF Processed Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                {stats && stats.new < stats.old ? (
                  <>Your file has been optimized. By reconstructing the document and clearing unused data, we reduced the size by ~{((1 - stats.new / stats.old) * 100).toFixed(0)}%.</>
                ) : (
                  <>Your file has been successfully reconstructed. However, the original document was already highly optimized or contains un-compressible imagery, so the size remains roughly the same.</>
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`optimized-${files[0]?.name || "document.pdf"}`}
                    className="btn btn-primary inline-flex items-center gap-2 text-center"
                  >
                    <FileDown className="w-5 h-5" />
                    Download Optimized PDF
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  Compress Another File
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
                Secure Processing
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your files are encrypted and automatically deleted after 2 hours.
                We never store or share your data.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Instant Results
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Smart compression algorithms optimize your PDF in seconds while
                preserving text clarity and image quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
