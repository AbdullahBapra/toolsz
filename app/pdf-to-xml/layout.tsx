import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF to XML Converter — No Upload, Structured Output | Toolsz",
  description: "Extract PDF text as XML — free, browser-based, no upload. Each page wrapped in XML elements with page number attributes. Ideal for data processing workflows.",
  keywords: ["pdf to xml", "convert pdf to xml", "pdf data extraction xml", "pdf text to xml", "pdf to structured xml"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-xml" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
