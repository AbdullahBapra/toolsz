import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PNG to PDF Converter — No Upload, Lossless | Toolsz",
  description: "Convert PNG images to PDF free — no upload, no watermark, browser-based. Preserves PNG transparency and quality. Combine multiple PNGs into one PDF document.",
  keywords: ["png to pdf", "convert png to pdf", "png pdf converter", "transparent png to pdf", "image to pdf", "free png to pdf"],
  alternates: { canonical: "https://www.toolsz.co/png-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
