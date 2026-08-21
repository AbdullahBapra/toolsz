import Link from "next/link";
import { FileText, Mail, Shield, AlertCircle } from "lucide-react";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.toolsz.co/terms",
      name: "Terms & Conditions — Toolsz",
      url: "https://www.toolsz.co/terms",
      description:
        "Terms and Conditions for using Toolsz.co — 219 Free browser-based tools. Read about acceptable use, no-upload processing, and our no-warranty policy.",
      dateModified: "2026-06-01",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.toolsz.co" },
        { "@type": "ListItem", position: 2, name: "Terms & Conditions", item: "https://www.toolsz.co/terms" },
      ],
    },
  ],
};

const toc = [
  { id: "agreement", label: "1. Agreement to Terms" },
  { id: "service", label: "2. Description of Service" },
  { id: "no-upload", label: "3. No-Upload Architecture" },
  { id: "acceptable-use", label: "4. Acceptable Use" },
  { id: "ip", label: "5. Intellectual Property" },
  { id: "disclaimer", label: "6. Disclaimer of Warranties" },
  { id: "liability", label: "7. Limitation of Liability" },
  { id: "indemnification", label: "8. Indemnification" },
  { id: "third-party", label: "9. Third-Party Links" },
  { id: "termination", label: "10. Termination" },
  { id: "governing-law", label: "11. Governing Law" },
  { id: "changes", label: "12. Changes to Terms" },
  { id: "contact", label: "13. Contact" },
];

