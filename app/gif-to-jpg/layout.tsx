import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "GIF to JPG Converter — Free Online Tool",
  description: "Convert GIF to JPG online. Smaller file size, universal compatibility. Transparent areas filled with white. Free, private, instant.",
  alternates: { canonical: "https://www.toolsz.co/gif-to-jpg" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
