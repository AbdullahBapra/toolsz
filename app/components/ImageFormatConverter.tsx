"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Image as ImageIcon,
  RotateCcw as ResetIcon,
  FileArchive,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface ConvertedFile {
  originalName: string;
  originalSize: number;
  blob: Blob;
  url: string;
  newName: string;
  newSize: number;
  status: "done" | "error";
  errorMsg?: string;
}

export interface ImageConverterProps {
  fromFormat: string;
  toFormat: string;
  fromExts: string;
  toMime: string;
  toExt: string;
  fillWhiteBg?: boolean;
  useGifEncoder?: boolean;
  useIcoEncoder?: boolean;
  useBmpEncoder?: boolean;
  hasQuality?: boolean;
  defaultQuality?: number;
  isBulk?: boolean;
  title: string;
  description: string;
  faqs: { q: string; a: string }[];
  relatedTools: { name: string; href: string }[];
}

function loadImgFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

async function encodeIco(file: File, fillWhiteBg: boolean): Promise<Blob> {
  const img = await loadImgFromFile(file);
  const sizes = [256, 48, 32, 16];
  const pngBufs: ArrayBuffer[] = [];

  for (const size of sizes) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    if (fillWhiteBg) { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, size, size); }
    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("PNG encode failed"))), "image/png")
    );
    pngBufs.push(await blob.arrayBuffer());
  }

  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + sizes.length * entrySize;
  const totalSize = dirSize + pngBufs.reduce((s, b) => s + b.byteLength, 0);
  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, sizes.length, true);

  let dataOffset = dirSize;
  for (let i = 0; i < sizes.length; i++) {
    const sz = sizes[i];
    const base = headerSize + i * entrySize;
    view.setUint8(base + 0, sz === 256 ? 0 : sz);
    view.setUint8(base + 1, sz === 256 ? 0 : sz);
    view.setUint8(base + 2, 0);
    view.setUint8(base + 3, 0);
    view.setUint16(base + 4, 1, true);
    view.setUint16(base + 6, 32, true);
    view.setUint32(base + 8, pngBufs[i].byteLength, true);
    view.setUint32(base + 12, dataOffset, true);
    bytes.set(new Uint8Array(pngBufs[i]), dataOffset);
    dataOffset += pngBufs[i].byteLength;
  }
  return new Blob([buf], { type: "image/x-icon" });
}

