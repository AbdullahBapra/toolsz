import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Toolsz",
  description:
    "Terms and Conditions for using Toolsz.co — 219 Free browser-based tools. Read about acceptable use, no-upload processing, intellectual property, and our no-warranty policy.",
  keywords: [
    "toolsz terms and conditions",
    "toolsz terms of service",
    "toolsz terms of use",
    "free tool terms",
    "browser tool acceptable use",
  ],
  openGraph: {
    title: "Terms & Conditions — Toolsz",
    description: "Terms of use for Toolsz.co — 219 Free browser-based tools.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/terms" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
