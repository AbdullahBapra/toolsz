"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Camera,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  Search,
  Info,
  Printer,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

// ─── Types ────────────────────────────────────────────────────────────────────

type Region = "all" | "americas" | "europe" | "asia" | "middleeast" | "africa" | "oceania";
type DocType = "passport" | "visa" | "id" | "residence" | "nicop";

interface PhotoSpec {
  id: string;
  country: string;
  flag: string;
  docType: DocType;
  label: string;
  widthMm: number;
  heightMm: number;
  bgColor: string;
  bgLabel: string;
  region: Region;
  notes?: string;
}

// ─── Specs Database ───────────────────────────────────────────────────────────

const SPECS: PhotoSpec[] = [
  // AMERICAS
  { id: "us-passport",    country: "United States", flag: "🇺🇸", docType: "passport",  label: "US Passport",         widthMm: 51, heightMm: 51, bgColor: "#FFFFFF", bgLabel: "White",      region: "americas", notes: "2×2 inches (51×51mm). Head 1″–1⅜″ tall. Plain white or off-white background." },
  { id: "us-visa",        country: "United States", flag: "🇺🇸", docType: "visa",      label: "US Visa",             widthMm: 51, heightMm: 51, bgColor: "#FFFFFF", bgLabel: "White",      region: "americas", notes: "Same as US passport: 2×2 in, white background, taken within 6 months." },
  { id: "ca-passport",    country: "Canada",        flag: "🇨🇦", docType: "passport",  label: "Canada Passport",     widthMm: 50, heightMm: 70, bgColor: "#FFFFFF", bgLabel: "White",      region: "americas", notes: "50×70mm. Head 31–36mm tall. Plain white background." },
  { id: "mx-passport",    country: "Mexico",        flag: "🇲🇽", docType: "passport",  label: "Mexico Passport",     widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "americas", notes: "35×45mm, white background." },
  { id: "br-passport",    country: "Brazil",        flag: "🇧🇷", docType: "passport",  label: "Brazil Passport",     widthMm: 30, heightMm: 40, bgColor: "#FFFFFF", bgLabel: "White",      region: "americas", notes: "30×40mm, white background, taken within 6 months." },
  { id: "ar-passport",    country: "Argentina",     flag: "🇦🇷", docType: "passport",  label: "Argentina Passport",  widthMm: 40, heightMm: 40, bgColor: "#FFFFFF", bgLabel: "White",      region: "americas", notes: "40×40mm, white or light-grey background." },
  { id: "co-passport",    country: "Colombia",      flag: "🇨🇴", docType: "passport",  label: "Colombia Passport",   widthMm: 30, heightMm: 40, bgColor: "#FFFFFF", bgLabel: "White",      region: "americas", notes: "30×40mm, white background." },
  { id: "cl-passport",    country: "Chile",         flag: "🇨🇱", docType: "passport",  label: "Chile Passport",      widthMm: 30, heightMm: 40, bgColor: "#FFFFFF", bgLabel: "White",      region: "americas", notes: "30×40mm, white background." },
  { id: "pe-passport",    country: "Peru",          flag: "🇵🇪", docType: "passport",  label: "Peru Passport",       widthMm: 32, heightMm: 26, bgColor: "#FFFFFF", bgLabel: "White",      region: "americas", notes: "32×26mm, white background." },

  // EUROPE
  { id: "schengen-visa",  country: "Schengen Area", flag: "🇪🇺", docType: "visa",      label: "Schengen Visa",       widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm (same as EU standard). White or light grey background. Head 32–36mm." },
  { id: "uk-passport",    country: "United Kingdom",flag: "🇬🇧", docType: "passport",  label: "UK Passport",         widthMm: 35, heightMm: 45, bgColor: "#F0F0F0", bgLabel: "Light grey", region: "europe",   notes: "35×45mm. Cream or light grey background. Head 29–34mm from chin to crown." },
  { id: "de-passport",    country: "Germany",       flag: "🇩🇪", docType: "passport",  label: "Germany Passport",    widthMm: 35, heightMm: 45, bgColor: "#F5F5F5", bgLabel: "Light grey", region: "europe",   notes: "35×45mm. Light grey or white background. Head 32–36mm." },
  { id: "fr-passport",    country: "France",        flag: "🇫🇷", docType: "passport",  label: "France Passport",     widthMm: 35, heightMm: 45, bgColor: "#F5F5F5", bgLabel: "Light grey", region: "europe",   notes: "35×45mm. Light grey background. Head 32–36mm." },
  { id: "it-passport",    country: "Italy",         flag: "🇮🇹", docType: "passport",  label: "Italy Passport",      widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm. White background." },
  { id: "es-passport",    country: "Spain",         flag: "🇪🇸", docType: "passport",  label: "Spain Passport",      widthMm: 26, heightMm: 32, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "26×32mm. White background. Head proportional to ICAO standards." },
  { id: "nl-passport",    country: "Netherlands",   flag: "🇳🇱", docType: "passport",  label: "Netherlands Passport",widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm. White background." },
  { id: "be-passport",    country: "Belgium",       flag: "🇧🇪", docType: "passport",  label: "Belgium Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm. White or light-grey background." },
  { id: "ch-passport",    country: "Switzerland",   flag: "🇨🇭", docType: "passport",  label: "Switzerland Passport",widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm, white background." },
  { id: "at-passport",    country: "Austria",       flag: "🇦🇹", docType: "passport",  label: "Austria Passport",    widthMm: 35, heightMm: 45, bgColor: "#F5F5F5", bgLabel: "Light grey", region: "europe",   notes: "35×45mm. Light grey background. Head 32–36mm." },
  { id: "se-passport",    country: "Sweden",        flag: "🇸🇪", docType: "passport",  label: "Sweden Passport",     widthMm: 35, heightMm: 45, bgColor: "#F5F5F5", bgLabel: "Light grey", region: "europe",   notes: "35×45mm. Light grey background." },
  { id: "no-passport",    country: "Norway",        flag: "🇳🇴", docType: "passport",  label: "Norway Passport",     widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm, white background." },
  { id: "dk-passport",    country: "Denmark",       flag: "🇩🇰", docType: "passport",  label: "Denmark Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm, white background." },
  { id: "fi-passport",    country: "Finland",       flag: "🇫🇮", docType: "passport",  label: "Finland Passport",    widthMm: 36, heightMm: 47, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "36×47mm, white background." },
  { id: "ie-passport",    country: "Ireland",       flag: "🇮🇪", docType: "passport",  label: "Ireland Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm, white or light background." },
  { id: "pt-passport",    country: "Portugal",      flag: "🇵🇹", docType: "passport",  label: "Portugal Passport",   widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm, white background." },
  { id: "pl-passport",    country: "Poland",        flag: "🇵🇱", docType: "passport",  label: "Poland Passport",     widthMm: 35, heightMm: 45, bgColor: "#F5F5F5", bgLabel: "Light grey", region: "europe",   notes: "35×45mm. Light grey background." },
  { id: "cz-passport",    country: "Czech Republic",flag: "🇨🇿", docType: "passport",  label: "Czech Passport",      widthMm: 35, heightMm: 45, bgColor: "#F5F5F5", bgLabel: "Light grey", region: "europe",   notes: "35×45mm. Light grey background." },
  { id: "hu-passport",    country: "Hungary",       flag: "🇭🇺", docType: "passport",  label: "Hungary Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm, white background." },
  { id: "ro-passport",    country: "Romania",       flag: "🇷🇴", docType: "passport",  label: "Romania Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm, white background." },
  { id: "ua-passport",    country: "Ukraine",       flag: "🇺🇦", docType: "passport",  label: "Ukraine Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm, white background." },
  { id: "ru-passport",    country: "Russia",        flag: "🇷🇺", docType: "passport",  label: "Russia Passport",     widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "35×45mm. White background. Head 32–36mm." },
  { id: "tr-passport",    country: "Turkey",        flag: "🇹🇷", docType: "passport",  label: "Turkey Passport",     widthMm: 50, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "50×60mm, white background." },
  { id: "gr-passport",    country: "Greece",        flag: "🇬🇷", docType: "passport",  label: "Greece Passport",     widthMm: 40, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "europe",   notes: "40×60mm (4×6cm), white background." },
  { id: "hr-passport",    country: "Croatia",       flag: "🇭🇷", docType: "passport",  label: "Croatia Passport",    widthMm: 35, heightMm: 45, bgColor: "#F5F5F5", bgLabel: "Light grey", region: "europe",   notes: "35×45mm. Light grey background." },

  // ASIA
  { id: "cn-passport",    country: "China",         flag: "🇨🇳", docType: "passport",  label: "China Passport",      widthMm: 33, heightMm: 48, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "33×48mm. White background. Head 28–33mm." },
  { id: "cn-visa",        country: "China",         flag: "🇨🇳", docType: "visa",      label: "China Visa",          widthMm: 33, heightMm: 48, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "33×48mm. White background. Same as passport spec." },
  { id: "jp-passport",    country: "Japan",         flag: "🇯🇵", docType: "passport",  label: "Japan Passport",      widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×45mm. White background. Head 32–36mm." },
  { id: "kr-passport",    country: "South Korea",   flag: "🇰🇷", docType: "passport",  label: "South Korea Passport",widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×45mm, white background." },
  { id: "in-passport",    country: "India",         flag: "🇮🇳", docType: "passport",  label: "India Passport",      widthMm: 51, heightMm: 51, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "51×51mm (2×2 in). White background. Head 25–35mm." },
  { id: "in-visa",        country: "India",         flag: "🇮🇳", docType: "visa",      label: "India e-Visa",        widthMm: 51, heightMm: 51, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "51×51mm, white background. Plain background required." },
  { id: "pk-passport",    country: "Pakistan",      flag: "🇵🇰", docType: "passport",  label: "Pakistan Passport",   widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×45mm. White background. Head must be 70–80% of frame height." },
  { id: "pk-nicop",       country: "Pakistan",      flag: "🇵🇰", docType: "nicop",     label: "Pakistan NICOP",      widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×45mm. White background. NICOP (National ID Card for Overseas Pakistanis)." },
  { id: "bd-passport",    country: "Bangladesh",    flag: "🇧🇩", docType: "passport",  label: "Bangladesh Passport", widthMm: 45, heightMm: 55, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "45×55mm. White background." },
  { id: "lk-passport",    country: "Sri Lanka",     flag: "🇱🇰", docType: "passport",  label: "Sri Lanka Passport",  widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×45mm, white background." },
  { id: "np-passport",    country: "Nepal",         flag: "🇳🇵", docType: "passport",  label: "Nepal Passport",      widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×45mm, white background." },
  { id: "ph-passport",    country: "Philippines",   flag: "🇵🇭", docType: "passport",  label: "Philippines Passport",widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×45mm, white background." },
  { id: "vn-passport",    country: "Vietnam",       flag: "🇻🇳", docType: "passport",  label: "Vietnam Passport",    widthMm: 40, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "40×60mm. White background." },
  { id: "th-passport",    country: "Thailand",      flag: "🇹🇭", docType: "passport",  label: "Thailand Passport",   widthMm: 40, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "40×60mm. White background." },
  { id: "my-passport",    country: "Malaysia",      flag: "🇲🇾", docType: "passport",  label: "Malaysia Passport",   widthMm: 35, heightMm: 50, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×50mm. White background." },
  { id: "sg-passport",    country: "Singapore",     flag: "🇸🇬", docType: "passport",  label: "Singapore Passport",  widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×45mm. White background." },
  { id: "id-passport",    country: "Indonesia",     flag: "🇮🇩", docType: "passport",  label: "Indonesia Passport",  widthMm: 51, heightMm: 51, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "51×51mm. White or light blue background." },
  { id: "tw-passport",    country: "Taiwan",        flag: "🇹🇼", docType: "passport",  label: "Taiwan Passport",     widthMm: 45, heightMm: 55, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "45×55mm. White background." },
  { id: "hk-passport",    country: "Hong Kong",     flag: "🇭🇰", docType: "passport",  label: "Hong Kong Passport",  widthMm: 40, heightMm: 50, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "40×50mm. White or off-white background." },
  { id: "mm-passport",    country: "Myanmar",       flag: "🇲🇲", docType: "passport",  label: "Myanmar Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "asia",     notes: "35×45mm. White background." },

  // MIDDLE EAST
  { id: "ae-passport",    country: "UAE",           flag: "🇦🇪", docType: "passport",  label: "UAE Passport",        widthMm: 40, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "40×60mm. White background." },
  { id: "sa-passport",    country: "Saudi Arabia",  flag: "🇸🇦", docType: "passport",  label: "Saudi Passport",      widthMm: 40, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "40×60mm. White background." },
  { id: "sa-visa",        country: "Saudi Arabia",  flag: "🇸🇦", docType: "visa",      label: "Saudi Visa",          widthMm: 40, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "40×60mm. White background." },
  { id: "kw-passport",    country: "Kuwait",        flag: "🇰🇼", docType: "passport",  label: "Kuwait Passport",     widthMm: 40, heightMm: 50, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "40×50mm. White background." },
  { id: "qa-passport",    country: "Qatar",         flag: "🇶🇦", docType: "passport",  label: "Qatar Passport",      widthMm: 40, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "40×60mm. White background." },
  { id: "om-passport",    country: "Oman",          flag: "🇴🇲", docType: "passport",  label: "Oman Passport",       widthMm: 40, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "40×60mm. White background." },
  { id: "jo-passport",    country: "Jordan",        flag: "🇯🇴", docType: "passport",  label: "Jordan Passport",     widthMm: 40, heightMm: 50, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "40×50mm. White background." },
  { id: "lb-passport",    country: "Lebanon",       flag: "🇱🇧", docType: "passport",  label: "Lebanon Passport",    widthMm: 40, heightMm: 50, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "40×50mm. White background." },
  { id: "ir-passport",    country: "Iran",          flag: "🇮🇷", docType: "passport",  label: "Iran Passport",       widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "35×45mm. White background." },
  { id: "il-passport",    country: "Israel",        flag: "🇮🇱", docType: "passport",  label: "Israel Passport",     widthMm: 50, heightMm: 50, bgColor: "#FFFFFF", bgLabel: "White",      region: "middleeast", notes: "50×50mm. White or light background." },

  // AFRICA
  { id: "za-passport",    country: "South Africa",  flag: "🇿🇦", docType: "passport",  label: "South Africa Passport",widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",     region: "africa",   notes: "35×45mm. White or off-white background." },
  { id: "ng-passport",    country: "Nigeria",       flag: "🇳🇬", docType: "passport",  label: "Nigeria Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "africa",   notes: "35×45mm. White background." },
  { id: "ke-passport",    country: "Kenya",         flag: "🇰🇪", docType: "passport",  label: "Kenya Passport",      widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "africa",   notes: "35×45mm. White background." },
  { id: "gh-passport",    country: "Ghana",         flag: "🇬🇭", docType: "passport",  label: "Ghana Passport",      widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "africa",   notes: "35×45mm. White background." },
  { id: "eg-passport",    country: "Egypt",         flag: "🇪🇬", docType: "passport",  label: "Egypt Passport",      widthMm: 40, heightMm: 60, bgColor: "#FFFFFF", bgLabel: "White",      region: "africa",   notes: "40×60mm. White background." },
  { id: "ma-passport",    country: "Morocco",       flag: "🇲🇦", docType: "passport",  label: "Morocco Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "africa",   notes: "35×45mm. White background." },
  { id: "dz-passport",    country: "Algeria",       flag: "🇩🇿", docType: "passport",  label: "Algeria Passport",    widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "africa",   notes: "35×45mm. White background." },
  { id: "et-passport",    country: "Ethiopia",      flag: "🇪🇹", docType: "passport",  label: "Ethiopia Passport",   widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "africa",   notes: "35×45mm. White background." },
  { id: "tz-passport",    country: "Tanzania",      flag: "🇹🇿", docType: "passport",  label: "Tanzania Passport",   widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "africa",   notes: "35×45mm. White background." },

  // OCEANIA
  { id: "au-passport",    country: "Australia",     flag: "🇦🇺", docType: "passport",  label: "Australia Passport",  widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "oceania",  notes: "35×45mm. White or off-white background. Head 32–36mm." },
  { id: "nz-passport",    country: "New Zealand",   flag: "🇳🇿", docType: "passport",  label: "New Zealand Passport",widthMm: 35, heightMm: 45, bgColor: "#FFFFFF", bgLabel: "White",      region: "oceania",  notes: "35×45mm. White or light-grey background." },
];

const REGIONS: { id: Region; label: string }[] = [
  { id: "all",        label: "All" },
  { id: "americas",  label: "Americas" },
  { id: "europe",    label: "Europe" },
  { id: "asia",      label: "Asia" },
  { id: "middleeast",label: "Middle East" },
  { id: "africa",    label: "Africa" },
  { id: "oceania",   label: "Oceania" },
];

const DOC_BADGE: Record<DocType, string> = {
  passport: "Passport",
  visa:     "Visa",
  id:       "ID Card",
  residence:"Residence",
  nicop:    "NICOP",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mmToPx = (mm: number) => Math.round((mm * 300) / 25.4);

function floodFillErase(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const idata = ctx.getImageData(0, 0, w, h);
  const data = idata.data;
  const corners = [
    [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
    [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
    [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)],
  ];
  let bgR = 0, bgG = 0, bgB = 0;
  for (const [cx, cy] of corners) {
    const idx = (cy * w + cx) * 4;
    bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2];
  }
  bgR = Math.round(bgR / corners.length);
  bgG = Math.round(bgG / corners.length);
  bgB = Math.round(bgB / corners.length);

  const visited = new Uint8Array(w * h);
  const queue: number[] = [];
  let head = 0;

  const enqueue = (x: number, y: number) => {
    const pos = y * w + x;
    if (visited[pos]) return;
    visited[pos] = 1;
    queue.push(x, y);
  };

  for (let x = 0; x < w; x++) { enqueue(x, 0); enqueue(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { enqueue(0, y); enqueue(w - 1, y); }

  const tol = 55;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = (y * w + x) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    if (Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) <= tol * 3) {
      data[idx + 3] = 0;
      if (x > 0)     enqueue(x - 1, y);
      if (x < w - 1) enqueue(x + 1, y);
      if (y > 0)     enqueue(x, y - 1);
      if (y < h - 1) enqueue(x, y + 1);
    }
  }
  ctx.putImageData(idata, 0, 0);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PassportPhotoPage() {
  const [files, setFiles]           = useState<File[]>([]);
  const [spec, setSpec]             = useState<PhotoSpec>(SPECS[0]);
  const [customBg, setCustomBg]     = useState(false);
  const [bgColor, setBgColor]       = useState(SPECS[0].bgColor);
  const [printSheet, setPrintSheet] = useState(false);
  const [query, setQuery]           = useState("");
  const [region, setRegion]         = useState<Region>("all");
  const [processing, setProcessing] = useState(false);
  const [done, setDone]             = useState(false);
  const [resultUrl, setResultUrl]   = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return SPECS.filter((s) => {
      const matchRegion = region === "all" || s.region === region;
      const matchQuery  = !q || s.country.toLowerCase().includes(q) || s.label.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [query, region]);

  // Keep bg in sync when spec changes (unless user has overridden it)
  useEffect(() => {
    if (!customBg) setBgColor(spec.bgColor);
  }, [spec, customBg]);

  useEffect(() => {
    urlRef.current = resultUrl;
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [resultUrl]);

  const handleProcess = useCallback(async () => {
    if (!files.length) return;
    setProcessing(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 50));

    try {
      const img = new Image();
      img.src = URL.createObjectURL(files[0]);
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("load")); });

      const targetW = mmToPx(spec.widthMm);
      const targetH = mmToPx(spec.heightMm);
      const tgtAspect = targetW / targetH;

      // Downscale for face detection
      const scale = Math.min(600 / img.naturalWidth, 1);
      const procW = Math.round(img.naturalWidth * scale);
      const procH = Math.round(img.naturalHeight * scale);
      const pc = document.createElement("canvas");
      pc.width = procW; pc.height = procH;
      const pCtx = pc.getContext("2d")!;
      pCtx.drawImage(img, 0, 0, procW, procH);
      const pData = pCtx.getImageData(0, 0, procW, procH).data;

      let minX = procW, maxX = 0, minY = procH, maxY = 0, faceFound = false;
      for (let y = 0; y < procH; y++) {
        for (let x = 0; x < procW; x++) {
          const i = (y * procW + x) * 4;
          const r = pData[i], g = pData[i + 1], b = pData[i + 2];
          if (r > 95 && g > 40 && b > 20 && Math.max(r,g,b)-Math.min(r,g,b) > 15 && Math.abs(r-g) > 15 && r > g && r > b) {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            faceFound = true;
          }
        }
      }

      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (faceFound && minX < maxX && minY < maxY) {
        const fW = (maxX - minX) / scale, fH = (maxY - minY) / scale;
        const cx = (minX + (maxX - minX) / 2) / scale, fy = minY / scale;
        sh = Math.min(img.naturalHeight, fH * 2.8);
        sw = sh * tgtAspect;
        if (sw > img.naturalWidth) { sw = img.naturalWidth; sh = sw / tgtAspect; }
        sx = Math.max(0, cx - sw / 2);
        if (sx + sw > img.naturalWidth) sx = img.naturalWidth - sw;
        sy = Math.max(0, fy - sh * 0.15);
        if (sy + sh > img.naturalHeight) sy = img.naturalHeight - sh;
      } else {
        const srcA = img.naturalWidth / img.naturalHeight;
        if (srcA > tgtAspect) { sw = img.naturalHeight * tgtAspect; sx = (img.naturalWidth - sw) / 2; }
        else { sh = img.naturalWidth / tgtAspect; sy = (img.naturalHeight - sh) * 0.25; }
      }

      // Crop + flood-fill erase background
      const tmpC = document.createElement("canvas");
      tmpC.width = targetW; tmpC.height = targetH;
      const tCtx = tmpC.getContext("2d")!;
      tCtx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
      floodFillErase(tCtx, targetW, targetH);

      // Composite: new background + subject
      const singleC = document.createElement("canvas");
      singleC.width = targetW; singleC.height = targetH;
      const sCtx = singleC.getContext("2d")!;
      sCtx.fillStyle = bgColor;
      sCtx.fillRect(0, 0, targetW, targetH);
      sCtx.drawImage(tmpC, 0, 0);

      if (printSheet) {
        const shW = mmToPx(152.4), shH = mmToPx(101.6); // 6×4 inch landscape
        const pC = document.createElement("canvas");
        pC.width = shW; pC.height = shH;
        const pCtxOut = pC.getContext("2d")!;
        pCtxOut.fillStyle = "#FFFFFF";
        pCtxOut.fillRect(0, 0, shW, shH);
        const gap = mmToPx(3);
        const cols = Math.floor((shW + gap) / (targetW + gap));
        const rows = Math.floor((shH + gap) / (targetH + gap));
        const startX = (shW - cols * targetW - (cols - 1) * gap) / 2;
        const startY = (shH - rows * targetH - (rows - 1) * gap) / 2;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = startX + c * (targetW + gap);
            const y = startY + r * (targetH + gap);
            pCtxOut.drawImage(singleC, 0, 0, targetW, targetH, x, y, targetW, targetH);
            pCtxOut.strokeStyle = "#CCCCCC";
            pCtxOut.lineWidth = 1;
            pCtxOut.strokeRect(x, y, targetW, targetH);
          }
        }
        setResultUrl(pC.toDataURL("image/png"));
      } else {
        setResultUrl(singleC.toDataURL("image/png"));
      }

      URL.revokeObjectURL(img.src);
      setDone(true);
    } catch {
      setError("Failed to process photo. Please try a clear portrait/selfie.");
    } finally {
      setProcessing(false);
    }
  }, [files, spec, bgColor, printSheet]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = printSheet ? `${spec.id}-print-sheet.png` : `${spec.id}-photo.png`;
    a.click();
  }, [resultUrl, printSheet, spec]);

  const handleReset = useCallback(() => {
    setFiles([]); setDone(false); setProcessing(false);
    setResultUrl(null); setError(null);
  }, []);

  const pxW = mmToPx(spec.widthMm);
  const pxH = mmToPx(spec.heightMm);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Camera}
          title="Passport & Visa Photo Maker"
          description="Exact specs for 60+ country documents — auto face-crop, background replacement, 300 DPI print sheet. Free and fully private."
          backHref="/image-tools"
          backLabel="Back to Image Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8 space-y-5">
        {!done ? (
          <>
            {/* ── Step 1: Country selector ── */}
            <div className="glass-panel rounded-[16px] p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Choose Country &amp; Document Type
              </h2>

              {/* Search + region filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="text"
                    placeholder="Search country or document..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-1 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {REGIONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRegion(r.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        region === r.id
                          ? "bg-primary-muted border-primary-border text-primary"
                          : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spec grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
                {filtered.length === 0 && (
                  <p className="col-span-4 text-sm text-foreground-muted text-center py-6">No results for &quot;{query}&quot;</p>
                )}
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSpec(s); if (!customBg) setBgColor(s.bgColor); }}
                    className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                      spec.id === s.id
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                  >
                    <span className="text-base mr-1.5">{s.flag}</span>
                    <span className="text-xs font-semibold leading-tight block truncate mt-0.5">{s.label}</span>
                    <span className="text-[10px] opacity-60 mt-0.5 block">{s.widthMm}×{s.heightMm}mm · {DOC_BADGE[s.docType]}</span>
                  </button>
                ))}
              </div>

              {/* Selected spec info */}
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary-muted/30 p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{spec.flag}</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{spec.label}</p>
                    <p className="text-xs text-foreground-secondary mt-0.5">
                      <span className="font-mono">{spec.widthMm}×{spec.heightMm}mm</span>
                      <span className="mx-2 opacity-40">|</span>
                      <span className="font-mono">{pxW}×{pxH}px</span> at 300 DPI
                      <span className="mx-2 opacity-40">|</span>
                      Background: {spec.bgLabel}
                    </p>
                  </div>
                </div>
                {spec.notes && (
                  <div className="flex items-start gap-2 text-xs text-foreground-muted max-w-sm">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/50" />
                    <span>{spec.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Step 2: Options ── */}
            <div className="glass-panel rounded-[16px] p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Background Color &amp; Output
              </h2>
              <div className="flex flex-wrap gap-6 items-start">
                {/* BG color */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Background</p>
                  <div className="flex gap-2 flex-wrap items-center">
                    <button
                      onClick={() => { setCustomBg(false); setBgColor(spec.bgColor); }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                        !customBg ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"
                      }`}
                    >
                      <span className="w-4 h-4 rounded border border-border/50" style={{ backgroundColor: spec.bgColor }} />
                      Required ({spec.bgLabel})
                    </button>
                    <button
                      onClick={() => setCustomBg(true)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        customBg ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"
                      }`}
                    >
                      Custom
                    </button>
                    {customBg && (
                      <div className="flex items-center gap-2">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded border border-border cursor-pointer" />
                        <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                          className="w-20 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs text-foreground font-mono" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Output format */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Output</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPrintSheet(false)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        !printSheet ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" /> Single Photo
                    </button>
                    <button
                      onClick={() => setPrintSheet(true)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        printSheet ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary"
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5" /> 4×6 Print Sheet
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Step 3: Upload ── */}
            <div className="glass-panel rounded-[16px] p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Upload Your Photo
              </h2>
              <FileUpload
                accept="image/*"
                files={files}
                onFilesChange={setFiles}
                label="Drop your portrait photo here"
                description="Selfie or portrait — face detection auto-crops to spec"
              />

              {files.length > 0 && !processing && (
                <div className="mt-6 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} className="btn btn-primary inline-flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Generate {spec.label} Photo
                  </button>
                </div>
              )}

              {processing && (
                <div className="mt-6 text-center py-10">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-foreground-secondary">Detecting face &amp; replacing background…</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>
              )}
            </div>
          </>
        ) : (
          /* ── Result ── */
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6 flex-wrap justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{spec.flag} {spec.label}</p>
                  <p className="text-xs text-foreground-muted">{spec.widthMm}×{spec.heightMm}mm · {pxW}×{pxH}px · 300 DPI</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleReset} className="btn btn-secondary">Make Another</button>
                <button onClick={handleDownload} className="btn btn-primary inline-flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download {printSheet ? "Print Sheet" : "Photo"}
                </button>
              </div>
            </div>

            {resultUrl && (
              <div className="flex justify-center">
                <img
                  src={resultUrl}
                  alt={`${spec.label} photo`}
                  className="max-w-full max-h-[480px] rounded-xl border border-border shadow-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Info cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">100% Private</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">Every operation runs in your browser. Your photo never leaves your device.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Exact Specs</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">60+ country specs with official mm/px dimensions and background color rules.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Print-Ready Sheet</h4>
              <p className="text-foreground-muted text-xs leading-relaxed">300 DPI output. Print sheet packs multiple copies on a 4×6 inch page — ready for any photo printer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
