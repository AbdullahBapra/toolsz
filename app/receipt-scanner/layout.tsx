import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receipt Scanner — Extract Text from Receipts | Toolsz",
  description:
    "Scan receipts and extract text using OCR. Upload a photo of your receipt and get all text including items, prices, totals, and dates. Free, browser-based, no signup.",
  keywords: [
    "receipt scanner",
    "receipt ocr",
    "scan receipt online",
    "extract text from receipt",
    "receipt text extractor",
  ],
  openGraph: {
    title: "Receipt Scanner — Extract Text from Receipts",
    description:
      "Scan receipts and extract text using OCR. Free, browser-based, instant results.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/receipt-scanner" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
