import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "How many PNG files can I batch convert to GIF?",
    a: "No hard limit. You can upload and convert dozens or hundreds of PNGs at once. All processing happens in your browser using the gif-encoder library, so performance depends on your device. For 50+ large files, we recommend batching for best results.",
  },
  {
    q: "Will the GIF quality be good for all my PNGs?",
    a: "GIF is limited to 256 colors. For simple flat graphics, logos, and illustrations with few colors, the output looks great. For photos or complex imagery, visible color banding will appear. PNG or WebP is a better format for photos.",
  },
  {
    q: "Can I download all converted GIFs in one ZIP?",
    a: "Yes. After conversion, click 'Download All as ZIP' to download all GIF files in a single archive. You can also download individual files using the per-file download button in the results list.",
  },
  {
    q: "Will transparency be preserved in the batch GIF conversion?",
    a: "Partial transparency (alpha channel) is not supported by GIF. Fully transparent pixels become transparent in GIF; semi-transparent pixels are rendered as either fully transparent or fully opaque based on a threshold. Full solid areas are preserved exactly.",
  },
  {
    q: "Is batch PNG to GIF conversion private?",
    a: "Yes. All conversion happens locally in your browser — no files are uploaded to any server. Your images never leave your device, regardless of how many files you convert at once.",
  },
];

const relatedTools = [
  { name: "PNG to GIF (Single)", href: "/png-to-gif" },
  { name: "GIF Maker", href: "/gif-maker" },
  { name: "Bulk PNG to JPG", href: "/bulk-png-to-jpg" },
  { name: "Bulk PNG to WebP", href: "/bulk-png-to-webp" },
  { name: "Video to GIF", href: "/video-to-gif" },
  { name: "Batch Resize Images", href: "/batch-resize" },
];

export default function BulkPngToGifPage() {
  return (
    <ImageFormatConverter
      fromFormat="PNG"
      toFormat="GIF"
      fromExts=".png,.PNG"
      toMime="image/gif"
      toExt="gif"
      useGifEncoder={true}
      hasQuality={false}
      isBulk={true}
      title="Bulk PNG to GIF Converter"
      description="Batch convert multiple PNG images to GIF format at once. Download all converted GIFs in a single ZIP. Free, private, browser-based — no server uploads, no file limits."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
