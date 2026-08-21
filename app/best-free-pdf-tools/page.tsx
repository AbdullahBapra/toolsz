import Link from "next/link";
import {
  FileDown, Image, Merge, FileText, Table2, Highlighter, FileEdit, BookOpen,
  Scissors, RotateCw, Droplets, EyeOff, GitCompare, Receipt, PenTool, Unlock,
  Lock, LayoutList, ListOrdered, Crop, Layers, ScanSearch, Sparkles, ArrowRight,
  Shield, Zap, Check, X as XIcon, ArrowLeft, Star, Gauge, ScrollText, ClipboardList,
} from "lucide-react";
import FaqAccordion, { type FaqItem } from "@/app/components/FaqAccordion";

const tools = [
  { name:"Compress PDF",            href:"/compress-pdf",         icon:FileDown,      badge:"Most popular", desc:"Reduce file size without losing visual quality. Works offline in your browser." },
  { name:"Merge PDF",               href:"/merge-pdf",            icon:Merge,                              desc:"Combine any number of PDFs into one document. Drag to reorder before merging." },
  { name:"Split PDF",               href:"/split-pdf",            icon:Scissors,                           desc:"Extract specific pages, split by ranges, or divide every N pages." },
  { name:"PDF to JPG",              href:"/pdf-to-jpg",           icon:Image,                              desc:"Convert each PDF page to a high-quality JPG image. Choose DPI and format." },
  { name:"PDF to Word",             href:"/pdf-to-word",          icon:FileDown,      badge:"Free",        desc:"Convert PDF to editable DOCX. Premium on Adobe & Smallpdf — free here." },
  { name:"PDF to Excel",            href:"/pdf-to-excel",         icon:Table2,        badge:"Free",        desc:"Extract PDF tables directly into XLSX spreadsheets. No data loss." },
  { name:"PDF to Text",             href:"/pdf-to-text",          icon:FileText,                           desc:"Pull out all text content from any PDF for copying or further processing." },
  { name:"PDF to Data",             href:"/pdf-to-data",          icon:Table2,                             desc:"Convert PDF structure to JSON or CSV — great for developers and data analysts." },
  { name:"PDF OCR",                 href:"/pdf-ocr",              icon:ScanSearch,    badge:"Free",        desc:"Make scanned PDFs searchable with Tesseract. Premium on most platforms — free here." },
  { name:"PDF Editor",              href:"/pdf-editor",           icon:FileEdit,                           desc:"Draw, highlight, add text boxes and erase directly on PDF pages." },
  { name:"Sign PDF",                href:"/sign-pdf",             icon:PenTool,                            desc:"Draw, type or upload your signature. Place it anywhere on any PDF." },
  { name:"PDF Form Filler",         href:"/pdf-form-filler",      icon:FileEdit,      badge:"Free",        desc:"Fill PDF form fields — text, checkboxes, dropdowns. No Adobe required." },
  { name:"Redact PDF",              href:"/redact-pdf",           icon:EyeOff,                             desc:"Permanently black out sensitive information — true data removal, not just overlay." },
  { name:"Protect PDF",             href:"/protect-pdf",          icon:Lock,                               desc:"Add AES-256 password encryption to any PDF in seconds." },
  { name:"Unlock PDF",              href:"/unlock-pdf",           icon:Unlock,                             desc:"Remove password protection from PDFs you own — instant, no limit." },
  { name:"Watermark PDF",           href:"/watermark-pdf",        icon:Droplets,                           desc:"Add custom text watermarks with adjustable size, opacity, rotation and color." },
  { name:"Rotate PDF",              href:"/rotate-pdf",           icon:RotateCw,                           desc:"Rotate individual or all pages clockwise, counter-clockwise, or 180°." },
  { name:"Organize PDF",            href:"/organize-pdf",         icon:LayoutList,                         desc:"Drag to reorder, delete, or duplicate pages. Visual page manager." },
  { name:"Crop PDF",                href:"/crop-pdf",             icon:Crop,                               desc:"Trim page margins in pt, mm, or inches. Remove whitespace instantly." },
  { name:"Flatten PDF",             href:"/flatten-pdf",          icon:Layers,                             desc:"Flatten form fields and annotations into a static, non-editable PDF." },
  { name:"Add Page Numbers",        href:"/page-numbers",         icon:ListOrdered,                        desc:"Insert page numbers in any position and format with a custom start page." },
  { name:"Highlight Extractor",     href:"/highlight-extractor",  icon:Highlighter,   badge:"Unique",      desc:"Extract all highlighted and annotated text from study materials in one click." },
  { name:"PDF Diff",                href:"/pdf-diff",             icon:GitCompare,    badge:"Unique",      desc:"Compare two PDFs side by side — visual and text diff highlighting. Unique to Toolsz." },
  { name:"PDF Flipbook",            href:"/flipbook-pdf",         icon:BookOpen,      badge:"Unique",      desc:"Turn any PDF into an interactive 3D flipbook with realistic page-turn animations." },
  { name:"HTML to PDF",             href:"/html-to-pdf",          icon:FileDown,                           desc:"Convert HTML markup to clean PDF. No watermarks. Customize margins and page size." },
  { name:"PPTX to PDF",             href:"/pptx-to-pdf",          icon:FileDown,                           desc:"Convert PowerPoint files to PDF. Client-side, no upload, preserves layout." },
  { name:"Invoice Generator",       href:"/invoice-generator",    icon:Receipt,                            desc:"Create professional PDF invoices with 10 templates. No watermark, no signup." },
  { name:"Smart PDF Cleaner",       href:"/pdf-cleaner",          icon:Sparkles,      badge:"Unique",      desc:"Auto-remove margins, center content, normalize fonts for perfect readability." },
  { name:"PDF Size Analyzer",       href:"/size-analyzer",        icon:Gauge,         badge:"Unique",      desc:"Visual breakdown of what's bloating your PDF — images, fonts, metadata." },
  { name:"PDF Quality Score",       href:"/pdf-roast",            icon:ScrollText,    badge:"Unique",      desc:"Brutally honest quality score for any PDF. Download a shareable score card." },
  { name:"Business Document Pack",  href:"/business-docs",        icon:ClipboardList, badge:"Unique",      desc:"Invoices, quotes, receipts, purchase orders & delivery notes — 5 themes." },
  { name:"Extract Images from PDF", href:"/extract-images-pdf",   icon:Image,                              desc:"Pull all embedded images from a PDF. Download individually or as a ZIP." },
];

