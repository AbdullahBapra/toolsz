import Link from "next/link";
import {
  Shield, Zap, Lock, FileText, Image, Code, ArrowRight,
  CheckCircle, Globe, Cpu, Eye, Users, Star,
} from "lucide-react";

const pdfCoreTools = [
  { name: "Compress PDF", href: "/compress-pdf", desc: "Reduce file size up to 80% without quality loss" },
  { name: "Merge PDF", href: "/merge-pdf", desc: "Combine multiple PDFs into one document" },
  { name: "Split PDF", href: "/split-pdf", desc: "Extract pages or split by range" },
  { name: "Sign PDF", href: "/sign-pdf", desc: "Draw, type, or upload a signature" },
  { name: "PDF Editor", href: "/pdf-editor", desc: "Annotate, highlight, add text and shapes" },
  { name: "PDF Form Filler", href: "/pdf-form-filler", desc: "Fill PDF forms — text, checkboxes, dropdowns" },
  { name: "PDF to Word", href: "/pdf-to-word", desc: "Convert PDF to editable DOCX" },
  { name: "PDF to Excel", href: "/pdf-to-excel", desc: "Extract PDF tables to XLSX" },
  { name: "PDF to JPG", href: "/pdf-to-jpg", desc: "Convert PDF pages to high-quality JPG images" },
  { name: "Rotate PDF", href: "/rotate-pdf", desc: "Rotate all or individual pages" },
  { name: "Protect PDF", href: "/protect-pdf", desc: "Add AES-256 password encryption" },
  { name: "Unlock PDF", href: "/unlock-pdf", desc: "Remove PDF password protection" },
  { name: "Watermark PDF", href: "/watermark-pdf", desc: "Add text or image watermarks" },
  { name: "Add Page Numbers", href: "/page-numbers", desc: "Insert page numbers in any position" },
  { name: "Crop PDF", href: "/crop-pdf", desc: "Trim margins with precision" },
  { name: "Redact PDF", href: "/redact-pdf", desc: "Permanently remove sensitive content" },
  { name: "Organize PDF", href: "/organize-pdf", desc: "Reorder and delete pages with drag-and-drop" },
  { name: "PDF OCR", href: "/pdf-ocr", desc: "Make scanned PDFs text-searchable" },
  { name: "PDF to Text", href: "/pdf-to-text", desc: "Extract all text from a PDF" },
  { name: "PDF Annotator", href: "/pdf-annotator", desc: "Sticky notes, highlights, underlines, stamps" },
  { name: "PDF Diff", href: "/pdf-diff", desc: "Compare two PDFs side-by-side" },
  { name: "PDF Quality Score", href: "/pdf-quality-score", desc: "Analyze resolution and accessibility" },
  { name: "PDF Highlight Extractor", href: "/pdf-highlight-extractor", desc: "Extract all highlighted text" },
  { name: "PDF Flipbook", href: "/pdf-flipbook", desc: "Interactive 3D page-turn viewer" },
  { name: "Smart PDF Cleaner", href: "/smart-pdf-cleaner", desc: "Remove hidden metadata and scripts" },
  { name: "Booklet Maker", href: "/booklet-maker", desc: "Rearrange pages for folded printing" },
  { name: "PDF Metadata Editor", href: "/pdf-metadata-editor", desc: "Edit title, author, keywords" },
  { name: "Flatten PDF", href: "/flatten-pdf", desc: "Flatten form fields into the page" },
  { name: "Invoice Generator", href: "/invoice-generator", desc: "Professional PDF invoices, 10 templates" },
  { name: "Business Docs", href: "/business-docs", desc: "Proposals, SOWs, NDA templates" },
  { name: "PDF Roast", href: "/pdf-roast", desc: "AI critique of document design" },
  { name: "Bates Numbering", href: "/pdf-bates-numbering", desc: "Add legal Bates numbers" },
];

