import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AZW3 to PDF Converter — Kindle to PDF | Toolsz",
  description: "Convert AZW3 Kindle ebooks to PDF. Learn about AZW3 to PDF conversion and discover the best tools — including Calibre — for converting Amazon Kindle format to PDF.",
  keywords: ["azw3 to pdf", "convert azw3 to pdf", "kindle fire to pdf", "azw3 pdf converter", "amazon kindle to pdf"],
  alternates: { canonical: "https://www.toolsz.co/azw3-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
