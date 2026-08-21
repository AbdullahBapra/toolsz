import Link from "next/link";
import {
  FileDown, Merge, Scissors, PenTool, ScanSearch, FileEdit, Lock, Unlock,
  EyeOff, Droplets, RotateCw, Table2, Image, Receipt, ArrowRight, Check,
  XCircle, Shield, Zap, Star, Layers, ListOrdered, Crop,
} from "lucide-react";
import FaqAccordion, { type FaqItem } from "@/app/components/FaqAccordion";

const tools = [
  { name:"Sign PDF",            href:"/sign-pdf",          icon:PenTool,    acrobat:"Acrobat Standard $12.99/mo", toolsz:"✓ Free — no account",      desc:"Draw, type or upload a signature. Place it anywhere on any PDF. No Adobe subscription." },
  { name:"PDF Form Filler",     href:"/pdf-form-filler",   icon:FileEdit,   acrobat:"Acrobat Pro $19.99/mo",      toolsz:"✓ Free — no account",      desc:"Fill PDF form fields including text, checkboxes and dropdowns. No Adobe required." },
  { name:"PDF OCR",             href:"/pdf-ocr",           icon:ScanSearch, acrobat:"Acrobat Pro $19.99/mo",      toolsz:"✓ Free — Tesseract",        desc:"Make scanned PDFs text-searchable using Tesseract OCR engine." },
  { name:"Protect PDF",         href:"/protect-pdf",       icon:Lock,       acrobat:"Acrobat Standard",           toolsz:"✓ Free — browser only",    desc:"Add AES-256 password encryption to PDFs without Adobe." },
  { name:"Compress PDF",        href:"/compress-pdf",      icon:FileDown,   acrobat:"Acrobat Online (limited)",   toolsz:"✓ Free — unlimited",        desc:"Compress PDFs without uploading to any server." },
  { name:"Merge PDF",           href:"/merge-pdf",         icon:Merge,      acrobat:"Acrobat Online (limited)",   toolsz:"✓ Free — unlimited",        desc:"Combine multiple PDFs. No daily limits, no account." },
  { name:"Split PDF",           href:"/split-pdf",         icon:Scissors,   acrobat:"Acrobat Standard",           toolsz:"✓ Free — unlimited",        desc:"Split PDFs by page range or extract specific pages." },
  { name:"Redact PDF",          href:"/redact-pdf",        icon:EyeOff,     acrobat:"Acrobat Pro $19.99/mo",      toolsz:"✓ Free — permanent",        desc:"True permanent redaction removes data from the file — not just a visual overlay." },
  { name:"PDF to Word",         href:"/pdf-to-word",       icon:FileDown,   acrobat:"Acrobat Standard",           toolsz:"✓ Free — always",           desc:"Export PDFs to editable DOCX. Adobe charges; Toolsz is always free." },
  { name:"PDF to Excel",        href:"/pdf-to-excel",      icon:Table2,     acrobat:"Acrobat Pro",                toolsz:"✓ Free — always",           desc:"Convert PDF tables to XLSX spreadsheets. No subscription." },
  { name:"Organize PDF",        href:"/organize-pdf",      icon:Layers,     acrobat:"Acrobat Standard",           toolsz:"✓ Free — drag & drop",     desc:"Reorder, delete and duplicate pages with a visual drag-and-drop interface." },
  { name:"Watermark PDF",       href:"/watermark-pdf",     icon:Droplets,   acrobat:"Acrobat Pro",                toolsz:"✓ Free — unlimited",        desc:"Add custom text watermarks with full control over size, opacity and position." },
  { name:"Add Page Numbers",    href:"/page-numbers",      icon:ListOrdered, acrobat:"Acrobat Standard",          toolsz:"✓ Free — all positions",   desc:"Insert page numbers in any position and format. Toolsz is free." },
  { name:"Crop PDF",            href:"/crop-pdf",          icon:Crop,        acrobat:"Acrobat Standard",          toolsz:"✓ Free — precision trim",  desc:"Trim PDF margins with precision — pt, mm, or inches." },
  { name:"Rotate PDF",          href:"/rotate-pdf",        icon:RotateCw,    acrobat:"Acrobat Reader + Standard", toolsz:"✓ Free — instant",         desc:"Rotate all or individual pages in any direction." },
  { name:"Invoice Generator",   href:"/invoice-generator", icon:Receipt,     acrobat:"Not available",             toolsz:"✓ Free — 10 templates",    desc:"Create professional PDF invoices. Acrobat doesn't even offer this." },
];

