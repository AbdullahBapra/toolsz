import Link from "next/link";
import {
  FileDown, Image, Maximize, Type, ArrowRightLeft, Pencil, Droplets, Smartphone,
  ShieldCheck, Eraser, Camera, Eye, Paintbrush, Film, Crop, RotateCw, Grid3x3,
  LayoutGrid, MessageSquare, Maximize2, Sparkles, Palette, ArrowRight, Shield,
  Zap, Check, Star, EyeOff, Code, Ruler,
} from "lucide-react";
import FaqAccordion, { type FaqItem } from "@/app/components/FaqAccordion";

const tools = [
  { name:"Compress Image",             href:"/compress-image",         icon:FileDown,      badge:"Most popular", desc:"Reduce JPG, PNG and WebP file size while preserving quality. Faster than TinyPNG." },
  { name:"Compress to Exact Size",     href:"/compress-to-size",       icon:FileDown,      badge:"Unique",       desc:"Hit a precise KB/MB target — US Passport (240KB), UK Visa, Schengen, Australia & more." },
  { name:"Background Remover",         href:"/remove-bg",              icon:Eraser,        badge:"AI",           desc:"Remove image backgrounds using AI. Get a transparent PNG in seconds — no account." },
  { name:"Resize Image",               href:"/resize-image",           icon:Maximize,                            desc:"Scale images to any pixel size or percentage. Preserves aspect ratio." },
  { name:"Convert Image",              href:"/convert-image",          icon:ArrowRightLeft,                      desc:"Convert between PNG, JPG, WebP, HEIC, SVG, AVIF and more formats." },
  { name:"Image Upscaler",             href:"/upscale-image",          icon:Maximize2,     badge:"AI",           desc:"Upscale images up to 4× using super-resolution AI. No quality loss." },
  { name:"HEIC to JPG",                href:"/heic-to-jpg",            icon:Smartphone,                          desc:"Convert iPhone HEIC/HEIF photos to JPG. Batch convert multiple files at once." },
  { name:"Remove Watermark",           href:"/watermark-remover",      icon:Paintbrush,    badge:"AI",           desc:"Remove watermarks from images using AI inpainting. Results are clean and seamless." },
  { name:"Photo Enhancer",             href:"/photo-enhancer",         icon:Sparkles,                            desc:"Auto-fix brightness, contrast and saturation. One-click image enhancement." },
  { name:"AI Image Detector",          href:"/ai-detector",            icon:Eye,           badge:"AI",           desc:"Detect if an image is AI-generated using a CLIP neural network + 10 heuristic signals." },
  { name:"Image Cropper",              href:"/crop-image",             icon:Crop,                                desc:"Crop to any aspect ratio — 1:1, 4:3, 16:9 — or free-form with precision." },
  { name:"Edit Image",                 href:"/edit-image",             icon:Pencil,                              desc:"Adjust brightness, contrast, saturation, hue, blur and sharpen photos." },
  { name:"Blur Background",            href:"/blur-background",        icon:Droplets,                            desc:"Add professional portrait bokeh blur to your photos without Photoshop." },
  { name:"Blur Face",                  href:"/blur-face",              icon:EyeOff,                              desc:"Blur faces and sensitive areas for privacy. Great for social media posts." },
  { name:"Watermark Image",            href:"/watermark-image",        icon:Droplets,                            desc:"Add custom text or logo watermarks to photos. Protect your creative work." },
  { name:"Rotate & Flip Image",        href:"/rotate-image",           icon:RotateCw,                            desc:"Rotate 90°/180°/270° and flip images horizontally or vertically." },
  { name:"Batch Image Resizer",        href:"/batch-resize",           icon:Maximize,                            desc:"Resize 50+ images at once. Download as a ZIP. Saves hours of manual work." },
  { name:"Image to Text (OCR)",        href:"/image-to-text",          icon:Type,          badge:"Free",         desc:"Extract text from images, screenshots, and scanned documents using OCR." },
  { name:"Image to PDF",               href:"/image-to-pdf",           icon:Image,                               desc:"Combine multiple images into a single PDF. Choose page size and orientation." },
  { name:"EXIF Remover",               href:"/exif-remover",           icon:ShieldCheck,                         desc:"Strip GPS location and camera metadata from photos before sharing online." },
  { name:"ID Photo Maker",             href:"/id-photo",               icon:Camera,                              desc:"Create passport, visa and ID photos at the right size and DPI. Print-ready." },
  { name:"Social Media Resizer",       href:"/social-image",           icon:Smartphone,                          desc:"Resize images for Instagram, Twitter, LinkedIn, YouTube, TikTok with one click." },
  { name:"GIF Maker",                  href:"/gif-maker",              icon:Film,                                desc:"Create animated GIFs from images. Set frame delay and loop count." },
  { name:"Video to GIF",               href:"/video-to-gif",           icon:Film,                                desc:"Convert video clips to animated GIFs directly in your browser." },
  { name:"Image Splitter",             href:"/split-image",            icon:Grid3x3,                             desc:"Split images into Instagram grid layouts — 1×3, 3×3 and custom grids." },
  { name:"Collage Maker",              href:"/collage-maker",          icon:LayoutGrid,                          desc:"Create photo collages with flexible 2×2, 3×3 and custom grid layouts." },
  { name:"Meme Generator",             href:"/meme-generator",         icon:MessageSquare,                       desc:"Add impact-style text captions to any image. Create memes instantly." },
  { name:"Image Annotator",            href:"/annotate-image",         icon:Palette,                             desc:"Add arrows, text boxes and rectangles to images for feedback and markup." },
  { name:"Colorize Image",             href:"/colorize-image",         icon:Palette,                             desc:"Add color to black-and-white and vintage photos automatically." },
  { name:"Color Blindness Simulator",  href:"/color-blind-simulator",  icon:Eye,                                 desc:"Test how your designs look to users with color blindness. 8 vision types." },
  { name:"HTML to Image",              href:"/html-to-image",          icon:Code,                                desc:"Render HTML and CSS code as a PNG or JPEG image. Great for og:image generation." },
  { name:"Pixel Size Comparator",      href:"/pixel-comparator",       icon:Ruler,                               desc:"Compare actual vs display pixel size with zoom and margin overlays." },
  { name:"Image to PDF",               href:"/image-to-pdf",           icon:FileDown,                            desc:"Convert one or many images into a single, well-formatted PDF document." },
];

