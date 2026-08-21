import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free DOC to PDF Converter — No Upload, Word to PDF | Toolsz",
  description: "Convert DOC files to PDF — free, browser-based, no upload. Supports .doc and .docx Word documents. Formatting and content preserved in the PDF output. No watermarks.",
  keywords: ["doc to pdf", "convert doc to pdf", "word to pdf", "docx to pdf", ".doc to pdf", "word document pdf"],
  alternates: { canonical: "https://www.toolsz.co/doc-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
