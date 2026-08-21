import FaqAccordion from "./FaqAccordion";
import { getToolSeoContent } from "@/app/utils/seo-content";
import { RELATED_TOOLS_MAP } from "@/app/utils/toolLinks";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ListOrdered, Zap } from "lucide-react";

interface ToolSeoFooterProps {
  slug: string;
}

export default function ToolSeoFooter({ slug }: ToolSeoFooterProps) {
  const content = getToolSeoContent(slug);
  if (!content) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pb-12 sm:pb-16">
      {/* Request a Tool CTA — visible right after tool UI, before FAQs */}
      <div className="mt-8 rounded-2xl bg-linear-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Missing a tool you need?</p>
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

      {/* FAQ Section */}
      {content.faqItems.length > 0 && (
        <div className="mt-10 sm:mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="type-h2 font-display text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="glass-panel rounded-[16px] p-5 sm:p-7">
            <FaqAccordion items={content.faqItems} />
          </div>
        </div>
      )}

      {/* How-To Steps */}
      {content.howToSteps && content.howToSteps.length > 0 && (
        <div className="mt-10 sm:mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center">
              <ListOrdered className="w-4 h-4 text-primary" />
            </div>
            <h2 className="type-h2 font-display text-foreground">
              How to Use This Tool
            </h2>
          </div>
          <div className="glass-panel rounded-[16px] p-5 sm:p-7">
            <ol className="space-y-4">
              {content.howToSteps.map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-muted border border-primary-border flex items-center justify-center text-primary font-bold text-sm">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{step.step}</p>
                    <p className="type-small text-foreground-secondary leading-relaxed mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Related Tools */}
      {(() => {
        const mapTools = RELATED_TOOLS_MAP[slug] ?? [];
        const displayTools = content.relatedTools.length > 0 ? content.relatedTools : mapTools;
        if (displayTools.length === 0) return null;
        return (
          <div className="mt-10 sm:mt-14">
            <h2 className="type-h2 font-display text-foreground mb-6">
              Related Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="glass-card-premium p-4 flex items-center gap-3 group hover:border-primary/30 transition-colors duration-150"
                >
                  <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {tool.name}
                    </p>
                    <p className="type-small text-foreground-secondary leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}
    </section>
  );
}
