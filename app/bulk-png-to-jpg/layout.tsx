import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk PNG to JPG Converter — Batch Convert 50+ Files, Download as ZIP | Toolsz",
  description:
    "Batch convert multiple PNG files to JPG at once. Adjust quality for all files, download a single ZIP. 100% browser-based — no uploads, no signup, no limits.",
  keywords: [
    "bulk png to jpg",
    "batch png to jpg",
    "bulk png to jpeg",
    "batch convert png to jpg",
    "multiple png to jpg",
    "bulk image converter",
  ],
  openGraph: {
    title: "Bulk PNG to JPG Converter — Batch Convert & Download ZIP",
    description:
      "Convert multiple PNG files to JPG in one click. Download all as ZIP. Free, private, no file limits.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-png-to-jpg" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
