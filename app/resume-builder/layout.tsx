import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Resume & CV Builder — 100 Templates, ATS Score, PDF Export | Toolsz",
  description:
    "Build a stunning resume or CV in minutes. Choose from 100 premium templates (Modern, Executive, Minimal, Academic, ATS-Safe & more), get a real-time ATS compatibility score, match keywords from job descriptions, add 10+ sections, customize fonts & spacing, and download a pixel-perfect PDF — no signup, no watermarks, 100% private.",
  keywords: [
    "free resume builder","cv builder","ATS resume","resume templates","resume maker",
    "ATS friendly resume","resume PDF download","professional resume template",
    "free CV maker","resume builder no watermark","resume builder online free",
    "academic CV template","executive resume template","modern resume template",
    "ATS score checker","job keyword matcher","resume design tool",
    "download resume PDF","resume builder 2025","best free resume builder",
  ],
  openGraph: {
    title: "Free Resume & CV Builder — 100 Templates, ATS Score, PDF Export",
    description: "100 premium templates, real-time ATS score, job keyword matcher, 10 sections, fonts & spacing. Download PDF free.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/resume-builder" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
