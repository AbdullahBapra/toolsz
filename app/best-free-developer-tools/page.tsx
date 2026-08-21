import Link from "next/link";
import {
  Braces, Server, Camera, Settings, Database, Mail, QrCode, Barcode, Binary,
  Regex, Palette, ArrowRightLeft, Lock, GitCompare, Bug, PenLine, FolderTree,
  FileText, ArrowRight, Shield, Zap, Check, Star, BookOpen, Sparkles, ShieldCheck,
} from "lucide-react";
import FaqAccordion, { type FaqItem } from "@/app/components/FaqAccordion";

const tools = [
  { name:"JSON Preview",                href:"/json-preview",          icon:Braces,         badge:"Most popular", desc:"Visualize JSON as a collapsible, searchable interactive tree. Faster than browser devtools." },
  { name:"Regex Tester",                href:"/regex-tester",          icon:Regex,                                desc:"Test regex patterns in real time with match highlights, groups & a built-in cheat sheet." },
  { name:"Diff Checker",                href:"/diff-checker",          icon:GitCompare,     badge:"Unique",       desc:"Compare text, JSON or images side by side. Line-by-line diff with highlights." },
  { name:"Code Screenshot",             href:"/code-screenshot",       icon:Camera,                               desc:"Create beautiful, syntax-highlighted code snippet images for sharing and presentations." },
  { name:"Base64 Encode / Decode",      href:"/base64",                icon:Binary,                               desc:"Encode and decode Base64, URL encoding and HTML entities — instant, no limits." },
  { name:"QR Code Generator",           href:"/qr-code",               icon:QrCode,                               desc:"Generate QR codes for URLs, WiFi credentials, vCards and plain text. Download as PNG or SVG." },
  { name:"JSON ↔ CSV Converter",        href:"/json-csv",              icon:ArrowRightLeft,                       desc:"Convert JSON to CSV and back. Choose delimiter, handle nested objects, download instantly." },
  { name:"Password Generator",          href:"/password-generator",    icon:Lock,                                 desc:"Generate crypto-secure passwords with custom rules. Bulk generate hundreds at once." },
  { name:"Color Picker & Palette",      href:"/color-picker",          icon:Palette,                              desc:"Pick colors in Hex, RGB and HSL. Check WCAG contrast ratios for accessibility." },
  { name:"Markdown Studio",             href:"/markdown-docs",         icon:Settings,                             desc:"Write and preview Markdown with live rendering. Export to HTML or PDF." },
  { name:"Fake Data Generator",         href:"/fake-data",             icon:Database,                             desc:"Generate realistic mock data — names, emails, addresses, credit cards. Download as CSV or JSON." },
  { name:"API Formatter",               href:"/api-formatter",         icon:Server,                               desc:"Paste any API response to inspect headers, status code and beautify the JSON body." },
  { name:"Barcode Generator",           href:"/barcode",               icon:Barcode,                              desc:"Generate Code128, EAN-13, UPC-A, ITF and more barcodes. Download as SVG or PNG." },
  { name:"Email Signature Generator",   href:"/email-signature",       icon:Mail,                                 desc:"Create professional HTML email signatures for Gmail, Outlook and Apple Mail. Copy in one click." },
  { name:"SVG Optimizer",               href:"/svg-optimizer",         icon:Sparkles,                             desc:"Clean and reduce SVG file size using SVGO. Paste Figma or Illustrator SVGs and compress." },
  { name:"Favicon Generator",           href:"/favicon-generator",     icon:QrCode,                               desc:"Create ICO, PNG and web manifest icons from any image. Generates all sizes at once." },
  { name:"Word Counter",                href:"/word-counter",          icon:FileText,                             desc:"Count words, characters, sentences and estimate reading time. Keyword density for SEO." },
  { name:"CSS Gradient Generator",      href:"/gradient-generator",    icon:Palette,                              desc:"Build linear, radial and conic CSS gradients visually. Copy the CSS in one click." },
  { name:"Lorem Ipsum Generator",       href:"/lorem-ipsum",           icon:BookOpen,                             desc:"Generate placeholder paragraphs, sentences or words. Choose language and count." },
  { name:"Multi-Format Converter",      href:"/multi-converter",       icon:ArrowRightLeft, badge:"Unique",       desc:"Convert files to Text, Table, JSON and Images all at once. One upload, multiple outputs." },
  { name:"CSV Visual Debugger",         href:"/csv-debugger",          icon:Bug,            badge:"Unique",       desc:"Find duplicate rows, empty cells and column inconsistencies in CSV files visually." },
  { name:"Bulk File Renamer",           href:"/bulk-renamer",          icon:PenLine,        badge:"Unique",       desc:"Rename files using date, numbering and pattern rules. Process entire folders at once." },
  { name:"Folder Structure Visualizer", href:"/folder-visualizer",    icon:FolderTree,     badge:"Unique",       desc:"Generate an interactive tree view of your project structure. Detects unused files." },
  { name:"Resume Builder",              href:"/resume-builder",        icon:FileText,       badge:"New",          desc:"Build ATS-optimized resumes with 20+ templates. Live preview, PDF export, auto-save." },
  { name:"Word to PDF",                 href:"/word-to-pdf",           icon:FileText,       badge:"New",          desc:"Convert DOCX Word documents to PDF entirely in your browser. No upload, no LibreOffice needed." },
  { name:"JSON to PPTX",               href:"/json-to-pptx",          icon:Braces,         badge:"New",          desc:"Generate PowerPoint presentations from JSON data. Automate slide decks from any data source." },
  { name:"JS to PPTX",                 href:"/js-to-pptx",            icon:Braces,         badge:"New",          desc:"Write JavaScript to generate PowerPoint decks programmatically. Full pptxgenjs API." },
  { name:"Website Trust Checker",      href:"/website-trust-checker", icon:ShieldCheck,    badge:"New",          desc:"Enter any URL to get a 0-100 trust score — checks SSL, security headers, robots.txt, sitemap, and OG tags." },
  { name:"Website Content Extractor",  href:"/website-content-extractor",icon:BookOpen,   badge:"New",          desc:"Paste any article URL to extract clean readable text with no ads or clutter. Export as Markdown or plain text." },
];

