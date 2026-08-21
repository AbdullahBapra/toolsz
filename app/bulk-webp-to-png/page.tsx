import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "Why would I batch convert WebP files to PNG?",
    a: "Common scenarios: preparing WebP images downloaded from the web for use in Photoshop or other editors; converting a website's WebP assets back to PNG for an email campaign; migrating images to a universally compatible format; or preparing images for platforms that don't accept WebP.",
  },
  {
    q: "How many WebP files can I convert at once?",
    a: "No enforced limit. Upload as many files as needed — all processing happens locally in your browser. For batches of 100+ files, processing in groups of 50 gives the smoothest performance.",
  },
  {
    q: "Will the batch conversion be lossless?",
    a: "Yes. PNG is a lossless format, so the conversion preserves every pixel exactly. There is no additional quality loss in the WebP → PNG conversion. The output PNG is a perfect lossless representation of your WebP images.",
  },
  {
    q: "Will PNG files be larger than my WebP files?",
    a: "Yes, typically 20–40% larger since PNG is lossless and WebP uses advanced compression. This is expected and normal. The larger PNG files will have identical visual quality — no quality was lost, just the compression method changed.",
  },
  {
    q: "Can I download all converted PNGs in one ZIP?",
    a: "Yes. After conversion, click 'Download All as ZIP' to download all PNG files in a single archive. Individual file downloads are also available from the results list.",
  },
];

const relatedTools = [
  { name: "WebP to PNG (Single)", href: "/webp-to-png" },
  { name: "Bulk PNG to WebP", href: "/bulk-png-to-webp" },
  { name: "Bulk JPG to WebP", href: "/bulk-jpg-to-webp" },
  { name: "Bulk JPG to PNG", href: "/bulk-jpg-to-png" },
  { name: "Compress Image", href: "/compress-image" },
  { name: "Batch Resize Images", href: "/batch-resize" },
];

export default function BulkWebpToPngPage() {
  return (
    <ImageFormatConverter
      fromFormat="WebP"
      toFormat="PNG"
      fromExts=".webp,.WEBP"
      toMime="image/png"
      toExt="png"
      hasQuality={false}
      isBulk={true}
      title="Bulk WebP to PNG Converter"
      description="Batch convert multiple WebP images to PNG for universal compatibility. Works in Photoshop, email, and Windows. Download as ZIP. Free, private, lossless — no limits."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
