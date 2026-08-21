import Link from "next/link";
import {
  FileDown, Merge, Scissors, PenTool, ScanSearch, FileEdit, Unlock, Lock,
  EyeOff, RotateCw, Droplets, Table2, Image, ArrowRight, Shield, Check,
  XCircle, Star, Zap, ArrowLeft,
} from "lucide-react";
import FaqAccordion, { type FaqItem } from "@/app/components/FaqAccordion";

const tools = [
  { name:"Compress PDF",        href:"/compress-pdf",      icon:FileDown,   smallpdf:"✓ Free (watermark)",  toolsz:"✓ Free — no watermark",    desc:"Reduce PDF file size. Unlike Smallpdf, the output has zero watermarks." },
  { name:"Merge PDF",           href:"/merge-pdf",         icon:Merge,      smallpdf:"✓ Free (2/day limit)", toolsz:"✓ Free — unlimited",        desc:"Combine unlimited PDFs with no daily cap and no account required." },
  { name:"Split PDF",           href:"/split-pdf",         icon:Scissors,   smallpdf:"✓ Free (watermark)",  toolsz:"✓ Free — no watermark",    desc:"Extract pages or split by range with clean watermark-free output." },
  { name:"PDF to Word",         href:"/pdf-to-word",       icon:FileDown,   smallpdf:"Paid only",            toolsz:"✓ Free — always",           desc:"PDF to DOCX conversion is behind Smallpdf's paywall. Free on Toolsz." },
  { name:"PDF to Excel",        href:"/pdf-to-excel",      icon:Table2,     smallpdf:"Paid only",            toolsz:"✓ Free — always",           desc:"Extract PDF tables to XLSX — premium on Smallpdf, free here." },
  { name:"PDF OCR",             href:"/pdf-ocr",           icon:ScanSearch, smallpdf:"Paid only",            toolsz:"✓ Free — always",           desc:"Make scanned PDFs searchable. Smallpdf charges for this. We don't." },
  { name:"Sign PDF",            href:"/sign-pdf",          icon:PenTool,    smallpdf:"✓ Free (limited)",    toolsz:"✓ Free — unlimited",        desc:"Draw or type your signature on any PDF. No account, no limits." },
  { name:"PDF Form Filler",     href:"/pdf-form-filler",   icon:FileEdit,   smallpdf:"✓ Free",               toolsz:"✓ Free — no upload",        desc:"Fill PDF forms without sending files to any server." },
  { name:"Unlock PDF",          href:"/unlock-pdf",        icon:Unlock,     smallpdf:"✓ Free (1 file/hr)",  toolsz:"✓ Free — unlimited",        desc:"Remove PDF password protection with no hourly limits." },
  { name:"Protect PDF",         href:"/protect-pdf",       icon:Lock,       smallpdf:"✓ Free",               toolsz:"✓ Free — no upload",        desc:"Add password encryption to PDFs. Files stay in your browser." },
  { name:"Rotate PDF",          href:"/rotate-pdf",        icon:RotateCw,   smallpdf:"✓ Free",               toolsz:"✓ Free — no upload",        desc:"Rotate PDF pages without uploading to any server." },
  { name:"Watermark PDF",       href:"/watermark-pdf",     icon:Droplets,   smallpdf:"Paid only",            toolsz:"✓ Free — always",           desc:"Add watermarks to PDFs — a paid feature on Smallpdf." },
  { name:"Redact PDF",          href:"/redact-pdf",        icon:EyeOff,     smallpdf:"✗ Not available",      toolsz:"✓ Free — unique",           desc:"True permanent redaction. Smallpdf doesn't offer this at all." },
  { name:"PDF to JPG",          href:"/pdf-to-jpg",        icon:Image,      smallpdf:"✓ Free (watermark)",  toolsz:"✓ Free — no watermark",    desc:"Convert PDF pages to JPG images with no watermarks." },
];

const COMPARE_TABLE = [
  { feature:"Price",                    smallpdf:"Free tier + paid plans",     toolsz:"100% free, forever" },
  { feature:"Watermarks on output",     smallpdf:"Yes (free tier)",             toolsz:"Never" },
  { feature:"File uploads",             smallpdf:"Files uploaded to servers",   toolsz:"Zero — browser only" },
  { feature:"Signup required",          smallpdf:"Yes — account required",      toolsz:"No — use instantly" },
  { feature:"Daily usage limit",        smallpdf:"2 tasks/day (free tier)",     toolsz:"Unlimited" },
  { feature:"PDF to Word",              smallpdf:"Paid only",                   toolsz:"Free" },
  { feature:"PDF OCR",                  smallpdf:"Paid only",                   toolsz:"Free" },
  { feature:"Watermark PDF",            smallpdf:"Paid only",                   toolsz:"Free" },
  { feature:"True PDF redaction",       smallpdf:"Not available",               toolsz:"Free" },
  { feature:"PDF Diff / compare",       smallpdf:"Not available",               toolsz:"Free" },
  { feature:"PDF Flipbook",             smallpdf:"Not available",               toolsz:"Free" },
  { feature:"Number of tools",          smallpdf:"~20",                         toolsz:"77+" },
  { feature:"Privacy",                  smallpdf:"Files stored on servers",     toolsz:"Files never leave device" },
];