const COMPARE = [
  { feature:"Price",               toolsz:"Free forever",   tinypng:"Free (limited)",    canva:"Free (limited)",   photopea:"Free (ads)" },
  { feature:"File uploads",        toolsz:"None — browser", tinypng:"Server upload",      canva:"Server upload",    photopea:"Server upload" },
  { feature:"Watermarks",          toolsz:"None",           tinypng:"None",               canva:"Yes (free tier)",  photopea:"None" },
  { feature:"Signup required",     toolsz:"No",             tinypng:"No",                 canva:"Yes",              photopea:"No" },
  { feature:"Background removal",  toolsz:"✓ Free AI",      tinypng:"✗ Not available",    canva:"Paid only",        photopea:"Manual only" },
  { feature:"Batch resize",        toolsz:"✓ 50+ images",   tinypng:"✓ Limited free",     canva:"✗ One at a time",  photopea:"✗ Not available" },
  { feature:"AI image detection",  toolsz:"✓ Free",         tinypng:"✗ Not available",    canva:"✗ Not available",  photopea:"✗ Not available" },
  { feature:"Exact KB target",     toolsz:"✓ Unique",       tinypng:"✗ Not available",    canva:"✗ Not available",  photopea:"✗ Not available" },
  { feature:"Privacy (local)",     toolsz:"100% local",     tinypng:"Files uploaded",     canva:"Files uploaded",   photopea:"Files uploaded" },
];

