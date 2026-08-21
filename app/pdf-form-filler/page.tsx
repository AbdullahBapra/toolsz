"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FileEdit,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw as ResetIcon,
  Type,
  CheckSquare,
  ChevronDown,
  Info,
  X,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface FormField {
  name: string;
  type: "text" | "checkbox" | "dropdown" | "radio" | "other";
  value: string;
  options?: string[]; // for dropdown/radio
  checked?: boolean; // for checkbox
  page: number;
  originalType: string;
}

interface OutputFile {
  url: string;
  name: string;
  blob: Blob;
}

export default function PdfFormFillerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [outputFile, setOutputFile] = useState<OutputFile | null>(null);
  const [loadingFields, setLoadingFields] = useState(false);
  const [flattening, setFlattening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputFileRef = useRef<OutputFile | null>(null);
  useEffect(() => {
    outputFileRef.current = outputFile;
  }, [outputFile]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (outputFileRef.current?.url) URL.revokeObjectURL(outputFileRef.current.url);
    };
  }, []);

  const handleFileChange = useCallback(async (newFiles: File[]) => {
    // Cleanup old output
    if (outputFileRef.current?.url) URL.revokeObjectURL(outputFileRef.current.url);
    setOutputFile(null);
    setDone(false);
    setError(null);
    setFiles(newFiles);
    setFields([]);

    if (newFiles.length === 0) return;

    setLoadingFields(true);
    try {
      const buffer = await newFiles[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const form = pdfDoc.getForm();

      const rawFields = form.getFields();
      const parsed: FormField[] = [];

      for (const field of rawFields) {
        const name = field.getName();
        if (!name) continue;

        // Determine type using constructor name
        const ctor = field.constructor.name;
        let type: FormField["type"] = "other";
        let options: string[] | undefined;
        let value = "";
        let checked: boolean | undefined;

        if (ctor === "PDFTextField") {
          type = "text";
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value = (field as any).getText?.() ?? "";
          } catch {
            value = "";
          }
        } else if (ctor === "PDFCheckBox") {
          type = "checkbox";
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            checked = (field as any).isChecked?.() ?? false;
          } catch {
            checked = false;
          }
        } else if (ctor === "PDFDropdown") {
          type = "dropdown";
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options = (field as any).getOptions?.() ?? [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sel = (field as any).getSelected()?.[0];
            value = sel ?? "";
          } catch {
            options = [];
          }
        } else if (ctor === "PDFRadioGroup") {
          type = "radio";
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options = (field as any).getOptions?.() ?? [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sel = (field as any).getSelected?.();
            value = sel ?? "";
          } catch {
            options = [];
          }
        }

        // Get page number
        let page = 0;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const widgets = (field as any).getWidgets?.() ?? [];
          if (widgets.length > 0) {
            const pageRef = widgets[0].P();
            if (pageRef) {
              const pages = pdfDoc.getPages();
              for (let i = 0; i < pages.length; i++) {
                if (pages[i].ref === pageRef) {
                  page = i + 1;
                  break;
                }
              }
            }
          }
        } catch {
          // ignore
        }

        parsed.push({
          name,
          type,
          value,
          options: options?.length ? options : undefined,
          checked,
          page,
          originalType: ctor,
        });
      }

      // Sort by page then name
      parsed.sort((a, b) => a.page - b.page || a.name.localeCompare(b.name));
      setFields(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read PDF form fields");
    } finally {
      setLoadingFields(false);
    }
  }, []);

  const updateFieldValue = useCallback((index: number, value: string) => {
    setFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      return next;
    });
  }, []);

  const updateFieldChecked = useCallback((index: number, checked: boolean) => {
    setFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], checked };
      return next;
    });
  }, []);

  const handleFill = useCallback(async () => {
    if (files.length === 0 || fields.length === 0) return;
    setProcessing(true);
    setError(null);

    try {
      const buffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const form = pdfDoc.getForm();

      for (const field of fields) {
        try {
          if (field.type === "text") {
            const tf = form.getTextField(field.name);
            tf?.setText(field.value);
          } else if (field.type === "checkbox") {
            const cb = form.getCheckBox(field.name);
            if (field.checked) {
              cb?.check();
            } else {
              cb?.uncheck();
            }
          } else if (field.type === "dropdown") {
            const dd = form.getDropdown(field.name);
            if (field.value) {
              dd?.select(field.value);
            }
          } else if (field.type === "radio") {
            const rg = form.getRadioGroup(field.name);
            if (field.value) {
              rg?.select(field.value);
            }
          }
        } catch {
          // Some fields may not be fillable — skip
        }
      }

      // Flatten if requested
      if (flattening) {
        form.flatten();
      }

      const filledBytes = await pdfDoc.save();
      const blob = new Blob([filledBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const baseName = files[0].name.replace(/\.[^/.]+$/, "");
      setOutputFile({
        url,
        name: `${baseName}_filled.pdf`,
        blob,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fill PDF form");
    } finally {
      setProcessing(false);
    }
  }, [files, fields, flattening]);

  const handleReset = useCallback(() => {
    if (outputFileRef.current?.url) URL.revokeObjectURL(outputFileRef.current.url);
    setFiles([]);
    setFields([]);
    setOutputFile(null);
    setDone(false);
    setError(null);
    setProcessing(false);
    setFlattening(false);
  }, []);

  const textFields = fields.filter((f) => f.type === "text");
  const checkboxFields = fields.filter((f) => f.type === "checkbox");
  const dropdownFields = fields.filter((f) => f.type === "dropdown" || f.type === "radio");
  const otherFields = fields.filter((f) => f.type === "other");

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileEdit}
          title="PDF Form Filler"
          description="Fill PDF form fields — text, checkboxes, dropdowns — no Adobe account needed. Free, instant, and completely private. Works with any fillable PDF form."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept=".pdf"
              files={files}
              onFilesChange={handleFileChange}
              label="Drop your PDF form here"
              description="or click to browse — any PDF with fillable form fields"
            />

            {loadingFields && (
              <div className="mt-6 flex items-center justify-center gap-3 py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-foreground-secondary">Reading form fields…</span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Error reading PDF</p>
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                </div>
              </div>
            )}

            {fields.length > 0 && !loadingFields && (
              <div className="mt-6 space-y-6 animate-fade-in-up">
                {/* Field summary */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-semibold text-foreground">
                    {fields.length} fillable field{fields.length !== 1 ? "s" : ""} detected
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {textFields.length > 0 && (
                      <span className="px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
                        <Type className="w-3 h-3 inline mr-1" />{textFields.length} text
                      </span>
                    )}
                    {checkboxFields.length > 0 && (
                      <span className="px-2 py-1 rounded-md bg-green-50 border border-green-100 text-xs font-semibold text-green-700">
                        <CheckSquare className="w-3 h-3 inline mr-1" />{checkboxFields.length} checkbox
                      </span>
                    )}
                    {dropdownFields.length > 0 && (
                      <span className="px-2 py-1 rounded-md bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-700">
                        <ChevronDown className="w-3 h-3 inline mr-1" />{dropdownFields.length} dropdown/radio
                      </span>
                    )}
                    {otherFields.length > 0 && (
                      <span className="px-2 py-1 rounded-md bg-surface-2 border border-border text-xs font-semibold text-foreground-secondary">
                        {otherFields.length} other
                      </span>
                    )}
                  </div>
                </div>

                {/* Flatten option */}
                <label className="flex items-center gap-3 p-3 rounded-lg bg-surface-1 border border-border cursor-pointer hover:bg-surface-2 transition-colors">
                  <input
                    type="checkbox"
                    checked={flattening}
                    onChange={(e) => setFlattening(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Flatten form after filling</p>
                    <p className="text-xs text-foreground-secondary">
                      Locks all fields so they can't be edited. Recommended for final submission.
                    </p>
                  </div>
                </label>

                {/* Text Fields */}
                {textFields.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Type className="w-4 h-4 text-blue-500" /> Text Fields
                    </h4>
                    <div className="space-y-3">
                      {textFields.map((field) => {
                        const idx = fields.indexOf(field);
                        return (
                          <div key={field.name} className="grid grid-cols-[1fr_2fr] gap-3 items-center">
                            <label className="text-xs font-medium text-foreground-secondary truncate" title={field.name}>
                              {field.name}
                              {field.page > 0 && <span className="text-foreground-muted ml-1">(p{field.page})</span>}
                            </label>
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => updateFieldValue(idx, e.target.value)}
                              placeholder="Enter value…"
                              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Checkbox Fields */}
                {checkboxFields.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-green-500" /> Checkboxes
                    </h4>
                    <div className="space-y-2">
                      {checkboxFields.map((field) => {
                        const idx = fields.indexOf(field);
                        return (
                          <label key={field.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-1 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={field.checked ?? false}
                              onChange={(e) => updateFieldChecked(idx, e.target.checked)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                            />
                            <span className="text-xs font-medium text-foreground">{field.name}</span>
                            {field.page > 0 && <span className="text-xs text-foreground-muted">(p{field.page})</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dropdown/Radio Fields */}
                {dropdownFields.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-purple-500" /> Dropdowns & Radio Groups
                    </h4>
                    <div className="space-y-3">
                      {dropdownFields.map((field) => {
                        const idx = fields.indexOf(field);
                        return (
                          <div key={field.name} className="grid grid-cols-[1fr_2fr] gap-3 items-center">
                            <label className="text-xs font-medium text-foreground-secondary truncate" title={field.name}>
                              {field.name}
                              {field.page > 0 && <span className="text-foreground-muted ml-1">(p{field.page})</span>}
                            </label>
                            <select
                              value={field.value}
                              onChange={(e) => updateFieldValue(idx, e.target.value)}
                              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              <option value="">— Select —</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Other Fields (read-only) */}
                {otherFields.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-foreground-muted" /> Unsupported Fields
                    </h4>
                    <div className="space-y-1">
                      {otherFields.map((field) => (
                        <div key={field.name} className="flex items-center gap-2 text-xs text-foreground-muted">
                          <span className="truncate">{field.name}</span>
                          <span className="text-foreground-muted">({field.originalType})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill Button */}
                <div className="flex flex-col items-center pt-2">
                  <button
                    onClick={handleFill}
                    disabled={processing || fields.length === 0}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Filling form…
                      </>
                    ) : (
                      <>
                        <FileEdit className="w-5 h-5" />
                        Fill &amp; Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* No fields detected */}
            {files.length > 0 && !loadingFields && fields.length === 0 && !error && (
              <div className="mt-6 p-6 rounded-lg bg-yellow-50 border border-yellow-100 text-center">
                <Info className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-yellow-700">No fillable form fields found</p>
                <p className="text-xs text-yellow-600 mt-1">
                  This PDF may have flat/flattened fields or no interactive form elements.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {/* Success */}
            <div className="glass-panel rounded-[16px] p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Form Filled Successfully</h3>
              <p className="text-sm text-foreground-secondary mb-4">
                {fields.length} field{fields.length !== 1 ? "s" : ""} filled{flattening ? " and flattened" : ""}.
              </p>
              <a
                href={outputFile?.url}
                download={outputFile?.name}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download Filled PDF
              </a>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2">
                <ResetIcon className="w-4 h-4" /> Fill Another Form
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">No Adobe Required — 100% Private</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Fill PDF forms directly in your browser. Your documents never leave your device.
                No account, no subscription, no upload to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">All Field Types Supported</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Text inputs, checkboxes, dropdowns, and radio buttons — all detected and fillable.
                Flatten option locks fields for final submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
