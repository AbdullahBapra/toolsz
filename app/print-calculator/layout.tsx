import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Print & Frame Calculator — Will My Photo Fit? | Toolsz",
  description:
    "Check if your photo will print at 8×10, A4, 4×6, or any size without cropping. See exactly what gets cut, get your DPI, and find the minimum resolution needed. Free, instant, 100% private.",
  alternates: { canonical: "https://www.toolsz.co/print-calculator" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
