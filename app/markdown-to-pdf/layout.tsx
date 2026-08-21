import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Markdown to PDF Converter — No Upload, Styled Output | Toolsz",
  description: "Convert Markdown (.md) files to PDF — free, browser-based, no upload. Headings, bold, italic, code, and lists are all styled in the PDF output. No watermarks.",
  keywords: ["markdown to pdf", "md to pdf", "convert markdown to pdf", "readme to pdf", "markdown pdf converter", ".md to pdf"],
  alternates: { canonical: "https://www.toolsz.co/markdown-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