async function encodeBmp(file: File, fillWhiteBg: boolean): Promise<Blob> {
  const img = await loadImgFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  if (fillWhiteBg) { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(img, 0, 0);
  const { width, height, data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const bmpBuf = new ArrayBuffer(fileSize);
  const view = new DataView(bmpBuf);
  const bytes = new Uint8Array(bmpBuf);

  bytes[0] = 0x42; bytes[1] = 0x4d;
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  for (let y = 0; y < height; y++) {
    const rowBase = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = rowBase + x * 3;
      bytes[dst] = data[src + 2];
      bytes[dst + 1] = data[src + 1];
      bytes[dst + 2] = data[src];
    }
  }
  return new Blob([bmpBuf], { type: "image/bmp" });
}

async function doConvert(
  file: File,
  toMime: string,
  toExt: string,
  quality: number,
  fillWhiteBg: boolean,
  useGifEncoder: boolean,
  useIcoEncoder: boolean,
  useBmpEncoder: boolean
): Promise<Blob> {
  if (useIcoEncoder) return encodeIco(file, fillWhiteBg);
  if (useBmpEncoder) return encodeBmp(file, fillWhiteBg);

  if (useGifEncoder) {
    const GIFEncoder = (await import("gif-encoder-2")).default;
    return new Promise((resolve, reject) => {
      const img = new globalThis.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          // gif-encoder-2 quality: 1 (best) to 20 (worst)
          const q = Math.max(1, Math.min(20, Math.round((1 - quality) * 19) + 1));
          const encoder = new GIFEncoder(img.naturalWidth, img.naturalHeight, "neuquant", false, 1);
          encoder.start();
          encoder.setDelay(0);
          encoder.setRepeat(-1);
          encoder.setQuality(q);
          encoder.addFrame(ctx);
          encoder.finish();
          resolve(new Blob([encoder.out.getData()], { type: "image/gif" }));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    });
  }

  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (fillWhiteBg) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Conversion failed"))),
        toMime,
        toMime === "image/png" ? undefined : quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export default function ImageFormatConverter({
  fromFormat,
  toFormat,
  fromExts,
  toMime,
  toExt,
  fillWhiteBg = false,
  useGifEncoder = false,
  useIcoEncoder = false,
  useBmpEncoder = false,
  hasQuality = false,
  defaultQuality = 0.92,
  isBulk = false,
  title,
  description,
  faqs,
  relatedTools,
}: ImageConverterProps) {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(defaultQuality);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [converted, setConverted] = useState<ConvertedFile[]>([]);
  const [convertingIndex, setConvertingIndex] = useState(-1);
  const [zipping, setZipping] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const convertedRef = useRef<ConvertedFile[]>([]);

  useEffect(() => {
    convertedRef.current = converted;
  }, [converted]);

  useEffect(() => {
    return () => {
      convertedRef.current.forEach((f) => {
        if (f.url) URL.revokeObjectURL(f.url);
      });
    };
  }, []);

  const handleFileChange = useCallback(
    (newFiles: File[]) => {
      convertedRef.current.forEach((f) => {
        if (f.url) URL.revokeObjectURL(f.url);
      });
      setConverted([]);
      setDone(false);
      setFiles(isBulk ? newFiles : newFiles.slice(0, 1));
    },
    [isBulk]
  );

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);
    convertedRef.current.forEach((f) => {
      if (f.url) URL.revokeObjectURL(f.url);
    });
    const results: ConvertedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      setConvertingIndex(i);
      const file = files[i];
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      try {
        const blob = await doConvert(file, toMime, toExt, quality, fillWhiteBg, useGifEncoder, useIcoEncoder, useBmpEncoder);
        const url = URL.createObjectURL(blob);
        results.push({
          originalName: file.name,
          originalSize: file.size,
          blob,
          url,
          newName: `${baseName}.${toExt}`,
          newSize: blob.size,
          status: "done",
        });
      } catch (err) {
        results.push({
          originalName: file.name,
          originalSize: file.size,
          blob: new Blob(),
          url: "",
          newName: "",
          newSize: 0,
          status: "error",
          errorMsg: err instanceof Error ? err.message : "Conversion failed",
        });
      }
    }

    setConverted(results);
    setDone(true);
    setProcessing(false);
    setConvertingIndex(-1);
  }, [files, quality, toMime, toExt, fillWhiteBg, useGifEncoder]);

  const downloadAllZip = useCallback(async () => {
    const success = converted.filter((f) => f.status === "done");
    if (success.length === 0) return;
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      success.forEach((f) => zip.file(f.newName, f.blob));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fromFormat.toLowerCase()}-to-${toExt}-batch.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      addToast("error", "Failed to create ZIP file.");
    } finally {
      setZipping(false);
    }
  }, [converted, fromFormat, toExt, addToast]);

  const removeConverted = useCallback(
    (index: number) => {
      const file = converted[index];
      if (file.url) URL.revokeObjectURL(file.url);
      const updated = converted.filter((_, i) => i !== index);
      setConverted(updated);
      if (updated.length === 0) setDone(false);
    },
    [converted]
  );

  const handleReset = useCallback(() => {
    converted.forEach((f) => {
      if (f.url) URL.revokeObjectURL(f.url);
    });
    setFiles([]);
    setConverted([]);
    setDone(false);
    setProcessing(false);
    setQuality(defaultQuality);
    setConvertingIndex(-1);
  }, [converted, defaultQuality]);

  const fmt = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const successCount = converted.filter((f) => f.status === "done").length;
  const totalOriginal = files.reduce((s, f) => s + f.size, 0);
  const totalConverted = converted.reduce(
    (s, f) => s + (f.status === "done" ? f.newSize : 0),
    0
  );

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={ImageIcon}
          title={title}
          description={description}
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!done ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept={fromExts}
              files={files}
              onFilesChange={handleFileChange}
              label={`Drop your ${fromFormat} ${isBulk ? "files" : "file"} here`}
              description={`or click to browse — ${fromFormat} format${isBulk ? ", multiple files supported" : ""}`}
              multiple={isBulk}
            />

            {isBulk && files.length > 0 && (
              <div className="mt-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </h3>
                  <span className="text-xs text-foreground-secondary">
                    {fmt(totalOriginal)} total
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {files.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-1 border border-border"
                    >
                      <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs text-foreground truncate flex-1">
                        {file.name}
                      </span>
                      <span className="text-xs text-foreground-secondary shrink-0">
                        {fmt(file.size)}
                      </span>
                      {processing && convertingIndex === i && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                      )}
                      {processing && convertingIndex > i && (
                        <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && hasQuality && (
              <div className="mt-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">
                    {toFormat} Quality
                  </label>
                  <span className="text-xs text-primary font-semibold">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.02"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary"
                />
                <div className="flex justify-between text-xs text-foreground-muted mt-1">
                  <span>Smaller file</span>
                  <span>Higher quality</span>
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                {processing && (
                  <p className="text-xs text-foreground-secondary mb-3 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    {isBulk
                      ? `Converting file ${convertingIndex + 1} of ${files.length}...`
                      : "Converting..."}
                  </p>
                )}
                <button
                  onClick={handleConvert}
                  disabled={processing}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      {isBulk && files.length > 1
                        ? `Convert ${files.length} Files to ${toFormat}`
                        : `Convert to ${toFormat}`}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {successCount === 1
                  ? "File Converted!"
                  : `${successCount} Files Converted!`}
              </h3>
              {successCount > 0 && totalConverted > 0 && totalOriginal > 0 && (
                <p className="text-foreground-secondary text-sm">
                  {fmt(totalOriginal)} → {fmt(totalConverted)}
                  {totalConverted < totalOriginal && (
                    <span className="text-success ml-1 font-semibold">
                      (
                      {Math.round((1 - totalConverted / totalOriginal) * 100)}%
                      smaller)
                    </span>
                  )}
                  {totalConverted > totalOriginal && (
                    <span className="text-foreground-muted ml-1">
                      (
                      {Math.round(
                        (totalConverted / totalOriginal - 1) * 100
                      )}
                      % larger — lossless format)
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
              {converted.map((file, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    file.status === "error"
                      ? "bg-red-50 border-red-100"
                      : "bg-surface-1 border-border hover:bg-surface-2"
                  }`}
                >
                  {file.status === "done" ? (
                    <>
                      <div className="w-9 h-9 rounded-[12px] bg-amber-50 border border-amber-200/50 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {file.originalName} → {file.newName}
                        </p>
                        <p className="text-xs text-foreground-secondary">
                          {fmt(file.originalSize)} → {fmt(file.newSize)}
                          {file.newSize < file.originalSize && (
                            <span className="text-success ml-1">
                              (
                              {Math.round(
                                (1 - file.newSize / file.originalSize) * 100
                              )}
                              % smaller)
                            </span>
                          )}
                          {file.newSize > file.originalSize && (
                            <span className="text-foreground-muted ml-1">
                              (
                              {Math.round(
                                (file.newSize / file.originalSize - 1) * 100
                              )}
                              % larger)
                            </span>
                          )}
                        </p>
                      </div>
                      <a
                        href={file.url}
                        download={file.newName}
                        className="p-2 rounded-lg hover:bg-primary-muted text-primary transition-colors shrink-0"
                        aria-label={`Download ${file.newName}`}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => removeConverted(i)}
                        className="p-2 rounded-lg hover:bg-red-50 text-foreground-secondary hover:text-red-500 transition-colors shrink-0"
                        aria-label={`Remove ${file.newName}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-700 truncate">
                          {file.originalName} — Failed
                        </p>
                        <p className="text-xs text-red-500">
                          {file.errorMsg || "Conversion error"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeConverted(i)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {successCount > 1 && (
                <button
                  onClick={downloadAllZip}
                  disabled={zipping}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  {zipping ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating ZIP...
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-5 h-5" />
                      Download All as ZIP
                    </>
                  )}
                </button>
              )}
              {successCount === 1 && (
                <a
                  href={converted.find((f) => f.status === "done")?.url}
                  download={converted.find((f) => f.status === "done")?.newName}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download {toFormat}
                </a>
              )}
              <button
                onClick={handleReset}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <ResetIcon className="w-4 h-4" />
                {isBulk ? "Convert More Files" : "Convert Another"}
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-amber-50 border border-amber-200/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                100% Private — Files Never Leave Your Device
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All conversion happens locally in your browser using the Canvas
                API. Your {isBulk ? "images" : "image"} never touch any server —
                zero uploads, zero data retention, zero tracking.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-amber-50 border border-amber-200/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                {isBulk
                  ? "Batch Convert & Download as ZIP"
                  : "Instant Conversion, Free Forever"}
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                {isBulk
                  ? `Upload multiple ${fromFormat} files, convert them all to ${toFormat} in one click, and download a single ZIP archive. No file limits, no queue.`
                  : `Drop your ${fromFormat} and get ${toFormat} instantly. No account, no watermarks, no file size limits — completely free.`}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        {faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="glass-panel rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-1 transition-colors"
                  >
                    <span className="text-sm font-semibold text-foreground pr-4">
                      {faq.q}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-foreground-muted shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-foreground-muted shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 border-t border-border">
                      <p className="text-sm text-foreground-secondary leading-relaxed pt-3">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="mt-8 mb-4">
            <h2 className="text-sm font-bold text-foreground mb-3">
              Related Converters
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary text-xs font-medium transition-colors bg-white"
                >
                  {tool.name}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
