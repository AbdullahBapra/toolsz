import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free JPG to PNG Converter — Lossless Output, No Upload | Toolsz",
  description:
    "Convert JPG to PNG free online. Get a lossless PNG from your JPEG. Ideal for editing workflows, design software, and transparency needs. Browser-based, private, instant.",
  keywords: [
    "jpg to png",
    "jpeg to png",
    "convert jpg to png",
    "jpg to png converter",
    "jpeg to png converter",
    "free jpg to png",
  ],
  openGraph: {
    title: "Free JPG to PNG Converter — Lossless Output",
    description:
      "Convert JPG/JPEG to PNG instantly. Lossless output for editing and design workflows. Free, private, no signup.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/jpg-to-png" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
