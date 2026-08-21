import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF to CSV Converter — Extract Data, No Upload | Toolsz",
  description: "Extract text from PDF pages and export as CSV — free, browser-based, no upload. Each PDF page becomes a CSV row. Ideal for data extraction and spreadsheet workflows.",
  keywords: ["pdf to csv", "convert pdf to csv", "pdf data extraction", "pdf to spreadsheet", "extract pdf text", "pdf to table"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-csv" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
