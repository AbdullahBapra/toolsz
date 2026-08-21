"use client";

import { useState, useRef, useEffect } from "react";
import {
  Type,
  Check,
  Loader2,
  Shield,
  Zap,
  Copy,
  Download,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

export default function ImageToTextPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState<{ status: string; progress: number } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleExtract = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress({ status: "initializing", progress: 0 });
    
    try {
      const file = files[0];
      const Tesseract = (await import("tesseract.js")).default;
      
      const worker = await Tesseract.createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress({ status: "Extracting text...", progress: Math.round(m.progress * 100) });
          } else {
            setProgress({ status: "Loading engine...", progress: Math.round(m.progress * 100) });
          }
        }
      });
      
      workerRef.current = worker;
      
      const imageUrl = URL.createObjectURL(file);
      const ret = await worker.recognize(imageUrl);
      
      setText(ret.data.text);
      URL.revokeObjectURL(imageUrl);
      await worker.terminate();
      workerRef.current = null;
      
      setDone(true);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to extract text from the image.");
    } finally {
      setProcessing(false);
      setProgress(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    addToast("success", "Text copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted-text-${files[0]?.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setText("");
    setProgress(null);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Type}
          title="Image to Text (OCR)"
          description="Extract text from any image using OCR technology — free, instant, and private. Works with screenshots, photos, and scanned documents right in your browser."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              {/* Upload Area */}
              <FileUpload
                accept=".jpg,.jpeg,.png,.webp,.bmp"
                files={files}
                onFilesChange={setFiles}

                label="Drop your image here"
                description="or click to browse — JPG, PNG, WEBP supported"
              />

              {/* Action Button */}
              {files.length > 0 && (
                <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                  <button
                    onClick={handleExtract}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Image...
                      </>
                    ) : (
                      <>
                        <Type className="w-5 h-5" />
                        Extract Text
                      </>
                    )}
                  </button>
                  
                  {progress && (
                    <div className="mt-6 w-full max-w-md">
                      <div className="flex justify-between text-xs font-semibold mb-2 text-foreground">
                        <span className="capitalize">{progress.status}</span>
                        <span>{progress.progress}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-200"
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="py-4 animate-fade-in-up">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Extraction Complete!
                </h3>
                <p className="text-foreground-secondary">
                  We&apos;ve extracted the text from your image. You can copy it or save it as a document.
                </p>
              </div>

              {/* Result Area */}
              <div className="mb-6">
                <textarea
                  className="w-full h-64 p-4 rounded-xl border border-border bg-background text-foreground text-xs resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Extracted text will appear here..."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleCopy}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copy Text
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Save as .txt
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Extract Another
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
                Total Privacy Assurance
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Our OCR engine runs entirely in your browser. Your images and extracted text are strictly local and never uploaded to any servers.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Advanced Accuracy
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Powered by state-of-the-art WebAssembly models to confidently scan documents, notes, menus, and receipts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
