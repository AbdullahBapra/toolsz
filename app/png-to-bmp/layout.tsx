import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PNG to BMP Converter — Free Online Tool",
  description: "Convert PNG to BMP format online. Raw uncompressed bitmap for legacy software. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/png-to-bmp" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
