import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Business Document Generator — Invoice, Quote, Receipt, PO, Delivery Note | Toolsz",
  description:
    "Create professional invoices, quotes, receipts, purchase orders, and delivery notes in seconds. Upload your logo, add VAT/GST, bank details, and custom terms. 5 premium themes. Download PDF free — no signup, no watermark.",
  keywords: [
    "free invoice generator","invoice template","quote builder","receipt maker",
    "purchase order generator","delivery note template","VAT invoice","GST invoice",
    "freelance invoice","small business invoice","PDF invoice download","invoice with logo",
    "professional invoice template","free invoice maker no watermark",
  ],
  openGraph: {
    title: "Free Business Document Generator — Invoice, Quote, Receipt, PO & More",
    description: "Professional invoices and business documents with logo, VAT/GST, bank details. 5 themes. Download PDF free.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/business-docs" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
