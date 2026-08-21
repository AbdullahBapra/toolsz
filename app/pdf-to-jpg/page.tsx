"use client";

import { useState } from "react";
import {
  Image,
  Check,
  Loader2,
  Shield,
  Zap,
  Settings,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

const qualityOptions = [
  { id: "low", label: "Normal (72 DPI)", description: "Good for screen viewing" },
  { id: "medium", label: "Good (150 DPI)", description: "Balanced quality" },
  { id: "high", label: "Excellent (300 DPI)", description: "Best for printing" },
];

export default function PdfToJpgPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState("medium");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    
    try {
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
      const JSZip = (await import("jszip")).default;
      
      const zip = new JSZip();
      
      for (let f = 0; f < files.length; f++) {
        const file = files[f];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        
        let scale = 2.0;
        if (quality === "low") scale = 1.0;
        if (quality === "high") scale = 4.16;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (!context) continue;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await page.render(renderContext).promise;
          
          const blob = await new Promise<Blob | null>((resolve) => 
            canvas.toBlob(resolve, "image/jpeg", 0.95)
          );
          
          if (blob) {
            const fileName = files.length > 1 
              ? `${file.name.replace('.pdf', '')}_page${i}.jpg`
              : `page-${i}.jpg`;
            zip.file(fileName, blob);
          }
        }
      }
      
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
      setDone(true);
      
    } catch (error) {
       console.error("Error converting PDF:", error);
       addToast("error", "An error occurred during conversion.");
    } finally {
       setProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
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
          icon={Image}
          title="PDF to JPG"
          description="Convert every page of your PDF into a high-quality JPG image — free, instant, and completely private. No server uploads, no watermarks, no account required."
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
                    <Settings className="w-5 h-5 text-primary" />
                    Image Quality
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
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleConvert}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Image className="w-5 h-5" />
                        Convert to JPG
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
                Conversion Complete!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your PDF has been converted to JPG images. Each page has been
                extracted as a separate high-quality image.
              </p>

              {/* Preview Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-border flex items-center justify-center"
                  >
                    <Image className="w-8 h-8 text-emerald-300" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a 
                    href={downloadUrl}
                    download="converted-images.zip"
                    className="btn btn-primary inline-flex items-center gap-2 text-center"
                  >
                    <Image className="w-5 h-5" />
                    Download All Images (ZIP)
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  Convert Another File
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
                Privacy Guaranteed
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All conversion happens server-side. Your files are deleted
                automatically after processing. No one can access your documents.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                High-Quality Output
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Get crisp, clear JPG images from your PDF pages. Choose up to 300
                DPI for print-quality output.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
