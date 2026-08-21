import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PNG to ICO Converter — Free Favicon Creator",
  description: "Convert PNG to ICO favicon file online. Creates multiple sizes (256×256, 48×48, 32×32, 16×16) in one .ico file. Free, private, instant.",
  alternates: { canonical: "https://www.toolsz.co/png-to-ico" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
