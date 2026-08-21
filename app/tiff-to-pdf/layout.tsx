import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free TIFF to PDF Converter — No Upload, Instant | Toolsz",
  description: "Convert TIFF images to PDF in your browser — free, private, no file upload required. Convert scanned TIF documents and high-res TIFF images to PDF. No watermarks.",
  keywords: ["tiff to pdf", "tif to pdf", "convert tiff to pdf", "tiff pdf converter", "scanned document to pdf", "image to pdf"],
  alternates: { canonical: "https://www.toolsz.co/tiff-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
