"use client";

import { useState, useRef, useEffect, useCallback } from"react";
import {
 Pencil,
 Type,
 Download,
 Trash2,
 Sun,
 Contrast,
 Droplets,
 Sparkles,
 Bold,
 Italic,
 Underline,
 AlignLeft,
 AlignCenter,
 AlignRight,
 ZoomIn,
 ZoomOut,
 RotateCcw,
 ChevronDown,
 Loader2,
 Shield,
 Zap,
 Plus,
 Minus,
 Paintbrush,
 Eraser,
 ScanText,
 Square,
 Pipette,
 Wand2,
 Lightbulb,
} from"lucide-react";
import FileUpload from"@/app/components/FileUpload";
import ToolHero from"@/app/components/ToolHero";
import { useToast } from "@/app/components/Toast";

const FONT_OPTIONS = [
"Arial",
"Helvetica",
"Georgia",
"Times New Roman",
"Courier New",
"Verdana",
"Trebuchet MS",
"Impact",
"Comic Sans MS",
];

interface FilterState {
 brightness: number;
 contrast: number;
 saturation: number;
 blur: number;
}

const DEFAULT_FILTERS: FilterState = {
 brightness: 0,
 contrast: 0,
 saturation: 0,
 blur: 0,
};

type ActiveTool ="select" |"draw" |"erase" |"region" |"magic";

