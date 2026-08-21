import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryMetadata } from "@/app/utils/seo";

export const metadata: Metadata = getCategoryMetadata("image-tools");

import {
  ImageIcon,
  FileImage,
  Maximize,
  Type,
  ArrowRightLeft,
  Pencil,
  Droplets,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  Smartphone,
  ShieldCheck,
  Maximize as MaximizeIcon,
  Eraser,
  Camera,
  Eye,
  Paintbrush,
  Film,
  Crop,
  RotateCw,
  Grid3x3,
  LayoutGrid,
  MessageSquare,
  PenTool,
  Maximize2,
  Sparkles,
  Palette,
  Ruler,
  EyeOff,
  Code,
  FileCode,
  Target,
  Table2,
  Gauge,
  FlaskConical,
  ScanSearch,
  Printer,
  Package,
  ShoppingBag,
  FileSearch,
  Archive,
} from "lucide-react";

const imageTools = [
  { name: "Compress Image", description: "Reduce image file size while maintaining visual quality.", href: "/compress-image", icon: ImageIcon },
  { name: "Image to PDF", description: "Convert your images into a professional PDF document.", href: "/image-to-pdf", icon: FileImage },
  { name: "Resize Image", description: "Resize images to any dimension for any purpose.", href: "/resize-image", icon: Maximize },
  { name: "Image to Text", description: "Extract text from images using OCR technology.", href: "/image-to-text", icon: Type },
  { name: "Convert Image", description: "Convert images between PNG, JPG, WebP, GIF, and SVG.", href: "/convert-image", icon: ArrowRightLeft },
  { name: "Edit Image", description: "Add text, design elements, and apply filters.", href: "/edit-image", icon: Pencil },
  { name: "Blur Background", description: "Automatically blur the background for a bokeh effect.", href: "/blur-background", icon: Droplets },
  { name: "HEIC to JPG", description: "Convert iPhone HEIC/HEIF photos to JPG, PNG, or WebP — batch supported.", href: "/heic-to-jpg", icon: Smartphone },
  { name: "EXIF Remover", description: "View and strip GPS, camera, and timestamp metadata from photos for privacy.", href: "/exif-remover", icon: ShieldCheck },
  { name: "Batch Image Resizer", description: "Resize 50+ images at once with presets or custom dimensions — ZIP download.", href: "/batch-resize", icon: MaximizeIcon },
  { name: "Background Remover", description: "Remove image backgrounds with AI — full resolution, no watermark, no signup. Add custom BG.", href: "/remove-bg", icon: Eraser },
  { name: "ID Photo Maker", description: "Create passport & visa photos with correct dimensions for 30+ countries. Print-ready 300 DPI.", href: "/id-photo", icon: Camera },
  { name: "Social Media Image Resizer", description: "One-click presets for Instagram, Twitter, LinkedIn, YouTube, TikTok — smart crop & fit.", href: "/social-image", icon: Smartphone },
  { name: "Color Blindness Simulator", description: "See how your designs look to people with Protanopia, Deuteranopia, Tritanopia, and more.", href: "/color-blind-simulator", icon: Eye },
  { name: "Watermark Remover", description: "Paint over watermarks and inpaint them away — client-side, no upload, private.", href: "/watermark-remover", icon: Paintbrush },
  { name: "Video to GIF", description: "Convert video clips to GIFs — trim, resize, adjust FPS. Client-side with FFmpeg, no upload.", href: "/video-to-gif", icon: Film },
  { name: "Image Cropper", description: "Crop images with precision — free aspect ratio or lock 1:1, 4:3, 16:9, and more presets.", href: "/crop-image", icon: Crop },
  { name: "Rotate & Flip Image", description: "Rotate 90°/180°/270° and flip horizontally or vertically — instant preview, any format.", href: "/rotate-image", icon: RotateCw },
  { name: "Image Splitter", description: "Split images into grids — 1×3, 2×2, 3×3 for Instagram carousels. Download all or individually.", href: "/split-image", icon: Grid3x3 },
  { name: "GIF Maker", description: "Create animated GIFs from multiple images — set frame delay, reorder, and loop.", href: "/gif-maker", icon: Film },
  { name: "Collage Maker", description: "Create photo collages with 8 layouts — 2×2, 3×3, feature layouts. Custom gap & background.", href: "/collage-maker", icon: LayoutGrid },
  { name: "Meme Generator", description: "Add bold Impact text to any image — top/bottom/center placement, custom colors & font size.", href: "/meme-generator", icon: MessageSquare },
  { name: "Image Annotator", description: "Add arrows, rectangles, circles, lines, text, and freehand drawings to images. Perfect for feedback.", href: "/annotate-image", icon: PenTool },
  { name: "Image Upscaler", description: "Upscale images up to 4× with multi-step interpolation & unsharp mask sharpening. Free, browser-based.", href: "/upscale-image", icon: Maximize2 },
  { name: "Photo Enhancer", description: "One-click auto-fix or fine-tune brightness, contrast, saturation, hue, blur, and sepia. Live preview.", href: "/photo-enhancer", icon: Sparkles },
  { name: "Colorize Image", description: "Add color to black & white photos — sepia toning + hue rotation with luminance-aware blending.", href: "/colorize-image", icon: Palette },
  { name: "Real Pixel Size Comparator", description: "Compare actual pixel size vs display size with zoom, grid overlay, and margin/padding visualization.", href: "/pixel-comparator", icon: Ruler },
  { name: "Watermark Image", description: "Add custom text or image watermarks to photos — adjust position, opacity, size, rotation, and color.", href: "/watermark-image", icon: Droplets },
  { name: "Blur Face", description: "Blur faces and sensitive areas in photos — draw rectangles or paint over areas with adjustable blur intensity.", href: "/blur-face", icon: EyeOff },
  { name: "HTML to Image", description: "Render HTML/CSS code as a high-quality PNG or JPEG image — live preview, custom viewport size.", href: "/html-to-image", icon: Code },
  { name: "SVG to PNG", description: "Convert SVG vector files to PNG — choose scale (1×–4×) and background color. Client-side, no upload.", href: "/svg-to-png", icon: FileImage },
  { name: "PNG to SVG", description: "Trace raster images into scalable SVG vectors — detailed, flat color, or monochrome. Client-side, no upload.", href: "/png-to-svg", icon: FileCode },
  { name: "Passport & Visa Photo", description: "Create passport and visa photos for 60+ countries with exact mm/px specs, face auto-crop, background replacement, and print-ready 4×6 sheet. 300 DPI.", href: "/passport-photo", icon: Camera },
  { name: "Compress to Exact Size", description: "Compress any image to an exact KB or MB target. Built-in presets for UPSC, IBPS, JEE/NEET, NADRA, passport, and visa forms. Binary-search precision, 100% private.", href: "/compress-to-size", icon: Target },
  { name: "Screenshot to Table", description: "Extract tables from screenshots, PDFs, or photos into editable CSV or Excel. Spatial OCR detects columns precisely — edit cells before you export.", href: "/screenshot-to-table", icon: Table2 },
  { name: "Image Size Analyzer", description: "Visual breakdown of what's eating your image's file size — EXIF metadata, ICC profiles, thumbnails, pixel data. With one-click links to fix each issue.", href: "/size-analyzer", icon: Gauge },
  { name: "Image Roast & Quality Score", description: "Get a brutally honest quality score for any image — sharpness, resolution, noise, compression, exposure, and color. Download a shareable score card. 100% private.", href: "/image-roast", icon: FlaskConical },
  { name: "AI Image Detector", description: "Check if any photo is AI-generated or real. Analyzes EXIF camera data, file format, AI-typical dimensions, and pixel noise patterns. Download a shareable result card. 100% private.", href: "/ai-detector", icon: ScanSearch },
  { name: "Print & Frame Calculator", description: "Will your photo print at 8×10\" without cropping? See exactly what gets cut, check DPI quality, and find the minimum resolution needed. Supports 16 sizes — A4, A3, Letter, plus custom.", href: "/print-calculator", icon: Printer },
];

