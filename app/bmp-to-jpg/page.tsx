import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "How much smaller will my JPG be than the BMP?", a: "Dramatically smaller. A typical photo stored as BMP might be 5-20 MB. The same photo as JPG at 92% quality is usually 200 KB to 2 MB — a reduction of 10-50×. The exact ratio depends on image complexity." },
  { q: "Is JPG quality noticeably worse than BMP?", a: "At 92% quality (the default), JPG is visually indistinguishable from the original for photos. For screenshots, diagrams, or images with sharp edges and text, use PNG instead — JPG introduces blur artifacts on sharp edges." },
  { q: "Why choose JPG over PNG when converting from BMP?", a: "JPG is better for photos and complex images where the smaller file size matters. PNG is better for screenshots, graphics, diagrams, and anything with text or sharp edges. For photos, JPG at 90%+ quality is usually the right choice." },
];

const relatedTools = [
  { name: "JPG to BMP", href: "/jpg-to-bmp" },
  { name: "BMP to PNG", href: "/bmp-to-png" },
  { name: "BMP to WebP", href: "/bmp-to-webp" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
];

export default function BmpToJpgPage() {
  return (
    <ImageFormatConverter
      fromFormat="BMP"
      toFormat="JPG"
      fromExts=".bmp,.BMP"
      toMime="image/jpeg"
      toExt="jpg"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="BMP to JPG Converter"
      description="Convert BMP to JPG online. Dramatically reduces file size while maintaining visual quality. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