const PLANS = [
  { plan:"Acrobat Reader",         price:"Free",          limits:"View & fill only — no editing, no OCR, no sign" },
  { plan:"Acrobat Standard",       price:"$12.99/month",  limits:"Sign, convert, edit — no OCR, no redaction" },
  { plan:"Acrobat Pro",            price:"$19.99/month",  limits:"Full features — expensive for occasional use" },
  { plan:"Toolsz (all tools)",     price:"Free forever",  limits:"All 77 PDF tools — no limits, no subscription" },
];

const COMPARE_TABLE = [
  { feature:"Price",                 acrobat:"$12.99–$19.99/month",     toolsz:"$0 — free forever" },
  { feature:"PDF sign",              acrobat:"Standard ($12.99/mo)",    toolsz:"✓ Free" },
  { feature:"PDF OCR",               acrobat:"Pro ($19.99/mo)",         toolsz:"✓ Free" },
  { feature:"PDF form fill",         acrobat:"Pro ($19.99/mo)",         toolsz:"✓ Free" },
  { feature:"PDF redaction",         acrobat:"Pro ($19.99/mo)",         toolsz:"✓ Free" },
  { feature:"PDF to Word",           acrobat:"Standard+",               toolsz:"✓ Free" },
  { feature:"File upload required",  acrobat:"Yes — cloud storage",     toolsz:"No — browser only" },
  { feature:"Internet required",     acrobat:"Yes (online tools)",      toolsz:"Works offline" },
  { feature:"Account/login",         acrobat:"Adobe ID required",       toolsz:"No account needed" },
  { feature:"Invoice generator",     acrobat:"Not available",           toolsz:"✓ Free — 10 templates" },
  { feature:"PDF Diff / compare",    acrobat:"Not available free",      toolsz:"✓ Free" },
  { feature:"Number of tools",       acrobat:"~15 online tools",        toolsz:"77+ tools" },
];

const faqs: FaqItem[] = [
  {
    question: "Is there a truly free Adobe Acrobat alternative in 2026?",
    answer: "Yes. Toolsz is one of the best free Adobe Acrobat alternatives in 2026. It covers all the core PDF tasks that Acrobat charges for: signing PDFs, OCR, form filling, redaction, PDF to Word, merge, split, compress, and more. All 77 tools are free with no subscription, no signup, and no file uploads. Files are processed locally in your browser.",
  },
  {
    question: "How much does Adobe Acrobat cost and why should I switch?",
    answer: "Adobe Acrobat Standard costs $12.99/month and Acrobat Pro costs $19.99/month, billed annually (roughly $156–$240/year). For occasional PDF users, this subscription rarely makes financial sense. Toolsz offers the same core PDF functionality — sign, compress, merge, split, OCR, form fill, PDF to Word — completely free with no subscription or account required.",
  },
  {
    question: "Can I sign a PDF without Adobe Acrobat for free?",
    answer: "Yes. Toolsz's Sign PDF tool lets you draw, type or upload a signature and place it on any page of any PDF. It's completely free with no account needed, and your document never leaves your device. This functionality requires Adobe Acrobat Standard ($12.99/month).",
  },
  {
    question: "Can I do PDF OCR (make scanned PDFs searchable) without Adobe Acrobat?",
    answer: "Yes. Toolsz's PDF OCR tool uses the open-source Tesseract OCR engine to add a text layer to scanned PDFs, making them searchable and copy-pasteable. This is an Acrobat Pro ($19.99/month) feature that's free on Toolsz. It runs in your browser — no upload required.",
  },
  {
    question: "Can I fill PDF forms without Adobe Acrobat?",
    answer: "Yes. Toolsz's PDF Form Filler detects all form fields in a PDF and lets you fill text boxes, check checkboxes, and select dropdowns without Adobe. It's free with no account, and the filled PDF is downloaded directly to your device without any server upload.",
  },
  {
    question: "Does Toolsz upload my files to the cloud like Adobe Acrobat?",
    answer: "No. Adobe Acrobat Online uploads your files to Adobe's servers for processing and may store them in Adobe Document Cloud. Toolsz processes everything locally in your browser using WebAssembly. Your PDFs never leave your device, making it significantly more private than Adobe's tools.",
  },
  {
    question: "What PDF features does Adobe Acrobat have that Toolsz doesn't?",
    answer: "Adobe Acrobat still has advantages for power users: advanced form creation (not just filling), digital certificate-based signatures, PDF portfolio creation, Bates numbering, and deep integration with Microsoft 365. For everyday tasks like compressing, signing, converting, OCR, form filling, and merging PDFs, Toolsz covers everything at zero cost.",
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
        { "@type": "ListItem", "position": 2, "name": "Free Adobe Acrobat Alternative", "item": "https://www.toolsz.co/free-alternatives-to-adobe-acrobat" },
      ],
    },
  ],
};

