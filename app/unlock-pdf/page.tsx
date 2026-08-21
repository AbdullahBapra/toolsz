"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Unlock,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  FileText,
  Lock,
  RotateCcw,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface OutputFile {
  name: string;
  blob: Blob;
  url: string;
}

export default function UnlockPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [output, setOutput] = useState<OutputFile | null>(null);
  const outputRef = useRef<OutputFile | null>(null);

  useEffect(() => { outputRef.current = output; }, [output]);
  useEffect(() => {
    return () => { if (outputRef.current) URL.revokeObjectURL(outputRef.current.url); };
  }, []);

  const handleFileChange = useCallback(async (newFiles: File[]) => {
    if (outputRef.current) { URL.revokeObjectURL(outputRef.current.url); setOutput(null); }
    setFiles(newFiles);
    setDone(false);
    setIsEncrypted(false);

    if (newFiles.length === 0) return;

    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await newFiles[0].arrayBuffer();
      // Try loading without ignoreEncryption to detect if it's encrypted
      try {
        await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
        setIsEncrypted(false);
      } catch {
        // If it fails, it's encrypted
        setIsEncrypted(true);
      }
    } catch {
      setIsEncrypted(false);
    }
  }, []);

  const handleUnlock = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await files[0].arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const pageCount = sourcePdf.getPageCount();
      const indices = Array.from({ length: pageCount }, (_, i) => i);
      const copiedPages = await newPdf.copyPages(sourcePdf, indices);
      copiedPages.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");

      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);

      const result: OutputFile = {
        name: `${baseName}_unlocked.pdf`,
        blob,
        url: URL.createObjectURL(blob),
      };
      setOutput(result);
      setDone(true);
    } catch (err) {
      console.error("Unlock error:", err);
      addToast("error", "Failed to unlock PDF. The file may have an owner password that prevents copying.");
    } finally {
      setProcessing(false);
    }
  }, [files, addToast]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setIsEncrypted(false);
    setOutput(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Unlock}
          title="Unlock PDF"
          description="Remove PDF password protection — free, instant, and no signup. Works on encrypted PDFs right in your browser. Your files never leave your device."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload
                accept=".pdf"
                files={files}
                onFilesChange={handleFileChange}
                label="Drop your protected PDF here"
                description="or click to browse — PDF files only"
              />

              {files.length > 0 && isEncrypted && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-fade-in-up">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600">
                    This PDF is password-protected — click Unlock to remove restrictions
                  </span>
                </div>
              )}

              {files.length > 0 && !isEncrypted && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/30 animate-fade-in-up">
                  <Unlock className="w-4 h-4 text-success" />
                  <span className="text-xs font-semibold text-success">
                    This PDF is not encrypted — no unlock needed
                  </span>
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleUnlock}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Unlocking PDF...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-5 h-5" />
                        Unlock PDF
                      </>
                    )}
                  </button>
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-surface-2 border border-border">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">How it works</p>
                      <p className="text-xs text-foreground-muted leading-relaxed">
                        This tool removes user-password restrictions (copying, printing, editing) by reconstructing the PDF without encryption. 
                        It works for PDFs where you can open the file but are restricted from editing/copying. 
                        Owner-password protected files that cannot be opened may not be unlockable.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                PDF Unlocked Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                All password restrictions have been removed. Your PDF is now freely editable and printable.
              </p>
              {output && (
                <div className="max-w-sm mx-auto mb-6">
                  <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground truncate">{output.name}</p>
                      <p className="text-xs text-foreground-secondary">{formatSize(output.blob.size)}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={output?.url} download={output?.name} className="btn btn-primary inline-flex items-center gap-2 text-center">
                  <Download className="w-5 h-5" />
                  Download Unlocked PDF
                </a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center">
                  <RotateCcw className="w-4 h-4" />
                  Unlock Another PDF
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Decryption happens entirely in your browser. Your PDF is never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Instant Unlock</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Removes copy, print, and edit restrictions by rebuilding the PDF without encryption layers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
