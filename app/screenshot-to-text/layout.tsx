import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Screenshot to Text — OCR Tool | Toolsz",
  description:
    "Extract text from screenshots using OCR. Upload a screenshot and get all visible text instantly. Free, browser-based, no signup required.",
  keywords: [
    "screenshot to text",
    "screenshot ocr",
    "extract text from screenshot",
    "screenshot text extractor",
    "ocr screenshot",
  ],
  openGraph: {
    title: "Screenshot to Text — OCR Tool",
    description:
      "Extract text from screenshots using OCR. Free, browser-based, instant results.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/screenshot-to-text" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