const faqs: FaqItem[] = [
  {
    question: "What is the best free image editing tool online in 2026?",
    answer: "Toolsz offers one of the best free image tool suites in 2026. With 113 tools including background remover, AI image upscaler, batch resizer, exact-size compressor, 50+ format converters (PNG, JPG, WebP, AVIF, ICO, BMP, TIFF, HEIC), 11 bulk tools, 6 product photo tools, and 5 OCR tools — all running in your browser without uploading files.",
  },
  {
    question: "Can I remove an image background for free without Photoshop?",
    answer: "Yes. Toolsz's Background Remover uses AI to remove backgrounds in seconds. It's completely free with no signup required, and your image is processed locally — it's not sent to any server. The output is a transparent PNG that you can download instantly.",
  },
  {
    question: "How do I compress an image to a specific KB size?",
    answer: "Use Toolsz's Compress to Exact Size tool. Enter your target size in KB or MB (e.g. 240KB for US passport photos), upload your image, and the tool automatically binary-searches the best quality setting to hit that exact target. Presets are available for US Passport, UK Visa, Schengen, Australian passport, and many more.",
  },
  {
    question: "Is TinyPNG really free, and how does it compare to Toolsz?",
    answer: "TinyPNG offers free compression up to 20 images per month, but files are uploaded to their servers. Toolsz compresses images with no monthly limits and no file uploads — everything runs in your browser. Toolsz also has 113 tools vs TinyPNG's single compression tool, including AI background removal, bulk converters, and product photo optimizers that TinyPNG doesn't offer.",
  },
  {
    question: "Can I convert HEIC photos from my iPhone to JPG for free?",
    answer: "Yes. Toolsz's HEIC to JPG tool converts iPhone HEIC/HEIF photos to JPG directly in your browser. You can batch convert multiple HEIC files at once with no file size limits and no upload to any server.",
  },
  {
    question: "Do any of these image tools use AI?",
    answer: "Yes. Several Toolsz image tools use AI models that run directly in your browser: Background Remover uses a segmentation model, Image Upscaler uses super-resolution AI, Photo Enhancer uses auto-enhancement, and AI Image Detector uses a CLIP neural network to identify AI-generated images. All AI processing happens locally.",
  },
  {
    question: "How do I resize images in bulk for free?",
    answer: "Use the Batch Image Resizer tool. Upload up to 50+ images at once, set your target dimensions or percentage scale, and download all resized images as a ZIP file. It takes under a minute regardless of how many images you upload.",
  },
  {
    question: "Can I detect if an image was made by AI (Midjourney, DALL-E, etc.)?",
    answer: "Yes. The AI Image Detector uses a CLIP ViT-B/32 neural network combined with 10 heuristic signals (DCT frequency analysis, EXIF metadata, noise patterns, etc.) to detect AI-generated images. It's one of the few free tools that uses a proper neural network for this — most competitors only use simple heuristics.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      "name": "Best Free Image Tools 2026",
      "numberOfItems": 113,
      "itemListElement": tools.slice(0, 10).map((t, i) => ({
        "@type": "ListItem", "position": i + 1, "name": t.name, "url": `https://www.toolsz.co${t.href}`,
      })),
    },
    {
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question", "name": f.question,
        "acceptedAnswer": { "@type": "Answer", "text": f.answer },
      })),
    },
  ],
};

