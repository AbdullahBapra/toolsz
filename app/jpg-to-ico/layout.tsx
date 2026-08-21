import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JPG to ICO Converter — Free Favicon Creator",
  description: "Convert JPG to ICO favicon online. Creates multi-size .ico file (16, 32, 48, 256px). Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/jpg-to-ico" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
