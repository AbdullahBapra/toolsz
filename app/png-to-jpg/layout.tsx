import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PNG to JPG Converter — No Upload, Instant, Private | Toolsz",
  description:
    "Convert PNG to JPG free online. Adjust JPEG quality, handles transparent backgrounds. 100% browser-based — your files never leave your device. No signup, no watermarks.",
  keywords: [
    "png to jpg",
    "png to jpeg",
    "convert png to jpg",
    "png to jpg converter",
    "png to jpeg converter",
    "free png to jpg",
  ],
  openGraph: {
    title: "Free PNG to JPG Converter — No Upload Required",
    description:
      "Convert PNG images to JPG instantly in your browser. Adjust quality, handles transparency. Free, private, no signup.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/png-to-jpg" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
