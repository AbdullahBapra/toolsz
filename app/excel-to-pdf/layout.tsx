import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Excel to PDF Converter — No Upload, All Sheets | Toolsz",
  description: "Convert Excel XLSX files to PDF — free, browser-based, no upload. All sheets are converted with table formatting preserved. Instant download. No watermarks, no sign-up.",
  keywords: ["excel to pdf", "xlsx to pdf", "convert excel to pdf", "spreadsheet to pdf", "excel file pdf", "xls to pdf online"],
  alternates: { canonical: "https://www.toolsz.co/excel-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
