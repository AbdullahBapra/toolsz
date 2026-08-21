import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free XML to PDF Converter — No Upload, Formatted | Toolsz",
  description: "Convert XML files to PDF — free, browser-based, no upload. XML content is formatted in a clean, readable PDF document. Instant download. No watermarks, no sign-up.",
  keywords: ["xml to pdf", "convert xml to pdf", "xml file to pdf", "xml document pdf", "xml to document"],
  alternates: { canonical: "https://www.toolsz.co/xml-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
