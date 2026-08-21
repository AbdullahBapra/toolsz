"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  PenTool,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  RotateCcw,
  Info,
  MousePointer2,
  Square,
  Circle,
  ArrowRight,
  Type,
  Minus,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

type Tool = "select" | "rect" | "circle" | "arrow" | "line" | "text" | "draw";

const tools: { id: Tool; label: string; icon: React.ElementType }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "rect", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "arrow", label: "Arrow", icon: ArrowRight },
  { id: "line", label: "Line", icon: Minus },
  { id: "text", label: "Text", icon: Type },
  { id: "draw", label: "Draw", icon: PenTool },
];

const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff", "#000000"];

export default function AnnotateImagePage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [strokeColor, setStrokeColor] = useState("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(24);
  const [canvasInit, setCanvasInit] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<any>(null);
  const fabricModuleRef = useRef<any>(null);
  const outputRef = useRef<string | null>(null);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const tempShapeRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    };
  }, []);

  const handleFileChange = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setFiles(newFiles);
    setDone(false);

    const url = URL.createObjectURL(newFiles[0]);

    if (!fabricRef.current) {
      const fabric = (await import("fabric")).default;
      fabricModuleRef.current = fabric;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = new fabric.Canvas(canvasRef.current!, {
          width: Math.min(img.naturalWidth, 900),
          height: Math.min(img.naturalHeight, 700),
        });
        fabricRef.current = canvas;

        const scale = Math.min(
          canvas.getWidth() / img.naturalWidth,
          canvas.getHeight() / img.naturalHeight
        );

        const fImg = new fabric.Image(img, {
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        });
        canvas.add(fImg);
        // @ts-ignore - sendToBack exists at runtime
        canvas.sendToBack(fImg);
        canvas.renderAll();
        setCanvasInit(true);
      };
      img.src = url;
    } else {
      const fabric = (await import("fabric")).default;
      fabricModuleRef.current = fabric;
      const canvas = fabricRef.current;
      canvas.clear();
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const scale = Math.min(
          canvas.getWidth() / img.naturalWidth,
          canvas.getHeight() / img.naturalHeight
        );
        const fImg = new fabric.Image(img, {
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        });
        canvas.add(fImg);
        // @ts-ignore - sendToBack exists at runtime
        canvas.sendToBack(fImg);
        canvas.renderAll();
      };
      img.src = url;
    }
  }, []);

  // Handle tool-specific canvas events
  useEffect(() => {
    if (!fabricRef.current || !canvasInit) return;
    const canvas = fabricRef.current;
    const fabric = fabricModuleRef.current;
    if (!fabric) return;

    canvas.isDrawingMode = activeTool === "draw";
    if (activeTool === "draw") {
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    }

    const handleMouseDown = (opt: any) => {
      if (activeTool === "select" || activeTool === "draw") return;
      isDrawingRef.current = true;
      const pointer = canvas.getPointer(opt.e);
      startPosRef.current = { x: pointer.x, y: pointer.y };

      if (activeTool === "text") {
        setTextPosition({ x: pointer.x, y: pointer.y });
        setTextInput("");
        isDrawingRef.current = false;
        return;
      }

      let shape: any;
      const common = {
        left: pointer.x,
        top: pointer.y,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth,
        selectable: true,
      };

      if (activeTool === "rect") {
        shape = new fabric.Rect({ ...common, width: 1, height: 1 });
      } else if (activeTool === "circle") {
        shape = new fabric.Ellipse({ ...common, rx: 1, ry: 1 });
      } else if (activeTool === "line" || activeTool === "arrow") {
        shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          ...common,
          fill: strokeColor,
        });
      }

      if (shape) {
        canvas.add(shape);
        tempShapeRef.current = shape;
      }
    };

    const handleMouseMove = (opt: any) => {
      if (!isDrawingRef.current || !tempShapeRef.current) return;
      const pointer = canvas.getPointer(opt.e);
      const shape = tempShapeRef.current;
      const sx = startPosRef.current.x;
      const sy = startPosRef.current.y;

      if (activeTool === "rect") {
        shape.set({
          width: Math.abs(pointer.x - sx),
          height: Math.abs(pointer.y - sy),
          left: Math.min(sx, pointer.x),
          top: Math.min(sy, pointer.y),
        });
      } else if (activeTool === "circle") {
        shape.set({
          rx: Math.abs(pointer.x - sx) / 2,
          ry: Math.abs(pointer.y - sy) / 2,
          left: Math.min(sx, pointer.x),
          top: Math.min(sy, pointer.y),
        });
      } else if (activeTool === "line" || activeTool === "arrow") {
        shape.set({ x2: pointer.x, y2: pointer.y });
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (tempShapeRef.current && activeTool === "arrow") {
        const shape = tempShapeRef.current;
        const x1 = shape.x1;
        const y1 = shape.y1;
        const x2 = shape.x2;
        const y2 = shape.y2;

        // Calculate arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 15;
        const headAngle = Math.PI / 6;

        const arrowHead = new fabric.Triangle({
          left: x2,
          top: y2,
          width: headLen,
          height: headLen,
          fill: strokeColor,
          angle: (angle * 180) / Math.PI + 90,
          selectable: false,
          evented: false,
        });

        canvas.add(arrowHead);
        shape.set({ selectable: true });
      }

      tempShapeRef.current = null;
      canvas.renderAll();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvasInit, activeTool, strokeColor, strokeWidth, fontSize]);

  const confirmText = useCallback(() => {
    if (!textInput.trim() || !fabricModuleRef.current || !fabricRef.current || !textPosition) return;
    const fabric = fabricModuleRef.current;
    const canvas = fabricRef.current;
    const textObj = new fabric.IText(textInput.trim(), {
      left: textPosition.x,
      top: textPosition.y,
      fontSize,
      fill: strokeColor,
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
    });
    canvas.add(textObj);
    canvas.renderAll();
    setTextInput("");
    setTextPosition(null);
  }, [textInput, textPosition, fontSize, strokeColor]);

  const handleExport = useCallback(async () => {
    if (!fabricRef.current) return;
    setProcessing(true);

    try {
      const dataUrl = fabricRef.current.toDataURL({ format: "png", multiplier: 2 });
      const url = dataUrl;
      if (outputRef.current) URL.revokeObjectURL(outputRef.current);
      outputRef.current = url;
      setOutputUrl(url);
      setDone(true);
      addToast("success", "Annotated image exported!");
    } catch (err) {
      console.error("Export failed:", err);
      addToast("error", "Failed to export. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [addToast]);

  const handleDownload = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = "annotated-image.png";
    a.click();
  }, [outputUrl]);

  const handleReset = useCallback(() => {
    if (fabricRef.current) {
      fabricRef.current.clear();
    }
    if (outputRef.current) URL.revokeObjectURL(outputRef.current);
    setFiles([]);
    setOutputUrl(null);
    setDone(false);
    setCanvasInit(false);
    fabricRef.current = null;
    outputRef.current = null;
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={PenTool}
          title="Image Annotator"
          description="Add arrows, rectangles, circles, lines, text, and freehand drawings to images — perfect for visual feedback. Free, instant, and private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload
                accept="image/*"
                files={files}
                onFilesChange={handleFileChange}
                label="Drop an image here or click to upload"
                description="or click to browse — PNG, JPG, WebP supported"
              />

            {canvasInit && (
              <div className="mt-8 animate-fade-in-up space-y-4">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-1">
                    {tools.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTool(t.id)}
                        title={t.label}
                        className={`p-2 rounded-lg transition ${
                          activeTool === t.id
                            ? "bg-accent/15 text-accent"
                            : "hover:bg-surface-2 text-foreground-secondary"
                        }`}
                      >
                        <t.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>

                  <div className="h-6 w-px bg-border" />

                  {/* Colors */}
                  <div className="flex gap-1">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setStrokeColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          strokeColor === c ? "border-accent scale-110" : "border-border"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="h-6 w-px bg-border" />

                  {/* Stroke width */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-foreground-muted">Width</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(Number(e.target.value))}
                      className="w-20 accent-accent"
                    />
                  </div>

                  {(activeTool === "text") && (
                    <>
                      <div className="h-6 w-px bg-border" />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-foreground-muted">Font</label>
                        <input
                          type="range"
                          min={12}
                          max={72}
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-20 accent-accent"
                        />
                        <span className="text-xs text-foreground-muted">{fontSize}px</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Text input overlay */}
                {textPosition && activeTool === "text" && (
                  <div className="bg-surface-1 rounded-xl p-4 border border-border mt-4">
                    <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-primary" /> Add Text
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmText();
                        }}
                        placeholder="Type text and press Enter"
                        className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={confirmText}
                        className="btn btn-primary px-4 py-2 text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setTextInput(""); setTextPosition(null); }}
                        className="btn btn-secondary px-3 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Canvas */}
                <div className="bg-surface-1 rounded-xl border border-border overflow-hidden flex justify-center">
                  <canvas ref={canvasRef} />
                </div>

                {/* Action Button */}
                <div className="mt-6 flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleExport}
                    disabled={processing}
                    className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Export PNG
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8 animate-fade-in-up">
            <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Annotated Image Ready!</h3>
            <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
              Your annotated image is ready. Download it and share it anywhere.
            </p>
            <div className="flex justify-center mb-6">
              <img
                src={outputUrl!}
                alt="Annotated Image"
                className="max-w-md max-h-80 rounded-lg border border-border"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="btn btn-primary inline-flex items-center gap-2 text-center"
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>
              <button
                onClick={handleReset}
                className="btn btn-secondary inline-flex items-center gap-2 text-center"
              >
                <RotateCcw className="w-4 h-4" />
                Annotate Another
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                All annotation happens entirely in your browser. Your image is never uploaded to any server.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Full Annotation Toolkit</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Arrows, rectangles, circles, lines, freehand drawing, and editable text. Double-click text objects to edit them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  