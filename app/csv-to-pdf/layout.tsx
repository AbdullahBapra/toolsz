import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free CSV to PDF Converter — No Upload, Table Formatting | Toolsz",
  description: "Convert CSV files to PDF — free, browser-based, no upload. CSV data is formatted as a styled table in a professional PDF. Instant download, no watermarks, no sign-up.",
  keywords: ["csv to pdf", "convert csv to pdf", "csv file to pdf", "spreadsheet to pdf", "csv to document", "table to pdf"],
  alternates: { canonical: "https://www.toolsz.co/csv-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
