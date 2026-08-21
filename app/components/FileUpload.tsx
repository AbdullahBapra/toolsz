"use client";

import { useCallback, useId, useState } from "react";
import { Upload, X, File } from "lucide-react";

interface FileUploadProps {
  accept: string;
  multiple?: boolean;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  /** Alternative: callback when new files are selected (does not manage state internally) */
  onFiles?: (files: File[]) => void;
  label?: string;
  description?: string;
  /** Compact mode for inline "Add more" buttons */
  compact?: boolean;
}

export default function FileUpload({
  accept,
  multiple = false,
  files: filesProp,
  onFilesChange,
  onFiles,
  label = "Upload File",
  description = "Drag and drop or browse",
  compact = false,
}: FileUploadProps) {
  const internalFiles = filesProp ?? [];
  const [dragOver, setDragOver] = useState(false);
  const inputId = useId();

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    },
    []
  );
  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 0) {
        if (onFiles) {
          onFiles(multiple ? dropped : [dropped[0]]);
        } else if (onFilesChange) {
          onFilesChange(multiple ? [...internalFiles, ...dropped] : [dropped[0]]);
        }
      }
    },
    [internalFiles, multiple, onFilesChange, onFiles]
  );

  const removeFile = (index: number) =>
    onFilesChange?.(internalFiles.filter((_, i) => i !== index));

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`drop-zone ${compact ? "py-2 px-3" : "py-16 px-6"} text-center rounded-2xl ${
          dragOver ? "drag-over" : ""
        }`}
      >
        <input
          type="file"
          id={inputId}
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const selected = Array.from(e.target.files);
              if (onFiles) {
                onFiles(multiple ? selected : [selected[0]]);
              } else if (onFilesChange) {
                onFilesChange(
                  multiple
                    ? [...internalFiles, ...selected]
                    : [selected[0]]
                );
              }
            }
            e.target.value = "";
          }}
        />
        <label
          htmlFor={inputId}
          className="cursor-pointer relative z-10 flex flex-col items-center"
        >
          {compact ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:border-primary-border transition text-foreground-secondary hover:text-primary">
              <Upload className="w-3.5 h-3.5" />
              {label}
            </span>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-[10px] border flex items-center justify-center mb-4 transition-all duration-150 ${
                dragOver 
                  ? "bg-primary-muted border-primary-border" 
                  : "bg-surface-1 border-border"
              }`}>
                <Upload
                  className={`w-5 h-5 transition-colors duration-150 ${
                    dragOver ? "text-primary" : "text-foreground-secondary"
                  }`}
                />
              </div>
              <h3 className="type-h3 font-semibold mb-1 text-foreground">{label}</h3>
              <p className="type-small text-foreground-muted">{description}</p>
            </>
          )}
        </label>
      </div>

      {!compact && internalFiles.length > 0 && (
        <div className="mt-5 flex flex-col gap-2.5">
          {internalFiles.map((file, i) => (
            <div
              key={i}
              className="glass-panel p-3.5 flex items-center justify-between rounded-xl animate-reveal"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-primary-muted border border-primary-border flex items-center justify-center flex-shrink-0">
                  <File className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{file.name}</p>
                  <p className="type-label text-foreground-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="p-1.5 rounded-lg hover:bg-danger-muted text-foreground-muted hover:text-danger transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