const COMPARE = [
  { feature:"Price",              toolsz:"Free forever",   jsoncrack:"Free (limited)", carbon:"Free",       regex101:"Free" },
  { feature:"File uploads",       toolsz:"None — browser", jsoncrack:"Server",          carbon:"Server",     regex101:"None" },
  { feature:"Signup required",    toolsz:"No",             jsoncrack:"Yes (Pro)",       carbon:"No",         regex101:"No" },
  { feature:"Tool variety",       toolsz:"29 tools",       jsoncrack:"1 tool",          carbon:"1 tool",     regex101:"1 tool" },
  { feature:"JSON + Regex + QR",  toolsz:"✓ All in one",   jsoncrack:"JSON only",       carbon:"Code only",  regex101:"Regex only" },
  { feature:"Offline capable",    toolsz:"✓ Yes",          jsoncrack:"No",              carbon:"No",         regex101:"No" },
  { feature:"Diff checker",       toolsz:"✓ Free",         jsoncrack:"✗",               carbon:"✗",          regex101:"✗" },
  { feature:"Fake data gen",      toolsz:"✓ Free",         jsoncrack:"✗",               carbon:"✗",          regex101:"✗" },
  { feature:"Privacy",            toolsz:"100% local",     jsoncrack:"Server process",  carbon:"Server",     regex101:"Local" },
];

