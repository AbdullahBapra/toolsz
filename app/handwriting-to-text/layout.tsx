import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Handwriting to Text Converter — OCR for Notes | Toolsz",
  description:
    "Convert handwritten notes to digital text using OCR. Upload a photo of your handwriting and extract the text. Free, browser-based, no signup required.",
  keywords: [
    "handwriting to text",
    "handwriting ocr",
    "convert handwriting to text",
    "handwritten notes to text",
    "digitize handwriting",
  ],
  openGraph: {
    title: "Handwriting to Text Converter — OCR for Notes",
    description:
      "Convert handwritten notes and documents to digital text using OCR. Free, browser-based.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/handwriting-to-text" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
