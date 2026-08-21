import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "Why would I need to convert WebP to PNG?",
    a: "WebP isn't supported in Outlook (email), older Photoshop versions (before CC 2021), many legacy image editors, Windows Explorer thumbnail previews on older Windows 10 builds, and some social media upload flows. PNG has universal compatibility — it works everywhere without exception.",
  },
  {
    q: "Does converting WebP to PNG lose quality?",
    a: "No. PNG is a lossless format, so the conversion captures the exact pixel data from the WebP file without any additional quality loss. The PNG will be a bit-perfect representation of what the WebP contained (within the limits of the WebP's own compression).",
  },
  {
    q: "Is PNG better than WebP?",
    a: "They serve different purposes. WebP is better for web performance: 25–35% smaller file sizes for the same quality. PNG is better for compatibility: works in every image editor, email client, and operating system. Use WebP for websites; use PNG for editing, printing, and sharing.",
  },
  {
    q: "Can I open WebP files in Photoshop?",
    a: "Photoshop CC 2021 and later support WebP natively. Older versions do not. If you're on an older version, convert WebP to PNG using this tool, then open the PNG in Photoshop. The quality will be identical since PNG is lossless.",
  },
  {
    q: "How do I open WebP images on Windows?",
    a: "Windows 10 (build 1809+) and Windows 11 can open WebP in Microsoft Photos and Edge. For older Windows builds or apps that don't support WebP, convert to PNG using this tool. You can also install the WebP Image Extensions from the Microsoft Store.",
  },
];

const relatedTools = [
  { name: "Bulk WebP to PNG", href: "/bulk-webp-to-png" },
  { name: "PNG to WebP", href: "/png-to-webp" },
  { name: "JPG to WebP", href: "/jpg-to-webp" },
  { name: "JPG to PNG", href: "/jpg-to-png" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function WebpToPngPage() {
  return (
    <ImageFormatConverter
      fromFormat="WebP"
      toFormat="PNG"
      fromExts=".webp,.WEBP"
      toMime="image/png"
      toExt="png"
      hasQuality={false}
      isBulk={false}
      title="WebP to PNG Converter"
      description="Convert WebP images to PNG for universal compatibility. Works in Photoshop, email, Windows, and any legacy software. Lossless conversion. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
