import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Table Extraction from Image — OCR Table Reader | Toolsz",
  description:
    "Extract tables from images and screenshots into CSV or Excel format. Upload an image with a table and get structured data. Free, browser-based, no signup.",
  keywords: [
    "table extraction from image",
    "image to table",
    "screenshot to table",
    "ocr table extractor",
    "extract table from image",
  ],
  openGraph: {
    title: "Table Extraction from Image — OCR Table Reader",
    description:
      "Extract tables from images and screenshots into CSV or Excel. Free, browser-based.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/table-extraction-from-image" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
