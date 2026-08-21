import type { Metadata } from "next";
import { getToolMetadata, getBreadcrumbLd, getWebApplicationLd, getFaqPageLd, getHowToLd } from "@/app/utils/seo";
import ToolSeoFooter from "@/app/components/ToolSeoFooter";

export const metadata: Metadata = getToolMetadata("pdf-to-jpg");

const breadcrumbLd = getBreadcrumbLd("pdf-to-jpg");
const webAppLd = getWebApplicationLd("pdf-to-jpg");
const faqLd = getFaqPageLd("pdf-to-jpg");
const howToLd = getHowToLd("pdf-to-jpg");

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
      <ToolSeoFooter slug="pdf-to-jpg" />
    </>
  );
}
