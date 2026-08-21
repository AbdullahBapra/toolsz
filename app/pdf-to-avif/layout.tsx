import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to AVIF Converter — Next-Gen Image Format | Toolsz",
  description: "Convert PDF pages to AVIF — the next-gen image format with superior compression. Learn about AVIF format and the best tools for PDF to AVIF conversion.",
  keywords: ["pdf to avif", "convert pdf to avif", "pdf to image avif", "pdf avif converter"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-avif" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
