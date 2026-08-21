import type { MetadataRoute } from "next";
import { allToolSlugs, SITE_URL } from "@/app/utils/seo";

const categoryPages = ["/pdf-tools", "/image-tools", "/dev-tools", "/all-tools"];

const staticContentPages = [
  { path: "/about", priority: 0.9 },
  { path: "/privacy", priority: 0.7 },
  { path: "/terms", priority: 0.7 },
  { path: "/roadmap", priority: 0.8 },
  { path: "/request-a-tool", priority: 0.7 },
  { path: "/best-free-pdf-tools", priority: 0.9 },
  { path: "/best-free-image-tools", priority: 0.9 },
  { path: "/best-free-developer-tools", priority: 0.9 },
  { path: "/free-alternatives-to-adobe-acrobat", priority: 0.85 },
  { path: "/free-alternatives-to-smallpdf", priority: 0.85 },
];

// All tool slugs NOT already covered by toolMetadataMap (new converters, bulk, product, OCR)
const additionalToolSlugs = [
  // PDF image-input converters
  "jpg-to-pdf", "jpeg-to-pdf", "png-to-pdf", "webp-to-pdf", "gif-to-pdf",
  "bmp-to-pdf", "tiff-to-pdf", "avif-to-pdf", "heic-to-pdf", "svg-to-pdf",
  // PDF image-output converters
  "pdf-to-png", "pdf-to-webp", "pdf-to-gif", "pdf-to-avif", "pdf-to-bmp",
  "pdf-to-tiff", "pdf-to-svg", "pdf-to-heic",
  // PDF document converters
  "pdf-to-csv", "pdf-to-html", "pdf-to-json", "pdf-to-markdown", "pdf-to-xml",
  "csv-to-pdf", "txt-to-pdf", "markdown-to-pdf", "json-to-pdf", "xml-to-pdf",
  "excel-to-pdf", "xls-to-pdf", "doc-to-pdf", "rtf-to-pdf", "epub-to-pdf",
  "odt-to-pdf", "mobi-to-pdf", "azw3-to-pdf", "ppt-to-pdf",
  // PDF output document converters
  "pdf-to-rtf", "pdf-to-odt", "pdf-to-doc", "pdf-to-xls", "pdf-to-ppt",
  "pdf-to-epub", "pdf-to-mobi", "pdf-to-azw3",
  // PDF special tools
  "pdf-roast", "business-docs",
  // Image — PNG converters
  "png-to-jpg", "png-to-webp", "png-to-gif", "png-to-ico", "png-to-bmp",
  "png-to-avif", "png-to-tiff", "png-to-heic",
  // Image — JPG converters
  "jpg-to-png", "jpg-to-webp", "jpg-to-gif", "jpg-to-svg", "jpg-to-ico",
  "jpg-to-bmp", "jpg-to-avif", "jpg-to-tiff", "jpg-to-heic",
  // Image — WebP converters
  "webp-to-png", "webp-to-jpg", "webp-to-gif", "webp-to-svg", "webp-to-ico",
  "webp-to-bmp", "webp-to-tiff",
  // Image — GIF, BMP, AVIF converters
  "gif-to-png", "gif-to-jpg", "gif-to-webp",
  "bmp-to-png", "bmp-to-jpg", "bmp-to-webp",
  "avif-to-png", "avif-to-jpg",
  // Image — ICO / SVG converters
  "ico-to-png", "ico-to-jpg", "ico-to-webp", "ico-to-svg", "svg-to-ico",
  "svg-to-jpg", "svg-to-webp",
  // Image — TIFF / HEIC converters
  "tiff-to-jpg", "tiff-to-png", "tiff-to-webp",
  "heic-to-png", "heic-to-webp",
  // Image — new main tools
  "passport-photo", "compress-to-size", "screenshot-to-table",
  "size-analyzer", "image-roast", "ai-detector", "print-calculator",
  "svg-to-png", "png-to-svg",
  // Bulk image tools
  "bulk-image-compressor", "bulk-image-resizer", "bulk-image-converter",
  "bulk-background-remover", "bulk-watermark-adder",
  "bulk-png-to-jpg", "bulk-png-to-webp", "bulk-png-to-gif",
  "bulk-jpg-to-png", "bulk-jpg-to-webp", "bulk-webp-to-png",
  // Product tools
  "amazon-image-resizer", "shopify-image-optimizer", "etsy-image-resizer",
  "product-image-resizer", "product-photo-optimizer", "product-background-remover",
  // OCR / text tools
  "screenshot-to-text", "handwriting-to-text", "receipt-scanner",
  "business-card-scanner", "table-extraction-from-image",
  // Dev tools
  "resume-builder", "json-to-pptx", "js-to-pptx", "word-to-pdf",
  // Static landing pages
  "best-free-pdf-tools", "free-alternatives-to-adobe-acrobat",
  "best-free-image-tools", "best-free-developer-tools",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const knownToolPages = allToolSlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const additionalPages = additionalToolSlugs
    .filter((slug) => !allToolSlugs.includes(slug))
    .map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: slug.startsWith("bulk-") || slug.includes("product") ? 0.7 : 0.75,
    }));

  const categoryPageEntries = categoryPages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const contentPageEntries = staticContentPages.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority,
  }));

  // Filter out slugs already covered by staticContentPages
  const staticPaths = staticContentPages.map((p) => p.path.replace("/", ""));
  const filteredAdditional = additionalPages.filter(
    (p) => !staticPaths.some((slug) => p.url.endsWith(`/${slug}`))
  );

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...categoryPageEntries,
    ...contentPageEntries,
    ...knownToolPages,
    ...filteredAdditional,
  ];
}
