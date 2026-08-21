import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "How much smaller is WebP than PNG?",
    a: "WebP achieves 25–35% smaller file sizes than PNG for lossless images. For lossy compression (photos), WebP can be 30–50% smaller than equivalent-quality PNG. Google's own benchmarks on 900,000+ web images found WebP files average 26% smaller than PNGs.",
  },
  {
    q: "Does WebP support transparency like PNG?",
    a: "Yes. WebP supports full alpha channel transparency — just like PNG. This makes WebP the ideal modern replacement for PNG on websites: you get smaller files without losing transparency support. Every pixel's transparency value is preserved.",
  },
  {
    q: "Which browsers support WebP images?",
    a: "All modern browsers support WebP: Chrome (since 2014), Firefox (since 2019), Safari (since macOS Big Sur / iOS 14 in 2020), Edge, and Opera. As of 2024, WebP has over 97% global browser support. The only common exception is very old Android browsers.",
  },
  {
    q: "Should I use lossless or lossy WebP?",
    a: "For graphics, logos, screenshots, and images with text: use lossless WebP (same quality as PNG, 25% smaller). For photos and complex images: use lossy WebP with the quality slider — much smaller file size with barely noticeable quality reduction at 80%+ quality.",
  },
  {
    q: "Can I use WebP images in email newsletters?",
    a: "Most email clients don't support WebP — Apple Mail and Gmail web do, but Outlook and many mobile clients don't. For email, stick with PNG or JPG. Use WebP for website images, web apps, and anywhere you control the rendering environment.",
  },
];

const relatedTools = [
  { name: "Bulk PNG to WebP", href: "/bulk-png-to-webp" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "JPG to WebP", href: "/jpg-to-webp" },
  { name: "WebP to PNG", href: "/webp-to-png" },
  { name: "PNG to GIF", href: "/png-to-gif" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function PngToWebpPage() {
  return (
    <ImageFormatConverter
      fromFormat="PNG"
      toFormat="WebP"
      fromExts=".png,.PNG"
      toMime="image/webp"
      toExt="webp"
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={false}
      title="PNG to WebP Converter"
      description="Convert PNG to WebP and reduce file size by 25–35% with no visible quality loss. Full transparency support. Free, private, browser-based — files never leave your device."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
