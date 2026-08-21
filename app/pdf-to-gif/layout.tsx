import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF to GIF Converter — Animated Slideshow | Toolsz",
  description: "Convert PDF to animated GIF — turn each PDF page into an animation frame. Free, browser-based, no upload. Perfect for PDF presentations and slideshows. No watermarks.",
  keywords: ["pdf to gif", "convert pdf to gif", "pdf to animated gif", "pdf slideshow gif", "pdf pages to gif", "pdf animation"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-gif" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