const faqs: FaqItem[] = [
  {
    question: "What are the best free developer tools online in 2026?",
    answer: "The best free browser-based developer tools in 2026 include Toolsz (29 tools including JSON viewer, regex tester, diff checker, code screenshot, QR generator, Base64 encoder, resume builder, Word to PDF, and more), Regex101 (regex testing), JSONCrack (JSON visualization), Carbon (code screenshots) and CyberChef (encoding). Toolsz stands out by combining all of these in one place with no signup or file uploads.",
  },
  {
    question: "Is there a free online JSON formatter and viewer?",
    answer: "Yes. Toolsz's JSON Preview tool visualizes JSON as an interactive, collapsible tree with syntax highlighting. You can search within the JSON, expand or collapse nodes, and copy values. It's faster than browser devtools and works entirely in your browser without uploading your data.",
  },
  {
    question: "What is the best free regex tester online?",
    answer: "Toolsz's Regex Tester provides real-time pattern matching with group highlights and a built-in cheat sheet. It supports JavaScript regex syntax. For more advanced regex features like PCRE support and unit tests, Regex101.com is the gold standard. Both are free and require no signup.",
  },
  {
    question: "How can I generate a QR code for free?",
    answer: "Use Toolsz's QR Code Generator. It generates QR codes for URLs, WiFi passwords, vCards, email addresses and plain text. Download as PNG or SVG. No signup, no watermarks, no limits — and it works entirely offline after the first page load.",
  },
  {
    question: "What is the best free Base64 encoder/decoder online?",
    answer: "Toolsz's Base64 tool encodes and decodes Base64, URL encoding and HTML entities. It handles large strings, shows character counts and copies to clipboard instantly. It runs locally — your data is never sent to any server, which is important when encoding sensitive credentials or API keys.",
  },
  {
    question: "How do I generate fake test data for development?",
    answer: "Use the Fake Data Generator on Toolsz. It generates realistic mock data including names, emails, phone numbers, addresses, company names, credit card numbers and more. You can generate hundreds of rows and download as CSV or JSON for use in testing.",
  },
  {
    question: "Can I use these developer tools offline?",
    answer: "Yes. Once a Toolsz page has loaded in your browser, most tools work without an internet connection because all processing happens locally using JavaScript. This is ideal for developers in environments with restricted internet access or when working with sensitive data.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      "name": "Best Free Developer Tools 2026",
      "numberOfItems": 29,
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

export default function BestFreeDevToolsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-[calc(100vh-8rem)]">
        <div className="max-w-300 mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="tool-hero p-6 sm:p-8">
            <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-5">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground">Best Free Developer Tools</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200/50 flex items-center justify-center shrink-0">
                <Braces className="w-6 h-6 text-blue-600" />
              </div>
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Updated 2026 · 29 tools
                </div>
                <h1 className="type-h1 font-display gradient-text mb-3">
                  29 Best Free Developer Tools Online in 2026
                </h1>
                <p className="text-foreground-secondary text-lg leading-relaxed max-w-2xl">
                  Browser-based utilities every developer needs — JSON viewer, regex tester, diff checker, QR generator, Base64 encoder, CSS gradients, fake data, code screenshots and more. No installation, no signup, no file uploads. All processing happens locally in your browser.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { label:"29 dev tools",   sub:"all completely free" },
                { label:"No install",     sub:"runs in your browser" },
                { label:"No signup",      sub:"open and use instantly" },
                { label:"Works offline",  sub:"after first page load" },
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

        <div className="max-w-300 mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-10">
          <h2 className="type-h2 font-display text-foreground mb-6">All 29 Free Developer Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <Link key={tool.href} href={tool.href} className="glass-card-premium p-5 group flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-all">
                    <tool.icon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  {tool.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tool.badge === "Most popular" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                      tool.badge === "New" ? "bg-green-50 text-green-600 border-green-100" :
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

          <div className="mt-12">
            <h2 className="type-h2 font-display text-foreground mb-2">Toolsz vs JSONCrack vs Carbon vs Regex101</h2>
            <p className="text-foreground-secondary mb-6">Most dev tools cover one use case. Toolsz covers 25.</p>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Feature</th>
                    <th className="px-4 py-3 font-bold text-primary text-center">Toolsz ✓</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">JSONCrack</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Carbon</th>
                    <th className="px-4 py-3 font-semibold text-foreground-secondary text-center">Regex101</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-surface/30"}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{row.feature}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.toolsz}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{row.jsoncrack}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{row.carbon}</td>
                      <td className="px-4 py-3 text-center text-foreground-secondary">{row.regex101}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                { label:"All Dev Tools", href:"/dev-tools" },
                { label:"Best Free PDF Tools", href:"/best-free-pdf-tools" },
                { label:"Best Free Image Tools", href:"/best-free-image-tools" },
                { label:"All 219 Tools", href:"/all-tools" },
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
