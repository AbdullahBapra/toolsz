import type { Metadata } from "next";
import { SITE_URL } from "@/app/utils/seo";

export const metadata: Metadata = {
  title: "Website Trust Checker — Free SSL, Security Headers & Trust Score Tool | Toolsz",
  description:
    "Check any website's trustworthiness instantly. Analyzes SSL certificate, HTTPS, security headers (HSTS, CSP, X-Frame-Options), robots.txt, sitemap, Open Graph tags, and response speed. Generates a 0–100 trust score. Free, no signup.",
  keywords: [
    "website trust checker",
    "website safety checker",
    "ssl checker",
    "security headers checker",
    "website legitimacy checker",
    "is website safe",
    "website trust score",
    "check website security",
    "https checker",
    "website analysis tool",
    "free website checker",
    "website security scanner",
  ],
  alternates: { canonical: `${SITE_URL}/website-trust-checker` },
  openGraph: {
    title: "Website Trust Checker — Free SSL & Security Score | Toolsz",
    description:
      "Enter any URL to get a trust score based on SSL, security headers, robots.txt, sitemap, OG tags, and response speed. Completely free.",
    url: `${SITE_URL}/website-trust-checker`,
    siteName: "Toolsz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Trust Checker — Free Security Score | Toolsz",
    description:
      "Check any website's SSL, security headers, and trust signals instantly. Free, no signup.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
