import type { Metadata } from "next";
import { getToolMetadata, getBreadcrumbLd, getWebApplicationLd, getFaqPageLd, getHowToLd } from "@/app/utils/seo";
import ToolSeoFooter from "@/app/components/ToolSeoFooter";

export const metadata: Metadata = getToolMetadata("multi-converter");

const breadcrumbLd = getBreadcrumbLd("multi-converter");
const webAppLd = getWebApplicationLd("multi-converter");
const faqLd = getFaqPageLd("multi-converter");
const howToLd = getHowToLd("multi-converter");

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      {webAppLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }}
        />
      )}
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      {howToLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
        />
      )}
      {children}
      <ToolSeoFooter slug="multi-converter" />
    </>
  );
}
