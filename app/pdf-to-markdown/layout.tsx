import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF to Markdown Converter — No Upload, Instant | Toolsz",
  description: "Convert PDF text content to Markdown — free, browser-based, no upload. Each PDF page exported as a Markdown section with headers. Ideal for documentation and wikis.",
  keywords: ["pdf to markdown", "pdf to md", "convert pdf to markdown", "pdf text to markdown", "pdf to documentation"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-markdown" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
