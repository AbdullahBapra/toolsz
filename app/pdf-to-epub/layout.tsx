import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to EPUB Converter — eBook Format | Toolsz",
  description: "Convert PDF to EPUB eBook format for Kindle, Apple Books, and eReaders. Learn about PDF to EPUB conversion and the best tools for converting PDFs to eBooks.",
  keywords: ["pdf to epub", "convert pdf to epub", "pdf to ebook", "pdf epub converter", "pdf to kindle", "pdf to ereader"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-epub" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