export default function FreeAlternativesToAdobeAcrobat() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-[calc(100vh-8rem)]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="tool-hero p-6 sm:p-8">
            <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-5">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground">Free Adobe Acrobat Alternative</span>
            </nav>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200/60 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
                <Check className="w-3 h-3" />
                $0 vs $19.99/month · No subscription · No upload
              </div>
              <h1 className="type-h1 font-display gradient-text mb-3">
                Best Free Adobe Acrobat Alternative in 2026
              </h1>
              <p className="text-foreground-secondary text-lg leading-relaxed max-w-2xl">
                Adobe Acrobat Pro costs $19.99/month. Toolsz gives you the same core PDF features — sign, OCR, form fill, redact, compress, merge, convert — for free, forever. No subscription, no Adobe ID, no file uploads. Your PDFs stay on your device.
              </p>

              {/* Cost calculator */}
              <div className="mt-6 p-4 rounded-2xl bg-white border border-border">
                <p className="text-xs text-foreground-secondary font-semibold uppercase tracking-wide mb-3">Adobe Acrobat Pricing vs Toolsz</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left pb-2 font-semibold text-foreground">Plan</th>
                        <th className="text-right pb-2 font-semibold text-foreground">Price</th>
                        <th className="text-left pb-2 pl-4 font-semibold text-foreground">What's missing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PLANS.map((p, i) => (
                        <tr key={p.plan} className={`${i < PLANS.length - 1 ? "border-b border-border/50" : ""}`}>
                          <td className={`py-2 font-medium ${i === PLANS.length - 1 ? "text-primary font-bold" : "text-foreground"}`}>{p.plan}</td>
                          <td className={`py-2 text-right whitespace-nowrap ${i === PLANS.length - 1 ? "text-green-600 font-bold" : "text-foreground"}`}>{p.price}</td>
                          <td className={`py-2 pl-4 text-xs ${i === PLANS.length - 1 ? "text-green-600" : "text-foreground-secondary"}`}>{p.limits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-10">

          <h2 className="type-h2 font-display text-foreground mb-2">Toolsz vs Adobe Acrobat — Feature Comparison</h2>
          <p className="text-foreground-secondary mb-6">How Toolsz covers every paid Acrobat feature, for free.</p>
          <div className="overflow-x-auto rounded-2xl border border-border mb-12">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Feature</th>
                  <th className="px-4 py-3 font-bold text-primary text-center">Toolsz</th>
                  <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Adobe Acrobat</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_TABLE.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-surface/30"}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{row.feature}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.toolsz}</td>
                    <td className="px-4 py-3 text-center text-foreground-secondary">{row.acrobat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="type-h2 font-display text-foreground mb-2">Replace Every Acrobat Feature — Free</h2>
          <p className="text-foreground-secondary mb-6">Here's exactly which Toolsz tool replaces each Adobe Acrobat paid feature.</p>
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
                    <span className="text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3"/>Adobe: {tool.acrobat}</span>
                    <span className="text-green-600 font-semibold flex items-center gap-1"><Check className="w-3 h-3"/>Toolsz: {tool.toolsz}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary shrink-0 mt-1 transition-colors" />
              </Link>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel glass-panel-info rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="type-h4 font-semibold text-foreground mb-1">No Adobe Cloud — No Data Sharing</h3>
                <p className="type-small text-foreground-secondary leading-relaxed">Adobe Acrobat Online stores your documents in Adobe Document Cloud. Toolsz never uploads your files — all processing is done locally in your browser, with no cloud storage and no data shared with any third party.</p>
              </div>
            </div>
            <div className="glass-panel glass-panel-info rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="type-h4 font-semibold text-foreground mb-1">Save $240/Year</h3>
                <p className="type-small text-foreground-secondary leading-relaxed">Adobe Acrobat Pro costs $19.99/month — $240/year. Toolsz covers all everyday PDF tasks for free, saving you the full subscription cost. If you only occasionally need PDF editing, there's no reason to pay for Adobe.</p>
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
                { label:"All PDF Tools", href:"/pdf-tools" },
                { label:"Best Free PDF Tools 2026", href:"/best-free-pdf-tools" },
                { label:"Free Smallpdf Alternative", href:"/free-alternatives-to-smallpdf" },
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
