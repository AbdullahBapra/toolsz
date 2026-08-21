import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why would I convert JPG to BMP?", a: "BMP is required by some legacy software, older Windows applications, Windows Paint workflows, and certain embedded systems or hardware devices. If you need an uncompressed raw pixel format, BMP is the standard choice." },
  { q: "How much larger will the BMP be?", a: "Significantly larger. A 500 KB JPG photo might become 5-15 MB as BMP. BMP is completely uncompressed — it stores raw pixel values without any compression algorithm." },
  { q: "Does the JPG-to-BMP conversion improve quality?", a: "No. JPG artifacts are permanent — converting to BMP stores those artifacts in uncompressed form, but doesn't add or remove any quality. Think of it as 'freezing' the current quality into an uncompressed container." },
  { q: "Does BMP support color profiles or metadata?", a: "Basic BMP files do not support color profiles or EXIF metadata. If you need metadata preservation, keep the original JPG. BMP is purely for pixel data compatibility." },
];

const relatedTools = [
  { name: "BMP to JPG", href: "/bmp-to-jpg" },
  { name: "PNG to BMP", href: "/png-to-bmp" },
  { name: "JPG to PNG", href: "/jpg-to-png" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function JpgToBmpPage() {
  return (
    <ImageFormatConverter
      fromFormat="JPG"
      toFormat="BMP"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      toMime="image/bmp"
      toExt="bmp"
      useBmpEncoder={true}
      fillWhiteBg={true}
      hasQuality={false}
      isBulk={true}
      title="JPG to BMP Converter"
      description="Convert JPG to BMP (Bitmap) format online. Uncompressed 24-bit BMP output for legacy software. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
