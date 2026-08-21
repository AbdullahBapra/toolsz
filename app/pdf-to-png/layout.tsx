import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF to PNG Converter — No Upload, Lossless | Toolsz",
  description: "Convert PDF pages to PNG images free — no file upload, browser-based. Lossless PNG output up to 300 DPI. All pages converted automatically. ZIP download. No watermarks.",
  keywords: ["pdf to png", "convert pdf to png", "pdf to image", "pdf pages to png", "extract images from pdf", "pdf to picture", "free pdf to png"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-png" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
