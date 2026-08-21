import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to DOC Converter — Word Document Format | Toolsz",
  description: "Convert PDF to DOC Word document. Learn about PDF to DOC conversion and discover browser-based tools for converting PDF files to editable Word documents.",
  keywords: ["pdf to doc", "pdf to word doc", "convert pdf to doc", "pdf to docx", "pdf word converter"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-doc" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
