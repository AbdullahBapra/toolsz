import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Card Scanner — Extract Contact Info | Toolsz",
  description:
    "Scan business cards and extract contact information using OCR. Upload a photo of a business card and get the name, phone, email, and address as text. Free, browser-based.",
  keywords: [
    "business card scanner",
    "business card ocr",
    "scan business card online",
    "extract contact from business card",
    "business card to text",
  ],
  openGraph: {
    title: "Business Card Scanner — Extract Contact Info",
    description:
      "Scan business cards and extract contact information using OCR. Free, browser-based, instant results.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/business-card-scanner" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
