import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF to HTML Converter — No Upload, Browser-Based | Toolsz",
  description: "Convert PDF text content to HTML — free, no upload, browser-based. Each PDF page becomes an HTML section. Export PDF content as a web page. No watermarks.",
  keywords: ["pdf to html", "convert pdf to html", "pdf to web page", "pdf content to html", "extract pdf text html"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-html" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
