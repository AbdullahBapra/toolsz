import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SVG to ICO Converter — Free Favicon Creator",
  description: "Convert SVG to ICO favicon online. Creates crisp multi-size .ico file from your vector logo. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/svg-to-ico" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