const converterGroups = [
  {
    heading: "PNG Converters",
    tools: [
      { name: "PNG to JPG", href: "/png-to-jpg", description: "Convert PNG to JPG with white background fill. Adjustable quality." },
      { name: "PNG to WebP", href: "/png-to-webp", description: "Reduce file size 25–35% with full transparency support." },
      { name: "PNG to GIF", href: "/png-to-gif", description: "Convert PNG to static GIF format, 256-color palette." },
      { name: "PNG to ICO", href: "/png-to-ico", description: "Create multi-size ICO favicons (256, 48, 32, 16px) from any PNG." },
      { name: "PNG to BMP", href: "/png-to-bmp", description: "Convert PNG to 24-bit Windows BMP format." },
      { name: "PNG to AVIF", href: "/png-to-avif", description: "Next-gen AVIF compression — up to 50% smaller than JPG." },
      { name: "PNG to TIFF", href: "/png-to-tiff", description: "Convert PNG to TIFF for professional print workflows." },
      { name: "PNG to HEIC", href: "/png-to-heic", description: "Convert PNG to Apple HEIC format (desktop tool required)." },
    ],
  },
  {
    heading: "JPG / JPEG Converters",
    tools: [
      { name: "JPG to PNG", href: "/jpg-to-png", description: "Convert JPEG to lossless PNG for editing and transparency needs." },
      { name: "JPG to WebP", href: "/jpg-to-webp", description: "Cut file sizes by 25–34% — better Core Web Vitals scores." },
      { name: "JPG to GIF", href: "/jpg-to-gif", description: "Convert JPG photos to GIF format with 256-color palette." },
      { name: "JPG to SVG", href: "/jpg-to-svg", description: "Trace JPG to scalable SVG vector — multiple tracing modes." },
      { name: "JPG to ICO", href: "/jpg-to-ico", description: "Create multi-size ICO favicon from any JPG image." },
      { name: "JPG to BMP", href: "/jpg-to-bmp", description: "Convert JPEG to 24-bit BMP for legacy Windows compatibility." },
      { name: "JPG to AVIF", href: "/jpg-to-avif", description: "Convert JPEG to AVIF for up to 50% smaller file sizes." },
      { name: "JPG to TIFF", href: "/jpg-to-tiff", description: "Convert JPG to TIFF for professional print workflows." },
      { name: "JPG to HEIC", href: "/jpg-to-heic", description: "Convert JPG to HEIC — or use AVIF as an open alternative." },
    ],
  },
  {
    heading: "WebP Converters",
    tools: [
      { name: "WebP to PNG", href: "/webp-to-png", description: "Convert WebP to PNG for universal compatibility — Photoshop, email." },
      { name: "WebP to JPG", href: "/webp-to-jpg", description: "Convert WebP to JPEG for broad software and sharing compatibility." },
      { name: "WebP to GIF", href: "/webp-to-gif", description: "Convert WebP to GIF format with 256-color palette." },
      { name: "WebP to SVG", href: "/webp-to-svg", description: "Trace WebP images to scalable SVG vector format." },
      { name: "WebP to ICO", href: "/webp-to-ico", description: "Create ICO favicon from WebP images for browser favicons." },
      { name: "WebP to BMP", href: "/webp-to-bmp", description: "Convert WebP to 24-bit BMP for Windows legacy compatibility." },
      { name: "WebP to TIFF", href: "/webp-to-tiff", description: "Convert WebP to TIFF for professional print workflows." },
    ],
  },
  {
    heading: "GIF Converters",
    tools: [
      { name: "GIF to PNG", href: "/gif-to-png", description: "Extract GIF frame as PNG with full transparency support." },
      { name: "GIF to JPG", href: "/gif-to-jpg", description: "Convert GIF to JPEG with white background fill." },
      { name: "GIF to WebP", href: "/gif-to-webp", description: "Convert GIF to WebP for smaller file sizes." },
    ],
  },
  {
    heading: "BMP Converters",
    tools: [
      { name: "BMP to PNG", href: "/bmp-to-png", description: "Convert Windows BMP to lossless PNG — smaller file size." },
      { name: "BMP to JPG", href: "/bmp-to-jpg", description: "Convert BMP to JPEG with adjustable quality." },
      { name: "BMP to WebP", href: "/bmp-to-webp", description: "Convert BMP to modern WebP for better compression." },
    ],
  },
  {
    heading: "AVIF Converters",
    tools: [
      { name: "AVIF to PNG", href: "/avif-to-png", description: "Convert AVIF to PNG for universal software compatibility." },
      { name: "AVIF to JPG", href: "/avif-to-jpg", description: "Convert AVIF to JPEG for broad sharing and app compatibility." },
    ],
  },
  {
    heading: "ICO / Favicon Converters",
    tools: [
      { name: "ICO to PNG", href: "/ico-to-png", description: "Extract highest-resolution PNG from ICO favicon file." },
      { name: "ICO to JPG", href: "/ico-to-jpg", description: "Convert ICO to JPEG — extracts and converts the largest size." },
      { name: "ICO to WebP", href: "/ico-to-webp", description: "Convert ICO to WebP format." },
      { name: "ICO to SVG", href: "/ico-to-svg", description: "Convert ICO to SVG via two-step raster tracing approach." },
      { name: "SVG to ICO", href: "/svg-to-ico", description: "Create multi-size ICO favicon from SVG vector source." },
      { name: "PNG to ICO", href: "/png-to-ico", description: "Build ICO favicons with all sizes from a single PNG." },
    ],
  },
  {
    heading: "SVG Converters",
    tools: [
      { name: "SVG to PNG", href: "/svg-to-png", description: "Rasterize SVG to PNG at 1×–4× scale. Transparent or solid background." },
      { name: "SVG to JPG", href: "/svg-to-jpg", description: "Convert SVG vector to JPEG with white background fill." },
      { name: "SVG to WebP", href: "/svg-to-webp", description: "Convert SVG to WebP for smaller web-optimized output." },
      { name: "PNG to SVG", href: "/png-to-svg", description: "Trace PNG to scalable SVG — pixel-perfect, detailed, flat, or mono." },
      { name: "JPG to SVG", href: "/jpg-to-svg", description: "Trace JPEG to SVG vector — 4 tracing modes." },
      { name: "WebP to SVG", href: "/webp-to-svg", description: "Trace WebP images to scalable SVG vector format." },
    ],
  },
  {
    heading: "TIFF Converters",
    tools: [
      { name: "TIFF to PNG", href: "/tiff-to-png", description: "Convert TIFF to PNG — requires desktop software (guide + alternatives)." },
      { name: "TIFF to JPG", href: "/tiff-to-jpg", description: "Convert TIFF to JPEG — requires desktop software (guide + alternatives)." },
      { name: "TIFF to WebP", href: "/tiff-to-webp", description: "Convert TIFF to WebP — requires desktop software (guide + alternatives)." },
    ],
  },
  {
    heading: "HEIC Converters",
    tools: [
      { name: "HEIC to JPG", href: "/heic-to-jpg", description: "Convert iPhone HEIC to JPG, PNG, or WebP — batch, browser-based." },
      { name: "HEIC to PNG", href: "/heic-to-png", description: "Convert HEIC to lossless PNG — uses our multi-format HEIC tool." },
      { name: "HEIC to WebP", href: "/heic-to-webp", description: "Convert HEIC to WebP — uses our multi-format HEIC tool." },
    ],
  },
];

