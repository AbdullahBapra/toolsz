import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to PPT Converter — PowerPoint Format | Toolsz",
  description: "Convert PDF to PPT PowerPoint presentation. Learn about PDF to PowerPoint conversion and discover the best tools for converting PDF slides to editable PPTX format.",
  keywords: ["pdf to ppt", "pdf to powerpoint", "convert pdf to ppt", "pdf to pptx", "pdf to slides", "pdf presentation"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-ppt" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
