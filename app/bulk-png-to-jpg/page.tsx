import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "How many PNG files can I convert at once?",
    a: "There's no enforced limit — you can convert dozens or hundreds of PNGs in one batch. Performance depends on total file sizes and your browser. For very large batches (100+ files or files over 10 MB each), processing in batches of 50 gives the best experience.",
  },
  {
    q: "Can I download all converted JPGs in one ZIP?",
    a: "Yes. After conversion completes, click 'Download All as ZIP' to download all your converted JPG files in a single ZIP archive. You can also download individual files by clicking the download icon next to each file.",
  },
  {
    q: "Is batch PNG to JPG conversion private?",
    a: "Completely. All conversion happens in your browser — no files are uploaded to any server at any point. Your images stay on your device throughout the entire batch process. Nothing is stored or shared.",
  },
  {
    q: "Will all my PNGs get the same quality setting?",
    a: "Yes. The quality slider applies uniformly to all files in the batch. If you need different quality levels for different files, process them in separate batches. For a standard photo library, 85–92% quality is ideal.",
  },
  {
    q: "What happens if one PNG fails to convert?",
    a: "Failed files are clearly marked in the results with an error message. Successfully converted files are unaffected and can still be downloaded individually or as a ZIP. Common failure reasons: corrupt PNG file, very unusual color profiles, or extremely large files.",
  },
];

const relatedTools = [
  { name: "PNG to JPG (Single)", href: "/png-to-jpg" },
  { name: "Bulk PNG to WebP", href: "/bulk-png-to-webp" },
  { name: "Bulk JPG to PNG", href: "/bulk-jpg-to-png" },
  { name: "Bulk JPG to WebP", href: "/bulk-jpg-to-webp" },
  { name: "Compress Image", href: "/compress-image" },
  { name: "Batch Resize Images", href: "/batch-resize" },
];

export default function BulkPngToJpgPage() {
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
      isBulk={true}
      title="Bulk PNG to JPG Converter"
      description="Batch convert multiple PNG files to JPG in one click — set quality, convert all, download as ZIP. Free, private, no file limits. All processing stays in your browser."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
