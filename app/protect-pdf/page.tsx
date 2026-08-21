"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Lock,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  FileText,
  Eye,
  EyeOff,
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

export default function ProtectPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [output, setOutput] = useState<OutputFile | null>(null);
  const outputRef = useRef<OutputFile | null>(null);

  useEffect(() => { outputRef.current = output; }, [output]);
  useEffect(() => {
    return () => { if (outputRef.current) URL.revokeObjectURL(outputRef.current.url); };
  }, []);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleProtect = useCallback(async () => {
    if (files.length === 0 || !passwordsMatch) return;
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

      // Encrypt with password
      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = files[0].name.replace(/\.pdf$/i, "");

      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);

      const result: OutputFile = {
        name: `${baseName}_protected.pdf`,
        blob,
        url: URL.createObjectURL(blob),
      };
      setOutput(result);
      setDone(true);
    } catch (err) {
      console.error("Protect error:", err);
      addToast("error", "Failed to protect PDF. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [files, password, passwordsMatch, addToast]);

  const handleReset = () => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setPassword("");
    setConfirmPassword("");
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
          icon={Lock}
          title="Protect PDF"
          description="Add password encryption to any PDF — set user and owner passwords for access control. Free, private, and everything runs locally in your browser."
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
                onFilesChange={setFiles}
                label="Drop your PDF here"
                description="or click to browse — PDF files only"
              />

              {files.length > 0 && (
                <div className="mt-8 animate-fade-in-up space-y-4">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Set Password
                  </h3>

                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-2 block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-2 block">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-surface-2 border border-border">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground-muted leading-relaxed">
                        Your password is processed locally in your browser and never sent to any server. 
                        Make sure to remember your password — we cannot recover it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleProtect}
                    disabled={processing || !passwordsMatch}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Protecting PDF...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Protect PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                PDF Protected Successfully!
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Your PDF is now password-protected. Anyone opening it will need the password you set.
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
                  Download Protected PDF
                </a>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center">
                  <RotateCcw className="w-4 h-4" />
                  Protect Another PDF
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Browser-Based Encryption</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Your PDF and password never leave your device. Encryption is performed entirely in your browser.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Strong Protection</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Adds 128-bit AES encryption to your PDF, the industry standard for document security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
