import Link from "next/link";
import { Shield, CheckCircle, Lock, Eye, Server, Globe, Mail } from "lucide-react";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.toolsz.co/privacy",
      name: "Privacy Policy — Toolsz",
      url: "https://www.toolsz.co/privacy",
      description:
        "Toolsz Privacy Policy. All 219 tools process files 100% client-side. Files are never uploaded. Zero data collection. GDPR and CCPA compliant.",
      dateModified: "2026-06-01",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.toolsz.co" },
        { "@type": "ListItem", position: 2, name: "Privacy Policy", item: "https://www.toolsz.co/privacy" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Does Toolsz upload my files?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Toolsz never uploads your files. All 219 tools process files 100% client-side in your browser using JavaScript and WebAssembly. Your files never leave your device.",
          },
        },
        {
          "@type": "Question",
          name: "Does Toolsz collect personal data?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Toolsz does not collect, store, or process any personal data. No account is required, no cookies track your identity, and no analytics platform records personal identifiers.",
          },
        },
        {
          "@type": "Question",
          name: "Is Toolsz GDPR compliant?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Because Toolsz collects zero personal data and never processes files on servers, there is nothing to be GDPR-regulated. No data transfer, no consent banner required for tool functionality.",
          },
        },
      ],
    },
  ],
};

