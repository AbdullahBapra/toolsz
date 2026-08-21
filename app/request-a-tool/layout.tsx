import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Free Online Tool — Tell Us What to Build Next | Toolsz",
  description: "Can't find the tool you need? Request it. We've built 47 tools directly from community requests. Submit your idea, vote on what others want, and track progress on our public roadmap.",
  keywords: ["request a tool", "suggest a tool", "community tool requests", "vote for tools", "free online tools 2026"],
  openGraph: {
    title: "Request a Tool — Toolsz Community",
    description: "Shape what we build next. 4,847 requests submitted. 47 tools built from the community.",
  },
  alternates: { canonical: "https://www.toolsz.co/request-a-tool" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
