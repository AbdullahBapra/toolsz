import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Why would I want JPG as HEIC?", a: "HEIC typically achieves 2× better compression than JPG at equivalent quality, making it useful for storage-constrained Apple devices. However, HEIC has poor compatibility outside Apple ecosystems, so converting JPG to HEIC rarely makes practical sense except for specific Apple workflows." },
  { q: "Why can't this convert to HEIC in the browser?", a: "HEIC uses the HEVC (H.265) video codec for encoding, which browsers don't implement. It requires hardware acceleration and codec licensing that's not available in browser environments." },
  { q: "Is AVIF a good alternative to HEIC?", a: "Yes — AVIF achieves similar or better compression than HEIC and is an open standard supported by Chrome, Firefox, and Safari. Our JPG to AVIF converter works in the browser and produces files that are 20-50% smaller than JPG." },
  { q: "How do I convert JPG to HEIC on Mac?", a: "Use the Preview app: open the JPG → File → Export → choose HEIC format. Or use the Automator app for batch conversion. iPhone's Shortcuts app can also convert images to HEIC." },
];

const relatedTools = [
  { name: "JPG to AVIF (open alternative, browser)", href: "/jpg-to-avif" },
  { name: "JPG to WebP (smaller, browser)", href: "/jpg-to-webp" },
  { name: "HEIC to JPG (reverse)", href: "/heic-to-jpg" },
];

export default function JpgToHeicPage() {
  return (
    <PdfConverterStub
      title="JPG to HEIC Converter"
      description="Convert JPG to HEIC format. Browsers cannot encode HEIC — use Mac Preview, or consider AVIF as a better open-standard alternative."
      reason="HEIC encoding requires the HEVC codec which isn't available in browsers. Use Mac Preview (File → Export → HEIC) or consider AVIF — our JPG to AVIF converter does the same job in your browser right now."
      alternatives={[
        { name: "JPG to AVIF (open alternative, browser)", href: "/jpg-to-avif" },
        { name: "JPG to WebP (modern format, browser)", href: "/jpg-to-webp" },
        { name: "Mac Preview (File → Export → HEIC)", href: "https://support.apple.com/guide/preview/welcome/mac", external: true },
        { name: "HEIC to JPG (reverse)", href: "/heic-to-jpg" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
