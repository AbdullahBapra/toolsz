/**
 * Reconstructs lines of text from a pdfjs-dist TextContent object
 * by grouping text items by their Y-position (same line) with a tolerance.
 * Returns lines sorted top-to-bottom, left-to-right.
 */
export interface PdfLine {
  y: number;
  text: string;
  x: number;
}

export function extractPdfLines(
  items: unknown[]
): PdfLine[] {
  // Filter to only items with a string "str" and number[] "transform"
  const textItems = items.filter(
    (item): item is { str: string; transform: number[] } =>
      !!item && typeof item === "object" && "str" in item && typeof (item as { str: unknown }).str === "string" && "transform" in item && Array.isArray((item as { transform: unknown }).transform)
  );

  if (textItems.length === 0) return [];

  const lineMap: PdfLine[] = [];
  const yTolerance = 5;

  for (const item of textItems) {
    const y = Math.round(item.transform[5] / yTolerance) * yTolerance;
    const x = item.transform[4];
    const existing = lineMap.find((l) => Math.abs(l.y - y) < yTolerance);
    if (existing) {
      existing.text += item.str;
    } else {
      lineMap.push({ y, text: item.str, x });
    }
  }

  // Sort by Y descending (PDF coords are bottom-up) then by X
  lineMap.sort((a, b) => b.y - a.y || a.x - b.x);

  return lineMap;
}
