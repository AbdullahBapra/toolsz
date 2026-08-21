import Link from "next/link";
import { Layers, Shield, Zap, Lock, ArrowRight } from "lucide-react";

const footerColumns = [
  {
    title: "Product",
    links: [
      { name: "PDF Tools (77)", href: "/pdf-tools" },
      { name: "Image Tools (113)", href: "/image-tools" },
      { name: "Developer Tools (29)", href: "/dev-tools" },
      { name: "All 219 Tools", href: "/all-tools" },
    ],
  },
  {
    title: "Top Tools",
    links: [
      { name: "Compress PDF", href: "/compress-pdf" },
      { name: "Background Remover", href: "/remove-bg" },
      { name: "PDF to Word", href: "/pdf-to-word" },
      { name: "JSON Formatter", href: "/json-preview" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "Request a Tool", href: "/request-a-tool" },
      { name: "Public Roadmap", href: "/roadmap" },
      { name: "Best Free PDF Tools", href: "/best-free-pdf-tools" },
      { name: "Free Adobe Alternative", href: "/free-alternatives-to-adobe-acrobat" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Toolsz", href: "/about" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms & Conditions", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-[#FAFAFA]">
      {/* Pre-footer community strip — shown on every page */}
      <div className="border-b border-border bg-linear-to-r from-indigo-50/60 via-white to-violet-50/60">
        <div className="max-w-300 mx-auto px-5 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-foreground">Need a tool that&apos;s not here?</span>
              <span className="text-sm text-foreground-secondary ml-1.5">219 tools and counting — yours could be next.</span>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/request-a-tool" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-xl transition-colors flex-1 sm:flex-none">
              Request a Tool <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/roadmap" className="flex items-center justify-center gap-1.5 text-sm font-medium text-foreground-secondary hover:text-primary border border-border hover:border-primary/40 px-4 py-2 rounded-xl transition-colors flex-1 sm:flex-none">
              Roadmap
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-300 mx-auto px-5 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-10 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-14">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-[10px] bg-linear-to-br from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center shadow-sm">
                <Layers className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[20px] font-display font-extrabold tracking-tight text-primary">
                Toolsz
              </span>
            </Link>
            <p className="text-[15px] text-foreground-secondary leading-relaxed max-w-sm mb-6">
              The highest quality browser-based file utilities available. Convert, compress, and edit with zero friction.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-muted border border-success/20">
                <Shield className="w-3.5 h-3.5 text-success" />
                <span className="text-[12px] font-semibold text-success font-mono">PRIVATE</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-muted border border-primary-border">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-[12px] font-semibold text-primary font-mono">FAST</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-muted border border-primary-border">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span className="text-[12px] font-semibold text-primary font-mono">SECURE</span>
              </div>
            </div>
          </div>

          {/* Nav Columns */}
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h4 className="font-display font-semibold text-foreground text-[12px] uppercase tracking-wider mb-1">
                {col.title}
              </h4>
              {col.links.map((link) =>
                link.href ? (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[15px] font-medium text-foreground-secondary hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <span
                    key={link.name}
                    className="text-[15px] font-medium text-foreground-secondary"
                  >
                    {link.name}
                  </span>
                )
              )}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[14px] font-medium text-foreground-muted">
            © {new Date().getFullYear()} Toolsz. Architecture for the web.
          </p>
          <div className="flex items-center gap-2">
            <span className="badge badge-success text-[12px] px-3 py-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