export default function EditImagePage() {
 const { addToast } = useToast();
 const [files, setFiles] = useState<File[]>([]);
 const [editorReady, setEditorReady] = useState(false);
 const [canvasInit, setCanvasInit] = useState(false);

 // Fabric canvas state
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const fabricRef = useRef<any>(null);
 const canvasElRef = useRef<HTMLCanvasElement>(null);

 // Selected object state
 const [selectedType, setSelectedType] = useState<"text" | null>(null);
 const [textProps, setTextProps] = useState({
 fontFamily:"Arial",
 fontSize: 32,
 fill:"#000000",
 bold: false,
 italic: false,
 underline: false,
 textAlign:"left" as"left" |"center" |"right",
 });

 // Filters
 const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

 // Zoom
 const [zoom, setZoom] = useState(1);

 // Loading
 const [isExporting, setIsExporting] = useState(false);

 // OCR state
 const [isOcrRunning, setIsOcrRunning] = useState(false);
 const [ocrProgress, setOcrProgress] = useState(0);
 const [ocrStatus, setOcrStatus] = useState("");
 const [detectedTextCount, setDetectedTextCount] = useState(0);
 const [ocrError, setOcrError] = useState("");

 // Drawing / paint tool state
 const [brushColor, setBrushColor] = useState("#ffffff");
 const [brushSize, setBrushSize] = useState(10);
 const [activeTool, setActiveTool] = useState<ActiveTool>("select");

 // Region erase state
 const [fillColor, setFillColor] = useState("#ffffff");
 const [autoSampleFill, setAutoSampleFill] = useState(true);
 const [regionRect, setRegionRect] = useState<{
 x: number;
 y: number;
 w: number;
 h: number;
 } | null>(null);
 const [isDrawingRegion, setIsDrawingRegion] = useState(false);

 // Image scale ref (original → display)
 const imageScaleRef = useRef(1);

 // Ref to track activeTool so canvas event handlers can read current value
 const activeToolRef = useRef<ActiveTool>("select");

 // Sync ref when activeTool changes
 useEffect(() => {
 activeToolRef.current = activeTool;
 }, [activeTool]);

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const activeTextRef = useRef<any>(null);

 // Region drawing refs
 const regionStartRef = useRef<{ x: number; y: number } | null>(null);
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const tempRectRef = useRef<any>(null);
 // Store fabric module ref for synchronous access in event handlers
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const fabricModuleRef = useRef<any>(null);

 // Flash animation interval IDs for cleanup
 const flashIntervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

 // SAM state & refs
 const [isSamLoading, setIsSamLoading] = useState(false);
 const [samStatus, setSamStatus] = useState("");
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const samProcessorRef = useRef<any>(null);
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const samModelRef = useRef<any>(null);

 // Delete selected (defined early so keyboard effect can reference it)
 const handleDeleteSelected = useCallback(() => {
 if (!fabricRef.current) return;
 const active = fabricRef.current.getActiveObject();
 if (active) {
 // If it's an OCR text, also remove its paired cover rect + highlight
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const coverRect = (active as any)._ocrCoverRect;
 const highlightRect = (active as any)._ocrHighlightRect;
 if (coverRect) {
 fabricRef.current.remove(coverRect);
 }
 if (highlightRect) {
 fabricRef.current.remove(highlightRect);
 }
 fabricRef.current.remove(active);
 fabricRef.current.discardActiveObject();
 fabricRef.current.requestRenderAll();
 setSelectedType(null);
 activeTextRef.current = null;
 }
 }, []);

 // Keyboard delete support
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if ((e.key ==="Delete" || e.key ==="Backspace") && editorReady) {
 // Don't intercept if user is editing text on the canvas
 const active = fabricRef.current?.getActiveObject();
 if (active && active.isEditing) return;
 // Don't intercept if focus is in an input/textarea/select
 const tag = (e.target as HTMLElement).tagName;
 if (tag ==="INPUT" || tag ==="TEXTAREA" || tag ==="SELECT") return;
 handleDeleteSelected();
 }
 };
 window.addEventListener("keydown", handleKeyDown);
 return () => window.removeEventListener("keydown", handleKeyDown);
 }, [editorReady, handleDeleteSelected]);

 // Helper: get the HTMLImageElement from the background FabricImage
 const getBgImageElement = useCallback(() => {
 const canvas = fabricRef.current;
 if (!canvas?.backgroundImage) return null;
 const bgImg = canvas.backgroundImage;
 return bgImg.getElement ? bgImg.getElement() : bgImg._element || null;
 }, []);

 // Helper: create an offscreen canvas with the original (unscaled) image drawn on it
 const createOffscreenFromBg = useCallback(() => {
 const imgEl = getBgImageElement();
 if (!imgEl) return null;
 const offscreen = document.createElement("canvas");
 offscreen.width = imgEl.naturalWidth || imgEl.width;
 offscreen.height = imgEl.naturalHeight || imgEl.height;
 const offCtx = offscreen.getContext("2d")!;
 offCtx.drawImage(imgEl, 0, 0);
 return { canvas: offscreen, ctx: offCtx, width: offscreen.width, height: offscreen.height, imgEl };
 }, [getBgImageElement]);

 // Sync drawing mode with fabric canvas
 useEffect(() => {
 if (!fabricRef.current) return;
 const canvas = fabricRef.current;

 const initDrawing = async () => {
 if (activeTool ==="draw" || activeTool ==="erase") {
 // PencilBrush must be explicitly created in fabric v7
 // Create brush BEFORE enabling drawing mode to avoid race condition
 if (!canvas.freeDrawingBrush) {
 const fabric = await import("fabric");
 canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
 }
 canvas.freeDrawingBrush.color = brushColor;
 canvas.freeDrawingBrush.width = brushSize;
 canvas.isDrawingMode = true;
 } else {
 canvas.isDrawingMode = false;
 }
 };

 initDrawing();
 }, [activeTool, brushColor, brushSize]);

 // Initialize fabric canvas
 useEffect(() => {
 if (!canvasElRef.current || canvasInit) return;

 let canvas: import("fabric").Canvas | null = null;
 let isMounted = true;

 const initCanvas = async () => {
 const fabric = await import("fabric");
 if (!isMounted) return;

 canvas = new fabric.Canvas(canvasElRef.current!, {
 width: 800,
 height: 600,
 backgroundColor:"#f0f0f0",
 selection: true,
 });

 fabricRef.current = canvas;
 fabricModuleRef.current = fabric;
 setCanvasInit(true);

 // Listen for selection events to sync React state
 canvas.on("selection:created", handleSelection);
 canvas.on("selection:updated", handleSelection);
 canvas.on("selection:cleared", handleSelectionCleared);

 // When a text object is modified, update the ref
 canvas.on("object:modified", (e: { target: any }) => {
 if (e.target && e.target.type ==="i-text") {
 activeTextRef.current = e.target;
 syncTextPropsFromObject(e.target);
 }
 });

 // When a text object is moved, sync its OCR cover rect + highlight rect position
 // Maintain the original relative offsets between objects
 canvas.on("object:moving", (e: { target: any }) => {
 if (e.target && e.target._ocrCoverRect) {
 const coverRect = e.target._ocrCoverRect;
 const highlightRect = e.target._ocrHighlightRect;
 // Cover rect offset: -OCR_PADDING from IText position
 // (cover rect was placed at bbox*scale - 4, IText at bbox*scale)
 const OCR_PADDING = 4;
 coverRect.set({
 left: e.target.left - OCR_PADDING,
 top: e.target.top - OCR_PADDING,
 });
 if (highlightRect) {
 // Highlight rect offset: -OCR_PADDING - HL_PADDING from IText
 const HL_PADDING = 6;
 highlightRect.set({
 left: e.target.left - OCR_PADDING - HL_PADDING,
 top: e.target.top - OCR_PADDING - HL_PADDING,
 });
 }
 }
 });

 // When an IText enters editing mode, auto-switch to select tool
 // so drawing mode doesn't block text editing
 // Uses ref to read current value since this handler captures initial state
 // Fabric v7 event name:"text:editing:entered" on Canvas
 canvas.on("text:editing:entered", (e: any) => {
 if (activeToolRef.current !=="select") {
 setActiveTool("select");
 }
 // Hide OCR highlight border while editing for cleaner view
 if (e.target?._ocrHighlightRect) {
 e.target._ocrHighlightRect.set({ visible: false });
 fabricRef.current?.requestRenderAll();
 }
 });

 // When IText exits editing, show OCR highlight again
 canvas.on("text:editing:exited", (e: any) => {
 if (e.target?._ocrHighlightRect) {
 e.target._ocrHighlightRect.set({ visible: true });
 fabricRef.current?.requestRenderAll();
 }
 });
 };

 initCanvas();

 return () => {
 isMounted = false;
 // Clear flash intervals on unmount
 flashIntervalsRef.current.forEach(id => clearInterval(id));
 flashIntervalsRef.current = [];
 if (canvas) {
 canvas.dispose();
 }
 if (fabricRef.current && fabricRef.current !== canvas) {
 fabricRef.current.dispose();
 }
 fabricRef.current = null;
 setCanvasInit(false);
 };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const handleSelection = (e: any) => {
 const obj = e.selected?.[0] || e.target;
 if (obj && obj.type ==="i-text") {
 setSelectedType("text");
 activeTextRef.current = obj;
 syncTextPropsFromObject(obj);
 } else {
 setSelectedType(null);
 activeTextRef.current = null;
 }
 };

 const handleSelectionCleared = () => {
 setSelectedType(null);
 activeTextRef.current = null;
 };

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const syncTextPropsFromObject = (obj: any) => {
 setTextProps({
 fontFamily: obj.fontFamily ||"Arial",
 fontSize: obj.fontSize || 32,
 fill: obj.fill ||"#000000",
 bold: obj.fontWeight ==="bold",
 italic: obj.fontStyle ==="italic",
 underline: obj.underline === true,
 textAlign: obj.textAlign ||"left",
 });
 };

 // Sample background color from image around a bounding box
 const sampleBackgroundColor = useCallback(
 (
 ctx: CanvasRenderingContext2D,
 imgWidth: number,
 imgHeight: number,
 bbox: { x0: number; y0: number; x1: number; y1: number }
 ): string => {
 const samples: { r: number; g: number; b: number }[] = [];
 const step = 3;
 const margin = 5; // sample a few pixels away from the text edge

 // Sample above the text
 const yAbove = Math.max(0, bbox.y0 - margin);
 for (let x = bbox.x0; x < bbox.x1; x += step) {
 const pixel = ctx.getImageData(
 Math.min(x, imgWidth - 1),
 yAbove,
 1,
 1
 ).data;
 samples.push({ r: pixel[0], g: pixel[1], b: pixel[2] });
 }

 // Sample below the text
 const yBelow = Math.min(imgHeight - 1, bbox.y1 + margin);
 for (let x = bbox.x0; x < bbox.x1; x += step) {
 const pixel = ctx.getImageData(
 Math.min(x, imgWidth - 1),
 yBelow,
 1,
 1
 ).data;
 samples.push({ r: pixel[0], g: pixel[1], b: pixel[2] });
 }

 // Sample left of the text
 const xLeft = Math.max(0, bbox.x0 - margin);
 for (let y = bbox.y0; y < bbox.y1; y += step) {
 const pixel = ctx.getImageData(
 xLeft,
 Math.min(y, imgHeight - 1),
 1,
 1
 ).data;
 samples.push({ r: pixel[0], g: pixel[1], b: pixel[2] });
 }

 // Sample right of the text
 const xRight = Math.min(imgWidth - 1, bbox.x1 + margin);
 for (let y = bbox.y0; y < bbox.y1; y += step) {
 const pixel = ctx.getImageData(
 xRight,
 Math.min(y, imgHeight - 1),
 1,
 1
 ).data;
 samples.push({ r: pixel[0], g: pixel[1], b: pixel[2] });
 }

 if (samples.length === 0) return"#ffffff";

 // Average the samples
 const avg = samples.reduce(
 (acc, s) => ({ r: acc.r + s.r, g: acc.g + s.g, b: acc.b + s.b }),
 { r: 0, g: 0, b: 0 }
 );
 const n = samples.length;
 const r = Math.round(avg.r / n);
 const g = Math.round(avg.g / n);
 const b = Math.round(avg.b / n);

 return `rgb(${r},${g},${b})`;
 },
 []
 );

 // Sample text color from multiple points in the bounding box
 // Uses contrast-based approach: finds the color that contrasts most with the background
 const sampleTextColor = useCallback(
 (
 ctx: CanvasRenderingContext2D,
 bbox: { x0: number; y0: number; x1: number; y1: number },
 bgColor?: string // background color for contrast comparison
 ): string => {
 // Sample a grid of points inside the text bbox
 const samples: { r: number; g: number; b: number }[] = [];
 const stepX = Math.max(1, Math.floor((bbox.x1 - bbox.x0) / 5));
 const stepY = Math.max(1, Math.floor((bbox.y1 - bbox.y0) / 3));

 for (let x = bbox.x0 + stepX; x < bbox.x1; x += stepX) {
 for (let y = bbox.y0 + stepY; y < bbox.y1; y += stepY) {
 const pixel = ctx.getImageData(x, y, 1, 1).data;
 samples.push({ r: pixel[0], g: pixel[1], b: pixel[2] });
 }
 }

 if (samples.length === 0) {
 // Fallback to center
 const cx = Math.floor((bbox.x0 + bbox.x1) / 2);
 const cy = Math.floor((bbox.y0 + bbox.y1) / 2);
 const pixel = ctx.getImageData(cx, cy, 1, 1).data;
 return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
 }

 // Parse background color if provided
 let bgR = 255, bgG = 255, bgB = 255;
 if (bgColor) {
 const match = bgColor.match(/rgb\((\d+),(\d+),(\d+)\)/);
 if (match) {
 bgR = parseInt(match[1]);
 bgG = parseInt(match[2]);
 bgB = parseInt(match[3]);
 }
 }

 // Find the sample with highest contrast against the background
 // This works for both dark-on-light AND light-on-dark text
 let bestContrast = samples[0];
 let bestContrastValue = 0;
 for (const s of samples) {
 // Euclidean color distance
 const dist = Math.sqrt(
 (s.r - bgR) ** 2 + (s.g - bgG) ** 2 + (s.b - bgB) ** 2
 );
 if (dist > bestContrastValue) {
 bestContrastValue = dist;
 bestContrast = s;
 }
 }

 return `rgb(${bestContrast.r},${bestContrast.g},${bestContrast.b})`;
 },
 []
 );

 // Sample average color from a rectangular region
 const sampleRegionColor = useCallback(
 (
 ctx: CanvasRenderingContext2D,
 x: number,
 y: number,
 w: number,
 h: number,
 imgWidth: number,
 imgHeight: number
 ): string => {
 const clamped = {
 x0: Math.max(0, Math.floor(x)),
 y0: Math.max(0, Math.floor(y)),
 x1: Math.min(imgWidth, Math.floor(x + w)),
 y1: Math.min(imgHeight, Math.floor(y + h)),
 };
 const rw = clamped.x1 - clamped.x0;
 const rh = clamped.y1 - clamped.y0;
 if (rw <= 0 || rh <= 0) return"#ffffff";

 const imgData = ctx.getImageData(clamped.x0, clamped.y0, rw, rh);
 const data = imgData.data;
 let rSum = 0, gSum = 0, bSum = 0, count = 0;
 // Sample every 4th pixel for performance
 for (let i = 0; i < data.length; i += 16) {
 rSum += data[i];
 gSum += data[i + 1];
 bSum += data[i + 2];
 count++;
 }
 if (count === 0) return"#ffffff";
 const r = Math.round(rSum / count);
 const g = Math.round(gSum / count);
 const b = Math.round(bSum / count);
 return `rgb(${r},${g},${b})`;
 },
 []
 );

 // Clean up previous OCR objects from canvas
 const cleanupOcrObjects = useCallback(() => {
 // Clear any pending flash animations
 flashIntervalsRef.current.forEach(id => clearInterval(id));
 flashIntervalsRef.current = [];

 if (!fabricRef.current) return;
 const canvas = fabricRef.current;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const toRemove: any[] = [];
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 canvas.getObjects().forEach((obj: any) => {
 if (obj._ocrHighlight) {
 toRemove.push(obj);
 }
 });
 // Deduplicate
 const unique = [...new Set(toRemove)];
 unique.forEach((obj) => canvas.remove(obj));
 if (unique.length > 0) {
 canvas.requestRenderAll();
 setDetectedTextCount(0);
 }
 }, []);

 // Run OCR on the uploaded image
 const runOCR = useCallback(
 async (imageInput: string | File, scale: number) => {
 setIsOcrRunning(true);
 setOcrProgress(0);
 setOcrStatus("Initializing OCR engine...");
 setOcrError("");

 // Clean up previous OCR objects first
 cleanupOcrObjects();

 try {
 const Tesseract = await import("tesseract.js");
 const worker = await Tesseract.createWorker("eng", 1, {
 logger: (m: { status: string; progress: number }) => {
 if (m.status ==="recognizing text") {
 setOcrProgress(Math.round(m.progress * 100));
 setOcrStatus("Recognizing text...");
 } else if (m.status ==="loading language traineddata") {
 setOcrProgress(Math.round(m.progress * 50)); // first 50% is loading
 setOcrStatus("Loading language data...");
 } else {
 setOcrStatus(m.status);
 }
 },
 });

 const result = await worker.recognize(imageInput);
 await worker.terminate();

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const ocrData = result.data as any;

 // Tesseract.js v5: lines are nested inside blocks > paragraphs > lines
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const lines: any[] = (ocrData.blocks || []).flatMap(
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (b: any) => (b.paragraphs || []).flatMap(
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (p: any) => p.lines || []
 )
 );

 if (lines.length === 0) {
 setOcrStatus("No text detected in this image");
 setIsOcrRunning(false);
 setOcrProgress(100);
 return;
 }

 // Create offscreen canvas for color sampling from ORIGINAL image
 const canvas = fabricRef.current;
 const bgImg = canvas.backgroundImage;
 if (!bgImg) {
 setOcrError("No background image found");
 setIsOcrRunning(false);
 return;
 }

 const offscreen = document.createElement("canvas");
 // Use the original image element for sampling
 const imgEl = bgImg.getElement ? bgImg.getElement() : bgImg._element;
 let count = 0;

 if (!imgEl) {
 setOcrError("Could not access image element for color sampling");
 setIsOcrRunning(false);
 return;
 }

 offscreen.width = imgEl.naturalWidth || imgEl.width;
 offscreen.height = imgEl.naturalHeight || imgEl.height;
 const offCtx = offscreen.getContext("2d")!;
 offCtx.drawImage(imgEl, 0, 0);

 const fabric = await import("fabric");

 for (const line of lines) {
 if (!line.bbox || !line.text || line.text.trim().length === 0)
 continue;

 const bbox = line.bbox;

 // Validate bbox coordinates
 if (
 typeof bbox.x0 !=="number" || typeof bbox.y0 !=="number" ||
 typeof bbox.x1 !=="number" || typeof bbox.y1 !=="number"
 ) continue;

 // Skip very tiny detections (likely noise)
 const rawW = bbox.x1 - bbox.x0;
 const rawH = bbox.y1 - bbox.y0;
 if (rawW < 5 || rawH < 3) continue;

 // Sample colors from original image
 const bgColor = sampleBackgroundColor(
 offCtx,
 offscreen.width,
 offscreen.height,
 bbox
 );
 const textColor = sampleTextColor(offCtx, bbox, bgColor);

 const boxW = rawW * scale;
 const boxH = rawH * scale;
 // Better font size estimation: use bbox height minus some padding
 const fontSize = Math.max(8, Math.min(200, boxH * 0.75));

 // Cover rectangle to hide original text — with generous padding
 const padding = 4;
 const coverRect = new fabric.Rect({
 left: bbox.x0 * scale - padding,
 top: bbox.y0 * scale - padding,
 width: boxW + padding * 2,
 height: boxH + padding * 2,
 fill: bgColor,
 selectable: false,
 evented: false,
 objectCaching: false,
 });

 // Detect bold/italic from tesseract data
 const isBold = line.words?.some(
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (w: any) =>
 (w.fontname && w.fontname.toLowerCase().includes("bold")) ||
 (w.fontsize && w.fontsize > fontSize / scale * 1.1)
 );
 const isItalic = line.words?.some(
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (w: any) =>
 w.fontname?.toLowerCase().includes("italic") ||
 w.fontname?.toLowerCase().includes("oblique")
 );

 // Editable IText overlay
 // NOTE: `padding` expands the hit area but does NOT shift the rendered text.
 // So keep left/top at the original text position (bbox.x0 * scale)
 const iText = new fabric.IText(line.text, {
 left: bbox.x0 * scale,
 top: bbox.y0 * scale,
 fontSize: fontSize,
 fill: textColor,
 fontFamily:"Arial",
 fontWeight: isBold ?"bold" :"normal",
 fontStyle: isItalic ?"italic" :"normal",
 editable: true,
 cursorColor:"#6E6EE8",
 editingBorderColor:"#6E6EE8",
 padding: padding + 4, // generous hit area for easy double-click
 lineHeight: 1.1,
 });

 // Always-visible dashed highlight border so users can FIND detected text
 const hlPadding = 6;
 const highlightRect = new fabric.Rect({
 left: bbox.x0 * scale - padding - hlPadding,
 top: bbox.y0 * scale - padding - hlPadding,
 width: boxW + padding * 2 + hlPadding * 2,
 height: boxH + padding * 2 + hlPadding * 2,
 fill:"transparent",
 stroke:"#6E6EE8",
 strokeWidth: 1.5,
 strokeDashArray: [4, 3],
 selectable: false,
 evented: false,
 objectCaching: false,
 visible: true,
 });

 // Link cover rect and highlight to IText
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (iText as any)._ocrCoverRect = coverRect;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (iText as any)._ocrHighlightRect = highlightRect;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (iText as any)._ocrHighlight = true;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (coverRect as any)._ocrHighlight = true;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (highlightRect as any)._ocrHighlight = true;

 // z-order: coverRect (bottom) → highlightRect → iText (top)
 canvas.add(coverRect, highlightRect, iText);
 count++;
 }

 setDetectedTextCount(count);
 canvas.requestRenderAll();

 // Auto-select the first detected text and pulse it to draw attention
 if (count > 0) {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const ocrTexts = canvas.getObjects().filter((obj: any) => obj._ocrCoverRect);
 if (ocrTexts.length > 0) {
 const firstText = ocrTexts[0];
 canvas.setActiveObject(firstText);
 canvas.requestRenderAll();

 // Pulse animation: briefly flash the highlight borders
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 ocrTexts.forEach((t: any) => {
 if (t._ocrHighlightRect) {
 const hl = t._ocrHighlightRect;
 const origStroke = hl.stroke;
 const origWidth = hl.strokeWidth;
 // Flash sequence
 let flashCount = 0;
 const flashInterval = setInterval(() => {
 if (flashCount >= 6) {
 hl.set({ stroke: origStroke, strokeWidth: origWidth });
 fabricRef.current?.requestRenderAll();
 clearInterval(flashInterval);
 // Remove from ref array
 const idx = flashIntervalsRef.current.indexOf(flashInterval);
 if (idx !== -1) flashIntervalsRef.current.splice(idx, 1);
 return;
 }
 const isOn = flashCount % 2 === 0;
 hl.set({
 stroke: isOn ?"#818cf8" : origStroke,
 strokeWidth: isOn ? 3 : origWidth,
 });
 fabricRef.current?.requestRenderAll();
 flashCount++;
 }, 250);
 flashIntervalsRef.current.push(flashInterval);
 }
 });
 }
 }

 setOcrStatus(
 count > 0
 ? `Detected ${count} text region${count !== 1 ?"s" :""} — double-click any highlighted text to edit it`
 :"No readable text detected in this image"
 );
 setOcrProgress(100);
 } catch (err) {
 console.error("OCR error:", err);
 const msg = err instanceof Error ? err.message :"Unknown error";
 setOcrError(`OCR failed: ${msg}`);
 setOcrStatus("OCR failed");
 setOcrProgress(100);
 } finally {
 setIsOcrRunning(false);
 }
 },
 [sampleBackgroundColor, sampleTextColor, cleanupOcrObjects]
 );

 // Convert blob URL to data URL (more reliable for tesseract.js)
 const blobUrlToDataUrl = useCallback((blobUrl: string): Promise<string> => {
 return new Promise((resolve, reject) => {
 const img = new Image();
 img.onload = () => {
 const c = document.createElement("canvas");
 c.width = img.naturalWidth;
 c.height = img.naturalHeight;
 const ctx = c.getContext("2d")!;
 ctx.drawImage(img, 0, 0);
 resolve(c.toDataURL("image/png"));
 };
 img.onerror = () => reject(new Error("Failed to load image for OCR"));
 img.src = blobUrl;
 });
 }, []);

 // Load uploaded image as background
 const handleUpload = useCallback(async () => {
 if (files.length === 0 || !fabricRef.current) return;

 const canvas = fabricRef.current;
 const file = files[0];
 const url = URL.createObjectURL(file);

 try {
 const fabric = await import("fabric");
 const img = await fabric.FabricImage.fromURL(url);

 // Scale canvas to fit the image (max 1200px wide)
 const maxW = 1200;
 const scale = img.width > maxW ? maxW / img.width : 1;
 const displayW = img.width * scale;
 const displayH = img.height * scale;

 // Store scale for OCR coordinate mapping
 imageScaleRef.current = scale;

 canvas.setDimensions({ width: displayW, height: displayH });

 // In fabric v7, backgroundImage is a property, not a method
 img.set({
 scaleX: scale,
 scaleY: scale,
 originX:"left",
 originY:"top",
 });
 canvas.backgroundImage = img;

 // Clear all objects and reset state
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 canvas.getObjects().slice().forEach((obj: any) => canvas.remove(obj));
 setFilters(DEFAULT_FILTERS);
 setZoom(1);
 setDetectedTextCount(0);
 setOcrError("");
 canvas.setZoom(1);
 canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
 canvas.requestRenderAll();

 setEditorReady(true);
 // Recalculate canvas position now that it's visible (display:none → block)
 requestAnimationFrame(() => {
 fabricRef.current?.calcOffset();
 });

 // Auto-run OCR to detect existing text
 // Convert blob URL to data URL first — more reliable for tesseract.js
 try {
 setOcrStatus("Preparing image for OCR...");
 setOcrProgress(0);
 setIsOcrRunning(true);
 const dataUrl = await blobUrlToDataUrl(url);
 runOCR(dataUrl, scale);
 } catch (ocrErr) {
 console.error("OCR prep error:", ocrErr);
 setOcrError("Could not prepare image for OCR");
 setIsOcrRunning(false);
 }
 } catch (err) {
 console.error(err);
 addToast("error", "Failed to load image.");
 }
 }, [files, runOCR, blobUrlToDataUrl, addToast]);

 // Trigger load when files change
 useEffect(() => {
 if (files.length > 0 && canvasInit) {
 handleUpload();
 }
 }, [files, canvasInit, handleUpload]);

 // Region erase: mouse handlers for drawing a rectangle
 useEffect(() => {
 if (!fabricRef.current || activeTool !=="region") return;
 const canvas = fabricRef.current;

 // Disable fabric selection and target finding when in region mode
 canvas.selection = false;
 canvas.skipTargetFind = true;

 const handleMouseDown = (e: any) => {
 const pointer = e.scenePoint || e.pointer || (canvas.getScenePoint && canvas.getScenePoint(e.e)) || { x: 0, y: 0 };
 regionStartRef.current = { x: pointer.x, y: pointer.y };
 setIsDrawingRegion(true);
 setRegionRect(null);

 // Create a temporary visual rectangle using the stored fabric module
 const fabricMod = fabricModuleRef.current;
 if (!fabricMod) return;
 tempRectRef.current = new fabricMod.Rect({
 left: pointer.x,
 top: pointer.y,
 width: 0,
 height: 0,
 fill:"rgba(99, 102, 241, 0.2)",
 stroke:"#6E6EE8",
 strokeWidth: 2,
 strokeDashArray: [5, 5],
 selectable: false,
 evented: false,
 });
 canvas.add(tempRectRef.current);
 };

 const handleMouseMove = (e: any) => {
 if (!regionStartRef.current || !tempRectRef.current) return;
 const pointer = e.scenePoint || e.pointer || (canvas.getScenePoint && canvas.getScenePoint(e.e)) || { x: 0, y: 0 };
 const x = Math.min(regionStartRef.current.x, pointer.x);
 const y = Math.min(regionStartRef.current.y, pointer.y);
 const w = Math.abs(pointer.x - regionStartRef.current.x);
 const h = Math.abs(pointer.y - regionStartRef.current.y);

 tempRectRef.current.set({ left: x, top: y, width: w, height: h });
 canvas.requestRenderAll();
 setRegionRect({ x, y, w, h });
 };

 const handleMouseUp = () => {
 regionStartRef.current = null;
 setIsDrawingRegion(false);

 // Remove temp rect — the actual fill rect will be added by the button handler
 if (tempRectRef.current) {
 canvas.remove(tempRectRef.current);
 tempRectRef.current = null;
 }

 // Re-enable selection
 canvas.selection = true;
 canvas.requestRenderAll();
 };

 canvas.on("mouse:down", handleMouseDown);
 canvas.on("mouse:move", handleMouseMove);
 canvas.on("mouse:up", handleMouseUp);

 return () => {
 canvas.off("mouse:down", handleMouseDown);
 canvas.off("mouse:move", handleMouseMove);
 canvas.off("mouse:up", handleMouseUp);
 canvas.selection = true;
 canvas.skipTargetFind = false;
 // Clean up temp rect if still present
 if (tempRectRef.current) {
 canvas.remove(tempRectRef.current);
 tempRectRef.current = null;
 }
 };
 }, [activeTool]);

 // Apply region fill — cover the selected region with the fill color
 const handleApplyRegionFill = useCallback(async () => {
 if (!fabricRef.current || !regionRect) return;
 const canvas = fabricRef.current;
 const fabric = await import("fabric");

 // Clean up temp rect if still present on canvas
 if (tempRectRef.current) {
 canvas.remove(tempRectRef.current);
 tempRectRef.current = null;
 }

 // If auto-sample is on, sample the color from the image border around the region
 let fill = fillColor;
 if (autoSampleFill) {
 const offResult = createOffscreenFromBg();
 if (offResult) {
 const scale = imageScaleRef.current;
 // Sample from border of the region in original image coordinates
 const origX = regionRect.x / scale;
 const origY = regionRect.y / scale;
 const origW = regionRect.w / scale;
 const origH = regionRect.h / scale;

 // Sample a thin border around the region
 fill = sampleRegionColor(
 offResult.ctx,
 Math.max(0, origX - 8),
 Math.max(0, origY - 8),
 origW + 16,
 origH + 16,
 offResult.width,
 offResult.height
 );
 }
 }

 const fillRect = new fabric.Rect({
 left: regionRect.x,
 top: regionRect.y,
 width: regionRect.w,
 height: regionRect.h,
 fill: fill,
 selectable: true,
 evented: true,
 objectCaching: false,
 });

 canvas.add(fillRect);
 canvas.requestRenderAll();
 setRegionRect(null);
 }, [regionRect, fillColor, autoSampleFill, createOffscreenFromBg, sampleRegionColor]);

 // Cancel region selection
 const handleCancelRegion = useCallback(() => {
 if (tempRectRef.current && fabricRef.current) {
 fabricRef.current.remove(tempRectRef.current);
 tempRectRef.current = null;
 }
 setRegionRect(null);
 setIsDrawingRegion(false);
 regionStartRef.current = null;
 }, []);

 // Magic selection logic
 const handleSelectMagicTool = async () => {
 setActiveTool("magic");
 if (!samModelRef.current) {
 setIsSamLoading(true);
 setSamStatus("Loading Magic Select AI model (approx 150MB)...");
 try {
 const { env, AutoModel, AutoProcessor } = await import("@xenova/transformers");
 env.allowLocalModels = false;
 const model_id ="Xenova/slimsam-77-uniform";
 samProcessorRef.current = await AutoProcessor.from_pretrained(model_id);
 samModelRef.current = await AutoModel.from_pretrained(model_id);
 setSamStatus("Ready! Click any object to extract it.");
 setTimeout(() => setSamStatus(""), 4000);
 } catch (err) {
 console.error("SAM load error", err);
 setSamStatus("Failed to load AI model. Please try again.");
 } finally {
 setIsSamLoading(false);
 }
 } else {
 setSamStatus("Ready! Click any object to extract it.");
 setTimeout(() => setSamStatus(""), 4000);
 }
 };

 useEffect(() => {
 if (!fabricRef.current || activeTool !=="magic") return;
 const canvas = fabricRef.current;
 canvas.selection = false;
 canvas.skipTargetFind = true;
 
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const handleMouseDown = async (e: any) => {
 if (!samModelRef.current || !samProcessorRef.current || isSamLoading) return;
 const pointer = e.scenePoint || e.pointer || (canvas.getScenePoint && canvas.getScenePoint(e.e)) || { x: 0, y: 0 };
 
 const scale = imageScaleRef.current;
 const x = Math.round(pointer.x / scale);
 const y = Math.round(pointer.y / scale);
 
 setSamStatus("Analyzing object... Please wait.");
 
 try {
 const offResult = createOffscreenFromBg();
 if (!offResult) return;
 
 const { RawImage } = await import("@xenova/transformers");
 const dataUrl = offResult.canvas.toDataURL("image/png");
 const rawImg = await RawImage.fromURL(dataUrl);

 const processor = samProcessorRef.current;
 const model = samModelRef.current;
 
 const inputs = await processor(rawImg, [[[x, y]]]);
 const outputs = await model(inputs);
 
 const masks = await processor.post_process_masks(outputs.pred_masks, inputs.original_sizes, inputs.reshaped_input_sizes);
 
 const h = rawImg.height;
 const w = rawImg.width;
 
 // Find the best mask based on iou_scores
 const scores = outputs.iou_scores.data;
 let bestIdx = 0;
 let bestScore = -Infinity;
 for (let i = 0; i < scores.length; i++) {
 if (scores[i] > bestScore) {
 bestScore = scores[i];
 bestIdx = i;
 }
 }
 
 const maskTensor = masks[0];
 const maskData = maskTensor.data; 
 const maskOffset = bestIdx * (w * h);
 
 const extractCanvas = document.createElement("canvas");
 extractCanvas.width = w;
 extractCanvas.height = h;
 const exCtx = extractCanvas.getContext("2d")!;
 const exImgData = exCtx.createImageData(w, h);
 
 const origImgData = offResult.ctx.getImageData(0, 0, w, h).data;
 
 let minX = w, minY = h, maxX = 0, maxY = 0;

 for (let i = 0; i < h; i++) {
 for (let j = 0; j < w; j++) {
 const localIdx = i * w + j;
 const maskVal = maskData[maskOffset + localIdx]; 
 
 // In transformers.js SAM, masks are usually boolean (1 or 0) or Float logits > 0
 if (maskVal > 0) {
 const pxOffset = localIdx * 4;
 exImgData.data[pxOffset] = origImgData[pxOffset];
 exImgData.data[pxOffset + 1] = origImgData[pxOffset + 1];
 exImgData.data[pxOffset + 2] = origImgData[pxOffset + 2];
 exImgData.data[pxOffset + 3] = origImgData[pxOffset + 3];
 
 if (j < minX) minX = j;
 if (j > maxX) maxX = j;
 if (i < minY) minY = i;
 if (i > maxY) maxY = i;
 }
 }
 }
 exCtx.putImageData(exImgData, 0, 0);
 
 if (minX <= maxX && minY <= maxY) {
 const cw = maxX - minX + 1;
 const ch = maxY - minY + 1;
 
 if (cw < 5 || ch < 5) {
 setSamStatus("Selection too small. Try clicking the center of the object.");
 setTimeout(() => setSamStatus(""), 3000);
 return;
 }

 const cropCanvas = document.createElement("canvas");
 cropCanvas.width = cw;
 cropCanvas.height = ch;
 cropCanvas.getContext("2d")!.drawImage(extractCanvas, minX, minY, cw, ch, 0, 0, cw, ch);
 
 const fabric = await import("fabric");
 const fabricObj = await fabric.FabricImage.fromURL(cropCanvas.toDataURL("image/png"));
 
 fabricObj.set({
 left: minX * scale,
 top: minY * scale,
 scaleX: scale,
 scaleY: scale,
 });
 
 const sampleColor = sampleRegionColor(offResult.ctx, Math.max(0, minX - 10), Math.max(0, minY - 10), cw + 20, ch + 20, w, h);
 const bgPatch = new fabric.Rect({
 left: minX * scale,
 top: minY * scale,
 width: cw * scale,
 height: ch * scale,
 fill: sampleColor,
 selectable: false,
 evented: false,
 });
 
 canvas.add(bgPatch);
 canvas.add(fabricObj);
 canvas.setActiveObject(fabricObj);
 setActiveTool("select");
 
 setSamStatus("Object extracted!");
 setTimeout(() => setSamStatus(""), 3000);
 } else {
 setSamStatus("Could not find a distinct object there.");
 setTimeout(() => setSamStatus(""), 3000);
 }
 } catch (err) {
 console.error("Extraction error", err);
 setSamStatus("Extraction failed. Please try again.");
 }
 };
 
 canvas.on("mouse:down", handleMouseDown);
 return () => { 
 canvas.off("mouse:down", handleMouseDown); 
 canvas.selection = true;
 canvas.skipTargetFind = false;
 };
 }, [activeTool, isSamLoading, createOffscreenFromBg, sampleRegionColor]);

 // Add text
 const handleAddText = async () => {
 if (!fabricRef.current) return;
 const fabric = await import("fabric");

 const text = new fabric.IText("Edit me", {
 left: 100,
 top: 100,
 fontSize: textProps.fontSize,
 fill: textProps.fill,
 fontFamily: textProps.fontFamily,
 fontWeight: textProps.bold ?"bold" :"normal",
 fontStyle: textProps.italic ?"italic" :"normal",
 underline: textProps.underline,
 textAlign: textProps.textAlign,
 editable: true,
 cursorColor:"#6E6EE8",
 editingBorderColor:"#6E6EE8",
 });

 fabricRef.current.add(text);
 fabricRef.current.setActiveObject(text);
 text.enterEditing();
 text.selectAll();
 fabricRef.current.requestRenderAll();
 };

 // Re-run OCR manually
 const handleRerunOCR = async () => {
 if (!fabricRef.current || !fabricRef.current.backgroundImage) return;
 const bgImg = fabricRef.current.backgroundImage;
 const imgEl = bgImg.getElement ? bgImg.getElement() : bgImg._element;
 if (!imgEl) return;

 try {
 // Create a data URL from the background image for OCR
 const offscreen = document.createElement("canvas");
 offscreen.width = imgEl.naturalWidth || imgEl.width;
 offscreen.height = imgEl.naturalHeight || imgEl.height;
 const offCtx = offscreen.getContext("2d")!;
 offCtx.drawImage(imgEl, 0, 0);
 const dataUrl = offscreen.toDataURL("image/png");
 runOCR(dataUrl, imageScaleRef.current);
 } catch (err) {
 console.error("OCR data URL error:", err);
 setOcrError("Could not prepare image for OCR — security restriction");
 }
 };

 // Eyedropper: sample color from canvas at click point
 const handleEyedropper = useCallback((target:"brush" |"fill") => {
 if (!fabricRef.current) return;
 const canvas = fabricRef.current;

 // Temporarily disable drawing mode
 const wasDrawingMode = canvas.isDrawingMode;
 canvas.isDrawingMode = false;

 const handler = (e: any) => {
 const pointer = e.scenePoint || e.pointer || (canvas.getScenePoint && canvas.getScenePoint(e.e)) || { x: 0, y: 0 };
 const bgImg = canvas.backgroundImage;
 if (!bgImg) return;

 // Sample from background image
 const imgEl = bgImg.getElement ? bgImg.getElement() : bgImg._element;
 if (!imgEl) return;

 const offscreen = document.createElement("canvas");
 offscreen.width = imgEl.naturalWidth || imgEl.width;
 offscreen.height = imgEl.naturalHeight || imgEl.height;
 const offCtx = offscreen.getContext("2d")!;
 offCtx.drawImage(imgEl, 0, 0);

 const scale = imageScaleRef.current;
 const ox = Math.floor(pointer.x / scale);
 const oy = Math.floor(pointer.y / scale);

 const pixel = offCtx.getImageData(
 Math.min(ox, offscreen.width - 1),
 Math.min(oy, offscreen.height - 1),
 1,
 1
 ).data;

 const hex =
"#" +
 [pixel[0], pixel[1], pixel[2]]
 .map((v) => v.toString(16).padStart(2,"0"))
 .join("");

 if (target ==="brush") {
 setBrushColor(hex);
 } else {
 setFillColor(hex);
 setAutoSampleFill(false);
 }
 canvas.off("mouse:down", handler);
 canvas.isDrawingMode = wasDrawingMode;
 };

 canvas.on("mouse:down", handler);
 }, []);

 // Apply text property changes
 const applyTextProp = useCallback(
 (prop: string, value: unknown) => {
 if (!fabricRef.current || !activeTextRef.current) return;
 const obj = activeTextRef.current;
 obj.set(prop, value);
 fabricRef.current.requestRenderAll();
 },
 []
 );

 // Apply filters
 const applyFilters = useCallback(async (newFilters: FilterState) => {
 if (!fabricRef.current) return;
 const fabric = await import("fabric");
 const bgImg = fabricRef.current.backgroundImage;
 if (!bgImg) return;

 const filterArr: InstanceType<typeof fabric.filters.BaseFilter>[] = [];

 if (newFilters.brightness !== 0) {
 filterArr.push(
 new fabric.filters.Brightness({ brightness: newFilters.brightness })
 );
 }
 if (newFilters.contrast !== 0) {
 filterArr.push(
 new fabric.filters.Contrast({ contrast: newFilters.contrast })
 );
 }
 if (newFilters.saturation !== 0) {
 filterArr.push(
 new fabric.filters.Saturation({ saturation: newFilters.saturation })
 );
 }
 if (newFilters.blur !== 0) {
 filterArr.push(new fabric.filters.Blur({ blur: newFilters.blur }));
 }

 bgImg.filters = filterArr;
 bgImg.applyFilters();
 fabricRef.current.requestRenderAll();
 }, []);

 // Handle filter slider change
 const handleFilterChange = (key: keyof FilterState, value: number) => {
 const newFilters = { ...filters, [key]: value };
 setFilters(newFilters);
 applyFilters(newFilters);
 };

 // Zoom controls
 const handleZoom = (direction:"in" |"out" |"reset") => {
 if (!fabricRef.current) return;
 const canvas = fabricRef.current;
 if (direction ==="reset") {
 setZoom(1);
 canvas.setZoom(1);
 canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
 } else {
 const newZoom =
 direction ==="in"
 ? Math.min(zoom + 0.1, 3)
 : Math.max(zoom - 0.1, 0.2);
 setZoom(newZoom);
 canvas.setZoom(newZoom);
 }
 canvas.requestRenderAll();
 };

 // Download
 const handleDownload = async () => {
 if (!fabricRef.current) return;
 setIsExporting(true);

 try {
 const canvas = fabricRef.current;

 // Deselect all objects to hide selection handles
 canvas.discardActiveObject();

 // Hide OCR highlight borders so they don't appear in the exported image
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const hiddenHighlights: any[] = [];
 canvas.getObjects().forEach((obj: any) => {
 if (obj._ocrHighlight && obj.visible) {
 obj.set({ visible: false });
 hiddenHighlights.push(obj);
 }
 });

 canvas.requestRenderAll();

 // Store current zoom, reset for export
 const currentZoom = canvas.getZoom();
 canvas.setZoom(1);
 canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

 const dataURL = canvas.toDataURL({
 format:"png",
 quality: 1,
 multiplier: 1,
 });

 // Restore zoom and OCR highlights
 canvas.setZoom(currentZoom);
 hiddenHighlights.forEach((obj) => obj.set({ visible: true }));
 canvas.requestRenderAll();

 const link = document.createElement("a");
 link.download = `edited-${
 files[0]?.name?.replace(/\.[^/.]+$/,"") ??"image"
 }.png`;
 link.href = dataURL;
 link.click();
 } catch (err) {
 console.error(err);
 addToast("error", "Failed to export image.");
 } finally {
 setIsExporting(false);
 }
 };

 // Full reset
 const handleReset = () => {
 // Clear flash intervals
 flashIntervalsRef.current.forEach(id => clearInterval(id));
 flashIntervalsRef.current = [];

 setFiles([]);
 setEditorReady(false);
 setSelectedType(null);
 setFilters(DEFAULT_FILTERS);
 setZoom(1);
 activeTextRef.current = null;
 setIsOcrRunning(false);
 setOcrProgress(0);
 setOcrStatus("");
 setOcrError("");
 setDetectedTextCount(0);
 setActiveTool("select");
 setRegionRect(null);
 setIsSamLoading(false);
 setSamStatus("");

 if (fabricRef.current) {
 fabricRef.current.clear();
 fabricRef.current.backgroundImage = undefined;
 fabricRef.current.backgroundColor ="#f0f0f0";
 fabricRef.current.isDrawingMode = false;
 fabricRef.current.requestRenderAll();
 fabricRef.current.setZoom(1);
 fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
 }
 };

 const formatPercent = (val: number, range: number) =>
 `${val > 0 ?"+" :""}${Math.round(val * range)}%`;

 return (
 <div className="min-h-[calc(100vh-8rem)]">
 {/* Hero */}
 <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-10">
 <ToolHero
 icon={Pencil}
 title="Edit Image"
 description="Apply adjustments, crops, and stylistic filters to your images — free and fully private. A full-featured browser-based editor with no account required."
 backHref="/image-tools"
 backLabel="Back to Image Tools"
 />
 </div>

 <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-6">
 {/* Upload State */}
 {!editorReady && (
 <div className="glass-panel rounded-[16px] p-6 sm:p-8">
 <FileUpload
 accept=".jpg,.jpeg,.png,.webp,.bmp"
 files={files}
 onFilesChange={setFiles}

 label="Drop your image here"
 description="or click to browse — JPG, PNG, WEBP, BMP supported"
 />
 {!canvasInit && (
 <div className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground-secondary">
 <Loader2 className="w-4 h-4 animate-spin" />
 Loading editor...
 </div>
 )}
 </div>
 )}

 {/* Canvas element — always in DOM so fabric can initialize on mount */}
 <div style={{ display: editorReady ?"block" :"none" }}>
 <div className="flex flex-col lg:flex-row gap-4">
 {/* Canvas Area */}
 <div className="flex-1 min-w-0">
 <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
 {/* Canvas Toolbar */}
 <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-2 flex-wrap gap-2">
 <div className="flex items-center gap-1 flex-wrap">
 {/* Tool buttons */}
 <button
 onClick={() => setActiveTool("select")}
 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
 activeTool ==="select"
 ?"bg-primary text-white"
 :"bg-primary-muted text-primary hover:bg-primary/20"
 }`}
 >
 <Pencil className="w-3.5 h-3.5" />
 Select
 </button>
 <button
 onClick={() => setActiveTool("draw")}
 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
 activeTool ==="draw"
 ?"bg-primary text-white"
 :"bg-primary-muted text-primary hover:bg-primary/20"
 }`}
 >
 <Paintbrush className="w-3.5 h-3.5" />
 Draw
 </button>
 <button
 onClick={() => setActiveTool("erase")}
 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
 activeTool ==="erase"
 ?"bg-primary text-white"
 :"bg-primary-muted text-primary hover:bg-primary/20"
 }`}
 >
 <Eraser className="w-3.5 h-3.5" />
 Erase
 </button>
 <button
 onClick={() => setActiveTool("region")}
 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
 activeTool ==="region"
 ?"bg-primary text-white"
 :"bg-primary-muted text-primary hover:bg-primary/20"
 }`}
 >
 <Square className="w-3.5 h-3.5" />
 Region Fill
 </button>
 <button
 onClick={handleSelectMagicTool}
 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
 activeTool ==="magic"
 ?"bg-primary text-white"
 :"bg-primary-muted text-primary hover:bg-primary/20"
 }`}
 >
 <Wand2 className="w-3.5 h-3.5" />
 Magic Select
 </button>

 <div className="w-px h-5 bg-border mx-1" />

 <button
 onClick={handleAddText}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-muted text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
 >
 <Type className="w-3.5 h-3.5" />
 Add Text
 </button>
 <button
 onClick={handleRerunOCR}
 disabled={isOcrRunning}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-muted text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
 >
 <ScanText className="w-3.5 h-3.5" />
 Detect Text
 </button>
 {selectedType ==="text" && (
 <button
 onClick={handleDeleteSelected}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-muted text-danger text-xs font-semibold hover:bg-danger/20 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" />
 Delete
 </button>
 )}
 </div>
 <div className="flex items-center gap-1">
 <button
 onClick={() => handleZoom("out")}
 className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
 title="Zoom Out"
 >
 <ZoomOut className="w-4 h-4" />
 </button>
 <span className="text-xs font-semibold text-foreground-secondary min-w-[2.5rem] text-center">
 {Math.round(zoom * 100)}%
 </span>
 <button
 onClick={() => handleZoom("in")}
 className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
 title="Zoom In"
 >
 <ZoomIn className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleZoom("reset")}
 className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
 title="Reset Zoom"
 >
 <RotateCcw className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* OCR or SAM Status */}
 {(isOcrRunning || isSamLoading || samStatus) ? (
 <div className="px-3 py-2 border-b border-border bg-surface-2">
 <div className="flex items-center justify-between mb-1">
 <span className="text-xs text-foreground-muted flex items-center gap-1.5">
 {isSamLoading || activeTool ==="magic" || samStatus ? (
 <Wand2 className={`w-3.5 h-3.5 text-primary ${(isSamLoading || samStatus.includes('Analyzing')) ? 'animate-pulse' : ''}`} />
 ) : (
 <ScanText className={`w-3.5 h-3.5 text-primary ${isOcrRunning ? 'animate-pulse' : ''}`} />
 )}
 {samStatus || ocrStatus}
 </span>
 {isOcrRunning && !samStatus && (
 <span className="text-xs font-mono text-foreground-secondary">
 {ocrProgress}%
 </span>
 )}
 </div>
 {(isOcrRunning || isSamLoading) && !samStatus.includes('Analyzing') && !samStatus.includes('Ready') && !samStatus.includes('failed') && !samStatus.includes('extracted') && !samStatus.includes('distinct') && !samStatus.includes('small') && (
 <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
 <div
 className="h-full bg-primary rounded-full transition-all duration-200"
 style={{ width: isSamLoading ?"100%" : `${ocrProgress}%`, animation: isSamLoading ?"pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" :"none" }}
 />
 </div>
 )}
 </div>
 ) : null}

 {/* OCR Error */}
 {ocrError && !isOcrRunning && (
 <div className="px-3 py-1.5 border-b border-border bg-red-50">
 <span className="text-xs text-danger flex items-center gap-1.5">
 <Shield className="w-3.5 h-3.5" />
 {ocrError}
 </span>
 </div>
 )}

 {/* Detected text info */}
 {detectedTextCount > 0 && !isOcrRunning && !ocrError && (
 <div className="px-3 py-1.5 border-b border-border bg-emerald-50">
 <span className="text-xs text-emerald-700 flex items-center gap-1.5">
 <ScanText className="w-3.5 h-3.5" />
 {detectedTextCount} text region
 {detectedTextCount !== 1 ?"s" :""} detected — double-click
 any highlighted text to edit it
 </span>
 </div>
 )}

 {/* No text detected info */}
 {detectedTextCount === 0 && !isOcrRunning && ocrStatus && !ocrError && ocrStatus.includes("No text") && (
 <div className="px-3 py-1.5 border-b border-border bg-amber-50">
 <span className="text-xs text-warning flex items-center gap-1.5">
 <ScanText className="w-3.5 h-3.5" />
 No readable text detected — use Region Fill or Eraser to edit elements
 </span>
 </div>
 )}

 {/* Region Fill status */}
 {activeTool ==="region" && regionRect && (
 <div className="px-3 py-1.5 border-b border-border bg-indigo-50">
 <span className="text-xs text-primary flex items-center gap-1.5">
 <Square className="w-3.5 h-3.5" />
 Region selected ({Math.round(regionRect.w)}×{Math.round(regionRect.h)}px) — choose fill color and click &quot;Apply Fill&quot;
 </span>
 </div>
 )}

 {/* Canvas */}
 <div
 className="overflow-auto bg-surface-2"
 style={{ maxHeight:"70vh" }}
 >
 <div className="flex items-start justify-center p-4 min-h-[400px]">
 <canvas ref={canvasElRef} />
 </div>
 </div>
 </div>

 {/* Bottom Actions */}
 <div className="mt-4 flex flex-wrap items-center gap-3">
 <button
 onClick={handleDownload}
 disabled={isExporting}
 className="btn btn-primary inline-flex items-center gap-2 text-xs disabled:opacity-50"
 >
 {isExporting ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 Exporting...
 </>
 ) : (
 <>
 <Download className="w-4 h-4" />
 Download PNG
 </>
 )}
 </button>
 <button
 onClick={handleReset}
 className="btn btn-secondary inline-flex items-center gap-2 text-xs"
 >
 <RotateCcw className="w-4 h-4" />
 Start Over
 </button>
 </div>
 </div>

 {/* Right Sidebar */}
 <div className="lg:w-72 flex-shrink-0 space-y-4">
 {/* Region Fill Panel (shown when region tool active) */}
 {activeTool ==="region" && (
 <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
 <div className="px-4 py-3 border-b border-border bg-surface-2">
 <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
 <Square className="w-4 h-4 text-primary" />
 Region Fill
 </h3>
 </div>
 <div className="p-4 space-y-3">
 <p className="text-xs text-foreground-secondary leading-relaxed">
 Draw a rectangle on the canvas to select an area. Then fill it with a color to cover unwanted elements.
 </p>

 {/* Fill Color */}
 <div>
 <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
 Fill Color
 </label>
 <div className="flex items-center gap-2">
 <input
 type="color"
 value={fillColor}
 onChange={(e) => { setFillColor(e.target.value); setAutoSampleFill(false); }}
 className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
 />
 <input
 type="text"
 value={fillColor}
 onChange={(e) => { setFillColor(e.target.value); setAutoSampleFill(false); }}
 className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-1 text-foreground text-xs font-mono focus:outline-none focus:border-primary"
 />
 <button
 onClick={() => handleEyedropper("fill")}
 className="p-2 rounded-lg border border-border hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
 title="Pick color from image"
 >
 <Pipette className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Quick fill options */}
 <div>
 <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
 Quick Fill
 </label>
 <div className="flex items-center gap-1.5 flex-wrap">
 <button
 onClick={() => setAutoSampleFill(true)}
 className={`px-2.5 py-1 rounded border text-xs font-semibold transition-colors ${
 autoSampleFill
 ?"bg-primary-muted border-primary text-primary"
 :"border-border text-foreground-secondary hover:text-primary hover:border-primary-border"
 }`}
 >
 Auto-Sample
 </button>
 {["#ffffff","#000000","#f5f5f5","#e0e0e0","#1a1a1a","#333333"].map((c) => (
 <button
 key={c}
 onClick={() => { setFillColor(c); setAutoSampleFill(false); }}
 className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
 style={{ backgroundColor: c }}
 />
 ))}
 </div>
 </div>

 {/* Apply / Cancel */}
 <div className="flex gap-2">
 <button
 onClick={handleApplyRegionFill}
 disabled={!regionRect || isDrawingRegion}
 className="flex-1 btn-primary inline-flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
 >
 <Square className="w-3.5 h-3.5" />
 Apply Fill
 </button>
 <button
 onClick={handleCancelRegion}
 className="px-3 py-2 rounded-lg border border-border text-xs text-foreground-secondary hover:text-primary hover:border-primary-border transition-colors"
 >
 Cancel
 </button>
 </div>

 <p className="text-xs text-foreground-secondary leading-relaxed">
 <Lightbulb className="w-3.5 h-3.5 text-amber-500 inline-block mr-1 -mt-0.5" /> <strong>Auto-Sample</strong> picks the average color from around the selected region for a seamless cover.
 </p>
 </div>
 </div>
 )}

 {/* Drawing Tools Panel (shown when draw/erase active) */}
 {(activeTool ==="draw" || activeTool ==="erase") && (
 <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
 <div className="px-4 py-3 border-b border-border bg-surface-2">
 <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
 {activeTool ==="draw" ? (
 <Paintbrush className="w-4 h-4 text-primary" />
 ) : (
 <Eraser className="w-4 h-4 text-primary" />
 )}
 {activeTool ==="draw" ?"Drawing" :"Eraser"} Tool
 </h3>
 </div>
 <div className="p-4 space-y-3">
 {/* Brush Size */}
 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="text-xs font-semibold text-foreground-secondary">
 Brush Size
 </label>
 <span className="text-xs font-mono text-foreground-secondary">
 {brushSize}px
 </span>
 </div>
 <input
 type="range"
 min={1}
 max={50}
 step={1}
 value={brushSize}
 onChange={(e) =>
 setBrushSize(parseInt(e.target.value))
 }
 className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-primary"
 />
 </div>

 {/* Brush Color */}
 <div>
 <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
 Color
 </label>
 <div className="flex items-center gap-2">
 <input
 type="color"
 value={brushColor}
 onChange={(e) => setBrushColor(e.target.value)}
 className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
 />
 <input
 type="text"
 value={brushColor}
 onChange={(e) => setBrushColor(e.target.value)}
 className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-1 text-foreground text-xs font-mono focus:outline-none focus:border-primary"
 />
 <button
 onClick={() => handleEyedropper("brush")}
 className="p-2 rounded-lg border border-border hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
 title="Pick color from image"
 >
 <Pipette className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Quick color swatches */}
 <div>
 <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
 Quick Colors
 </label>
 <div className="flex items-center gap-1.5 flex-wrap">
 {[
"#ffffff",
"#000000",
"#ff0000",
"#00ff00",
"#0000ff",
"#ffff00",
"#ff6600",
"#8844cc",
"#ff69b4",
"#008080",
 ].map((c) => (
 <button
 key={c}
 onClick={() => setBrushColor(c)}
 className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
 style={{ backgroundColor: c }}
 />
 ))}
 </div>
 </div>

 {activeTool ==="erase" && (
 <p className="text-xs text-foreground-secondary leading-relaxed">
 <Lightbulb className="w-3.5 h-3.5 text-amber-500 inline-block mr-1 -mt-0.5" /> Use the <strong>eyedropper</strong> (<Pipette className="w-3 h-3 inline" />) to pick the background color for seamless erasing. Or use <strong>Region Fill</strong> for larger areas.
 </p>
 )}
 </div>
 </div>
 )}

 {/* Text Properties Panel */}
 <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
 <div className="px-4 py-3 border-b border-border bg-surface-2">
 <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
 <Type className="w-4 h-4 text-primary" />
 Text Properties
 </h3>
 </div>
 <div className="p-4 space-y-3">
 {!selectedType ? (
 <p className="text-xs text-foreground-secondary">
 Select a text element on the canvas to edit its
 properties. Double-click to edit text content.
 </p>
 ) : (
 <>
 {/* Font Family */}
 <div>
 <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
 Font
 </label>
 <div className="relative">
 <select
 value={textProps.fontFamily}
 onChange={(e) => {
 const val = e.target.value;
 setTextProps((p) => ({
 ...p,
 fontFamily: val,
 }));
 applyTextProp("fontFamily", val);
 }}
 style={{ fontFamily: textProps.fontFamily }}
 className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary appearance-none cursor-pointer"
 >
 {FONT_OPTIONS.map((f) => (
 <option
 key={f}
 value={f}
 style={{ fontFamily: f }}
 >
 {f}
 </option>
 ))}
 </select>
 <ChevronDown className="w-4 h-4 text-foreground-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
 </div>
 </div>

 {/* Font Size */}
 <div>
 <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
 Size
 </label>
 <div className="flex items-center gap-2">
 <button
 onClick={() => {
 const val = Math.max(
 8,
 textProps.fontSize - 2
 );
 setTextProps((p) => ({
 ...p,
 fontSize: val,
 }));
 applyTextProp("fontSize", val);
 }}
 className="p-1.5 rounded-lg border border-border hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
 >
 <Minus className="w-3.5 h-3.5" />
 </button>
 <input
 type="number"
 min={8}
 max={200}
 value={textProps.fontSize}
 onChange={(e) => {
 const val = Math.max(
 8,
 Math.min(
 200,
 parseInt(e.target.value) || 8
 )
 );
 setTextProps((p) => ({
 ...p,
 fontSize: val,
 }));
 applyTextProp("fontSize", val);
 }}
 className="w-16 text-center px-2 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary"
 />
 <button
 onClick={() => {
 const val = Math.min(
 200,
 textProps.fontSize + 2
 );
 setTextProps((p) => ({
 ...p,
 fontSize: val,
 }));
 applyTextProp("fontSize", val);
 }}
 className="p-1.5 rounded-lg border border-border hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors"
 >
 <Plus className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Text Color */}
 <div>
 <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
 Color
 </label>
 <div className="flex items-center gap-2">
 <input
 type="color"
 value={textProps.fill}
 onChange={(e) => {
 const val = e.target.value;
 setTextProps((p) => ({
 ...p,
 fill: val,
 }));
 applyTextProp("fill", val);
 }}
 className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
 />
 <input
 type="text"
 value={textProps.fill}
 onChange={(e) => {
 const val = e.target.value;
 setTextProps((p) => ({
 ...p,
 fill: val,
 }));
 applyTextProp("fill", val);
 }}
 className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-1 text-foreground text-xs font-mono focus:outline-none focus:border-primary"
 />
 </div>
 </div>

 {/* Style Buttons */}
 <div>
 <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
 Style
 </label>
 <div className="flex items-center gap-1">
 <button
 onClick={() => {
 const val = !textProps.bold;
 setTextProps((p) => ({
 ...p,
 bold: val,
 }));
 applyTextProp(
"fontWeight",
 val ?"bold" :"normal"
 );
 }}
 className={`p-2 rounded-lg border transition-colors ${
 textProps.bold
 ?"bg-primary-muted border-primary text-primary"
 :"border-border text-foreground-secondary hover:text-primary hover:border-primary-border"
 }`}
 >
 <Bold className="w-4 h-4" />
 </button>
 <button
 onClick={() => {
 const val = !textProps.italic;
 setTextProps((p) => ({
 ...p,
 italic: val,
 }));
 applyTextProp(
"fontStyle",
 val ?"italic" :"normal"
 );
 }}
 className={`p-2 rounded-lg border transition-colors ${
 textProps.italic
 ?"bg-primary-muted border-primary text-primary"
 :"border-border text-foreground-secondary hover:text-primary hover:border-primary-border"
 }`}
 >
 <Italic className="w-4 h-4" />
 </button>
 <button
 onClick={() => {
 const val = !textProps.underline;
 setTextProps((p) => ({
 ...p,
 underline: val,
 }));
 applyTextProp("underline", val);
 }}
 className={`p-2 rounded-lg border transition-colors ${
 textProps.underline
 ?"bg-primary-muted border-primary text-primary"
 :"border-border text-foreground-secondary hover:text-primary hover:border-primary-border"
 }`}
 >
 <Underline className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Alignment */}
 <div>
 <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
 Alignment
 </label>
 <div className="flex items-center gap-1">
 {(
 [
 {
 key:"left",
 Icon: AlignLeft,
 },
 {
 key:"center",
 Icon: AlignCenter,
 },
 {
 key:"right",
 Icon: AlignRight,
 },
 ] as const
 ).map(({ key, Icon }) => (
 <button
 key={key}
 onClick={() => {
 const val = key;
 setTextProps((p) => ({
 ...p,
 textAlign:
 val as"left" |"center" |"right",
 }));
 applyTextProp("textAlign", val);
 }}
 className={`p-2 rounded-lg border transition-colors ${
 textProps.textAlign === key
 ?"bg-primary-muted border-primary text-primary"
 :"border-border text-foreground-secondary hover:text-primary hover:border-primary-border"
 }`}
 >
 <Icon className="w-4 h-4" />
 </button>
 ))}
 </div>
 </div>
 </>
 )}

 {/* Quick Add Text Button (always visible) */}
 <button
 onClick={handleAddText}
 className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-primary-border text-primary text-xs font-semibold hover:bg-primary-muted hover:border-primary/50 transition-colors"
 >
 <Plus className="w-3.5 h-3.5" />
 Add New Text
 </button>
 </div>
 </div>

 {/* Filters Panel */}
 <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
 <div className="px-4 py-3 border-b border-border bg-surface-2">
 <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-primary" />
 Image Filters
 </h3>
 </div>
 <div className="p-4 space-y-4">
 {/* Brightness */}
 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
 <Sun className="w-3.5 h-3.5 text-amber-500" />
 Brightness
 </label>
 <span className="text-xs font-mono text-foreground-secondary">
 {formatPercent(filters.brightness, 100)}
 </span>
 </div>
 <input
 type="range"
 min={-1}
 max={1}
 step={0.01}
 value={filters.brightness}
 onChange={(e) =>
 handleFilterChange(
"brightness",
 parseFloat(e.target.value)
 )
 }
 className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-primary"
 />
 </div>

 {/* Contrast */}
 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
 <Contrast className="w-3.5 h-3.5 text-blue-500" />
 Contrast
 </label>
 <span className="text-xs font-mono text-foreground-secondary">
 {formatPercent(filters.contrast, 100)}
 </span>
 </div>
 <input
 type="range"
 min={-1}
 max={1}
 step={0.01}
 value={filters.contrast}
 onChange={(e) =>
 handleFilterChange(
"contrast",
 parseFloat(e.target.value)
 )
 }
 className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-primary"
 />
 </div>

 {/* Saturation */}
 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
 <Droplets className="w-3.5 h-3.5 text-green-500" />
 Saturation
 </label>
 <span className="text-xs font-mono text-foreground-secondary">
 {formatPercent(filters.saturation, 100)}
 </span>
 </div>
 <input
 type="range"
 min={-1}
 max={1}
 step={0.01}
 value={filters.saturation}
 onChange={(e) =>
 handleFilterChange(
"saturation",
 parseFloat(e.target.value)
 )
 }
 className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-primary"
 />
 </div>

 {/* Blur */}
 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-purple-500" />
 Blur
 </label>
 <span className="text-xs font-mono text-foreground-secondary">
 {formatPercent(filters.blur, 100)}
 </span>
 </div>
 <input
 type="range"
 min={0}
 max={1}
 step={0.01}
 value={filters.blur}
 onChange={(e) =>
 handleFilterChange(
"blur",
 parseFloat(e.target.value)
 )
 }
 className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-primary"
 />
 </div>

 {/* Reset Filters */}
 <button
 onClick={() => {
 setFilters(DEFAULT_FILTERS);
 applyFilters(DEFAULT_FILTERS);
 }}
 className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-foreground-secondary hover:text-primary hover:border-primary-border transition-colors"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 Reset Filters
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Info Cards */}
 <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
 <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
 <Shield className="w-5 h-5 text-primary" />
 </div>
 <div>
 <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
 Private &amp; Secure
 </h4>
 <p className="text-foreground-muted text-sm leading-relaxed">
 All editing and OCR happens locally in your browser. Your images
 never leave your device — zero server uploads.
 </p>
 </div>
 </div>
 <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
 <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
 <Zap className="w-5 h-5 text-primary" />
 </div>
 <div>
 <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
 Edit Existing Text &amp; Elements
 </h4>
 <p className="text-foreground-muted text-sm leading-relaxed">
 <strong>Detect Text</strong> uses OCR to find text and make it editable.
 Use <strong>Region Fill</strong> to cover unwanted elements, <strong>Eraser</strong> to
 paint over small areas, and <strong>Draw</strong> to add new content.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