const COMPARE = [
  { feature:"Price",              toolsz:"Free forever",   smallpdf:"Free (watermarks)",  ilovepdf:"Free (watermarks)", adobe:"$19.99/month" },
  { feature:"Watermarks",         toolsz:"None",           smallpdf:"Yes (free tier)",     ilovepdf:"Yes (free tier)",   adobe:"None" },
  { feature:"File uploads",       toolsz:"None — browser", smallpdf:"Server upload",       ilovepdf:"Server upload",     adobe:"Server upload" },
  { feature:"Signup required",    toolsz:"No",             smallpdf:"Yes",                 ilovepdf:"Yes",               adobe:"Yes" },
  { feature:"Number of tools",    toolsz:"77+",            smallpdf:"~20",                 ilovepdf:"~20",               adobe:"~15 online" },
  { feature:"PDF OCR",            toolsz:"✓ Free",         smallpdf:"Paid only",           ilovepdf:"Paid only",         adobe:"Paid only" },
  { feature:"PDF to Word",        toolsz:"✓ Free",         smallpdf:"Paid only",           ilovepdf:"Paid only",         adobe:"Paid only" },
  { feature:"PDF Diff",           toolsz:"✓ Free",         smallpdf:"✗ Not available",     ilovepdf:"✗ Not available",   adobe:"✗ Not available" },
  { feature:"Privacy (local)",    toolsz:"100% local",     smallpdf:"Files uploaded",      ilovepdf:"Files uploaded",    adobe:"Files uploaded" },
];

