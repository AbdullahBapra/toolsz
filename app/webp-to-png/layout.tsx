import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free WebP to PNG Converter — Universal Compatibility, No Upload | Toolsz",
  description:
    "Convert WebP to PNG free online. PNG works everywhere — Photoshop, email, Windows, legacy software. Lossless conversion. Browser-based, private, instant.",
  keywords: [
    "webp to png",
    "convert webp to png",
    "webp to png converter",
    "free webp to png",
    "webp png conversion",
  ],
  openGraph: {
    title: "Free WebP to PNG Converter — Maximum Compatibility",
    description:
      "Convert WebP images to PNG for universal compatibility. Works in Photoshop, email, and Windows. Free, private, lossless.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/webp-to-png" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
