import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert PNG to BMP?", a: "BMP (Bitmap) is an uncompressed raw pixel format required by some legacy software, older Windows applications, and certain hardware devices (like some label printers, CNC machines, or embedded systems). For modern use cases, PNG is almost always better." },
  { q: "Will the BMP be much larger than the PNG?", a: "Yes. BMP is uncompressed — a 1 MB PNG might become a 5-20 MB BMP, depending on image dimensions and color depth. This is because BMP stores raw pixel data without any compression." },
  { q: "Does BMP support transparency?", a: "32-bit BMP supports alpha channels, but this is rarely used and not widely supported. This tool creates 24-bit BMP (no alpha). If you need transparency, keep using PNG." },
  { q: "Is 24-bit BMP lossless?", a: "Yes. The conversion from PNG to 24-bit BMP is entirely lossless for RGB content. Every pixel value is preserved exactly. The only exception is if your PNG had semi-transparent pixels — these are composited onto white." },
];

const relatedTools = [
  { name: "BMP to PNG", href: "/bmp-to-png" },
  { name: "JPG to BMP", href: "/jpg-to-bmp" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function PngToBmpPage() {
  return (
    <ImageFormatConverter
      fromFormat="PNG"
      toFormat="BMP"
      fromExts=".png,.PNG"
      toMime="image/bmp"
      toExt="bmp"
      useBmpEncoder={true}
      hasQuality={false}
      isBulk={true}
      title="PNG to BMP Converter"
      description="Convert PNG to BMP (Bitmap) format online. Lossless 24-bit BMP output for legacy software compatibility. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
