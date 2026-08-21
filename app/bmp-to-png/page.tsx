import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert BMP to PNG?", a: "BMP (Bitmap) files are uncompressed and extremely large. A 1 MB PNG typically stores the same image as a 10-20 MB BMP. PNG uses lossless compression that matches BMP's quality exactly but at a fraction of the size." },
  { q: "Will I lose any quality converting BMP to PNG?", a: "No. PNG is a lossless format. Converting BMP to PNG is entirely lossless — every pixel is preserved exactly. The only difference is file size (PNG is much smaller thanks to compression)." },
  { q: "When should I keep BMP format?", a: "BMP is mainly used when you need raw uncompressed pixel data for specific software or hardware that doesn't support compressed formats. For general use, PNG offers identical quality at a fraction of the file size." },
  { q: "Does BMP support transparency?", a: "Some BMP variants (32-bit) support alpha channels, though this is rarely used. PNG fully supports alpha transparency. Converting a 32-bit BMP with transparency to PNG will preserve the transparency correctly." },
];

const relatedTools = [
  { name: "PNG to BMP", href: "/png-to-bmp" },
  { name: "BMP to JPG", href: "/bmp-to-jpg" },
  { name: "BMP to WebP", href: "/bmp-to-webp" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function BmpToPngPage() {
  return (
    <ImageFormatConverter
      fromFormat="BMP"
      toFormat="PNG"
      fromExts=".bmp,.BMP"
      toMime="image/png"
      toExt="png"
      hasQuality={false}
      isBulk={true}
      title="BMP to PNG Converter"
      description="Convert BMP to PNG online. Lossless compression reduces file size by 10-20× while preserving every pixel. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
