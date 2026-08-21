import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passport Photo Maker Free | 50 Plus Countries Supported",
  description:
    "Create passport and visa photos for 50+ countries online for free. US passport, Schengen visa, UK, India, Pakistan, China specs. Auto-crop, white background, 300 DPI. No upload.",
  alternates: { canonical: "https://www.toolsz.co/passport-photo" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
