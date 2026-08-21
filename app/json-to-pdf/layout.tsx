import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free JSON to PDF Converter — No Upload, Formatted | Toolsz",
  description: "Convert JSON files to PDF — free, browser-based, no upload. JSON is pretty-printed and formatted in a readable PDF document. Perfect for sharing API responses. No watermarks.",
  keywords: ["json to pdf", "convert json to pdf", "json file to pdf", "api response to pdf", "json document pdf"],
  alternates: { canonical: "https://www.toolsz.co/json-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
