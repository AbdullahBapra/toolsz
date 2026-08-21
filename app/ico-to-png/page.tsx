import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "What is an ICO file?", a: "ICO is a container format used for Windows icons and browser favicons. It typically contains multiple sizes of the same image (16×16, 32×32, 48×48, 256×256) stored as PNG or BMP data." },
  { q: "Which size does this tool extract?", a: "The browser renders the ICO at its largest available size. This tool converts that rendered image to PNG, capturing the highest quality version of the icon." },
  { q: "Why convert ICO to PNG?", a: "PNG is universally supported for editing and display. ICO files are mainly needed for Windows and browser favicon use cases. If you need to edit, display, or use the image in design tools, PNG is the right choice." },
  { q: "Does the converter work for multi-size ICO files?", a: "Yes — the browser renders the ICO at the highest resolution and this tool captures that. Note: some very old ICO files may not be supported in all browsers." },
];

const relatedTools = [
  { name: "PNG to ICO", href: "/png-to-ico" },
  { name: "ICO to JPG", href: "/ico-to-jpg" },
  { name: "ICO to WebP", href: "/ico-to-webp" },
  { name: "SVG to ICO", href: "/svg-to-ico" },
];

export default function IcoToPngPage() {
  return (
    <ImageFormatConverter
      fromFormat="ICO"
      toFormat="PNG"
      fromExts=".ico,.ICO"
      toMime="image/png"
      toExt="png"
      hasQuality={false}
      isBulk={true}
      title="ICO to PNG Converter"
      description="Convert ICO favicon files to PNG images online. Extracts the highest resolution from multi-size ICO containers. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
