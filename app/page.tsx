import Link from "next/link";
import FaqAccordion, { type FaqItem } from "@/app/components/FaqAccordion";
import StickyMobileCta from "@/app/components/StickyMobileCta";
import {
  FileDown,
  Image,
  Merge,
  FileText,
  Table2,
  FileEdit,
  ImageIcon,
  FileImage,
  Maximize,
  Type,
  ArrowRightLeft,
  Pencil,
  Droplets,
  Shield,
  Zap,
  ListOrdered,
  Globe,
  ArrowRight,
  Sparkles,
  Braces,
  Camera,
  Settings,
  Upload,
  Download,
  EyeOff,
  BadgeCheck,
  MousePointerClick,
  BookOpen,
  Scissors,
  RotateCw,
  Smartphone,
  QrCode,
  Lock,
  Palette,
  Binary,
  Regex,
  BookOpen as BookOpenIcon,
  Eraser,
  PenTool,
  Eye,
  Unlock,
  ScanSearch,
  Maximize2,
  Crop,
  GitCompare,
  Receipt,
  LayoutList,
  Layers,
  Image as ImageIconLucide,
  Mail,
  Database,
  Barcode,
  ArrowRightLeft as ArrowRightLeftIcon,
  Globe as GlobeIcon,
  Bug,
  PenLine,
  FolderTree,
  Ruler,
  Code,
  Film,
  MessageSquare,
  LayoutGrid,
  Grid3x3,
} from "lucide-react";

// ── Homepage-featured tools: most searched & highest-value per category ────────

const homepagePdfTools = [
  { name: "Compress PDF",   desc: "Reduce PDF file size without quality loss — up to 80% smaller.",       href: "/compress-pdf",    icon: FileDown,  badge: "Most Popular" },
  { name: "Merge PDF",      desc: "Combine multiple PDFs into a single document in seconds.",              href: "/merge-pdf",       icon: Merge,     badge: null },
  { name: "PDF to Word",    desc: "Convert PDF to editable DOCX — free, client-side, no upload.",         href: "/pdf-to-word",     icon: FileDown,  badge: null },
  { name: "PDF to JPG",     desc: "Extract crisp JPG images from every PDF page.",                         href: "/pdf-to-jpg",      icon: Image,     badge: null },
  { name: "Split PDF",      desc: "Extract pages or split by ranges — download individually or as ZIP.",   href: "/split-pdf",       icon: Scissors,  badge: null },
  { name: "Sign PDF",       desc: "Draw, type, or upload your signature — place it on any page. Free.",    href: "/sign-pdf",        icon: PenTool,   badge: null },
  { name: "PDF Editor",     desc: "Annotate, draw, highlight, and add text to PDFs — no Adobe needed.",   href: "/pdf-editor",      icon: FileEdit,  badge: null },
  { name: "Unlock PDF",     desc: "Remove PDF password protection instantly — free, private.",             href: "/unlock-pdf",      icon: Unlock,    badge: null },
  { name: "Invoice Generator", desc: "Create professional PDF invoices — 10 templates, no watermark.",   href: "/invoice-generator", icon: Receipt, badge: "Free" },
];

const homepageImageTools = [
  { name: "Compress Image",     desc: "Reduce image file size while keeping visual quality — all formats.",    href: "/compress-image",    icon: ImageIcon,       badge: "Most Popular" },
  { name: "Background Remover", desc: "AI removes backgrounds in seconds — full resolution, no watermark.",   href: "/remove-bg",         icon: Eraser,          badge: "AI" },
  { name: "Resize Image",       desc: "Scale to any pixel dimension or percentage — instant preview.",         href: "/resize-image",      icon: Maximize,        badge: null },
  { name: "HEIC to JPG",        desc: "Convert iPhone HEIC/HEIF photos to JPG, PNG, or WebP — batch.",        href: "/heic-to-jpg",       icon: Smartphone,      badge: null },
  { name: "Image to PDF",       desc: "Combine images into a single professional PDF document.",              href: "/image-to-pdf",      icon: FileImage,       badge: null },
  { name: "PNG to JPG",         desc: "Convert PNG to JPG with quality control — handles transparency.",       href: "/png-to-jpg",        icon: ArrowRightLeft,  badge: null },
  { name: "Image to Text",      desc: "Extract text from images using OCR — 40+ languages supported.",        href: "/image-to-text",     icon: Type,            badge: null },
  { name: "Passport & Visa Photo", desc: "Create compliant passport photos for 60+ countries. 300 DPI.",    href: "/passport-photo",    icon: Camera,          badge: null },
  { name: "Image Upscaler",     desc: "Upscale images up to 4× with super-resolution sharpening.",            href: "/upscale-image",     icon: Maximize2,       badge: "AI" },
];

