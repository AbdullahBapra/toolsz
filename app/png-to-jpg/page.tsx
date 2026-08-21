import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "Does converting PNG to JPG lose quality?",
    a: "Yes — JPG is a lossy format, meaning some image data is discarded during compression. At 90%+ quality the difference is nearly invisible for photos. For graphics with sharp lines, text, or logos, PNG or WebP is a better choice since JPG can introduce visible artifacts around edges.",
  },
  {
    q: "What happens to transparency when converting PNG to JPG?",
    a: "JPG doesn't support transparency. Any transparent areas in your PNG are replaced with a white background during conversion. If your PNG has a transparent logo or icon that you need to keep transparent, use PNG to WebP instead — WebP fully supports alpha channel transparency.",
  },
  {
    q: "What's the best quality setting for PNG to JPG?",
    a: "For photos: 85–92% quality. For graphics or screenshots: 95%+ if you must use JPG, or better yet, keep as PNG. The default 92% is a great balance — files are much smaller than PNG but look visually identical for most photos.",
  },
  {
    q: "When should I keep PNG instead of converting to JPG?",
    a: "Keep PNG when you need transparency (logos, icons, illustrations with transparent backgrounds), when you need pixel-perfect sharpness (screenshots, text graphics), or when you'll continue editing the image. Convert to JPG when file size matters and the image is a photo without transparency.",
  },
  {
    q: "Can I batch convert multiple PNGs to JPG at once?",
    a: "Yes — use our Bulk PNG to JPG converter at /bulk-png-to-jpg to process multiple files at once and download them all in a single ZIP archive. Everything still stays in your browser with no server uploads.",
  },
];

const relatedTools = [
  { name: "Bulk PNG to JPG", href: "/bulk-png-to-jpg" },
  { name: "PNG to WebP", href: "/png-to-webp" },
  { name: "PNG to GIF", href: "/png-to-gif" },
  { name: "JPG to PNG", href: "/jpg-to-png" },
  { name: "JPG to WebP", href: "/jpg-to-webp" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function PngToJpgPage() {
  return (
    <ImageFormatConverter
      fromFormat="PNG"
      toFormat="JPG"
      fromExts=".png,.PNG"
      toMime="image/jpeg"
      toExt="jpg"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={false}
      title="PNG to JPG Converter"
      description="Convert PNG images to JPG instantly — free, private, no upload. Quality slider lets you balance file size vs. clarity. Transparent areas replaced with white background."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
