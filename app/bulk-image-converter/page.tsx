import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "Why should I convert images to WebP in bulk?",
    a: "WebP images are typically 25–35% smaller than equivalent JPG or PNG files at the same visual quality. Converting your entire image library to WebP reduces page load times and bandwidth costs — especially important for e-commerce sites and image-heavy blogs.",
  },
  {
    q: "Will WebP images work everywhere?",
    a: "WebP is supported by all modern browsers including Chrome, Firefox, Safari (since 2020), and Edge. Over 95% of web users can view WebP images. For older browser support, keep a JPG fallback.",
  },
  {
    q: "How many images can I convert at once?",
    a: "There is no enforced limit. All conversion happens in your browser using the Canvas API. For batches of 100+ images, process in groups of 50 for the smoothest experience.",
  },
  {
    q: "Is the bulk conversion completely private?",
    a: "Yes. All conversion happens in your browser — no files are uploaded to any server. Your images stay on your device throughout the entire batch process.",
  },
];

const relatedTools = [
  { name: "Bulk PNG to JPG", href: "/bulk-png-to-jpg" },
  { name: "Bulk JPG to PNG", href: "/bulk-jpg-to-png" },
  { name: "Bulk WebP to PNG", href: "/bulk-webp-to-png" },
  { name: "Bulk JPG to WebP", href: "/bulk-jpg-to-webp" },
];

export default function BulkImageConverterPage() {
  return (
    <ImageFormatConverter
      fromFormat="Any"
      toFormat="WebP"
      fromExts=".jpg,.jpeg,.png,.bmp,.gif,.avif"
      toMime="image/webp"
      toExt="webp"
      hasQuality={true}
      isBulk={true}
      title="Bulk Image Converter"
      description="Convert multiple images to WebP at once for faster websites. Upload JPG, PNG, BMP, GIF, or AVIF files and download all converted WebP images as a ZIP. Free, private, no limits."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
