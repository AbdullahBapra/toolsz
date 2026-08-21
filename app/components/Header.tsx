"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Menu,
  X,
  Layers,
  Search,
  ChevronDown,
  FileDown,
  Image,
  Merge,
  Scissors,
  FileEdit,
  ScanSearch,
  Unlock,
  PenTool,
  Eraser,
  Maximize,
  ArrowRightLeft,
  Maximize2,
  Pencil,
  Paintbrush,
  Braces,
  Regex,
  GitCompare,
  Lock,
  Database,
  Bug,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Droplets,
  Code,
  EyeOff,
} from "lucide-react";
import CommandPalette, { useCommandPalette } from "./CommandPalette";

/* ══════════════════════════════════════════════════════════
   Mega Dropdown Data — Top 8 tools per category
   ══════════════════════════════════════════════════════════ */

interface MegaTool {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MegaCategory {
  label: string;
  href: string;
  total: number;
  accent: string;          // tailwind color name: red, amber, blue
  tools: MegaTool[];
}

const megaCategories: MegaCategory[] = [
  {
    label: "PDF Tools",
    href: "/pdf-tools",
    total: 77,
    accent: "red",
    tools: [
      { name: "Compress PDF", href: "/compress-pdf", description: "Reduce file size", icon: FileDown },
      { name: "PDF to JPG", href: "/pdf-to-jpg", description: "Pages to images", icon: Image },
      { name: "Merge PDF", href: "/merge-pdf", description: "Combine documents", icon: Merge },
      { name: "Split PDF", href: "/split-pdf", description: "Extract pages", icon: Scissors },
      { name: "PDF Editor", href: "/pdf-editor", description: "Annotate & draw", icon: FileEdit },
      { name: "PDF OCR", href: "/pdf-ocr", description: "Make searchable", icon: ScanSearch },
      { name: "Unlock PDF", href: "/unlock-pdf", description: "Remove password", icon: Unlock },
      { name: "Sign PDF", href: "/sign-pdf", description: "Add signature", icon: PenTool },
    ],
  },
  {
    label: "Image Tools",
    href: "/image-tools",
    total: 113,
    accent: "amber",
    tools: [
      { name: "Remove Background", href: "/remove-bg", description: "AI cutout", icon: Eraser },
      { name: "Compress Image", href: "/compress-image", description: "Reduce file size", icon: FileDown },
      { name: "Resize Image", href: "/resize-image", description: "Scale dimensions", icon: Maximize },
      { name: "Convert Image", href: "/convert-image", description: "PNG, JPG, WebP", icon: ArrowRightLeft },
      { name: "Watermark Image", href: "/watermark-image", description: "Add text & logo", icon: Droplets },
      { name: "Blur Face", href: "/blur-face", description: "Anonymize faces", icon: EyeOff },
      { name: "HTML to Image", href: "/html-to-image", description: "Code → screenshot", icon: Code },
      { name: "Edit Image", href: "/edit-image", description: "Adjust & filter", icon: Pencil },
    ],
  },
  {
    label: "Dev Tools",
    href: "/dev-tools",
    total: 29,
    accent: "blue",
    tools: [
      { name: "JSON Preview", href: "/json-preview", description: "Interactive tree", icon: Braces },
      { name: "Regex Tester", href: "/regex-tester", description: "Live matching", icon: Regex },
      { name: "Diff Checker", href: "/diff-checker", description: "Compare files", icon: GitCompare },
      { name: "Password Generator", href: "/password-generator", description: "Crypto-secure", icon: Lock },
      { name: "Fake Data", href: "/fake-data", description: "Mock datasets", icon: Database },
      { name: "CSV Debugger", href: "/csv-debugger", description: "Find data issues", icon: Bug },
      { name: "SVG Optimizer", href: "/svg-optimizer", description: "Clean & reduce", icon: Sparkles },
      { name: "Code Screenshot", href: "/code-screenshot", description: "Beautiful snippets", icon: Image },
    ],
  },
];

/* Accent color maps for mega dropdown icons */
const accentStyles: Record<string, { bg: string; text: string; badge: string }> = {
  red:   { bg: "bg-red-50",   text: "text-red-600",   badge: "bg-red-50 text-red-600 border-red-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", badge: "bg-amber-50 text-amber-600 border-amber-200" },
  blue:  { bg: "bg-blue-50",  text: "text-blue-600",  badge: "bg-blue-50 text-blue-600 border-blue-200" },
};

/* ══════════════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════════════ */

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const { open, openPalette, close } = useCommandPalette();
  const pathname = usePathname();