export default function TermsPage() {
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
            <span className="text-foreground">Terms &amp; Conditions</span>
          </nav>

          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-muted border border-primary-border text-primary text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
              <FileText className="w-3 h-3" />
              Plain-language terms for a free, privacy-first tool suite
            </div>
            <h1 className="type-h1 font-display gradient-text mb-3">Terms &amp; Conditions</h1>
            <p className="text-foreground-secondary">
              <strong className="text-foreground">Last updated:</strong> June 1, 2026 &nbsp;·&nbsp;
              <strong className="text-foreground">Effective:</strong> June 1, 2026
            </p>
          </div>

          <div className="grid md:grid-cols-[220px_1fr] gap-10 items-start">

            {/* Sticky TOC */}
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
            <div className="space-y-10">

              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>By using Toolsz (toolsz.co), you agree to these Terms.</strong> If you do not agree, please do not use the service. These Terms are written in plain language — we believe legal documents should be readable.
                  </p>
                </div>
              </div>

              <section id="agreement">
                <h2 className="type-h2 font-display text-foreground mb-3">1. Agreement to Terms</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;) and Toolsz (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) governing your access to and use of the website at <strong className="text-foreground">https://www.toolsz.co</strong> and all associated tools, features, and content (collectively, the &quot;Service&quot;).
                </p>
                <p className="text-foreground-secondary text-sm leading-relaxed mt-3">
                  By accessing or using the Service, you confirm that you are at least 13 years of age, have read and understood these Terms, and agree to be bound by them. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
                </p>
              </section>

              <section id="service">
                <h2 className="type-h2 font-display text-foreground mb-3">2. Description of Service</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                  Toolsz provides a suite of 219 Free, browser-based utility tools for PDF processing, image editing and conversion, and developer tasks. The Service is provided free of charge. Key characteristics of the Service include:
                </p>
                <ul className="space-y-2 text-sm text-foreground-secondary">
                  {[
                    "All tools run 100% client-side in your web browser — no server-side file processing",
                    "No account, registration, or email address is required to use any tool",
                    "No subscription, payment, or premium tier is required",
                    "Output files contain no watermarks, tracking pixels, or embedded metadata from Toolsz",
                    "Tools are provided on an as-is basis with no guaranteed uptime or feature availability",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Shield className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-foreground-secondary text-sm leading-relaxed mt-3">
                  We reserve the right to add, modify, or discontinue any tool or feature at any time without notice. The availability of individual tools may change over time.
                </p>
              </section>

              <section id="no-upload">
                <h2 className="type-h2 font-display text-foreground mb-3">3. No-Upload Architecture &amp; File Processing</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                  A fundamental aspect of Toolsz is that <strong className="text-foreground">your files never leave your device</strong>. All file processing occurs locally in your browser using JavaScript, WebAssembly, and browser-native APIs (Canvas API, File API, etc.).
                </p>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                  Because files are never transmitted to our servers, Toolsz has no ability to access, view, store, or recover files that you process using the Service. This means:
                </p>
                <ul className="space-y-2 text-sm text-foreground-secondary">
                  {[
                    "We cannot recover files or processed output if you close your browser without downloading",
                    "We cannot assist with recovering corrupted output — all processing is final and local",
                    "We are not responsible for data loss arising from browser crashes, memory limitations, or tool errors during local processing",
                    "You are responsible for maintaining backups of any files you process using the Service",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground-secondary mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section id="acceptable-use">
                <h2 className="type-h2 font-display text-foreground mb-3">4. Acceptable Use</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                  You agree to use the Service only for lawful purposes. You must not use the Service to:
                </p>
                <ul className="space-y-2 text-sm text-foreground-secondary mb-4">
                  {[
                    "Process, create, distribute, or store content that is illegal in your jurisdiction",
                    "Violate any applicable laws, regulations, or third-party rights",
                    "Attempt to reverse-engineer, decompile, or extract source code from the Service",
                    "Scrape, crawl, or automate requests to the Service in a way that damages performance for other users",
                    "Transmit malicious code, viruses, or any software intended to damage or interfere with the Service",
                    "Misrepresent the source or origin of content processed by the Service",
                    "Use the Service to facilitate infringement of intellectual property rights",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  Because all processing is client-side, enforcement of acceptable use is primarily a matter of your own responsibility. Toolsz does not — and cannot — monitor the content of files you process. You are solely responsible for ensuring your use of the Service complies with all applicable laws and these Terms.
                </p>
              </section>

              <section id="ip">
                <h2 className="type-h2 font-display text-foreground mb-3">5. Intellectual Property</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                  <strong className="text-foreground">Toolsz IP:</strong> The Toolsz name, logo, website design, tool interfaces, and original code are owned by Toolsz and protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any part of the Service without our written permission.
                </p>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                  <strong className="text-foreground">Your Content:</strong> You retain full ownership of all files and content you process using the Service. Toolsz claims no intellectual property rights over files you upload, process, or download. Because files are never transmitted to our servers, no license grant to us is possible or necessary.
                </p>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  <strong className="text-foreground">Open-Source Libraries:</strong> Toolsz uses open-source libraries (including pdf-lib, Tesseract.js, PDF.js, and others) that are licensed under their respective open-source licenses. These libraries run client-side in your browser.
                </p>
              </section>

              <section id="disclaimer">
                <h2 className="type-h2 font-display text-foreground mb-3">6. Disclaimer of Warranties</h2>
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4 mb-4">
                  <p className="text-sm text-amber-800 font-medium">
                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
                  </p>
                </div>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                  To the fullest extent permitted by applicable law, Toolsz expressly disclaims all warranties, including but not limited to:
                </p>
                <ul className="space-y-2 text-sm text-foreground-secondary">
                  {[
                    "Warranties of merchantability, fitness for a particular purpose, or non-infringement",
                    "That the Service will be uninterrupted, error-free, or secure",
                    "That the results obtained from using the Service will be accurate or reliable",
                    "That any errors or defects in the Service will be corrected",
                    "That the Service is free of viruses or other harmful components (note: client-side processing is inherently isolated in your browser sandbox)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-foreground-secondary text-sm leading-relaxed mt-3">
                  You assume all risk associated with your use of the Service, including any risk to your computer, software, or data from using the Service.
                </p>
              </section>

              <section id="liability">
                <h2 className="type-h2 font-display text-foreground mb-3">7. Limitation of Liability</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                  To the fullest extent permitted by applicable law, Toolsz shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="space-y-2 text-sm text-foreground-secondary mb-4">
                  {[
                    "Loss of data or files arising from use of the Service",
                    "Loss of profits, revenue, or business opportunity",
                    "Cost of procuring substitute services",
                    "Any claim arising from errors or inaccuracies in tool output",
                    "Damages arising from your reliance on tool results for professional, medical, legal, or financial decisions",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground-secondary mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  Toolsz&apos;s total aggregate liability for any claims arising from or related to your use of the Service shall not exceed $0 (zero dollars), reflecting the fact that the Service is provided entirely free of charge. Some jurisdictions do not allow exclusion of certain warranties or limitations on liability, so some of these limitations may not apply to you.
                </p>
              </section>

              <section id="indemnification">
                <h2 className="type-h2 font-display text-foreground mb-3">8. Indemnification</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  You agree to defend, indemnify, and hold harmless Toolsz, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with: (a) your access to or use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) any content you process, create, or distribute using the Service.
                </p>
              </section>

              <section id="third-party">
                <h2 className="type-h2 font-display text-foreground mb-3">9. Third-Party Links</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  The Service may contain links to third-party websites, tools, or resources. These links are provided for convenience only. Toolsz does not endorse, control, or assume responsibility for the content, privacy practices, or terms of any third-party website. You access third-party websites at your own risk and subject to their respective terms of service and privacy policies.
                </p>
              </section>

              <section id="termination">
                <h2 className="type-h2 font-display text-foreground mb-3">10. Termination</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  Toolsz reserves the right to restrict, suspend, or terminate access to the Service, in whole or in part, at any time and for any reason, including (but not limited to) violation of these Terms. Because no account is required, &quot;termination&quot; in practice means blocking access from your IP address or device. You may stop using the Service at any time — no cancellation process is needed since there is no account, subscription, or stored data.
                </p>
              </section>

              <section id="governing-law">
                <h2 className="type-h2 font-display text-foreground mb-3">11. Governing Law</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  These Terms shall be governed by and construed in accordance with applicable law. Any dispute arising from these Terms or your use of the Service shall first be addressed through good-faith negotiation. If the dispute cannot be resolved informally, it shall be submitted to binding arbitration or the appropriate court of competent jurisdiction. Nothing in these Terms limits your statutory rights as a consumer in your jurisdiction.
                </p>
              </section>

              <section id="changes">
                <h2 className="type-h2 font-display text-foreground mb-3">12. Changes to These Terms</h2>
                <p className="text-foreground-secondary text-sm leading-relaxed">
                  We may update these Terms from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. Your continued use of the Service after changes are posted constitutes your acceptance of the updated Terms. If we make material changes, we will make reasonable efforts to notify users (e.g., via a notice on the homepage).
                </p>
                <p className="text-foreground-secondary text-sm leading-relaxed mt-3">
                  The core commitment — that Toolsz is free, processes files locally, and does not collect personal data — reflects the architecture of the Service and will not change.
                </p>
              </section>

              <section id="contact">
                <h2 className="type-h2 font-display text-foreground mb-4">13. Contact</h2>
                <div className="glass-card-premium p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-muted border border-primary-border flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">Questions About These Terms?</h3>
                      <p className="text-foreground-secondary text-sm leading-relaxed mb-3">
                        If you have questions about these Terms and Conditions, please contact us:
                      </p>
                      <a href="mailto:legal@toolsz.co" className="text-primary font-semibold text-sm hover:underline">
                        legal@toolsz.co
                      </a>
                      <p className="text-foreground-secondary text-xs mt-2">Website: https://www.toolsz.co</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer links */}
              <div className="pt-6 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Privacy Policy", href: "/privacy" },
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
