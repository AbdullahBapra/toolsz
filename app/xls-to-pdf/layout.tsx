import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free XLS to PDF Converter — No Upload, Legacy Excel | Toolsz",
  description: "Convert old XLS (Excel 97-2003) files to PDF — free, browser-based, no upload. XLS spreadsheets are converted with table formatting. Instant download. No watermarks.",
  keywords: ["xls to pdf", "convert xls to pdf", "old excel to pdf", "excel 97 to pdf", "xls file pdf", "legacy excel pdf"],
  alternates: { canonical: "https://www.toolsz.co/xls-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
