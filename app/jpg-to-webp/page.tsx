import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "How much smaller is WebP than JPG?",
    a: "WebP is typically 25–34% smaller than equivalent quality JPEG. Google's analysis of 900,000+ web images found WebP achieves the same visual quality at an average of 30% smaller file size. This directly translates to faster page loads and better Core Web Vitals scores.",
  },
  {
    q: "Is JPG to WebP conversion lossy?",
    a: "Yes — we re-encode the image as lossy WebP. The quality slider controls compression. At 90%+ quality, WebP and JPG look nearly identical, but WebP is significantly smaller. You can also convert to lossless WebP, though lossless WebP of a JPG is usually larger than the original JPG.",
  },
  {
    q: "Should I convert my website's JPG photos to WebP?",
    a: "Yes — if your audience uses modern browsers (which is virtually everyone today). WebP will make your pages load faster. Google PageSpeed Insights and Lighthouse both flag JPG/PNG images and suggest serving them as WebP. Faster images = better user experience + better SEO.",
  },
  {
    q: "Does converting JPG photos to WebP improve Google SEO rankings?",
    a: "Indirectly, yes. Smaller WebP images improve Core Web Vitals — specifically the LCP (Largest Contentful Paint) metric, which is a confirmed Google ranking signal. Faster image loading improves LCP, which can positively impact your search rankings over time.",
  },
  {
    q: "Can I convert multiple JPG photos to WebP at once?",
    a: "Yes — use our Bulk JPG to WebP converter at /bulk-jpg-to-webp to batch convert an entire image library at once. Upload multiple JPGs, set your quality level, and download a ZIP containing all converted WebP files.",
  },
];

const relatedTools = [
  { name: "Bulk JPG to WebP", href: "/bulk-jpg-to-webp" },
  { name: "PNG to WebP", href: "/png-to-webp" },
  { name: "WebP to PNG", href: "/webp-to-png" },
  { name: "JPG to PNG", href: "/jpg-to-png" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function JpgToWebpPage() {
  return (
    <ImageFormatConverter
      fromFormat="JPG"
      toFormat="WebP"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      toMime="image/webp"
      toExt="webp"
      hasQuality={true}
      defaultQuality={0.9}
      isBulk={false}
      title="JPG to WebP Converter"
      description="Convert JPG photos to WebP and reduce file size by 25–34% with no visible quality loss. Boost PageSpeed scores and Core Web Vitals. Free, private, browser-based."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