const faqs: FaqItem[] = [
  {
    question: "What is the best free PDF tool online in 2026?",
    answer: "Toolsz is one of the best free PDF tool suites in 2026 because it runs entirely in your browser — your files are never uploaded to any server. It offers 77 PDF tools including compress, merge, split, OCR, sign, edit, and 45+ format converters (JPG↔PDF, Excel↔PDF, EPUB↔PDF, and more) — all completely free with no watermarks and no signup required. Unlike Smallpdf and iLovePDF which add watermarks on the free tier, Toolsz never adds any watermarks.",
  },
  {
    question: "Are these PDF tools really free — no hidden costs?",
    answer: "Yes, 100% free with no hidden costs. Toolsz has no premium tier, no freemium limits, and no watermarks on any output. Every one of the 77 PDF tools is completely free to use without limit. We cover costs through optional, non-intrusive ads.",
  },
  {
    question: "Do I need to upload my PDF files to use these tools?",
    answer: "No. All Toolsz PDF tools run entirely client-side in your browser using JavaScript and WebAssembly. Your files never leave your device and are never uploaded to any server. This makes them safer than cloud-based tools like Smallpdf, iLovePDF, and Adobe Acrobat Online.",
  },
  {
    question: "Is there a file size limit for these free PDF tools?",
    answer: "File size limits depend on your browser's available memory. Most modern browsers can handle PDFs up to 500MB. For very large files (1GB+), performance depends on your device RAM. There are no artificial file size limits imposed by our platform.",
  },
  {
    question: "Which free PDF tool is better — Toolsz vs Smallpdf?",
    answer: "Toolsz beats Smallpdf for free users on every metric: no watermarks, no file uploads, no signup, and 77 tools vs Smallpdf's ~20. Smallpdf's free tier adds watermarks and requires creating an account. Premium features like PDF to Word and PDF OCR cost extra on Smallpdf but are free on Toolsz. The only area where Smallpdf has an edge is the polished mobile app experience.",
  },
  {
    question: "How do I compress a PDF for free without losing quality?",
    answer: "Use Toolsz's Compress PDF tool. Open it, drag your PDF in, choose your compression level (low/medium/high), and download. The tool uses PDF.js and pdflib to re-encode images and remove redundant objects. The entire process runs in your browser — no upload required.",
  },
  {
    question: "Can I sign a PDF online for free without Adobe Acrobat?",
    answer: "Yes. Toolsz's Sign PDF tool lets you draw, type, or upload a signature and place it anywhere on a PDF page. It's completely free with no Adobe subscription needed, and your document is never uploaded to any server.",
  },
  {
    question: "What makes Toolsz different from other free PDF tools?",
    answer: "Three key things: (1) 100% client-side — files never leave your device; (2) No watermarks on any free output; (3) Unique tools not found elsewhere free, like PDF Diff, Highlight Extractor, PDF Flipbook, Smart PDF Cleaner, and PDF Quality Score.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      "name": "Best Free PDF Tools 2026",
      "description": "The 32 best free PDF tools that run in your browser — no upload, no watermarks, no signup.",
      "numberOfItems": 77,
      "itemListElement": tools.slice(0, 10).map((t, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": t.name,
        "description": t.desc,
        "url": `https://www.toolsz.co${t.href}`,
      })),
    },
    {
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": { "@type": "Answer", "text": f.answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.toolsz.co" },
        { "@type": "ListItem", "position": 2, "name": "Best Free PDF Tools", "item": "https://www.toolsz.co/best-free-pdf-tools" },
      ],
    },
  ],
};

