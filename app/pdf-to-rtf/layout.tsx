import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to RTF Converter — Format Info & Alternatives | Toolsz",
  description: "Convert PDF to RTF (Rich Text Format). Learn about PDF to RTF conversion and discover the best browser and desktop tools for converting PDF to editable RTF documents.",
  keywords: ["pdf to rtf", "convert pdf to rtf", "pdf to rich text", "pdf to wordpad", "pdf rtf converter"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-rtf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
