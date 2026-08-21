import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Product Roadmap 2026 — See What We're Building at Toolsz",
  description: "A fully transparent public roadmap. See what Toolsz has shipped, what's in progress right now, what the community is voting for next, and every release in our changelog.",
  keywords: ["toolsz roadmap", "product roadmap 2026", "upcoming free tools", "new tools coming soon", "tool requests roadmap"],
  openGraph: {
    title: "Toolsz Public Roadmap — Transparent, Community-Driven",
    description: "219 tools shipped. Dark mode 80% done. Excel Formula Generator in progress. See everything.",
  },
  alternates: { canonical: "https://www.toolsz.co/roadmap" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
