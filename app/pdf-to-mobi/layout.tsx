import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to MOBI Converter — Kindle Format | Toolsz",
  description: "Convert PDF to MOBI for Kindle eReaders. Learn about PDF to MOBI conversion and the best tools — including free desktop apps — for converting PDF to Kindle MOBI format.",
  keywords: ["pdf to mobi", "convert pdf to mobi", "pdf to kindle", "pdf mobi converter", "pdf to kindle format"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-mobi" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
