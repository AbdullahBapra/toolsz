import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free JPEG to PDF Converter — No Upload, Instant | Toolsz",
  description: "Convert JPEG images to PDF free and instantly in your browser. No file uploads, no sign-up, no watermarks. Combine multiple JPEG photos into a single PDF document.",
  keywords: ["jpeg to pdf", "jpg to pdf", "convert jpeg to pdf", "jpeg pdf", "photo to pdf", "image to pdf free"],
  alternates: { canonical: "https://www.toolsz.co/jpeg-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