const toc = [
  { id: "summary", label: "TL;DR Summary" },
  { id: "how-tools-work", label: "How Our Tools Process Your Files" },
  { id: "data-collected", label: "What Data We Collect" },
  { id: "cookies", label: "Cookies & Local Storage" },
  { id: "analytics", label: "Analytics" },
  { id: "third-parties", label: "Third-Party Services" },
  { id: "gdpr-ccpa", label: "GDPR & CCPA Rights" },
  { id: "childrens", label: "Children's Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-[calc(100vh-8rem)]">
        <div className="max-w-[900px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-14 pb-16">

          {/* Header */}
          <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Privacy Policy</span>
          </nav>

          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200/60 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
              <Shield className="w-3 h-3" />
              Zero data collection · Zero uploads · Privacy by architecture
            </div>
            <h1 className="type-h1 font-display gradient-text mb-3">Privacy Policy</h1>
            <p className="text-foreground-secondary">
              <strong className="text-foreground">Last updated:</strong> June 1, 2026 &nbsp;·&nbsp;
              <strong className="text-foreground">Effective:</strong> June 1, 2026
            </p>
          </div>

          <div className="grid md:grid-cols-[220px_1fr] gap-10 items-start">

            {/* Sticky TOC (hidden on mobile) */}
            <nav className="hidden md:block sticky top-6 rounded-2xl border border-border bg-surface/60 p-4">
              <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3">Contents</p>
              <ul className="space-y-1.5">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-foreground-secondary hover:text-primary transition-colors block py-0.5"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content */}
            <div className="space-y-10 prose-headings:font-display">

              {/* TL;DR */}
              <section id="summary">
                <div className="rounded-2xl border border-green-200/60 bg-green-50/60 p-5 sm:p-6">
                  <h2 className="type-h3 font-display text-green-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    TL;DR — The Important Part
                  </h2>
                  <ul className="space-y-2.5">
                    {[
                      "Your files are NEVER uploaded to any server — all processing happens in your browser",
                      "We collect ZERO personal data — no name, no email, no file content",
                      "No account is required to use any of the 219 tools",
                      "No cookies track your identity or tool usage",
                      "No third-party services receive your file data",
                      "You can use all tools completely offline after the first page load",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-green-800">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* How tools work */}
              <section id="how-tools-work">
                <h2 className="type-h2 font-display text-foreground mb-4">How Our Tools Process Your Files</h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-5">
                  {[
                    { icon: Lock, title: "Files Stay on Your Device", desc: "When you select a file in any Toolsz tool, it is read into your browser's memory using the browser's File API. It never travels over your internet connection." },
                    { icon: Server, title: "Zero Server Processing", desc: "Toolsz's servers (on Vercel's CDN) only serve static files — HTML, CSS, JavaScript, and fonts. They have no capability to receive or process your documents." },
                    { icon: Eye, title: "Architecturally Enforced Privacy", desc: "Unlike tools that promise 'we delete files in 1 hour', Toolsz's architecture makes server-side file access physically impossible — not just a policy commitment." },
                  ].map((item) => (
                    <div key={item.title} className="glass-card-premium p-4">
                      <div className="w-9 h-9 rounded-xl bg-primary-muted border border-primary-border flex items-center justify-center mb-3">
                        <item.icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <h3 className="font-bold text-sm text-foreground mb-1.5">{item.title}</h3>
                      <p className="text-xs text-foreground-secondary leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  The tools use browser technologies including: the <strong className="text-foreground">Canvas API</strong> for image processing, <strong className="text-foreground">WebAssembly</strong> (via Tesseract.js for OCR, pdf-lib for PDF operations), and the <strong className="text-foreground">File API</strong> for reading your files into browser memory. These are the same APIs that desktop applications use — except everything runs inside your browser tab, not on an external server.
                </p>
              </section>

              {/* Data collected */}
              <section id="data-collected">
                <h2 className="type-h2 font-display text-foreground mb-4">What Data We Collect</h2>
                <div className="overflow-x-auto rounded-2xl border border-border mb-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface border-b border-border">
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Data Type</th>
                        <th className="px-4 py-3 font-semibold text-center text-foreground">Collected?</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Your files (PDFs, images, documents)", "No — never", "100% local processing"],
                        ["File names or metadata", "No — never", "Never sent to our servers"],
                        ["Personal information (name, email)", "No — never", "No account required"],
                        ["IP address", "Incidentally by CDN", "Vercel CDN logs for security only; not stored long-term"],
                        ["Page views (anonymous)", "Aggregate only", "No user ID, no session tracking"],
                        ["Cookies for tracking", "No", "See Cookies section below"],
                        ["Third-party advertising data", "No", "No ad tracking cookies"],
                      ].map(([type, collected, notes], i) => (
                        <tr key={type} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-surface/30"}`}>
                          <td className="px-4 py-3 text-foreground">{type}</td>
                          <td className={`px-4 py-3 text-center font-semibold ${collected.startsWith("No") ? "text-green-600" : "text-amber-600"}`}>{collected}</td>
                          <td className="px-4 py-3 text-foreground-secondary text-xs">{notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  We operate on a <strong className="text-foreground">data minimization</strong> principle: the best way to protect your data is to never collect it in the first place. Toolsz has been architected from the ground up to require zero personal data to deliver full tool functionality.
                </p>
              </section>

              {/* Cookies */}
              <section id="cookies">
                <h2 className="type-h2 font-display text-foreground mb-4">Cookies &amp; Local Storage</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-4">
                  Toolsz does not use cookies for tracking, advertising, or user identification. The only browser storage we use:
                </p>
                <ul className="space-y-3 text-sm">
                  {[
                    { type: "Browser Cache", purpose: "Stores the JavaScript libraries (pdf-lib, Tesseract.js, etc.) so tools load faster on repeat visits and work offline. This is standard browser caching, not a cookie.", personal: false },
                    { type: "localStorage (optional)", purpose: "Some tools save your last-used settings locally (e.g., preferred compression level, output format). This data never leaves your device and you can clear it via browser settings.", personal: false },
                    { type: "Session Storage", purpose: "Used temporarily during a tool session to hold UI state. Cleared when you close the tab.", personal: false },
                  ].map((item) => (
                    <li key={item.type} className="rounded-xl border border-border p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-foreground">{item.type}</span>
                          <p className="text-foreground-secondary text-xs mt-1 leading-relaxed">{item.purpose}</p>
                          <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">Contains no personal data</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Analytics */}
              <section id="analytics">
                <h2 className="type-h2 font-display text-foreground mb-4">Analytics</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                  Toolsz may use privacy-respecting, aggregate analytics (such as Vercel Analytics) to understand which pages receive traffic and how the site performs. These analytics:
                </p>
                <ul className="space-y-2 text-sm text-foreground-secondary list-none">
                  {[
                    "Do not create individual user profiles or unique identifiers",
                    "Do not track you across sessions or other websites",
                    "Do not share data with advertising platforms",
                    "Collect only aggregate page view counts, not individual behavior",
                    "Never include file content, names, or any document metadata",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Third parties */}
              <section id="third-parties">
                <h2 className="type-h2 font-display text-foreground mb-4">Third-Party Services</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-4">
                  Toolsz uses a minimal set of third-party services. None of these services receive your file data:
                </p>
                <ul className="space-y-3">
                  {[
                    { name: "Vercel", role: "Hosting and CDN", data: "Serves static files. No access to file data." },
                    { name: "Google Fonts / Next.js Fonts", role: "Typography", data: "Font files served. No user data shared." },
                    { name: "Open-source libraries", role: "pdf-lib, Tesseract.js, PDF.js, etc.", data: "All run client-side. Zero data sent to library maintainers." },
                  ].map((item) => (
                    <li key={item.name} className="rounded-xl border border-border p-4 text-sm">
                      <div className="font-semibold text-foreground">{item.name}</div>
                      <div className="text-foreground-secondary text-xs mt-0.5">{item.role}</div>
                      <div className="text-green-600 text-xs mt-1 font-medium">{item.data}</div>
                    </li>
                  ))}
                </ul>
                <p className="text-foreground-secondary text-sm mt-4 leading-relaxed">
                  We do not sell, rent, or share your data with any third party for commercial purposes. This is absolute — not conditional on a tier, plan, or region.
                </p>
              </section>

              {/* GDPR / CCPA */}
              <section id="gdpr-ccpa">
                <h2 className="type-h2 font-display text-foreground mb-4">GDPR &amp; CCPA Rights</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-4">
                  Because Toolsz collects no personal data, most GDPR/CCPA rights are automatically satisfied — there is no personal data to access, correct, delete, or port. However, we formally acknowledge your rights:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { right: "Right to Access", desc: "We hold no personal data about you to provide." },
                    { right: "Right to Deletion", desc: "No personal data is stored; nothing to delete." },
                    { right: "Right to Portability", desc: "Not applicable — no personal data collected." },
                    { right: "Right to Object", desc: "No profiling or automated decision-making occurs." },
                    { right: "Right to Opt-Out of Sale", desc: "We do not sell data. CCPA opt-out N/A." },
                    { right: "Right to Non-Discrimination", desc: "All users receive identical service regardless of privacy choices." },
                  ].map((item) => (
                    <div key={item.right} className="rounded-xl border border-border p-4">
                      <div className="font-semibold text-sm text-foreground mb-1">{item.right}</div>
                      <div className="text-xs text-foreground-secondary">{item.desc}</div>
                    </div>
                  ))}
                </div>
                <p className="text-foreground-secondary text-sm mt-4 leading-relaxed">
                  <strong className="text-foreground">For EU/EEA users:</strong> Toolsz does not require a GDPR consent banner for tool functionality because no personal data processing occurs. Any aggregate analytics (page views) are processed under a legitimate interest basis and contain no personal data.
                </p>
              </section>

              {/* Children */}
              <section id="childrens">
                <h2 className="type-h2 font-display text-foreground mb-3">Children&apos;s Privacy</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  Toolsz does not knowingly collect any information from children under 13 (or under 16 in the EU). Because we collect no personal data from any user, children can use the tools safely. If you believe a child has inadvertently provided personal information, contact us and we will address it promptly — though in practice this is architecturally impossible given our zero-data design.
                </p>
              </section>

              {/* Changes */}
              <section id="changes">
                <h2 className="type-h2 font-display text-foreground mb-3">Changes to This Privacy Policy</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  We may update this Privacy Policy to reflect new tools, new technologies, or legal requirements. When we do, we will update the &quot;Last updated&quot; date at the top of this page. Our core commitment — zero file uploads, zero personal data collection — will never change, as it is baked into the architecture, not just the policy text.
                </p>
              </section>

              {/* Contact */}
              <section id="contact">
                <h2 className="type-h2 font-display text-foreground mb-4">Contact Us</h2>
                <div className="glass-card-premium p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-muted border border-primary-border flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">Questions About Privacy?</h3>
                      <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                        If you have any questions about this Privacy Policy or our data practices, contact us at:
                      </p>
                      <a href="mailto:privacy@toolsz.co" className="text-primary font-semibold text-sm hover:underline">
                        privacy@toolsz.co
                      </a>
                      <p className="text-foreground-secondary text-xs mt-2">
                        We respond to all privacy inquiries within 72 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer links */}
              <div className="pt-6 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Terms & Conditions", href: "/terms" },
                    { label: "About Toolsz", href: "/about" },
                    { label: "All 219 tools", href: "/all-tools" },
                  ].map((l) => (
                    <Link key={l.href} href={l.href} className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
