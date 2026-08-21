import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF — Convert DOCX to PDF Free | Toolsz",
  description: "Convert Word documents (.docx) to PDF entirely in your browser. Free, instant, and 100% private — your file never leaves your device.",
  alternates: { canonical: "https://www.toolsz.co/word-to-pdf" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
