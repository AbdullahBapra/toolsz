import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amazon Image Resizer — 1000×1000 Product Photos | Toolsz",
  description:
    "Resize product photos to Amazon's 1000×1000 pixel standard. White background, JPG output, 90% quality. Meets Amazon main image requirements. Free, browser-based, no signup.",
  keywords: [
    "amazon image resizer",
    "amazon product image size",
    "amazon 1000x1000 image",
    "amazon white background image",
    "amazon main image requirements",
  ],
  openGraph: {
    title: "Amazon Image Resizer — 1000×1000 Product Photos",
    description:
      "Resize product photos to Amazon's 1000×1000 standard with white background. Free, private, browser-based.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/amazon-image-resizer" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
