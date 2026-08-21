import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { ToastProvider } from "@/app/components/Toast";
import ChatbotWrapper from "@/app/components/ChatbotWrapper";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.toolsz.co"),
  verification: {
    // google: "_JcbugrziQXjKdx_1xP3ekjUbs7ree5BLHCY4KJLzEw",
  },
  title: {
    default: "Toolsz | 219 Free Online Tools for PDF, Image and Dev",
    template: "%s",
  },
  description:
    "219 free tools for PDF, images, and developers. Compress, merge, convert, sign, and edit. 100% client-side, no uploads, no watermarks, no signup.",
  keywords: [
    "free online tools",
    "pdf tools",
    "image tools",
    "developer tools",
    "online file utilities",
    "free pdf tools online",
    "free image tools online",
    "free developer tools",
    "free pdf compressor",
    "free image converter",
    "client-side file tools",
    "no signup required",
    "privacy first tools",
    "browser based tools",
    "no upload tools",
    "convert any file online",
    "online file converter",
    "edit images online free",
    "edit images in bulk",
    "pdf editor online free",
    "pdf tools for pdf lovers",
    "compress merge convert pdf",
    "no installation tools",
    "free solution to pdf problems",
    "ilovepdf alternative",
    "smallpdf alternative",
    "iloveimg alternative",
    "cloudconvert alternative",
    "pdf24 alternative",
    "freeconvert alternative",
  ],
  authors: [{ name: "Toolsz" }],
  creator: "Toolsz",
  publisher: "Toolsz",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.toolsz.co",
  },
  openGraph: {
    title: "Toolsz | 219 Free Online Tools | No Uploads, No Watermarks",
    description:
      "219 Free tools for PDF, images, and developers. 100% client-side, no watermarks, no signup.",
    url: "https://www.toolsz.co",
    siteName: "Toolsz",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolsz | 219 Free Online Tools for PDF, Image and Dev",
    description:
      "219 Free tools for PDF, images, and developers. 100% client-side, no uploads, no watermarks.",
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Toolsz",
  url: "https://www.toolsz.co",
  logo: "https://www.toolsz.co/icon.png",
  description: "219 Free tools for PDF, images, and developers. 100% client-side, no uploads, no watermarks. Your files never leave your device.",
  sameAs: [],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Toolsz",
  url: "https://www.toolsz.co",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.toolsz.co/all-tools?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col selection:bg-primary/15 selection:text-primary">
        <ToastProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <ChatbotWrapper />
        </ToastProvider>
      </body>
    </html>
  );
}
