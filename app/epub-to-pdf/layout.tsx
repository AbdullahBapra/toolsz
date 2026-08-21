import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free EPUB to PDF Converter — No Upload, eBook to PDF | Toolsz",
  description: "Convert EPUB eBooks to PDF — free, browser-based, no upload. EPUB chapters are extracted and combined into a PDF document. Instant download. No watermarks, no sign-up.",
  keywords: ["epub to pdf", "convert epub to pdf", "ebook to pdf", ".epub to pdf", "epub pdf converter", "kindle alternative"],
  alternates: { canonical: "https://www.toolsz.co/epub-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
