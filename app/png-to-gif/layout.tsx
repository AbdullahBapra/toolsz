import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PNG to GIF Converter — Static GIF, No Upload | Toolsz",
  description:
    "Convert PNG to GIF free online. Creates a static single-frame GIF. 256-color output, supports binary transparency. Browser-based — no uploads, no signup, instant.",
  keywords: [
    "png to gif",
    "convert png to gif",
    "png to gif converter",
    "free png to gif",
    "image to gif",
  ],
  openGraph: {
    title: "Free PNG to GIF Converter — No Upload Required",
    description:
      "Convert PNG images to GIF format instantly. Static GIF output, binary transparency support. Free, private, browser-based.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/png-to-gif" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
