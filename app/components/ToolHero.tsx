import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface ToolHeroProps {
  icon: LucideIcon;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

export default function ToolHero({
  icon: Icon,
  title,
  description,
  backHref = "/",
  backLabel = "Back to Home",
}: ToolHeroProps) {
  return (
    <div className="tool-hero relative overflow-hidden p-5 sm:p-8 md:p-10 mb-6 sm:mb-8">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="relative z-10">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary text-sm font-semibold mb-6 sm:mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="min-w-0 pt-1">
            <h1 className="type-h1 font-display gradient-text mb-2 sm:mb-3 break-words">
              {title}
            </h1>
            <p className="text-foreground-secondary text-[15px] sm:text-lg md:text-xl font-medium max-w-3xl leading-relaxed break-words">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
