import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "How much smaller will my JPG library be after converting to WebP?",
    a: "Typically 25–34% smaller. Google's analysis of 900,000+ images found WebP achieves the same quality at an average 30% smaller file size versus JPEG. A 1 GB photo library often becomes 650–750 MB in WebP without any visible quality reduction.",
  },
  {
    q: "How many JPG photos can I batch convert at once?",
    a: "No enforced limit — convert dozens to hundreds of files in one batch. All processing happens in your browser. For very large libraries (100+ files or files over 20 MB each), processing in groups of 30–50 gives the best experience.",
  },
  {
    q: "Does batch converting to WebP affect image quality?",
    a: "Only as much as you choose. The quality slider applies to all files in the batch. At 90%+ quality, the difference vs. the original JPG is imperceptible. Lower quality settings create significantly smaller files but introduce more compression artifacts.",
  },
  {
    q: "Can I download all converted WebP files in one ZIP?",
    a: "Yes. After conversion, click 'Download All as ZIP' to get all WebP files bundled in one archive. Individual file downloads are also available in the results list.",
  },
  {
    q: "Will converting my website's JPG photos to WebP help with Google rankings?",
    a: "Yes — indirectly. WebP images reduce page weight which improves Core Web Vitals (particularly LCP — Largest Contentful Paint), a confirmed Google ranking factor. Faster loading pages typically rank better and have lower bounce rates.",
  },
];

const relatedTools = [
  { name: "JPG to WebP (Single)", href: "/jpg-to-webp" },
  { name: "Bulk PNG to WebP", href: "/bulk-png-to-webp" },
  { name: "Bulk WebP to PNG", href: "/bulk-webp-to-png" },
  { name: "Bulk JPG to PNG", href: "/bulk-jpg-to-png" },
  { name: "Compress Image", href: "/compress-image" },
  { name: "Batch Resize Images", href: "/batch-resize" },
];

export default function BulkJpgToWebpPage() {
  return (
    <ImageFormatConverter
      fromFormat="JPG"
      toFormat="WebP"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      toMime="image/webp"
      toExt="webp"
      hasQuality={true}
      defaultQuality={0.9}
      isBulk={true}
      title="Bulk JPG to WebP Converter"
      description="Batch convert your JPEG photo library to WebP and cut file sizes by 25–34%. Download all as ZIP. Free, private, browser-based — no server uploads, no file limits."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
