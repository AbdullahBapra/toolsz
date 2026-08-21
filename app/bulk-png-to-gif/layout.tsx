import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk PNG to GIF Converter — Batch Convert Images to GIF | Toolsz",
  description:
    "Batch convert multiple PNG files to GIF format at once. Download all converted GIFs as a ZIP file. Browser-based — no uploads, no signup, completely free.",
  keywords: [
    "bulk png to gif",
    "batch png to gif",
    "batch convert png gif",
    "multiple png to gif",
    "bulk image to gif",
  ],
  openGraph: {
    title: "Bulk PNG to GIF Converter — Batch Convert & Download ZIP",
    description:
      "Convert multiple PNG images to GIF in one click. Download as ZIP. Free, private, browser-based.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-png-to-gif" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
