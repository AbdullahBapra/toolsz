import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JPG to GIF Converter — Free Online Tool",
  description: "Convert JPG to GIF online. Free, private, instant — no upload needed.",
  alternates: { canonical: "https://www.toolsz.co/jpg-to-gif" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