const bulkTools = [
  { name: "Bulk Image Compressor", href: "/bulk-image-compressor", description: "Compress dozens of images at once with a shared quality slider — download as ZIP.", icon: Archive },
  { name: "Bulk Image Resizer", href: "/bulk-image-resizer", description: "Resize multiple images to exact dimensions — contain, cover, or stretch modes. ZIP download.", icon: Maximize },
  { name: "Bulk Image Converter", href: "/bulk-image-converter", description: "Convert multiple images to WebP in one batch — 25–35% smaller files. ZIP download.", icon: ArrowRightLeft },
  { name: "Bulk Background Remover", href: "/bulk-background-remover", description: "Remove backgrounds from multiple product photos at once — AI-powered batch processing.", icon: Eraser },
  { name: "Bulk Watermark Adder", href: "/bulk-watermark-adder", description: "Add text or image watermarks to multiple photos in one operation.", icon: Droplets },
  { name: "Bulk PNG to JPG", href: "/bulk-png-to-jpg", description: "Batch convert multiple PNG files to JPG. Set quality for all, download a single ZIP.", icon: ArrowRightLeft },
  { name: "Bulk PNG to WebP", href: "/bulk-png-to-webp", description: "Batch convert your PNG library to WebP. 25–35% smaller files, one ZIP download.", icon: ArrowRightLeft },
  { name: "Bulk PNG to GIF", href: "/bulk-png-to-gif", description: "Batch convert multiple PNG images to GIF. Download all in one ZIP archive.", icon: ArrowRightLeft },
  { name: "Bulk JPG to PNG", href: "/bulk-jpg-to-png", description: "Batch convert multiple JPG photos to PNG for lossless quality. Download as ZIP.", icon: ArrowRightLeft },
  { name: "Bulk JPG to WebP", href: "/bulk-jpg-to-webp", description: "Batch optimize your JPEG photo library to WebP. Reduce library size by 25–34%.", icon: ArrowRightLeft },
  { name: "Bulk WebP to PNG", href: "/bulk-webp-to-png", description: "Batch convert multiple WebP files to PNG for universal compatibility. Download as ZIP.", icon: ArrowRightLeft },
];

