import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "Why would I batch convert JPG files to PNG?",
    a: "Common scenarios: preparing a photo library for editing in design tools that prefer PNG; converting product photos to PNG for e-commerce platforms that need lossless quality; migrating an image library to a lossless format for archival; or when downstream tools require PNG input.",
  },
  {
    q: "How many JPG files can I convert at once?",
    a: "No enforced limit. Upload as many files as you need — all processing happens in your browser. For batches of 100+ files or files over 10 MB each, processing in groups of 50 gives the smoothest experience.",
  },
  {
    q: "Will PNG files be much larger than my originals JPGs?",
    a: "Yes. PNG is a lossless format and typically 2–5× larger than an equivalent JPG photo. A 1 MB JPG batch might become 3–8 MB total in PNG. This is expected — PNG stores every pixel losslessly. Make sure you have adequate storage.",
  },
  {
    q: "Can I download all converted PNG files in one ZIP?",
    a: "Yes. After the batch completes, click 'Download All as ZIP' to get all converted PNG files in a single archive. You can also download individual files from the results list.",
  },
  {
    q: "Is the batch conversion completely private?",
    a: "Yes. All conversion happens in your browser using the HTML5 Canvas API — no files are uploaded to any server. Your images stay on your device throughout the entire batch process.",
  },
];

const relatedTools = [
  { name: "JPG to PNG (Single)", href: "/jpg-to-png" },
  { name: "Bulk PNG to JPG", href: "/bulk-png-to-jpg" },
  { name: "Bulk JPG to WebP", href: "/bulk-jpg-to-webp" },
  { name: "Bulk WebP to PNG", href: "/bulk-webp-to-png" },
  { name: "Compress Image", href: "/compress-image" },
  { name: "Batch Resize Images", href: "/batch-resize" },
];

export default function BulkJpgToPngPage() {
  return (
    <ImageFormatConverter
      fromFormat="JPG"
      toFormat="PNG"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      toMime="image/png"
      toExt="png"
      hasQuality={false}
      isBulk={true}
      title="Bulk JPG to PNG Converter"
      description="Batch convert multiple JPG/JPEG photos to PNG at once. Lossless output for editing and design workflows. Download as ZIP. Free, private, no file limits."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