const imageCore = [
  { name: "Compress Image", href: "/compress-image", desc: "Reduce file size while keeping quality" },
  { name: "Background Remover", href: "/remove-bg", desc: "AI removes backgrounds — full resolution" },
  { name: "Resize Image", href: "/resize-image", desc: "Scale to any dimension or percentage" },
  { name: "HEIC to JPG", href: "/heic-to-jpg", desc: "Convert iPhone photos — batch supported" },
  { name: "Image to PDF", href: "/image-to-pdf", desc: "Combine images into a PDF" },
  { name: "Image Upscaler", href: "/upscale-image", desc: "AI 4× super-resolution upscaling" },
  { name: "Crop Image", href: "/crop-image", desc: "Custom dimensions or preset ratios" },
  { name: "Rotate & Flip", href: "/rotate-image", desc: "Rotate by angle or flip" },
  { name: "Convert to WebP", href: "/convert-to-webp", desc: "Optimize images for the web" },
  { name: "Image to Base64", href: "/image-to-base64", desc: "Encode for CSS/HTML embedding" },
  { name: "Add Text to Image", href: "/add-text-to-image", desc: "Custom text overlays" },
  { name: "Watermark Image", href: "/watermark-image", desc: "Text or image watermarks" },
  { name: "Image Color Picker", href: "/image-color-picker", desc: "Pick any color — Hex, RGB, HSL" },
  { name: "Blur Image", href: "/blur-image", desc: "Gaussian blur for privacy or design" },
  { name: "Sharpen Image", href: "/sharpen-image", desc: "Improve clarity with sharpening filters" },
  { name: "Grayscale Image", href: "/grayscale-image", desc: "Convert color to black and white" },
  { name: "Adjust Image", href: "/adjust-image", desc: "Brightness, contrast, saturation, hue" },
  { name: "Invert Colors", href: "/invert-image", desc: "Create a color negative" },
  { name: "Round Corners", href: "/round-corners", desc: "Rounded corners or circle crop" },
  { name: "Image Border", href: "/image-border", desc: "Add borders with custom color and width" },
  { name: "Pixelate Image", href: "/pixelate-image", desc: "Pixelate faces or regions for privacy" },
  { name: "Favicon Generator", href: "/favicon-generator", desc: ".ico, PNGs, manifest.json" },
  { name: "Passport Photo", href: "/passport-photo", desc: "60+ countries, 300 DPI compliant" },
  { name: "Compress to Size", href: "/compress-to-size", desc: 'Target a specific file size (e.g. "200KB")' },
  { name: "EXIF Viewer", href: "/exif-viewer", desc: "View GPS, camera, timestamp metadata" },
  { name: "Remove EXIF", href: "/remove-exif", desc: "Strip metadata for privacy" },
  { name: "Meme Generator", href: "/meme-generator", desc: "Add custom text to meme templates" },
  { name: "Screenshot to Table", href: "/screenshot-to-table", desc: "Extract tables from screenshots" },
  { name: "Size Analyzer", href: "/size-analyzer", desc: "Analyze image file size composition" },
  { name: "SVG to PNG", href: "/svg-to-png", desc: "Convert vectors to PNG at any resolution" },
  { name: "PNG to SVG", href: "/png-to-svg", desc: "Trace bitmap to vector format" },
  { name: "Image Roast", href: "/image-roast", desc: "AI critique of your image" },
  { name: "AI Detector", href: "/ai-detector", desc: "Detect AI-generated images" },
  { name: "Print Calculator", href: "/print-calculator", desc: "Calculate DPI for physical media" },
  { name: "Image to Text (OCR)", href: "/image-to-text", desc: "Extract text — 40+ languages" },
  { name: "Screenshot to Text", href: "/screenshot-to-text", desc: "Extract text from UI screenshots" },
  { name: "Handwriting to Text", href: "/handwriting-to-text", desc: "Digitize handwritten notes" },
  { name: "Receipt Scanner", href: "/receipt-scanner", desc: "Extract data from receipts" },
  { name: "Photo to Cartoon", href: "/photo-to-cartoon", desc: "Transform photos to cartoon style" },
];