  // Close mobile nav on route change (browser back/forward)
  useEffect(() => {
    setMobileOpen(false);
    setMobileAccordion(null);
  }, [pathname]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggleAccordion = useCallback((label: string) => {
    setMobileAccordion((prev) => (prev === label ? null : label));
  }, []);

  return (
    <>
      {/* ── Sticky Header Shell ──────────────────────────── */}
      <header className="sticky top-0 z-50 w-full">
        {/* Ambient top glow line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Floating pill nav container */}
        <div className="mx-auto max-w-[1200px] px-3 sm:px-4 pt-3">
          <nav
            aria-label="Main navigation"
            className="nav-pill relative flex items-center justify-between gap-3 h-14 sm:h-16 px-4 sm:px-5"
          >
            {/* ── Logo + Badge ─────────────────────────── */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center shadow-[0_3px_12px_rgba(79,70,229,0.3)] transition-transform duration-300 group-hover:scale-105">
                  <Layers className="w-[18px] h-[18px] text-white" />
                </div>
                <span className="text-[20px] sm:text-[22px] font-display font-[800] tracking-tight text-primary transition-colors duration-200">
                  Toolsz
                </span>
              </Link>

              {/* Product funnel badge */}
              <span className="hidden lg:inline-flex badge-primary text-[11px] px-2.5 py-1">
                219 Free Tools
              </span>
            </div>

            {/* ── Desktop Mega Nav ─────────────────────── */}
            <ul className="hidden md:flex items-center gap-0.5">
              {megaCategories.map((cat) => {
                const accent = accentStyles[cat.accent];
                return (
                  <li key={cat.label} className="group relative">
                    {/* Nav link trigger */}
                    <Link
                      href={cat.href}
                      aria-haspopup="true"
                      className="nav-link flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[14px] font-medium text-foreground-secondary transition-colors duration-150 whitespace-nowrap"
                    >
                      {cat.label}
                      <ChevronDown className="nav-chevron w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                    </Link>

                    {/* Invisible hover bridge (prevents gap flicker) */}
                    <div className="nav-bridge" />

                    {/* ── Mega Dropdown ─────────────────── */}
                    <div className="mega-dropdown">
                      <div className="mega-dropdown-inner">
                        {/* Left: Bento grid of tools */}
                        <div className="flex-1 p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[11px] font-semibold tracking-wider uppercase font-mono px-2.5 py-1 rounded-full border ${accent.badge}`}>
                              Top {cat.label}
                            </span>
                            <span className="text-[11px] text-foreground-muted font-mono">{cat.total} tools</span>
                          </div>
                          <ul className="grid grid-cols-2 gap-1">
                            {cat.tools.map((tool) => {
                              const Icon = tool.icon;
                              return (
                                <li key={tool.href}>
                                  <Link
                                    href={tool.href}
                                    className="group/item flex items-start gap-3 p-2.5 rounded-xl transition-colors duration-150"
                                  >
                                    <div className={`flex items-center justify-center w-9 h-9 rounded-[10px] ${accent.bg} ${accent.text} flex-shrink-0 transition-shadow duration-150 group-hover/item:shadow-sm`}>
                                      <Icon className="w-[18px] h-[18px]" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-[13px] font-medium text-foreground group-hover/item:text-primary transition-colors truncate">
                                        {tool.name}
                                      </div>
                                      <div className="text-[11px] text-foreground-muted mt-0.5 truncate">
                                        {tool.description}
                                      </div>
                                    </div>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Right: Funnel sidebar */}
                        <div className="nav-funnel-sidebar">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Zap className="w-4 h-4 text-primary" />
                              <span className="text-[13px] font-semibold text-foreground">Browser-native</span>
                            </div>
                            <p className="text-[12px] text-foreground-muted leading-relaxed">
                              Process files instantly & securely. All processing runs inside your browser — your data never leaves your device.
                            </p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-border">
                            <Link
                              href={cat.href}
                              className="flex items-center gap-1.5 text-[13px] font-medium text-primary hover:text-primary-hover transition-colors"
                            >
                              View all {cat.total} {cat.label}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-[11px] text-foreground-muted mb-2 font-medium">Can&apos;t find what you need?</p>
                            <Link
                              href="/request-a-tool"
                              className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary-hover transition-colors"
                            >
                              Request a tool
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                            <Link
                              href="/roadmap"
                              className="flex items-center gap-1.5 text-[12px] font-medium text-foreground-secondary hover:text-primary transition-colors mt-1.5"
                            >
                              View roadmap
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* ── Right Side: Search + CTA ────────────── */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <button
                onClick={openPalette}
                className="search-trigger"
                aria-label="Search tools"
              >
                <Search className="w-4 h-4" />
                <span className="search-trigger-text">Search…</span>
                <kbd className="search-trigger-kbd">⌘K</kbd>
              </button>
            </div>

            {/* ── Mobile: Search + Menu ───────────────── */}
            <div className="flex md:hidden items-center gap-1 flex-shrink-0">
              <button
                className="search-trigger-mobile"
                onClick={openPalette}
                aria-label="Search tools"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="search-trigger-mobile"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Mobile Full-Screen Overlay ──────────────────── */}
      {mobileOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-1 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>

            {/* Mobile Logo + Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center shadow-[0_3px_12px_rgba(79,70,229,0.3)]">
                <Layers className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="text-[22px] font-display font-[800] tracking-tight text-primary">
                Toolsz
              </span>
              <span className="badge-primary text-[11px] px-2.5 py-1">219 Free Tools</span>
            </div>

            {/* Mobile Search */}
            <button
              onClick={() => { setMobileOpen(false); openPalette(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-1 border border-border text-foreground-muted mb-6"
            >
              <Search className="w-5 h-5" />
              <span className="text-[15px] font-medium">Search tools…</span>
              <kbd className="ml-auto search-trigger-kbd">⌘K</kbd>
            </button>

            {/* Accordion Categories */}
            {megaCategories.map((cat) => {
              const accent = accentStyles[cat.accent];
              const isOpen = mobileAccordion === cat.label;
              return (
                <div key={cat.label} className="mb-1">
                  <button
                    onClick={() => toggleAccordion(cat.label)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-surface-1 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[11px] font-semibold tracking-wider uppercase font-mono px-2.5 py-1 rounded-full border ${accent.badge}`}>
                        {cat.label}
                      </span>
                      <span className="text-[12px] text-foreground-muted font-mono">{cat.total}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-foreground-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Accordion content */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-2 pb-2 pt-1">
                      {cat.tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-1 transition-colors"
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-[8px] ${accent.bg} ${accent.text}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[14px] font-medium text-foreground">{tool.name}</div>
                              <div className="text-[11px] text-foreground-muted">{tool.description}</div>
                            </div>
                          </Link>
                        );
                      })}

                      {/* View All link */}
                      <Link
                        href={cat.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-1.5 px-3 py-2.5 mt-1 text-[13px] font-medium text-primary hover:text-primary-hover transition-colors"
                      >
                        View all {cat.total} {cat.label}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Links */}
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider font-mono mb-3">Quick Links</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Link
                  href="/all-tools"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-1 border border-border text-[13px] font-medium text-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
                  All 219 Tools
                </Link>
                <Link
                  href="/roadmap"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-1 border border-border text-[13px] font-medium text-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
                  Roadmap
                </Link>
              </div>
              <Link
                href="/request-a-tool"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary-muted border border-primary-border text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors w-full"
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                Can&apos;t find a tool? Request it →
              </Link>
            </div>

            {/* Bottom trust signals */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-6 text-[12px] font-semibold text-foreground-muted uppercase tracking-wider font-mono">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Fast</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-primary" /> Secure</span>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette open={open} onClose={close} />
    </>
  );
}
