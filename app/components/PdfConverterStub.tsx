"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronUp, ArrowRight, Clock, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import ToolHero from "@/app/components/ToolHero";
import { FileText } from "lucide-react";

export interface PdfConverterStubProps {
  title: string;
  description: string;
  reason: string;
  alternatives: { name: string; href: string; external?: boolean }[];
  faqs: { q: string; a: string }[];
  relatedTools: { name: string; href: string }[];
}

export default function PdfConverterStub({
  title, description, reason, alternatives, faqs, relatedTools,
}: PdfConverterStubProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={FileText} title={title} description={description} backHref="/pdf-tools" backLabel="Back to PDF Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Browser Support Coming Soon</h3>
            <p className="text-foreground-secondary text-sm max-w-lg mx-auto">{reason}</p>
          </div>

          {alternatives.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3 text-center">Use These Alternatives Instead</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {alternatives.map((alt) => (
                  alt.external ? (
                    <a key={alt.href} href={alt.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-primary/30 bg-primary-muted text-primary text-xs font-semibold hover:border-primary transition-colors">
                      {alt.name}<ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link key={alt.href} href={alt.href}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-primary/30 bg-primary-muted text-primary text-xs font-semibold hover:border-primary transition-colors">
                      {alt.name}<ArrowRight className="w-3 h-3" />
                    </Link>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-panel rounded-xl border border-border overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-1 transition-colors">
                    <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-foreground-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-foreground-muted shrink-0" />}
                  </button>
                  {openFaq === i && <div className="px-5 pb-4 border-t border-border"><p className="text-sm text-foreground-secondary leading-relaxed pt-3">{faq.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedTools.length > 0 && (
          <div className="mt-8 mb-4">
            <h2 className="text-sm font-bold text-foreground mb-3">Related Converters</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map(t => <Link key={t.href} href={t.href} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary text-xs font-medium transition-colors bg-white">{t.name}<ArrowRight className="w-3 h-3" /></Link>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
