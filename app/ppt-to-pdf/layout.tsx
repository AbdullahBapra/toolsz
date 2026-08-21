import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PPT to PDF Converter — PowerPoint to PDF | Toolsz",
  description: "Convert PPT PowerPoint presentations to PDF. Our PPTX to PDF tool supports modern PowerPoint files. Learn about PPT to PDF conversion and the best free online tools.",
  keywords: ["ppt to pdf", "powerpoint to pdf", "convert ppt to pdf", "pptx to pdf", "presentation to pdf", "slides to pdf"],
  alternates: { canonical: "https://www.toolsz.co/ppt-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
