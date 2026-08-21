# Toolsz — Next.js App Source

This directory contains the Next.js 15 source for **[www.toolsz.co](https://www.toolsz.co)** — 217 free browser-based tools for PDF, image, and developer workflows.

> **Full project documentation (tool catalog, architecture, comparisons, FAQ):** see the [root README](../README.md)

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # Production build
npx tsc --noEmit  # Type check
```

## Key Files

| File | Purpose |
|------|---------|
| `app/utils/seo.ts` | `SITE_URL`, `toolMetadataMap` (207 entries), `getToolMetadata()`, `getCategoryMetadata()` |
| `app/sitemap.ts` | Auto-generated sitemap — all 217+ tool pages |
| `app/robots.ts` | `allow: "/"` + sitemap pointer |
| `app/layout.tsx` | Root layout — Organization + WebSite JSON-LD, global fonts, ChatbotWrapper |
| `app/utils/toolLinks.ts` | `RELATED_TOOLS_MAP` — 44 entries for related tool suggestions |
| `public/llms.txt` | Machine-readable site inventory for AI crawlers |

## Domain

All canonical URLs use `https://www.toolsz.co` (set in `SITE_URL`).  
Configure a 301 redirect from `toolsz.co` → `www.toolsz.co` in Vercel domain settings.

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Vercel Edge
