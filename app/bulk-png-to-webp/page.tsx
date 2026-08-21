import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "How much will batch PNG to WebP reduce my image library size?",
    a: "Typically 25–35% smaller file sizes across your library. WebP achieves better compression than PNG for both lossless and lossy encoding. A 100 MB folder of PNGs often becomes 65–75 MB in WebP — without any visible quality change.",
  },
  {
    q: "How many PNG files can I convert in one batch?",
    a: "No enforced limit. Dozens to hundreds of files at once — all processing happens in your browser. For very large batches or files above 10 MB each, batching 50 files at a time gives the smoothest experience.",
  },
  {
    q: "Do the converted WebP files keep transparency?",
    a: "Yes. WebP fully supports alpha channel transparency. All transparent areas in your PNG files will be preserved perfectly in the output WebP files — no white fill, no quality change to transparent regions.",
  },
  {
    q: "Can I download all converted WebP files as one ZIP?",
    a: "Yes. After the batch converts, click 'Download All as ZIP' to get all your WebP files in one archive. You can also download files individually with the per-file download button.",
  },
  {
    q: "Should I convert my entire website's PNG library to WebP?",
    a: "Yes, if your site targets modern browsers (97%+ of global users support WebP). The 25–35% size reduction directly improves page load times, Core Web Vitals LCP scores, and reduces bandwidth costs. Keep PNG originals as backups.",
  },
];

const relatedTools = [
  { name: "PNG to WebP (Single)", href: "/png-to-webp" },
  { name: "Bulk PNG to JPG", href: "/bulk-png-to-jpg" },
  { name: "Bulk JPG to WebP", href: "/bulk-jpg-to-webp" },
  { name: "Bulk WebP to PNG", href: "/bulk-webp-to-png" },
  { name: "Compress Image", href: "/compress-image" },
  { name: "Batch Resize Images", href: "/batch-resize" },
];

export default function BulkPngToWebpPage() {
  return (
    <ImageFormatConverter
      fromFormat="PNG"
      toFormat="WebP"
      fromExts=".png,.PNG"
      toMime="image/webp"
      toExt="webp"
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="Bulk PNG to WebP Converter"
      description="Batch convert your entire PNG library to WebP and reduce file sizes by 25–35%. Download all as ZIP. Free, private, browser-based — no server uploads, no file limits."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
