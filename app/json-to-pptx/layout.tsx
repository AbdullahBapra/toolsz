import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to PPTX — Convert JSON to PowerPoint | Toolsz",
  description: "Convert structured JSON data to a polished PowerPoint presentation with 5 layouts and 5 themes. Free, instant, runs entirely in your browser.",
  alternates: { canonical: "https://www.toolsz.co/json-to-pptx" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
