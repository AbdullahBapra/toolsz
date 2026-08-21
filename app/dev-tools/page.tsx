import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryMetadata } from "@/app/utils/seo";

export const metadata: Metadata = getCategoryMetadata("dev-tools");

import {
  Braces,
  Server,
  Camera,
  FileText,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  Database,
  Mail,
  Sparkles,
  QrCode,
  Barcode,
  Lock,
  ArrowRightLeft,
  Globe,
  Palette,
  Binary,
  Regex,
  BookOpen as BookOpenIcon,
  GitCompare,
  Bug,
  PenLine,
  FolderTree,
  Check,
  X,
  Star,
  Eye,
  Layers,
  FileJson,
  Code2,
  FileType,
  Briefcase,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

const devTools = [
  {
    name: "JSON → UI Preview",
    description: "Visualize JSON as an interactive collapsible tree with type badges and search.",
    href: "/json-preview",
    icon: Braces,
  },
  {
    name: "API Response Formatter",
    description: "Format raw API responses with status badges, headers, and error details.",
    href: "/api-formatter",
    icon: Server,
  },
  {
    name: "Code Screenshot Generator",
    description: "Create beautiful code screenshots with 8 themes and PNG export.",
    href: "/code-screenshot",
    icon: Camera,
  },
  {
    name: "Markdown → Beautiful Docs",
    description: "Render Markdown as styled documentation with syntax highlighting.",
    href: "/markdown-docs",
    icon: FileText,
  },
  {
    name: "Fake Data Generator",
    description: "Generate realistic dummy data — users, emails, addresses — export as CSV, JSON, or SQL.",
    href: "/fake-data",
    icon: Database,
  },
  {
    name: "Email Signature Generator",
    description: "Create professional email signatures with custom colors and copy-paste HTML output.",
    href: "/email-signature",
    icon: Mail,
  },
  {
    name: "SVG Optimizer",
    description: "Clean and optimize SVG files — remove bloat from Figma/Illustrator exports with 30+ plugins.",
    href: "/svg-optimizer",
    icon: Sparkles,
  },
  {
    name: "QR Code Generator",
    description: "Generate QR codes for URLs, text, WiFi, vCards, and emails. Custom colors and SVG export.",
    href: "/qr-code",
    icon: QrCode,
  },
  {
    name: "Barcode Generator",
    description: "Generate barcodes in 7 formats — Code128, EAN-13, UPC-A, ITF-14, MSI, Codabar. PNG/SVG.",
    href: "/barcode",
    icon: Barcode,
  },
  {
    name: "Password Generator",
    description: "Generate strong, crypto-secure passwords with bulk export. Customizable length and character sets.",
    href: "/password-generator",
    icon: Lock,
  },
  {
    name: "JSON ↔ CSV Converter",
    description: "Convert between JSON and CSV formats with custom delimiters. Bidirectional, instant.",
    href: "/json-csv",
    icon: ArrowRightLeft,
  },
  {
    name: "Favicon Generator",
    description: "Generate .ico, multi-size PNGs, apple-touch-icon, and manifest.json from any image.",
    href: "/favicon-generator",
    icon: Globe,
  },
  {
    name: "Color Picker & Palette",
    description: "Pick colors with hex/RGB/HSL conversion, WCAG contrast checker, and image palette extraction.",
    href: "/color-picker",
    icon: Palette,
  },
  {
    name: "Word Counter",
    description: "Count words, characters, sentences. Check reading time, keyword density, and SEO metrics.",
    href: "/word-counter",
    icon: FileText,
  },
  {
    name: "Base64 Encode / Decode",
    description: "Encode and decode Base64, URL encoding, and HTML entities — 6 tools in one.",
    href: "/base64",
    icon: Binary,
  },
  {
    name: "Regex Tester",
    description: "Test regular expressions with real-time matching, group highlighting, and cheat sheet.",
    href: "/regex-tester",
    icon: Regex,
  },
  {
    name: "CSS Gradient Generator",
    description: "Build CSS gradients visually — linear, radial, conic with 10 presets and copy-paste CSS.",
    href: "/gradient-generator",
    icon: Palette,
  },
  {
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text as paragraphs, sentences, or words. Start with Lorem option.",
    href: "/lorem-ipsum",
    icon: BookOpenIcon,
  },
  {
    name: "Diff Checker",
    description: "Compare text, JSON, or images side by side with syntax-highlighted diff — no size limit.",
    href: "/diff-checker",
    icon: GitCompare,
  },
  {
    name: "Multi-Format Converter",
    description: "Convert any file to Text, Table, JSON, or Images — all in one interface. One upload, four outputs.",
    href: "/multi-converter",
    icon: ArrowRightLeft,
  },
  {
    name: "CSV Visual Debugger",
    description: "Upload CSV and instantly find duplicates, empty values, type mismatches, and column issues.",
    href: "/csv-debugger",
    icon: Bug,
  },
  {
    name: "Bulk File Renamer",
    description: "Rename multiple files at once using numbering, date, pattern, or find-and-replace rules.",
    href: "/bulk-renamer",
    icon: PenLine,
  },
  {
    name: "Folder Structure Visualizer",
    description: "Drag & drop a folder to see an interactive tree view with collapsible nodes and unused file detection.",
    href: "/folder-visualizer",
    icon: FolderTree,
  },
  {
    name: "JSON to PPTX",
    description: "Convert structured JSON to a PowerPoint presentation — 5 layouts (title, bullets, content, table, two-col) and 5 themes. No upload.",
    href: "/json-to-pptx",
    icon: FileJson,
  },
  {
    name: "JS to PPTX",
    description: "Write JavaScript using the pptxgenjs API and download a PPTX file instantly — full API access, shapes, tables, bullets, colors.",
    href: "/js-to-pptx",
    icon: Code2,
  },
  {
    name: "Word to PDF",
    description: "Convert Word documents (.docx) to PDF entirely in your browser. Preserves headings, lists, bold, italic, and tables. No server, no signup.",
    href: "/word-to-pdf",
    icon: FileType,
  },
  {
    name: "Resume / CV Builder",
    description: "Build a polished resume with Modern, Classic, or ATS-Friendly templates. Live preview, PDF export. No signup, no watermarks.",
    href: "/resume-builder",
    icon: Briefcase,
  },
  {
    name: "Website Trust Checker",
    description: "Check any website's SSL, security headers, robots.txt, and sitemap. Generates a 0–100 trust score to spot safe vs. risky sites instantly.",
    href: "/website-trust-checker",
    icon: ShieldCheck,
  },
  {
    name: "Website Content Extractor",
    description: "Paste any article URL to get clean, readable text — no ads, no navigation. Export as Markdown or plain text. Powered by Mozilla Readability.",
    href: "/website-content-extractor",
    icon: BookOpen,
  },
];

// Competitor comparison data
const competitors = [
  { name: "Toolsz", tools: "29", watermarks: false, signup: false, clientSide: true, premium: false, unique: "API Formatter, CSV Debugger, Trust Checker, Content Extractor, Folder Visualizer, Bulk Renamer" },
  { name: "Regex101", tools: "1", watermarks: false, signup: true, clientSide: false, premium: true, unique: "—" },
  { name: "Carbon.now.sh", tools: "1", watermarks: false, signup: false, clientSide: true, premium: false, unique: "—" },
  { name: "JSON Formatter", tools: "~3", watermarks: false, signup: false, clientSide: false, premium: false, unique: "—" },
  { name: "Mockaroo", tools: "1", watermarks: false, signup: true, clientSide: false, premium: true, unique: "—" },
  { name: "Diffchecker", tools: "1", watermarks: false, signup: true, clientSide: false, premium: true, unique: "—" },
  { name: "QR Code Monkey", tools: "1", watermarks: false, signup: false, clientSide: false, premium: true, unique: "—" },
];

// Tools only available on Toolsz (competitor gap)
const uniqueTools = [
  { name: "API Response Formatter", href: "/api-formatter", description: "Format raw HTTP responses with status badges and error details — no other free tool offers this", icon: Server },
  { name: "CSV Visual Debugger", href: "/csv-debugger", description: "Find duplicates, empty values, and type mismatches in CSV files — unique data validation tool", icon: Bug },
  { name: "Multi-Format Converter", href: "/multi-converter", description: "4-in-1 conversion: Text, Table, JSON, and Images simultaneously — only on Toolsz", icon: ArrowRightLeft },
  { name: "Folder Structure Visualizer", href: "/folder-visualizer", description: "Interactive tree view with unused file detection — no other free web tool offers this", icon: FolderTree },
  { name: "Bulk File Renamer", href: "/bulk-renamer", description: "Rename files with regex, date, and pattern rules in your browser — alternative to desktop-only Bulk Rename Utility", icon: PenLine },
  { name: "Code Screenshot", href: "/code-screenshot", description: "Beautiful code screenshots with 8 themes — the best carbon.now.sh alternative, no watermarks", icon: Camera },
  { name: "Email Signature Generator", href: "/email-signature", description: "Professional HTML signatures without HubSpot's signup or branding — completely private", icon: Mail },
  { name: "Fake Data Generator", href: "/fake-data", description: "Unlimited mock data without Mockaroo's row caps — free, local, export as JSON/CSV/SQL", icon: Database },
];

export default function DevToolsPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-300 mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Braces className="w-6 h-6 text-primary" />
            </div>
            <div className="max-w-3xl">
              <h1 className="type-h1 font-display gradient-text mb-2">
                Free Developer Tools Online — 29 Tools, No Signup, 100% Private
              </h1>
              <p className="text-foreground-secondary text-lg max-w-2xl leading-relaxed">
                29 free developer tools that run entirely in your browser. Format APIs, preview JSON,
                generate QR codes, test regex, convert encodings, debug CSV, rename files,
                build resumes, generate PPTX from JSON or JavaScript, convert Word to PDF, and more — no server uploads, no signup,
                no watermarks. Unlike regex101 and diffchecker.com, your data never leaves your device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-300 mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devTools.map((tool, index) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-card-premium p-5 sm:p-7 group flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-muted border border-primary-border flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:border-primary-border transition-all duration-200">
                <tool.icon className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="type-h3 font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200 wrap-break-word">
                {tool.name}
              </h3>
              <p className="type-small text-foreground-secondary leading-relaxed flex-1 wrap-break-word">
                {tool.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary type-label opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Open tool
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Request CTA — visible right after tool grid */}
        <div className="mt-8 rounded-2xl bg-linear-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Missing a developer tool?</p>
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

        {/* Why Choose Toolsz */}
        <div className="mt-10 sm:mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <h2 className="type-h2 font-display text-foreground">
              Why Developers Choose Toolsz
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel glass-panel-info rounded-2xl p-6 flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="type-h4 font-semibold text-foreground mb-1">
                  100% Client-Side &amp; Private
                </h4>
                <p className="type-small text-foreground-secondary leading-relaxed">
                  Your JSON, API tokens, regex patterns, and source code never leave your browser.
                  Unlike regex101, diffchecker.com, and Mockaroo, nothing is uploaded to any server.
                </p>
              </div>
            </div>
            <div className="glass-panel glass-panel-info rounded-2xl p-6 flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="type-h4 font-semibold text-foreground mb-1">
                  No Premium, No Limits
                </h4>
                <p className="type-small text-foreground-secondary leading-relaxed">
                  Mockaroo limits rows, diffchecker.com limits file size, QR Code Monkey gates SVG export.
                  Toolsz has zero restrictions — every feature is completely free with no signup.
                </p>
              </div>
            </div>
            <div className="glass-panel glass-panel-info rounded-2xl p-6 flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="type-h4 font-semibold text-foreground mb-1">
                  29 Tools, One Workflow
                </h4>
                <p className="type-small text-foreground-secondary leading-relaxed">
                  No more switching between regex101, carbon.now.sh, and 5 other sites.
                  Toolsz puts every dev tool you need in one place — with consistent UI and no accounts.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