const faqs: FaqItem[] = [
  {
    question: "Is there a free Smallpdf alternative with no watermarks?",
    answer: "Yes — Toolsz is a completely free Smallpdf alternative with no watermarks on any output, ever. Unlike Smallpdf's free tier which adds watermarks and limits you to 2 tasks per day, Toolsz has no tier restrictions, no watermarks, and no signup requirement. All 77 PDF tools are free forever.",
  },
  {
    question: "Why does Smallpdf add watermarks to my PDF?",
    answer: "Smallpdf adds watermarks on the free tier as a monetization strategy to push users toward their paid plans. The only way to remove Smallpdf watermarks is to subscribe to Smallpdf Pro (starting at $12/month). Toolsz offers the same PDF compression, merging, splitting and conversion without any watermarks — for free.",
  },
  {
    question: "Does Toolsz upload my files like Smallpdf does?",
    answer: "No. This is the biggest difference. Smallpdf uploads your files to their servers in the Netherlands for processing. Toolsz processes everything 100% client-side using JavaScript and WebAssembly in your browser. Your PDFs never leave your device, making it significantly more private and secure.",
  },
  {
    question: "What does Toolsz have that Smallpdf doesn't?",
    answer: "Toolsz has several tools that Smallpdf doesn't offer at all: PDF Diff (compare two PDFs side by side), PDF Flipbook (interactive 3D page viewer), PDF Highlight Extractor, Smart PDF Cleaner, PDF Quality Score, and true permanent PDF Redaction. Toolsz also offers PDF OCR, PDF to Word, and Watermark PDF for free — tools that are behind Smallpdf's paywall.",
  },
  {
    question: "Is Toolsz really free, or will I hit a limit?",
    answer: "Toolsz is genuinely 100% free with no usage limits. There's no free tier, no premium tier, no daily caps, no file size limits (beyond your browser's memory), and no watermarks on any output. All 77 PDF tools are unlimited and free, funded by optional non-intrusive ads.",
  },
  {
    question: "How do I compress a PDF for free without Smallpdf?",
    answer: "Go to toolsz.co/compress-pdf, drag your PDF in, choose your compression level, and download. The entire process runs in your browser — nothing is uploaded, and the compressed PDF has zero watermarks. It typically reduces file size by 40–80% depending on the content.",
  },
  {
    question: "Can I merge PDFs for free without a Smallpdf account?",
    answer: "Yes. Use Toolsz's Merge PDF tool at toolsz.co/merge-pdf. Upload multiple PDFs, drag to reorder them, and download the merged file. No account required, no daily limits, no watermarks. Smallpdf limits free users to 2 merges per day and requires an account.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question", "name": f.question,
        "acceptedAnswer": { "@type": "Answer", "text": f.answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.toolsz.co" },
        { "@type": "ListItem", "position": 2, "name": "Free Smallpdf Alternative", "item": "https://www.toolsz.co/free-alternatives-to-smallpdf" },
      ],
    },
  ],
};

export default function FreeAlternativesToSmallpdf() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-[calc(100vh-8rem)]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="tool-hero p-6 sm:p-8">
            <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-5">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground">Free Smallpdf Alternative</span>
            </nav>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200/60 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
                <Check className="w-3 h-3" />
                No watermarks · No signup · No uploads
              </div>
              <h1 className="type-h1 font-display gradient-text mb-3">
                Best Free Smallpdf Alternative in 2026
              </h1>
              <p className="text-foreground-secondary text-lg leading-relaxed max-w-2xl">
                Tired of Smallpdf's watermarks, 2-tasks-per-day limit, and server uploads? Toolsz gives you 77 PDF tools that are completely free with no watermarks, no daily caps, no account, and zero file uploads. Your PDFs never leave your browser.
              </p>

              {/* Pain point strip */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { pain:"Smallpdf adds watermarks", fix:"Toolsz: zero watermarks, ever" },
                  { pain:"Smallpdf: 2 tasks/day free", fix:"Toolsz: unlimited usage" },
                  { pain:"Smallpdf uploads your files", fix:"Toolsz: 100% browser-based" },
                ].map(r => (
                  <div key={r.pain} className="rounded-xl border border-border bg-white p-3">
                    <div className="flex items-center gap-1.5 text-red-500 text-xs mb-1.5">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{r.pain}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>{r.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-10">

          {/* Full comparison table */}
          <h2 className="type-h2 font-display text-foreground mb-2">Toolsz vs Smallpdf — Full Comparison</h2>
          <p className="text-foreground-secondary mb-6">Feature-by-feature breakdown of how Toolsz replaces Smallpdf.</p>
          <div className="overflow-x-auto rounded-2xl border border-border mb-12">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Feature</th>
                  <th className="px-4 py-3 font-bold text-primary text-center">Toolsz ✓</th>
                  <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Smallpdf</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_TABLE.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-surface/30"}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{row.feature}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.toolsz}</td>
                    <td className="px-4 py-3 text-center text-foreground-secondary">{row.smallpdf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tool-by-tool */}
          <h2 className="type-h2 font-display text-foreground mb-2">Every Smallpdf Tool — Available Free on Toolsz</h2>
          <p className="text-foreground-secondary mb-6">Toolsz covers everything Smallpdf offers — and more — completely free.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map(tool => (
              <Link key={tool.href} href={tool.href} className="glass-card-premium p-4 group flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-muted border border-primary-border flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-all">
                  <tool.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-1">{tool.name}</h3>
                  <p className="text-xs text-foreground-secondary mb-2 leading-relaxed">{tool.desc}</p>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3"/>Smallpdf: {tool.smallpdf}</span>
                    <span className="text-green-600 font-semibold flex items-center gap-1"><Check className="w-3 h-3"/>Toolsz: {tool.toolsz}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary shrink-0 mt-1 transition-colors" />
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <h2 className="type-h2 font-display text-foreground mb-6">Frequently Asked Questions</h2>
            <FaqAccordion items={faqs} />
          </div>

          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-sm text-foreground-secondary mb-3 font-medium">Explore more</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label:"All PDF Tools", href:"/pdf-tools" },
                { label:"Best Free PDF Tools", href:"/best-free-pdf-tools" },
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
