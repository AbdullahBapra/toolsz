import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "BMP to JPG Converter — Free Online Tool",
  description: "Convert BMP to JPG for much smaller file sizes. Perfect for sharing photos from Windows Paint or legacy apps. Free, private, instant.",
  alternates: { canonical: "https://www.toolsz.co/bmp-to-jpg" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
