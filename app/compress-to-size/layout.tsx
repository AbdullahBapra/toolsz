import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Image to Exact Size — US Passport, UK Visa, Schengen, AUS | Toolsz",
  description:
    "Compress any photo to an exact file size in KB or MB. One-click presets for US Passport (240KB), UK Passport (1MB), Schengen EU Visa, Australian Passport, Canadian IRCC, USCIS Green Card, LinkedIn, and more. Free, instant, 100% private — nothing uploaded.",
  keywords: [
    "compress image to exact size","compress photo to kb","image resizer kb",
    "us passport photo size","uk passport photo size","schengen visa photo size",
    "australian passport photo","canadian passport photo ircc","uscis photo requirements",
    "compress image for government form","resize photo for visa application",
    "photo size reducer","image file size reducer free","compress jpg to 50kb",
    "linkedin photo size resize","uk home office photo requirements",
    "compress image online free","photo kb reducer",
  ],
  openGraph: {
    title: "Compress Image to Exact KB/MB — Free Tool",
    description: "US Passport, UK Visa, Schengen, AUS, Canadian IRCC presets. Set a target size and get an exact match instantly.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/compress-to-size" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
