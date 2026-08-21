import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AVIF to PDF Converter — No Upload, Browser-Based | Toolsz",
  description: "Convert AVIF images to PDF in your browser — free, private, no upload. Convert next-gen AVIF photos and graphics to PDF instantly. No watermarks, no limits.",
  keywords: ["avif to pdf", "convert avif to pdf", "avif pdf converter", "avif to document", "image to pdf"],
  alternates: { canonical: "https://www.toolsz.co/avif-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
