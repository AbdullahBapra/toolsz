import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free HEIC to PDF Converter — No Upload, iPhone Photos | Toolsz",
  description: "Convert iPhone HEIC photos to PDF free in your browser. No file upload, no cloud server. Convert .heic and .heif files to PDF instantly. Private and watermark-free.",
  keywords: ["heic to pdf", "heif to pdf", "iphone photo to pdf", "convert heic to pdf", "heic pdf converter", "apple photo to pdf"],
  alternates: { canonical: "https://www.toolsz.co/heic-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
