import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Roast & Quality Score — Brutal PDF Analysis | Toolsz",
  description:
    "Upload any PDF and get a brutally honest quality score — file efficiency, font load, embedded images, safety (JavaScript detection), metadata completeness, and PDF version. Download a shareable score card. Free, instant, 100% private.",
  alternates: { canonical: "https://www.toolsz.co/pdf-roast" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
