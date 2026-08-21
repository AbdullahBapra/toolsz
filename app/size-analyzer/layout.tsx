import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Is My File So Big? — PDF & Image Size Analyzer | Toolsz",
  description:
    "Upload a PDF or image and get a visual breakdown of what's eating the file size — embedded images, fonts, metadata, JavaScript, annotations. Free, instant, 100% private.",
  alternates: { canonical: "https://www.toolsz.co/size-analyzer" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
