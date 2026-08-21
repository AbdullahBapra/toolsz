"use client";

import { useState } from "react";
import {
  FileImage,
  Check,
  Loader2,
  Shield,
  Zap,
  Settings,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

const layoutOptions = [
  { id: "fit", label: "Fit to Page", description: "Scale image to fit page" },
  { id: "fill", label: "Fill Page", description: "Image covers entire page" },
  { id: "original", label: "Original Size", description: "Keep image at native size" },
];

export default function ImageToPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [layout, setLayout] = useState("fit");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === "image/png") {
          image = await pdf.embedPng(arrayBuffer);
        } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
          image = await pdf.embedJpg(arrayBuffer);
        } else if (file.type === "image/webp") {
          const objectUrl = URL.createObjectURL(file);
          const img = new globalThis.Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = objectUrl;
          });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          if (ctx) ctx.drawImage(img, 0, 0);
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95));
          URL.revokeObjectURL(objectUrl);
          if (blob) {
             const convertedBuffer = await blob.arrayBuffer();
             image = await pdf.embedJpg(convertedBuffer);
          }
        }
        
        if (!image) continue;

        const a4Width = 595.28;
        const a4Height = 841.89;
        const imgWidth = image.width;
        const imgHeight = image.height;

        let page;
        if (layout === "original") {
          page = pdf.addPage([imgWidth, imgHeight]);
          page.drawImage(image, { x: 0, y: 0, width: imgWidth, height: imgHeight });
        } else if (layout === "fit") {
          page = pdf.addPage([a4Width, a4Height]);
          const scale = Math.min(a4Width / imgWidth, a4Height / imgHeight);
          const drawWidth = imgWidth * scale;
          const drawHeight = imgHeight * scale;
          page.drawImage(image, {
            x: (a4Width - drawWidth) / 2,
            y: (a4Height - drawHeight) / 2,
            width: drawWidth,
            height: drawHeight,
          });
        } else if (layout === "fill") {
          page = pdf.addPage([a4Width, a4Height]);
          const scale = Math.max(a4Width / imgWidth, a4Height / imgHeight);
          const drawWidth = imgWidth * scale;
          const drawHeight = imgHeight * scale;
          page.drawImage(image, {
            x: (a4Width - drawWidth) / 2,
            y: (a4Height - drawHeight) / 2,
            width: drawWidth,
            height: drawHeight,
          });
        }
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to convert images to PDF.");
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
          icon={FileImage}
          title="Image to PDF"
          description="Compile your images into one professional PDF document — free, instant, and private. Supports JPG, PNG, WebP, and more with no watermarks on output."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              {/* Upload Area */}
              <FileUpload
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                files={files}
                onFilesChange={setFiles}

                label="Drop your images here"
                description="or click to browse — JPG, PNG, WebP supported"
              />

              {/* Layout Selection */}
              {files.length > 0 && (
                <div className="mt-8 animate-fade-in-up">
                  <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Page Layout
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {layoutOptions.map((option) => (
                      <button
                        key={option.id}
                        role="radio"
                        aria-checked={layout === option.id}
                        onClick={() => setLayout(option.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          layout === option.id
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border hover:border-primary-border hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              layout === option.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {layout === option.id && (
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

                  {/* Image count info */}
                  <p className="mt-4 text-foreground-secondary text-xs">
                    {files.length} image{files.length !== 1 ? "s" : ""} selected
                    — each will be placed on its own page.
                  </p>
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
                        <FileImage className="w-5 h-5" />
                        Convert to PDF
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
                PDF Created Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your {files.length} image{files.length !== 1 ? "s have" : " has"} been
                converted into a professional PDF document.
              </p>

              <div className="inline-flex items-center gap-2 bg-primary-muted border border-primary-border rounded-xl px-4 py-3 mb-6">
                <FileImage className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  images-to-pdf.pdf
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download="images-to-pdf.pdf"
                    className="btn btn-primary inline-flex items-center gap-2 text-center"
                  >
                    <FileImage className="w-5 h-5" />
                    Download PDF
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-center"
                >
                  Convert More Images
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
                All conversion happens securely. Your images are deleted
                automatically after processing. No one can access your files.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Professional Output
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Get a clean, well-organized PDF with your images in high quality.
                Choose the layout that best suits your needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