const devTools = [
  { name: "JSON Preview", href: "/json-preview", desc: "Interactive collapsible tree — copy paths" },
  { name: "QR Code Generator", href: "/qr-code", desc: "URLs, WiFi, vCards — SVG export" },
  { name: "Password Generator", href: "/password-generator", desc: "Crypto-secure, bulk, custom charset" },
  { name: "Base64 Encode/Decode", href: "/base64", desc: "Base64, URL encoding, HTML entities" },
  { name: "Regex Tester", href: "/regex-tester", desc: "Real-time patterns with group highlighting" },
  { name: "Color Picker & Palette", href: "/color-picker", desc: "Hex/RGB/HSL — WCAG contrast checker" },
  { name: "Code Screenshot", href: "/code-screenshot", desc: "Syntax-highlighted code images" },
  { name: "Diff Checker", href: "/diff-checker", desc: "Compare text, JSON, or images" },
  { name: "JWT Decoder", href: "/jwt-decoder", desc: "Decode and inspect JWT tokens" },
  { name: "UUID Generator", href: "/uuid-generator", desc: "v1/v4/v5 UUIDs — bulk output" },
  { name: "Lorem Ipsum", href: "/lorem-ipsum", desc: "Placeholder text — words, sentences, paragraphs" },
  { name: "Hash Generator", href: "/hash-generator", desc: "MD5, SHA-1, SHA-256, SHA-512" },
  { name: "URL Encoder/Decoder", href: "/url-encoder", desc: "Encode and decode URL components" },
  { name: "HTML Entity Encoder", href: "/html-encoder", desc: "Encode/decode HTML characters" },
  { name: "Timestamp Converter", href: "/timestamp-converter", desc: "Unix timestamps to dates" },
  { name: "Cron Builder", href: "/cron-builder", desc: "Build cron expressions with explanations" },
  { name: "CSS Gradient Generator", href: "/css-gradient", desc: "Linear/radial gradients with preview" },
  { name: "Box Shadow Generator", href: "/box-shadow", desc: "CSS box-shadow builder" },
  { name: "Barcode Generator", href: "/barcode-generator", desc: "Code128, QR, EAN, UPC in SVG/PNG" },
  { name: "Resume Builder", href: "/resume-builder", desc: "ATS-friendly PDF resumes" },
  { name: "JSON to PPTX", href: "/json-to-pptx", desc: "Generate PowerPoint from JSON data" },
  { name: "JS to PPTX", href: "/js-to-pptx", desc: "Write JS to generate decks programmatically" },
  { name: "Word to PDF", href: "/word-to-pdf", desc: "Convert DOCX to PDF in the browser" },
  { name: "Website Trust Checker", href: "/website-trust-checker", desc: "SSL, security headers & 0–100 trust score for any URL" },
  { name: "Website Content Extractor", href: "/website-content-extractor", desc: "Extract clean article text from any URL — Markdown export" },
  { name: "Markdown to HTML", href: "/markdown-to-html", desc: "Convert Markdown to semantic HTML" },
  { name: "JSON Formatter", href: "/json-formatter", desc: "Format and minify with validation" },
  { name: "HTML Minifier", href: "/html-minifier", desc: "Minify HTML, CSS, and JavaScript" },
  { name: "Favicon Generator", href: "/favicon-generator", desc: "Icons, manifest, apple-touch-icon" },
];