const homepageDevTools = [
  { name: "JSON Preview",          desc: "Visualize JSON as an interactive collapsible tree — copy paths.",    href: "/json-preview",      icon: Braces,          badge: "Most Popular" },
  { name: "QR Code Generator",     desc: "Generate QR codes for URLs, WiFi, vCards. Custom colors & SVG.",    href: "/qr-code",           icon: QrCode,          badge: null },
  { name: "Password Generator",    desc: "Crypto-secure passwords in bulk — custom length & character sets.",  href: "/password-generator", icon: Lock,           badge: null },
  { name: "Base64 Encode / Decode",desc: "Encode and decode Base64, URL encoding, and HTML entities.",        href: "/base64",            icon: Binary,          badge: null },
  { name: "Regex Tester",          desc: "Test regex patterns in real time with group highlighting & cheat sheet.",href: "/regex-tester",  icon: Regex,           badge: null },
  { name: "Color Picker & Palette",desc: "Pick colors in Hex, RGB, HSL — WCAG contrast checker + image palette.",href: "/color-picker",  icon: Palette,         badge: null },
  { name: "Code Screenshot",       desc: "Create beautiful syntax-highlighted code images for social media.",  href: "/code-screenshot",  icon: Camera,          badge: null },
  { name: "Diff Checker",          desc: "Compare text, JSON, or images side by side with diff highlights.",   href: "/diff-checker",     icon: GitCompare,      badge: null },
  { name: "Favicon Generator",     desc: "Generate .ico, multi-size PNGs, apple-touch-icon, and manifest.json.",href: "/favicon-generator", icon: GlobeIcon,     badge: null },
];

const homepageSections = [
  {
    id: "pdf",
    label: "PDF Tools",
    sublabel: "Compress, merge, split, sign, convert, and edit PDFs",
    href: "/pdf-tools",
    count: "77",
    ctaCopy: "77 PDF tools — compress, merge, sign, convert, OCR, edit, and 45 format converters",
    ctaLabel: "Explore All PDF Tools",
    data: homepagePdfTools,
    accentFrom: "from-indigo-50",
    accentTo: "to-violet-50",
    borderColor: "border-indigo-100",
  },
  {
    id: "image",
    label: "Image Tools",
    sublabel: "Compress, resize, convert, remove backgrounds, and enhance photos",
    href: "/image-tools",
    count: "113",
    ctaCopy: "113 image tools — 39 core editors, 50+ format converters, bulk tools, product & OCR",
    ctaLabel: "Explore All Image Tools",
    data: homepageImageTools,
    accentFrom: "from-amber-50",
    accentTo: "to-orange-50",
    borderColor: "border-amber-100",
  },
  {
    id: "dev",
    label: "Developer Tools",
    sublabel: "JSON, regex, color picker, QR codes, passwords, and more",
    href: "/dev-tools",
    count: "27",
    ctaCopy: "29 developer tools — JSON, regex, Base64, QR codes, diff checker, resume builder, and more",
    ctaLabel: "Explore All Dev Tools",
    data: homepageDevTools,
    accentFrom: "from-sky-50",
    accentTo: "to-blue-50",
    borderColor: "border-sky-100",
  },
];

const features = [
  {
    icon: Shield,
    title: "100% Client-Side — Files Never Leave Your Browser",
    desc: "Unlike other online tools that upload your files to servers, Toolsz processes everything locally. Your documents, images, and data stay on your device — nothing is ever uploaded, stored, or shared.",
  },
  {
    icon: Zap,
    title: "No Watermarks, No Premium Tiers, No Signup",
    desc: "Every tool is completely free with no hidden paywalls. Other tools add watermarks or charge for full-quality output — we never do. Just open a tool and start using it immediately.",
  },
  {
    icon: Globe,
    title: "150+ Tools for PDF, Image & Developer Tasks",
    desc: "Compress PDFs, remove image backgrounds, generate QR codes, convert 50+ image formats, and more — all in one place. Works on desktop, tablet, and mobile with no installation required.",
  },
];

const howItWorks = [
  { step: 1, icon: Upload,   title: "Upload your file",        desc: "Drag and drop or click to browse. Supports PDFs, images, JSON, and more — up to 50 MB." },
  { step: 2, icon: Settings, title: "Customize & process",     desc: "Adjust settings to your needs, then hit process. Everything runs right in your browser." },
  { step: 3, icon: Download, title: "Download the result",     desc: "Get your polished output instantly. Try another file or explore related tools." },
];

const trustSignals = [
  { icon: Shield,           label: "100% client-side — no server uploads" },
  { icon: EyeOff,           label: "No watermark on any output" },
  { icon: BadgeCheck,       label: "100% free — no premium tiers" },
  { icon: Lock,             label: "Files never leave your browser" },
  { icon: MousePointerClick,label: "No signup or account needed" },
];

