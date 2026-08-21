import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free GIF to PDF Converter — No Upload, Instant | Toolsz",
  description: "Convert GIF images to PDF in your browser — free, private, no file upload. Uses the first frame of animated GIFs. Combine multiple GIFs into one PDF document.",
  keywords: ["gif to pdf", "convert gif to pdf", "gif pdf converter", "animated gif to pdf", "image to pdf"],
  alternates: { canonical: "https://www.toolsz.co/gif-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