export default function BestFreePdfToolsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-[calc(100vh-8rem)]">
        {/* Hero */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="tool-hero p-6 sm:p-8">
            <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-5">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground">Best Free PDF Tools</span>
            </nav>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <FileDown className="w-6 h-6 text-primary" />
              </div>
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Updated 2026 · 77 tools
                </div>
                <h1 className="type-h1 font-display gradient-text mb-3">
                  77 Best Free PDF Tools Online in 2026
                </h1>
                <p className="text-foreground-secondary text-lg leading-relaxed max-w-2xl">
                  Every PDF tool you'll ever need — 32 core tools (compress, merge, split, sign, edit, OCR, form fill) plus 45 format converters (JPG↔PDF, Excel↔PDF, Word↔PDF, EPUB↔PDF, and more) — all running entirely in your browser. No file uploads, no watermarks, no signup, no premium tier.
                </p>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { label:"77 PDF tools", sub:"32 core + 45 converters" },
                { label:"0 file uploads", sub:"100% browser-based" },
                { label:"0 watermarks", sub:"ever, on any tool" },
                { label:"0 signup required", sub:"open & use instantly" },
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

        {/* Tool Grid */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-10">
          <h2 className="type-h2 font-display text-foreground mb-6">32 Core PDF Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <Link key={tool.href} href={tool.href} className="glass-card-premium p-5 group flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-muted border border-primary-border flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary-border transition-all">
                    <tool.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  {tool.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tool.badge === "Most popular" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                      tool.badge === "Free" ? "bg-green-50 text-green-600 border-green-100" :
                      tool.badge === "Unique" ? "bg-amber-50 text-amber-600 border-amber-100" : ""
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

          {/* PDF Format Converters */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-1.5 h-6 rounded-full bg-primary inline-block shrink-0" />
              <h2 className="type-h2 font-display font-semibold text-foreground">45 PDF Format Converters</h2>
            </div>
            <p className="text-foreground-secondary mb-5 ml-4.5">Convert between PDF and every major format — images, spreadsheets, documents, and eBooks. Every format pair has a reverse converter.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {[
                { name:"JPG → PDF", href:"/jpg-to-pdf" }, { name:"PNG → PDF", href:"/png-to-pdf" }, { name:"WebP → PDF", href:"/webp-to-pdf" },
                { name:"GIF → PDF", href:"/gif-to-pdf" }, { name:"BMP → PDF", href:"/bmp-to-pdf" }, { name:"TIFF → PDF", href:"/tiff-to-pdf" },
                { name:"AVIF → PDF", href:"/avif-to-pdf" }, { name:"HEIC → PDF", href:"/heic-to-pdf" }, { name:"SVG → PDF", href:"/svg-to-pdf" },
                { name:"PDF → PNG", href:"/pdf-to-png" }, { name:"PDF → WebP", href:"/pdf-to-webp" }, { name:"PDF → GIF", href:"/pdf-to-gif" },
                { name:"PDF → AVIF", href:"/pdf-to-avif" }, { name:"PDF → BMP", href:"/pdf-to-bmp" }, { name:"PDF → TIFF", href:"/pdf-to-tiff" },
                { name:"PDF → SVG", href:"/pdf-to-svg" },
                { name:"Excel → PDF", href:"/excel-to-pdf" }, { name:"Word → PDF", href:"/doc-to-pdf" }, { name:"PPT → PDF", href:"/ppt-to-pdf" },
                { name:"CSV → PDF", href:"/csv-to-pdf" }, { name:"TXT → PDF", href:"/txt-to-pdf" }, { name:"MD → PDF", href:"/markdown-to-pdf" },
                { name:"JSON → PDF", href:"/json-to-pdf" }, { name:"XML → PDF", href:"/xml-to-pdf" }, { name:"RTF → PDF", href:"/rtf-to-pdf" },
                { name:"ODT → PDF", href:"/odt-to-pdf" }, { name:"EPUB → PDF", href:"/epub-to-pdf" }, { name:"MOBI → PDF", href:"/mobi-to-pdf" },
                { name:"AZW3 → PDF", href:"/azw3-to-pdf" },
                { name:"PDF → Word", href:"/pdf-to-word" }, { name:"PDF → Excel", href:"/pdf-to-excel" }, { name:"PDF → PPT", href:"/pdf-to-ppt" },
                { name:"PDF → CSV", href:"/pdf-to-csv" }, { name:"PDF → HTML", href:"/pdf-to-html" }, { name:"PDF → JSON", href:"/pdf-to-json" },
                { name:"PDF → XML", href:"/pdf-to-xml" }, { name:"PDF → MD", href:"/pdf-to-markdown" }, { name:"PDF → RTF", href:"/pdf-to-rtf" },
                { name:"PDF → ODT", href:"/pdf-to-odt" }, { name:"PDF → EPUB", href:"/pdf-to-epub" }, { name:"PDF → MOBI", href:"/pdf-to-mobi" },
                { name:"PDF → AZW3", href:"/pdf-to-azw3" }, { name:"PDF → DOC", href:"/pdf-to-doc" }, { name:"PDF → Text", href:"/pdf-to-text" },
                { name:"PPTX → PDF", href:"/pptx-to-pdf" },
              ].map(c => (
                <Link key={c.href} href={c.href} className="text-xs px-2.5 py-2 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors text-center font-medium bg-white">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-12">
            <h2 className="type-h2 font-display text-foreground mb-2">Toolsz vs Smallpdf vs iLovePDF vs Adobe Acrobat</h2>
            <p className="text-foreground-secondary mb-6">A feature-by-feature comparison of the most popular free PDF tools.</p>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Feature</th>
                    <th className="px-4 py-3 font-bold text-primary text-center">Toolsz ✓</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Smallpdf</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">iLovePDF</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Adobe</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-surface/30"}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{row.feature}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.toolsz}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{row.smallpdf}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{row.ilovepdf}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{row.adobe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trust blocks */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel glass-panel-info rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="type-h4 font-semibold text-foreground mb-1">Files Never Leave Your Device</h3>
                <p className="type-small text-foreground-secondary leading-relaxed">Unlike Smallpdf, iLovePDF, and Adobe Acrobat Online, Toolsz processes PDFs 100% client-side using WebAssembly and JavaScript. Nothing is ever sent to a server.</p>
              </div>
            </div>
            <div className="glass-panel glass-panel-info rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="type-h4 font-semibold text-foreground mb-1">No Watermarks — Ever</h3>
                <p className="type-small text-foreground-secondary leading-relaxed">Smallpdf and iLovePDF stamp watermarks on all free-tier output. Toolsz has no premium tier — all output is clean and watermark-free, no matter how many times you use it.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h2 className="type-h2 font-display text-foreground mb-6">Frequently Asked Questions</h2>
            <FaqAccordion items={faqs} />
          </div>

          {/* Related pages */}
          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-sm text-foreground-secondary mb-3 font-medium">Explore more</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label:"All PDF Tools", href:"/pdf-tools" },
                { label:"Best Free Image Tools", href:"/best-free-image-tools" },
                { label:"Best Free Dev Tools", href:"/best-free-developer-tools" },
                { label:"Free Smallpdf Alternative", href:"/free-alternatives-to-smallpdf" },
                { label:"Free Adobe Acrobat Alternative", href:"/free-alternatives-to-adobe-acrobat" },
                { label:"All 219 tools", href:"/all-tools" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
