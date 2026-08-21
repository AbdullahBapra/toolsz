import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "WebP to BMP Converter — Free Online Tool",
  description: "Convert WebP to BMP format online. Uncompressed bitmap for legacy software. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/webp-to-bmp" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
