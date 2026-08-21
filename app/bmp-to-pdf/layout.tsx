import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free BMP to PDF Converter — No Upload, Browser-Based | Toolsz",
  description: "Convert BMP bitmap images to PDF free in your browser. No upload, no watermark. Combine multiple BMP files into a single PDF. Private and instant.",
  keywords: ["bmp to pdf", "convert bmp to pdf", "bitmap to pdf", "bmp pdf converter", "image to pdf"],
  alternates: { canonical: "https://www.toolsz.co/bmp-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
