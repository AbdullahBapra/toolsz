/**
 * Generates layout.tsx files for every tool page with SEO metadata.
 * Run: node scripts/generate-tool-layouts.js
 */
const fs = require("fs");
const path = require("path");

const toolSlugs = [
  // PDF Tools
  "compress-pdf", "pdf-to-jpg", "merge-pdf", "pdf-to-text", "pdf-to-data",
  "highlight-extractor", "pdf-editor", "flipbook-pdf", "split-pdf", "rotate-pdf",
  "watermark-pdf", "redact-pdf", "pdf-diff", "pdf-form-filler", "html-to-pdf",
  "invoice-generator", "sign-pdf", "pptx-to-pdf", "unlock-pdf", "protect-pdf",
  "organize-pdf", "page-numbers", "crop-pdf", "flatten-pdf", "extract-images-pdf",
  "pdf-ocr", "pdf-to-word", "pdf-to-excel",
  // Image Tools
  "compress-image", "image-to-pdf", "resize-image", "image-to-text",
  "convert-image", "edit-image", "blur-background", "heic-to-jpg", "exif-remover",
  "batch-resize", "remove-bg", "id-photo", "social-image", "color-blind-simulator",
  "watermark-remover", "video-to-gif", "crop-image", "rotate-image", "split-image",
  "gif-maker", "collage-maker", "meme-generator", "annotate-image", "upscale-image",
  "photo-enhancer", "colorize-image", "watermark-image", "blur-face", "html-to-image",
  // Dev Tools
  "json-preview", "api-formatter", "code-screenshot", "markdown-docs",
  "fake-data", "email-signature", "svg-optimizer", "qr-code", "barcode",
  "password-generator", "json-csv", "favicon-generator", "color-picker",
  "word-counter", "base64", "regex-tester", "gradient-generator",
  "lorem-ipsum", "diff-checker",
];

const appDir = path.join(__dirname, "..", "app");

let created = 0;
let skipped = 0;

for (const slug of toolSlugs) {
  const toolDir = path.join(appDir, slug);
  const layoutPath = path.join(toolDir, "layout.tsx");

  // Ensure directory exists
  if (!fs.existsSync(toolDir)) {
    fs.mkdirSync(toolDir, { recursive: true });
  }

  // Don't overwrite existing layouts
  if (fs.existsSync(layoutPath)) {
    console.log(`  SKIP ${slug} (layout.tsx already exists)`);
    skipped++;
    continue;
  }

  const content = `import type { Metadata } from "next";
import { getToolMetadata, getBreadcrumbLd, getWebApplicationLd } from "@/app/utils/seo";

export const metadata: Metadata = getToolMetadata("${slug}");

const breadcrumbLd = getBreadcrumbLd("${slug}");
const webAppLd = getWebApplicationLd("${slug}");

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
      {children}
    </>
  );
}
`;

  fs.writeFileSync(layoutPath, content, "utf8");
  console.log(`  Created ${slug}/layout.tsx`);
  created++;
}

console.log(`\nDone: ${created} layouts created, ${skipped} skipped (already existed).`);
