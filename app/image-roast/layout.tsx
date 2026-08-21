import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Roast & Quality Score — Brutally Honest Analysis | Toolsz",
  description:
    "Upload any image and get a brutally honest quality score — sharpness, resolution, noise, compression, exposure, color vibrancy. Download a shareable score card. Free, instant, 100% private.",
  alternates: { canonical: "https://www.toolsz.co/image-roast" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