const productTools = [
  { name: "Amazon Image Resizer", href: "/amazon-image-resizer", description: "Resize product photos to Amazon's 1000×1000 standard — white background, JPG output.", icon: ShoppingBag },
  { name: "Shopify Image Optimizer", href: "/shopify-image-optimizer", description: "Optimize product photos for Shopify — resize to 2048×2048, white background, JPG.", icon: ShoppingBag },
  { name: "Etsy Image Resizer", href: "/etsy-image-resizer", description: "Resize product photos for Etsy listings — 2000×2000 JPG with adjustable quality.", icon: ShoppingBag },
  { name: "Product Image Resizer", href: "/product-image-resizer", description: "Resize product photos for any e-commerce platform — Amazon, Shopify, Etsy, eBay presets.", icon: Package },
  { name: "Product Photo Optimizer", href: "/product-photo-optimizer", description: "Compress and optimize multiple product photos at once — batch JPG output.", icon: Package },
  { name: "Product Background Remover", href: "/product-background-remover", description: "Remove backgrounds from product photos for white-background e-commerce listings.", icon: Eraser },
];

const ocrTools = [
  { name: "Image to Text", href: "/image-to-text", description: "Extract text from any image using Tesseract OCR. Supports printed text in 40+ languages.", icon: Type },
  { name: "Screenshot to Text", href: "/screenshot-to-text", description: "Copy text from screenshots — UI text, error messages, code snippets. Browser-based OCR.", icon: FileSearch },
  { name: "Screenshot to Table", href: "/screenshot-to-table", description: "Extract tables from screenshots into editable CSV or Excel. Spatial OCR for precise columns.", icon: Table2 },
  { name: "Handwriting to Text", href: "/handwriting-to-text", description: "Convert handwritten notes to digital text using OCR. Works best with clear printed handwriting.", icon: PenTool },
  { name: "Receipt Scanner", href: "/receipt-scanner", description: "Scan receipts and extract all visible text — totals, items, dates, and merchant names.", icon: FileSearch },
  { name: "Business Card Scanner", href: "/business-card-scanner", description: "Scan business cards and extract contact information — name, email, phone, company.", icon: ScanSearch },
  { name: "Table Extraction from Image", href: "/table-extraction-from-image", description: "Extract tabular data from images and photos into structured CSV format.", icon: Table2 },
];

