import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to XLS Converter — Excel Spreadsheet | Toolsz",
  description: "Convert PDF to XLS Excel spreadsheet. Learn about PDF to XLS conversion and discover the best tools to extract tabular data from PDFs into Excel files.",
  keywords: ["pdf to xls", "pdf to excel xls", "convert pdf to xls", "pdf to spreadsheet", "pdf xls converter"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-xls" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