const faqItems: FaqItem[] = [
  {
    question: "What is the best free online PDF compressor?",
    answer: "Toolsz offers the best free online PDF compressor because it runs entirely in your browser — no file uploads, no watermarks, and no signup. Unlike other tools that process files on remote servers, Toolsz keeps your documents 100% private while reducing PDF file size by up to 60-80%.",
  },
  {
    question: "How do I compress a PDF without losing quality?",
    answer: "Open the Compress PDF tool, drag and drop your file, choose a compression level (Low for best quality, Medium for balanced, High for smallest size), and click Compress. The tool rebuilds your PDF locally in the browser, removing redundant data while keeping text crisp and images sharp.",
  },
  {
    question: "Is it safe to use online PDF tools for sensitive documents?",
    answer: "Toolsz is the safest option for sensitive documents because all processing happens locally in your browser — your files are never uploaded to any server. Other online PDF tools upload your documents to cloud servers for processing, but Toolsz uses client-side technology so your data never leaves your device.",
  },
  {
    question: "Why do free PDF tools add watermarks?",
    answer: "Many free PDF tools add watermarks because they operate on a freemium model — they give you a basic result for free but charge for clean output. Toolsz never adds watermarks to any output. Every tool is completely free with no premium tiers, no signup, and no watermarks on your files.",
  },
  {
    question: "Can I merge PDFs online for free without uploading to a server?",
    answer: "Yes — Toolsz lets you merge multiple PDFs into one document entirely in your browser. No file uploads, no server processing, and no watermarks on the merged result. Just drag and drop your PDFs, reorder pages, and download the combined file instantly.",
  },
  {
    question: "How do I remove background from an image for free?",
    answer: "Open the Background Remover tool, upload your image, and the AI automatically removes the background in seconds — full resolution output, no watermarks, and no signup. You can add a custom background color or download with a transparent background. Everything runs locally in your browser.",
  },
];

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Toolsz",
  url: "https://www.toolsz.co",
  logo: "https://www.toolsz.co/logo.png",
  description: "Fast, free, client-side tools for PDF, Images, and Developers. No signup, no watermark, no data retention.",
  sameAs: [],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Toolsz",
  url: "https://www.toolsz.co",
  description: "A clean suite of PDF, Image, and Development tools. Lightning fast, completely free, and beautifully simple.",
};

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />

      {/* ── Hero ── */}
      <section
        aria-label="Hero"
        className="relative -mt-[72px] sm:-mt-[76px] pt-[144px] sm:pt-[156px] md:pt-[208px] pb-24 md:pb-36 px-5 md:px-6 lg:px-8"
        style={{ background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, rgba(139, 92, 246, 0.03) 20%, transparent 40%)', overflowClipMargin: '80px' } as React.CSSProperties}
      >
        <div className="absolute inset-0 pointer-events-none -z-10" style={{ overflow: 'visible', clipPath: 'inset(-120px 0 0 0)' }}>
          <div className="absolute top-[-30%] left-[15%] w-[45%] h-[55%] rounded-full bg-primary/20 blur-[120px] animate-blob" />
          <div className="absolute top-[-15%] right-[8%] w-[38%] h-[50%] rounded-full bg-violet-600/20 blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-10%] left-[35%] w-[50%] h-[45%] rounded-full bg-indigo-400/20 blur-[120px] animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <a
            href="#tools"
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-border shadow-sm hover:border-primary-border hover:shadow-md transition-all duration-300 mb-8 sm:mb-12 font-medium text-sm text-foreground-secondary hover:text-foreground"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            </span>
            150+ free online utilities — PDF, Image &amp; Dev
            <ArrowRight className="w-4 h-4 text-foreground-muted" />
          </a>

          <h1 className="type-hero mb-6 md:mb-8 animate-reveal">
            <span className="gradient-text">Your files.</span><br />
            <span className="gradient-text">Your browser.</span><br />
            <span className="gradient-text-accent">Zero compromise.</span>
          </h1>

          <p className="text-foreground-secondary max-w-2xl mx-auto mb-10 text-lg md:text-xl font-medium leading-relaxed animate-reveal delay-100">
            A premium suite of utility tools for PDF, image, and developer workflows.
            Completely free. 100% private. No watermarks attached.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal delay-200 w-full sm:w-auto">
            <a href="#tools" className="btn btn-primary btn-pill w-full sm:w-auto">
              Explore All Tools
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link href="/pdf-tools" className="btn btn-secondary btn-pill w-full sm:w-auto">PDF Tools</Link>
            <Link href="/image-tools" className="btn btn-secondary btn-pill w-full sm:w-auto">Image Tools</Link>
          </div>

          <div className="mt-14 animate-reveal delay-300 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-foreground-muted uppercase tracking-wider font-mono">
            <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Client-Side Only</span>
            <span className="flex items-center gap-2"><EyeOff className="w-5 h-5 text-primary" /> No Uploads</span>
            <span className="flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-primary" /> Free Forever</span>
          </div>
        </div>
      </section>

      <div id="tools" className="w-full frost-divider max-w-[1200px] mx-auto" />

      {/* ── Tool Sections ── */}
      {homepageSections.map((section) => (
        <section
          key={section.id}
          className="py-10 md:py-14 px-5 md:px-6 lg:px-8 max-w-[1200px] mx-auto w-full"
        >
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-8 rounded-full bg-primary mt-1 shrink-0" />
              <div>
                <h2 className="type-h2 font-display text-foreground leading-tight">
                  {section.label}
                </h2>
                <p className="text-foreground-secondary text-sm mt-0.5">{section.sublabel}</p>
              </div>
            </div>
            {/* Prominent "View All" button */}
            <Link
              href={section.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-200 shrink-0"
            >
              View All {section.count} Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Tool grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {section.data.map((tool) => (
              <Link
                href={tool.href}
                key={tool.name}
                className="glass-card-premium p-5 sm:p-7 group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary-border transition-all duration-200">
                    <tool.icon className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  {"badge" in tool && tool.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      tool.badge === "Most Popular" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                      tool.badge === "AI"           ? "bg-violet-50 text-violet-600 border-violet-100" :
                      tool.badge === "Free"         ? "bg-green-50 text-green-600 border-green-100" :
                                                      "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>{tool.badge}</span>
                  )}
                </div>
                <h3 className="type-h3 font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200 break-words">
                  {tool.name}
                </h3>
                <p className="type-small text-foreground-secondary leading-relaxed flex-1 break-words">{tool.desc}</p>
                <div className="mt-5 flex items-center gap-2 text-primary type-label opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Open tool <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>

          {/* Section CTA banner */}
          <div className={`mt-8 rounded-2xl bg-linear-to-r ${section.accentFrom} ${section.accentTo} border ${section.borderColor} px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <div>
              <p className="text-sm font-bold text-foreground">{section.ctaCopy}</p>
              <p className="text-xs text-foreground-secondary mt-0.5">Free, private, browser-based — no signup, no watermarks</p>
            </div>
            <Link
              href={section.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-200 shrink-0 whitespace-nowrap"
            >
              {section.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      ))}

      {/* ── How It Works ── */}
      <section className="py-16 md:py-24 px-5 md:px-6 lg:px-8 border-t border-border" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 600px" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="type-label text-primary bg-primary-subtle border border-primary-border px-3 py-1.5 rounded-[100px] inline-flex items-center gap-2 mb-4">
              <ListOrdered className="w-4 h-4" />
              3 Simple Steps
            </span>
            <h2 className="type-h2 font-display text-foreground">How it works.</h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-[44px] left-[16.67%] right-[16.67%] h-px bg-border z-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center relative z-10">
                  <div className="w-16 h-16 sm:w-[100px] sm:h-[100px] rounded-full bg-white border-2 border-border flex items-center justify-center mb-5 sm:mb-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                  </div>
                  <span className="type-label text-primary mb-1.5 sm:mb-2">Step {item.step}</span>
                  <h3 className="type-h3 font-semibold mb-1.5 sm:mb-2 text-foreground">{item.title}</h3>
                  <p className="type-small text-foreground-secondary leading-relaxed max-w-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="py-12 md:py-16 px-5 md:px-6 lg:px-8 bg-white border-t border-border" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 300px" }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="type-h2 font-display text-foreground mb-10">
            Unlike other tools — <span className="text-primary">no uploads, no watermarks, no premium.</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-8 gap-y-3">
            {trustSignals.map((signal) => (
              <div key={signal.label} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[100px] bg-surface-1 border border-border">
                <signal.icon className="w-4 h-4 sm:w-5 sm:h-5 text-success shrink-0" />
                <span className="text-xs sm:text-[13px] font-medium text-foreground whitespace-nowrap">{signal.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 md:py-24 px-5 md:px-6 lg:px-8 border-t border-border" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 500px" }}>
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-12">
            <span className="type-label text-primary bg-primary-subtle border border-primary-border px-3 py-1.5 rounded-[100px] inline-flex items-center gap-2 mb-4">FAQ</span>
            <h2 className="type-h2 font-display text-foreground">Common questions.</h2>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      <StickyMobileCta />

      {/* ── Features ── */}
      <section className="py-12 md:py-16 px-5 md:px-6 lg:px-8 border-t border-border" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 400px" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-1.5 h-8 rounded-full bg-primary" />
            <h2 className="type-h2 font-display text-foreground">Built on principles.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center mb-4 sm:mb-5">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="type-h3 font-semibold mb-2 text-foreground break-words">{feature.title}</h3>
                <p className="type-small text-foreground-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
