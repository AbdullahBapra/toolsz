import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free RTF to PDF Converter — No Upload, Rich Text to PDF | Toolsz",
  description: "Convert RTF files to PDF — free, browser-based, no upload. Rich Text Format documents are converted with basic formatting preserved. Instant download. No watermarks.",
  keywords: ["rtf to pdf", "convert rtf to pdf", "rich text to pdf", ".rtf to pdf", "wordpad to pdf", "rtf pdf converter"],
  alternates: { canonical: "https://www.toolsz.co/rtf-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