const faqs = [
  {
    q: "Is Toolsz really free — no hidden costs?",
    a: "Yes, completely free. There are no subscription plans, no premium tiers, no watermarks on any output, no daily usage limits, and no account required. All 219 tools are free forever. Toolsz is funded by non-intrusive contextual ads.",
  },
  {
    q: "Do my files get uploaded anywhere?",
    a: "No. This is the core of what makes Toolsz different. Every tool processes files 100% inside your browser using JavaScript and WebAssembly. Your PDF, image, or data never leaves your device — not even for a millisecond. There are no server requests containing your file data.",
  },
  {
    q: "How does client-side processing work technically?",
    a: "Toolsz uses pdf-lib and PDF.js for PDF operations, the Canvas API and browser-image-compression for images, and Tesseract.js (compiled to WebAssembly) for OCR. These libraries run directly in your browser's JavaScript engine — the same way a desktop app would work on your computer, but without an install.",
  },
  {
    q: "Can I use Toolsz offline?",
    a: "Most tools work offline after the initial page load, because the processing libraries are downloaded to your browser's cache. Heavy tools like AI background removal may need an active connection on first use to load the AI model. Once loaded, they work offline.",
  },
  {
    q: "Why is Toolsz better than Adobe Acrobat or Smallpdf?",
    a: "Adobe Acrobat charges $12.99–$19.99/month and still uploads your files to Adobe servers. Smallpdf adds watermarks on its free tier, limits you to 2 tasks/day, and also uploads files to their servers. Toolsz is free forever, adds zero watermarks, has zero usage limits, and never uploads your files.",
  },
  {
    q: "How many tools does Toolsz have?",
    a: "219 tools total: 77 PDF tools (32 core tools + 45 format converters), 113 image tools (39 core editors, 50+ format converters, 11 bulk batch tools, 6 product photography tools, and 7 OCR tools), and 29 developer tools.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      name: "About Toolsz — 219 Free Browser-Based Online Tools",
      url: "https://www.toolsz.co/about",
      description:
        "Toolsz is a suite of 219 Free, browser-based tools for PDF, image, and developer workflows. All processing is 100% client-side — files never leave your browser.",
      mainEntity: {
        "@type": "Organization",
        name: "Toolsz",
        url: "https://www.toolsz.co",
        logo: "https://www.toolsz.co/icon.png",
        description:
          "219 Free browser-based tools for PDF processing, image editing, and developer utilities. 100% client-side — files never uploaded.",
        areaServed: "Worldwide",
        knowsAbout: [
          "PDF processing",
          "Image editing",
          "Image conversion",
          "Developer tools",
          "Browser-based file utilities",
          "Client-side WebAssembly",
        ],
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.toolsz.co" },
        { "@type": "ListItem", position: 2, name: "About", item: "https://www.toolsz.co/about" },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-[calc(100vh-8rem)]">
        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-14">
          <div className="tool-hero p-6 sm:p-10">
            <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-5">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground">About</span>
            </nav>

            <div className="inline-flex items-center gap-1.5 bg-primary-muted border border-primary-border text-primary text-xs font-semibold px-2.5 py-1 rounded-full mb-5">
              <Shield className="w-3 h-3" />
              Privacy-First · Free Forever · No Signup Required
            </div>

            <h1 className="type-h1 font-display gradient-text mb-4 max-w-3xl">
              About Toolsz — 219 Free Browser-Based Online Tools
            </h1>
            <p className="text-foreground-secondary text-lg leading-relaxed max-w-2xl mb-8">
              Every tool on Toolsz runs entirely inside your browser. Your files are never uploaded, stored, or seen by any server. No subscription. No watermarks. No account. Just 219 tools that work instantly and privately.
            </p>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {[
                { value: "219", label: "Free Tools" },
                { value: "77", label: "PDF Tools" },
                { value: "113", label: "Image Tools" },
                { value: "27", label: "Developer Tools" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-white px-4 py-3 text-center">
                  <div className="text-2xl font-display font-extrabold text-primary">{s.value}</div>
                  <div className="text-xs text-foreground-secondary mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-10 sm:py-14 space-y-16">

          {/* ── Mission ───────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-1.5 h-6 rounded-full bg-primary inline-block shrink-0" />
              <h2 className="type-h2 font-display text-foreground">Our Mission</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card-premium p-5 sm:p-7">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                  <Eye className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">The Problem We Solved</h3>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  Most online tools — Smallpdf, ILovePDF, Sejda, even Adobe Acrobat Online — upload your files to their servers. Your confidential contracts, medical records, and private photos pass through third-party infrastructure. Many add watermarks or charge $12–$20/month for basic features. We thought that was wrong.
                </p>
              </div>
              <div className="glass-card-premium p-5 sm:p-7">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">What We Built Instead</h3>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  Toolsz processes everything locally using WebAssembly, the Canvas API, and browser-native technologies. The same power as desktop software — but in a URL. 219 tools, all free, all private, all instant. No upload, no account, no watermark, ever.
                </p>
              </div>
            </div>
          </section>

          {/* ── How It Works ──────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-1.5 h-6 rounded-full bg-primary inline-block shrink-0" />
              <h2 className="type-h2 font-display text-foreground">How It Works</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Cpu,
                  color: "bg-indigo-50 border-indigo-100 text-indigo-600",
                  title: "WebAssembly Processing",
                  desc: "Heavy workloads like OCR (Tesseract.js), PDF rendering (PDF.js), and image compression run as compiled WebAssembly modules directly in your browser's JavaScript engine — no server needed.",
                },
                {
                  icon: Shield,
                  color: "bg-green-50 border-green-100 text-green-600",
                  title: "Zero Network Requests",
                  desc: "When you process a file, zero bytes of your data are sent anywhere. Toolsz's servers only serve the static tool pages — they never receive your files, not even in logs.",
                },
                {
                  icon: Zap,
                  color: "bg-amber-50 border-amber-100 text-amber-600",
                  title: "Instant Results",
                  desc: "Because processing is local, there's no upload delay, no queue wait, no 'processing on server' spinner. Your files are processed at the speed of your own CPU.",
                },
              ].map((item) => (
                <div key={item.title} className="glass-card-premium p-5 sm:p-6">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-foreground-secondary text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5 sm:p-6">
              <h3 className="font-display font-semibold text-foreground mb-3">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {["pdf-lib", "PDF.js", "Tesseract.js (OCR)", "Canvas API", "WebAssembly", "browser-image-compression", "qrcode.js", "Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4", "Vercel Edge"].map((tech) => (
                  <span key={tech} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white border border-border text-foreground-secondary">{tech}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ── PDF Tools ────────────────────────────────── */}
          <section id="pdf-tools">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-indigo-500 inline-block shrink-0" />
                <div>
                  <h2 className="type-h2 font-display text-foreground">PDF Tools</h2>
                  <p className="text-sm text-foreground-secondary mt-0.5">77 tools — 32 core PDF tools + 45 format converters</p>
                </div>
              </div>
              <Link href="/pdf-tools" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                View all PDF tools <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
                <FileText className="w-3 h-3" />
                Core PDF Processing Tools (32)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {pdfCoreTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-muted/30 transition-all group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors block truncate">{tool.name}</span>
                      <span className="text-xs text-foreground-secondary leading-snug">{tool.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5">
              <div className="inline-flex items-center gap-1.5 bg-white border border-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                PDF Format Converters (45)
              </div>
              <p className="text-sm text-foreground-secondary mb-3">Every PDF format conversion — all client-side, no upload required:</p>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  "JPG↔PDF","PNG↔PDF","WebP↔PDF","GIF↔PDF","BMP↔PDF","TIFF↔PDF","AVIF↔PDF","HEIC↔PDF","SVG↔PDF",
                  "Word↔PDF","Excel↔PDF","PPT↔PDF","CSV↔PDF","TXT→PDF","Markdown↔PDF","JSON↔PDF","XML↔PDF",
                  "RTF↔PDF","EPUB↔PDF","ODT↔PDF","MOBI↔PDF","AZW3↔PDF","DOC↔PDF","PDF→HTML",
                ].map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-white border border-indigo-100 text-indigo-700 font-mono">{c}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ── Image Tools ──────────────────────────────── */}
          <section id="image-tools">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-amber-500 inline-block shrink-0" />
                <div>
                  <h2 className="type-h2 font-display text-foreground">Image Tools</h2>
                  <p className="text-sm text-foreground-secondary mt-0.5">113 tools — 39 core editors, 50+ converters, 11 bulk, 6 product, 7 OCR</p>
                </div>
              </div>
              <Link href="/image-tools" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                View all image tools <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
                <Image className="w-3 h-3" />
                Core Image Editing & Conversion Tools (39)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {imageCore.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-border hover:border-amber-300/60 hover:bg-amber-50/40 transition-all group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-foreground group-hover:text-amber-700 transition-colors block truncate">{tool.name}</span>
                      <span className="text-xs text-foreground-secondary leading-snug">{tool.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Format Converters (50+)", desc: "PNG, JPG, WebP, GIF, BMP, AVIF, TIFF, HEIC, ICO, SVG — every combination", color: "bg-amber-50 border-amber-100 text-amber-700" },
                { label: "Bulk Batch Tools (11)", desc: "Compress, resize, convert, remove backgrounds from hundreds of images at once", color: "bg-orange-50 border-orange-100 text-orange-700" },
                { label: "Product Photography (6)", desc: "Amazon, Shopify, Etsy product image sizing and optimization", color: "bg-rose-50 border-rose-100 text-rose-700" },
              ].map((g) => (
                <div key={g.label} className={`rounded-2xl border p-4 ${g.color}`}>
                  <div className="font-semibold text-sm mb-1">{g.label}</div>
                  <div className="text-xs opacity-80 leading-relaxed">{g.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Developer Tools ──────────────────────────── */}
          <section id="dev-tools">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-sky-500 inline-block shrink-0" />
                <div>
                  <h2 className="type-h2 font-display text-foreground">Developer Tools</h2>
                  <p className="text-sm text-foreground-secondary mt-0.5">29 developer utilities — JSON, regex, colors, QR, passwords, and more</p>
                </div>
              </div>
              <Link href="/dev-tools" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                View all dev tools <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {devTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-border hover:border-sky-300/60 hover:bg-sky-50/40 transition-all group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-foreground group-hover:text-sky-700 transition-colors block truncate">{tool.name}</span>
                    <span className="text-xs text-foreground-secondary leading-snug">{tool.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Privacy Story ─────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-1.5 h-6 rounded-full bg-green-500 inline-block shrink-0" />
              <h2 className="type-h2 font-display text-foreground">Privacy Is the Feature</h2>
            </div>
            <div className="glass-card-premium p-6 sm:p-8 bg-linear-to-r from-green-50/60 to-emerald-50/40">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-3">What &quot;client-side&quot; actually means</h3>
                  <p className="text-foreground-secondary text-sm leading-relaxed mb-4">
                    When you compress a PDF on Toolsz, the compression algorithm runs in JavaScript inside your Chrome or Safari tab. The PDF file is read by your browser's File API into memory — it never travels over any network connection. When you click download, the browser creates the file from that in-memory data.
                  </p>
                  <p className="text-foreground-secondary text-sm leading-relaxed">
                    Our server (Vercel) only ever delivers HTML, CSS, and JavaScript files. It has no capability to receive, store, or process your documents. This is architecturally enforced — not just a policy.
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-3">Why this matters</h3>
                  <ul className="space-y-2.5">
                    {[
                      "Upload a confidential legal contract — it stays on your device",
                      "Process medical records without a HIPAA cloud dependency",
                      "Edit passport scans without them appearing in server logs",
                      "Work with client financial data without third-party exposure",
                      "Process documents fully offline after initial page load",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-foreground-secondary">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── Comparison ───────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-1.5 h-6 rounded-full bg-primary inline-block shrink-0" />
              <h2 className="type-h2 font-display text-foreground">How Toolsz Compares</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Feature</th>
                    <th className="px-4 py-3 font-bold text-primary text-center">Toolsz ✓</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Adobe Acrobat</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Smallpdf</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Price", "Free forever", "$12.99–$19.99/mo", "$12/mo+"],
                    ["File uploads", "Never — browser only", "Yes — Adobe cloud", "Yes — their servers"],
                    ["Watermarks", "Zero — always", "None (paid)", "Yes (free tier)"],
                    ["Signup required", "Never", "Adobe ID required", "Account required"],
                    ["Daily limits", "Unlimited", "Unlimited (paid)", "2 tasks/day (free)"],
                    ["Total tools", "219", "~15 online", "~20"],
                    ["Works offline", "Most tools yes", "No", "No"],
                  ].map(([feat, t, aa, sp], i) => (
                    <tr key={feat} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-surface/30"}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{feat}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{t}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{aa}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{sp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1.5 h-6 rounded-full bg-primary inline-block shrink-0" />
              <h2 className="type-h2 font-display text-foreground">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="glass-card-premium p-5">
                  <h3 className="font-display font-bold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-foreground-secondary text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ──────────────────────────────────────── */}
          <section className="rounded-3xl border border-primary/20 bg-linear-to-r from-indigo-50/60 via-white to-violet-50/60 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-1.5 bg-primary-muted border border-primary-border text-primary text-xs font-semibold px-2.5 py-1 rounded-full mb-5">
              <Star className="w-3 h-3" />
              Start using tools — no signup, ever
            </div>
            <h2 className="type-h2 font-display gradient-text mb-3">Try Any of the 219 tools Now</h2>
            <p className="text-foreground-secondary max-w-xl mx-auto mb-8">
              Every tool is free, instant, and private. Start with your most common task.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/pdf-tools" className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover transition-colors">
                <FileText className="w-4 h-4" />
                PDF Tools (77)
              </Link>
              <Link href="/image-tools" className="flex items-center gap-2 px-6 py-3 border border-border hover:border-primary/40 text-foreground font-semibold rounded-2xl transition-colors">
                <Image className="w-4 h-4" />
                Image Tools (113)
              </Link>
              <Link href="/dev-tools" className="flex items-center gap-2 px-6 py-3 border border-border hover:border-primary/40 text-foreground font-semibold rounded-2xl transition-colors">
                <Code className="w-4 h-4" />
                Dev Tools (29)
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: Shield, label: "Files never leave your browser" },
                { icon: Zap, label: "No signup, no account" },
                { icon: Lock, label: "Zero watermarks on output" },
                { icon: Globe, label: "Works offline after first load" },
                { icon: Users, label: "Used by 500K+ users worldwide" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </section>

          {/* ── Internal links ───────────────────────────── */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-foreground-secondary mb-3 font-medium">More from Toolsz</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Best Free PDF Tools", href: "/best-free-pdf-tools" },
                { label: "Best Free Image Tools", href: "/best-free-image-tools" },
                { label: "Best Free Dev Tools", href: "/best-free-developer-tools" },
                { label: "Free Adobe Alternative", href: "/free-alternatives-to-adobe-acrobat" },
                { label: "Free Smallpdf Alternative", href: "/free-alternatives-to-smallpdf" },
                { label: "Roadmap", href: "/roadmap" },
                { label: "Privacy Policy", href: "/privacy" },
              ].map((l) => (
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
