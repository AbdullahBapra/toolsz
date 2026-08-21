import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "Why would I convert JPG to PNG?",
    a: "PNG is the best choice when you need to: edit the image further without additional quality loss; use it in a design workflow (PNG is lossless from this point); open it in software that handles PNG better; or when you need a lossless intermediate format for compositing.",
  },
  {
    q: "Does converting JPG to PNG improve quality?",
    a: "No. JPEG compression artifacts are permanent once created. Converting to PNG stores those artifacts losslessly — meaning no new quality loss is introduced, but existing JPEG artifacts remain. Think of it as \"preserving the current quality\" rather than restoring lost quality.",
  },
  {
    q: "How much larger is PNG than JPG?",
    a: "PNG is typically 2–5× larger than an equivalent JPG for photos. A 1 MB JPG photo might become a 3–8 MB PNG. The exact difference depends on image complexity and the original JPEG compression level. For graphics (logos, screenshots), the difference is less dramatic.",
  },
  {
    q: "Will my converted PNG have a transparent background?",
    a: "No — your JPG had no transparency, so the PNG will have whatever solid background the JPG had. If you need a transparent background, you'll need a background removal tool after conversion. Use our Remove Background tool at /remove-bg after converting.",
  },
  {
    q: "When is it better to stay in JPG format?",
    a: "For sharing photos via email, social media, or web galleries where file size matters — JPG is much smaller and universally compatible. Convert to PNG only when you need to edit the image in software, use it in a design project, or require guaranteed lossless quality for further processing.",
  },
];

const relatedTools = [
  { name: "Bulk JPG to PNG", href: "/bulk-jpg-to-png" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "JPG to WebP", href: "/jpg-to-webp" },
  { name: "WebP to PNG", href: "/webp-to-png" },
  { name: "Remove Background", href: "/remove-bg" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function JpgToPngPage() {
  return (
    <ImageFormatConverter
      fromFormat="JPG"
      toFormat="PNG"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      toMime="image/png"
      toExt="png"
      hasQuality={false}
      isBulk={false}
      title="JPG to PNG Converter"
      description="Convert JPG/JPEG to PNG for lossless quality. Ideal for editing workflows, design software, and when you need a transparent background. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
