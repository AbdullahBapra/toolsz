import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free WebP to PDF Converter — No Upload, Instant | Toolsz",
  description: "Convert WebP images to PDF in your browser — free, private, no upload required. Combine multiple WebP files into one PDF. Works offline. No watermarks.",
  keywords: ["webp to pdf", "convert webp to pdf", "webp pdf converter", "webp to document", "image to pdf"],
  alternates: { canonical: "https://www.toolsz.co/webp-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
