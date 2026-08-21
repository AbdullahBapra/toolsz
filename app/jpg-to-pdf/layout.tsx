import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free JPG to PDF Converter — No Upload, No Watermark | Toolsz",
  description: "Convert JPG images to PDF instantly — free, private, no file upload. Combine multiple JPG photos into one PDF. Choose A4 fit, fill, or original size. Works offline.",
  keywords: ["jpg to pdf", "jpeg to pdf", "convert jpg to pdf", "jpg pdf converter", "image to pdf", "photo to pdf", "free jpg to pdf"],
  alternates: { canonical: "https://www.toolsz.co/jpg-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