export default function BestFreeImageToolsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-[calc(100vh-8rem)]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="tool-hero p-6 sm:p-8">
            <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-5">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground">Best Free Image Tools</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-50 to-amber-100 border border-amber-200/50 flex items-center justify-center shrink-0">
                <Image className="w-6 h-6 text-amber-600" />
              </div>
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Updated 2026 · 113 tools
                </div>
                <h1 className="type-h1 font-display gradient-text mb-3">
                  113 Best Free Image Tools Online in 2026
                </h1>
                <p className="text-foreground-secondary text-lg leading-relaxed max-w-2xl">
                  Compress, convert, resize, remove backgrounds, upscale, crop, and edit photos — plus 50+ format converters (PNG, JPG, WebP, AVIF, ICO, BMP, SVG, TIFF, HEIC), 11 bulk tools, 6 e-commerce product tools, and 5 OCR tools. All free, all in your browser. No uploads, no watermarks, no account.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { label:"113 image tools", sub:"39 core + 50 converters + more" },
                { label:"0 file uploads", sub:"browser-only processing" },
                { label:"AI-powered tools", sub:"runs locally" },
                { label:"0 signup", sub:"open and use now" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground leading-none">{s.label}</p>
                    <p className="text-[11px] text-foreground-secondary mt-0.5">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-10">
          <h2 className="type-h2 font-display text-foreground mb-6">39 Core Image Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <Link key={tool.href + tool.name} href={tool.href} className="glass-card-premium p-5 group flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:bg-amber-100 transition-all">
                    <tool.icon className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                  </div>
                  {tool.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tool.badge === "Most popular" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                      tool.badge === "AI" ? "bg-violet-50 text-violet-600 border-violet-100" :
                      tool.badge === "Unique" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-green-50 text-green-600 border-green-100"
                    }`}>{tool.badge}</span>
                  )}
                </div>
                <h3 className="type-h3 font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{tool.name}</h3>
                <p className="type-small text-foreground-secondary leading-relaxed flex-1">{tool.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Open tool <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>

          {/* Image Format Converters */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-1.5 h-6 rounded-full bg-primary inline-block shrink-0" />
              <h2 className="type-h2 font-display font-semibold text-foreground">50+ Image Format Converters</h2>
            </div>
            <p className="text-foreground-secondary mb-5 ml-4.5">Convert between any image format instantly in your browser. Every format pair has a dedicated tool.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {[
                { name:"PNG → JPG", href:"/png-to-jpg" }, { name:"PNG → WebP", href:"/png-to-webp" }, { name:"PNG → AVIF", href:"/png-to-avif" },
                { name:"PNG → GIF", href:"/png-to-gif" }, { name:"PNG → ICO", href:"/png-to-ico" }, { name:"PNG → BMP", href:"/png-to-bmp" },
                { name:"PNG → SVG", href:"/png-to-svg" }, { name:"PNG → TIFF", href:"/png-to-tiff" },
                { name:"JPG → PNG", href:"/jpg-to-png" }, { name:"JPG → WebP", href:"/jpg-to-webp" }, { name:"JPG → AVIF", href:"/jpg-to-avif" },
                { name:"JPG → GIF", href:"/jpg-to-gif" }, { name:"JPG → ICO", href:"/jpg-to-ico" }, { name:"JPG → BMP", href:"/jpg-to-bmp" },
                { name:"JPG → SVG", href:"/jpg-to-svg" }, { name:"JPG → TIFF", href:"/jpg-to-tiff" },
                { name:"WebP → PNG", href:"/webp-to-png" }, { name:"WebP → JPG", href:"/webp-to-jpg" }, { name:"WebP → GIF", href:"/webp-to-gif" },
                { name:"WebP → ICO", href:"/webp-to-ico" }, { name:"WebP → BMP", href:"/webp-to-bmp" }, { name:"WebP → SVG", href:"/webp-to-svg" },
                { name:"GIF → PNG", href:"/gif-to-png" }, { name:"GIF → JPG", href:"/gif-to-jpg" }, { name:"GIF → WebP", href:"/gif-to-webp" },
                { name:"AVIF → PNG", href:"/avif-to-png" }, { name:"AVIF → JPG", href:"/avif-to-jpg" },
                { name:"ICO → PNG", href:"/ico-to-png" }, { name:"ICO → JPG", href:"/ico-to-jpg" }, { name:"ICO → WebP", href:"/ico-to-webp" },
                { name:"SVG → PNG", href:"/svg-to-png" }, { name:"SVG → JPG", href:"/svg-to-jpg" }, { name:"SVG → ICO", href:"/svg-to-ico" },
                { name:"SVG → WebP", href:"/svg-to-webp" },
                { name:"BMP → PNG", href:"/bmp-to-png" }, { name:"BMP → JPG", href:"/bmp-to-jpg" }, { name:"BMP → WebP", href:"/bmp-to-webp" },
                { name:"TIFF → JPG", href:"/tiff-to-jpg" }, { name:"TIFF → PNG", href:"/tiff-to-png" }, { name:"TIFF → WebP", href:"/tiff-to-webp" },
                { name:"HEIC → PNG", href:"/heic-to-png" }, { name:"HEIC → JPG", href:"/heic-to-jpg" }, { name:"HEIC → WebP", href:"/heic-to-webp" },
              ].map(c => (
                <Link key={c.href} href={c.href} className="text-xs px-2.5 py-2 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors text-center font-medium bg-white">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Bulk + Product + OCR Tools */}
          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="type-h3 font-semibold text-foreground mb-3">11 Bulk Image Tools</h3>
                <div className="space-y-1.5">
                  {[
                    { name:"Bulk Image Compressor", href:"/bulk-image-compressor" },
                    { name:"Bulk Image Resizer", href:"/bulk-image-resizer" },
                    { name:"Bulk Image Converter", href:"/bulk-image-converter" },
                    { name:"Bulk Background Remover", href:"/bulk-background-remover" },
                    { name:"Bulk Watermark Adder", href:"/bulk-watermark-adder" },
                    { name:"Bulk PNG → JPG", href:"/bulk-png-to-jpg" },
                    { name:"Bulk PNG → WebP", href:"/bulk-png-to-webp" },
                    { name:"Bulk JPG → PNG", href:"/bulk-jpg-to-png" },
                    { name:"Bulk JPG → WebP", href:"/bulk-jpg-to-webp" },
                    { name:"Bulk WebP → PNG", href:"/bulk-webp-to-png" },
                    { name:"Bulk PNG → GIF", href:"/bulk-png-to-gif" },
                  ].map(t => (
                    <Link key={t.href} href={t.href} className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-primary transition-colors">
                      <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />{t.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="type-h3 font-semibold text-foreground mb-3">6 Product Photo Tools</h3>
                <div className="space-y-1.5">
                  {[
                    { name:"Amazon Image Resizer", href:"/amazon-image-resizer" },
                    { name:"Shopify Image Optimizer", href:"/shopify-image-optimizer" },
                    { name:"Etsy Image Resizer", href:"/etsy-image-resizer" },
                    { name:"Product Image Resizer", href:"/product-image-resizer" },
                    { name:"Product Photo Optimizer", href:"/product-photo-optimizer" },
                    { name:"Product Background Remover", href:"/product-background-remover" },
                  ].map(t => (
                    <Link key={t.href} href={t.href} className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-primary transition-colors">
                      <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />{t.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="type-h3 font-semibold text-foreground mb-3">5 OCR & Text Tools</h3>
                <div className="space-y-1.5">
                  {[
                    { name:"Screenshot to Text", href:"/screenshot-to-text" },
                    { name:"Handwriting to Text", href:"/handwriting-to-text" },
                    { name:"Receipt Scanner", href:"/receipt-scanner" },
                    { name:"Business Card Scanner", href:"/business-card-scanner" },
                    { name:"Table Extraction from Image", href:"/table-extraction-from-image" },
                  ].map(t => (
                    <Link key={t.href} href={t.href} className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-primary transition-colors">
                      <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />{t.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="mt-12">
            <h2 className="type-h2 font-display text-foreground mb-2">Toolsz vs TinyPNG vs Canva vs Photopea</h2>
            <p className="text-foreground-secondary mb-6">How Toolsz compares to the most popular free image tools.</p>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Feature</th>
                    <th className="px-4 py-3 font-bold text-primary text-center">Toolsz ✓</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">TinyPNG</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Canva</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Photopea</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-surface/30"}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{row.feature}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.toolsz}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{row.tinypng}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{row.canva}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{row.photopea}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel glass-panel-info rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="type-h4 font-semibold text-foreground mb-1">Images Stay on Your Device</h3>
                <p className="type-small text-foreground-secondary leading-relaxed">Unlike TinyPNG and Canva, all Toolsz image processing happens in your browser. Your photos are never sent to any server — critical for privacy when editing personal or sensitive images.</p>
              </div>
            </div>
            <div className="glass-panel glass-panel-info rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="type-h4 font-semibold text-foreground mb-1">AI Tools That Run Locally</h3>
                <p className="type-small text-foreground-secondary leading-relaxed">Background removal, image upscaling, and AI image detection all use on-device AI models via WebAssembly. No cloud API calls, no data leaving your machine, and it works offline.</p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="type-h2 font-display text-foreground mb-6">Frequently Asked Questions</h2>
            <FaqAccordion items={faqs} />
          </div>

          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-sm text-foreground-secondary mb-3 font-medium">Explore more</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label:"All Image Tools", href:"/image-tools" },
                { label:"Best Free PDF Tools", href:"/best-free-pdf-tools" },
                { label:"Best Free Dev Tools", href:"/best-free-developer-tools" },
                { label:"Free Adobe Alternative", href:"/free-alternatives-to-adobe-acrobat" },
                { label:"All 219 tools", href:"/all-tools" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
