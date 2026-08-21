import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF to JSON Converter — Extract Structured Data | Toolsz",
  description: "Extract PDF text content as structured JSON — free, no upload, browser-based. Each page's text exported with page number metadata. Perfect for data pipelines and APIs.",
  keywords: ["pdf to json", "convert pdf to json", "pdf data extraction json", "pdf text to json", "extract pdf structured data"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-json" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
