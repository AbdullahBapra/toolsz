import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MOBI to PDF Converter — Kindle to PDF | Toolsz",
  description: "Convert MOBI Kindle ebooks to PDF. Learn about MOBI to PDF conversion and discover the best free tools — including Calibre — for converting Kindle books to PDF format.",
  keywords: ["mobi to pdf", "convert mobi to pdf", "kindle to pdf", "mobi pdf converter", "kindle book to pdf"],
  alternates: { canonical: "https://www.toolsz.co/mobi-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
