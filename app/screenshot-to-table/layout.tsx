import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Screenshot to Excel / CSV — Image Table OCR | Toolsz",
  description:
    "Convert screenshots of tables to editable CSV or Excel in seconds. Paste a screenshot of any table — from PDFs, websites, reports — and get a clean, editable spreadsheet. Free, instant, 100% private.",
  alternates: { canonical: "https://www.toolsz.co/screenshot-to-table" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
