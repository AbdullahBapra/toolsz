import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JPG to BMP Converter — Free Online Tool",
  description: "Convert JPG to BMP format online. Uncompressed bitmap for legacy apps and Windows Paint. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/jpg-to-bmp" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
