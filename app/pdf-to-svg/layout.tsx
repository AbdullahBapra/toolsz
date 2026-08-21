import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to SVG Converter — Vector Conversion Info | Toolsz",
  description: "Learn about PDF to SVG vector conversion. Converting raster PDF pages to SVG requires specialized software. Find the best tools for PDF to SVG conversion.",
  keywords: ["pdf to svg", "convert pdf to svg", "pdf to vector", "pdf svg converter", "pdf to vector graphic"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-svg" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