export default function ImageToolsPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="max-w-3xl">
              <h1 className="type-h1 font-display gradient-text mb-2">
                Free Online Image Tools — 113 Tools &amp; Converters, No Watermarks, No Signup
              </h1>
              <p className="text-foreground-secondary text-lg max-w-2xl leading-relaxed">
                113 free image tools and format converters that run entirely in your browser. Compress,
                resize, convert between 10+ formats, crop, remove backgrounds, blur faces, enhance photos,
                watermark, OCR text extraction, e-commerce image resizing for Amazon/Shopify/Etsy, and more
                — no server uploads, no watermarks, no signup required.
                Unlike iLoveIMG, remove.bg, and Adobe Express, your photos never leave your device.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Image Tools ── */}
        <div className="mb-4">
          <h2 className="type-h2 font-display font-semibold text-foreground mb-1">Image Tools</h2>
          <p className="type-small text-foreground-secondary">Edit, compress, resize, enhance, and analyze images — all client-side, all free.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {imageTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-card-premium p-5 sm:p-7 group flex flex-col"
            >
              <div className="w-12 h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:border-primary-border transition-all duration-200">
                <tool.icon className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="type-h3 font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200 break-words">
                {tool.name}
              </h3>
              <p className="type-small text-foreground-secondary leading-relaxed flex-1 break-words">
                {tool.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary type-label opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Open tool
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Format Converters ── */}
        <div className="mb-8">
          <h2 className="type-h2 font-display font-semibold text-foreground mb-1">Format Converters</h2>
          <p className="type-small text-foreground-secondary">Convert images between PNG, JPG, WebP, GIF, BMP, AVIF, ICO, SVG, TIFF, and HEIC — 50+ converters, all private and browser-based.</p>
        </div>

        {converterGroups.map((group) => (
          <div key={group.heading} className="mb-10">
            <h3 className="type-h3 font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-primary inline-block shrink-0" />
              {group.heading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="glass-card-premium p-5 sm:p-6 group flex flex-col"
                >
                  <div className="w-10 h-10 rounded-[10px] bg-primary-muted border border-primary-border flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-all duration-200">
                    <ArrowRightLeft className="w-5 h-5 text-primary transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <h3 className="type-h3 font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors duration-200 text-[15px] break-words">
                    {tool.name}
                  </h3>
                  <p className="type-small text-foreground-secondary leading-relaxed flex-1 text-[13px] break-words">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-primary type-label opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Convert
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* ── Bulk Image Tools ── */}
        <div className="mt-6 mb-4">
          <h2 className="type-h2 font-display font-semibold text-foreground mb-1">Bulk Image Tools</h2>
          <p className="type-small text-foreground-secondary">Process dozens of images at once — compress, resize, convert, and watermark in batch. ZIP download included.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {bulkTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-card-premium p-5 sm:p-7 group flex flex-col"
            >
              <div className="w-12 h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:border-primary-border transition-all duration-200">
                <tool.icon className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="type-h3 font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200 break-words">
                {tool.name}
              </h3>
              <p className="type-small text-foreground-secondary leading-relaxed flex-1 break-words">
                {tool.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary type-label opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Open tool
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Product & E-commerce ── */}
        <div className="mb-4">
          <h2 className="type-h2 font-display font-semibold text-foreground mb-1">Product &amp; E-commerce Tools</h2>
          <p className="type-small text-foreground-secondary">Resize and optimize product photos for Amazon, Shopify, Etsy, and eBay — correct dimensions, white background, and JPG output.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {productTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-card-premium p-5 sm:p-7 group flex flex-col"
            >
              <div className="w-12 h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:border-primary-border transition-all duration-200">
                <tool.icon className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="type-h3 font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200 break-words">
                {tool.name}
              </h3>
              <p className="type-small text-foreground-secondary leading-relaxed flex-1 break-words">
                {tool.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary type-label opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Open tool
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── OCR & Text Extraction ── */}
        <div className="mb-4">
          <h2 className="type-h2 font-display font-semibold text-foreground mb-1">OCR &amp; Text Extraction</h2>
          <p className="type-small text-foreground-secondary">Extract text from images, screenshots, receipts, business cards, and handwritten notes — Tesseract OCR, 40+ languages, 100% browser-based.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {ocrTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-card-premium p-5 sm:p-7 group flex flex-col"
            >
              <div className="w-12 h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:border-primary-border transition-all duration-200">
                <tool.icon className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="type-h3 font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200 break-words">
                {tool.name}
              </h3>
              <p className="type-small text-foreground-secondary leading-relaxed flex-1 break-words">
                {tool.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary type-label opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Open tool
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Request CTA */}
        <div className="mt-2 rounded-2xl bg-linear-to-r from-amber-50 to-indigo-50 border border-amber-100 px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Missing an image tool?</p>
            <p className="text-xs text-foreground-secondary mt-0.5">219 tools and counting — submit yours and vote for what ships next.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/request-a-tool" className="btn btn-primary gap-1.5 text-xs px-4 py-2 flex-1 sm:flex-none justify-center">
              <Zap className="w-3.5 h-3.5" /> Request a Tool
            </Link>
            <Link href="/roadmap" className="btn btn-secondary gap-1.5 text-xs px-4 py-2 flex-1 sm:flex-none justify-center">
              Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 350px" }}>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="type-h4 font-semibold text-foreground mb-1">
                100% Client-Side — Your Photos Stay Private
              </h4>
              <p className="type-small text-foreground-secondary leading-relaxed">
                Unlike iloveimg.com, imagecompressor.com, and remove.bg which upload your
                photos to cloud servers, Toolsz processes everything locally in your browser.
                Your images never leave your device — nothing is stored or shared.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="type-h4 font-semibold text-foreground mb-1">
                No Watermarks, No Premium — Truly Free
              </h4>
              <p className="type-small text-foreground-secondary leading-relaxed">
                Other image tools add watermarks on the free tier or limit
                resolution — remove.bg charges for HD, Adobe Express brands free output.
                Toolsz never adds watermarks and delivers full-resolution
                output — every tool is completely free, forever.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
