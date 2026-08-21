import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JS to PPTX — JavaScript PowerPoint Generator | Toolsz",
  description: "Write JavaScript using the pptxgenjs API and download a PowerPoint file instantly. Full API access — shapes, tables, bullets, and more. Free, client-side.",
  alternates: { canonical: "https://www.toolsz.co/js-to-pptx" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
