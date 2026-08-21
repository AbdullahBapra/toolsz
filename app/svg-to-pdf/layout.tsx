import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SVG to PDF Converter — No Upload, Vector to PDF | Toolsz",
  description: "Convert SVG vector graphics to PDF in your browser — free, no file upload, no watermark. Preserve SVG quality in high-resolution PDF output. Combine multiple SVGs.",
  keywords: ["svg to pdf", "convert svg to pdf", "svg pdf converter", "vector to pdf", "svg document", "image to pdf"],
  alternates: { canonical: "https://www.toolsz.co/svg-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
