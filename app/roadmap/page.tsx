"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Clock, Lightbulb, Rocket, TrendingUp,
  ThumbsUp, ArrowRight, Zap, Users, Calendar, Sparkles, Check,
  GitCommit, Star,
} from "lucide-react";

type Tab = "in-progress" | "planned" | "completed" | "changelog";

const IN_PROGRESS = [
  { name:"Dark Mode",                  pct:80, eta:"July 2026",     tag:"Feature",   desc:"Full dark theme across all 219 tools with system preference detection." },
  { name:"Tool Favorites & Bookmarks", pct:65, eta:"July 2026",     tag:"Feature",   desc:"Save your most-used tools and access them from a personal dashboard." },
  { name:"Excel Formula Generator",   pct:35, eta:"August 2026",   tag:"Tool",      desc:"Describe what you want in plain English — get the exact Excel formula." },
  { name:"Chrome Extension",          pct:40, eta:"August 2026",   tag:"Feature",   desc:"Access any Toolsz tool from your browser toolbar with a single click." },
  { name:"PDF to PowerPoint",         pct:20, eta:"Sept 2026",     tag:"Tool",      desc:"Convert PDF presentations back to fully editable .pptx files." },
];

const PLANNED = [
  { tool:"SQL Formatter & Beautifier",   votes:241, category:"Developer", desc:"Format and indent messy SQL queries — supports MySQL, Postgres, SQLite" },
  { tool:"Website Screenshot Tool",      votes:198, category:"Developer", desc:"Capture full-page screenshots of any public URL — no install" },
  { tool:"XML to JSON Converter",        votes:176, category:"Developer", desc:"Convert XML files and strings to clean JSON — handles attributes" },
  { tool:"Text to Speech",              votes:143, category:"AI / ML",   desc:"Convert text to natural-sounding audio in 40+ languages" },
  { tool:"HTML Email Builder",          votes:119, category:"Business",  desc:"Drag-and-drop HTML email template editor with inbox preview" },
  { tool:"Contract Generator",          votes:98,  category:"Business",  desc:"Generate freelance contracts, NDAs, and SoWs from smart templates" },
  { tool:"JSON Schema Validator",       votes:87,  category:"Developer", desc:"Validate JSON data against a schema with detailed error messages" },
  { tool:"CSS Minifier / Beautifier",   votes:74,  category:"Developer", desc:"Minify CSS for production or beautify for debugging" },
];

const FEATURES_PLANNED = [
  { name:"User Dashboard",    desc:"Personal space to view history, saved tools, and requests",  status:"Planned" },
  { name:"API Access",        desc:"Programmatic access to core PDF and image tools",             status:"Planned" },
  { name:"Mobile App",        desc:"Native iOS and Android apps for the most-used tools",        status:"Considering" },
  { name:"Tool History",      desc:"Keep a record of files you've processed (local only)",       status:"Planned" },
  { name:"Offline Mode",      desc:"Service worker cache so tools work without internet",        status:"Planned" },
  { name:"Keyboard Shortcuts",desc:"Power-user keyboard navigation for all tool pages",          status:"In Progress" },
];

const COMPLETED = [
  {
    month: "June 2026",
    tools: [
      { name:"PDF Roast & Quality Score",   href:"/pdf-roast",           highlight:true },
      { name:"Business Document Pack",      href:"/business-docs",       highlight:true },
      { name:"JSON to PPTX",               href:"/json-to-pptx",        highlight:true },
      { name:"JS to PPTX",                 href:"/js-to-pptx" },
      { name:"Word to PDF",                href:"/word-to-pdf" },
      { name:"Passport & Visa Photo",       href:"/passport-photo",      highlight:true },
      { name:"Screenshot to Table",        href:"/screenshot-to-table", highlight:true },
      { name:"Image Roast & Quality Score", href:"/image-roast" },
      { name:"Print & Frame Calculator",   href:"/print-calculator" },
      { name:"SVG to PNG",                 href:"/svg-to-png" },
      { name:"PNG to SVG",                 href:"/png-to-svg" },
      { name:"Image Size Analyzer",        href:"/size-analyzer" },
    ],
  },
  {
    month: "May 2026",
    tools: [
      { name:"Resume / CV Builder",         href:"/resume-builder",      highlight:true },
      { name:"AI Image Detector",           href:"/ai-detector",         highlight:true },
      { name:"Bulk File Renamer",           href:"/bulk-renamer" },
      { name:"Folder Structure Visualizer", href:"/folder-visualizer" },
      { name:"CSV Visual Debugger",         href:"/csv-debugger" },
      { name:"Multi-Format Converter",      href:"/multi-converter" },
    ],
  },
  {
    month: "April 2026",
    tools: [
      { name:"Invoice Generator (10 templates)", href:"/invoice-generator",   highlight:true },
      { name:"Smart PDF Cleaner",               href:"/pdf-cleaner" },
      { name:"PDF Flipbook",                    href:"/flipbook-pdf" },
      { name:"Code Screenshot Generator",       href:"/code-screenshot" },
      { name:"Barcode Generator",               href:"/barcode" },
    ],
  },
  {
    month: "Jan – Mar 2026",
    tools: [
      { name:"PDF OCR",             href:"/pdf-ocr" },
      { name:"Image Upscaler",      href:"/upscale-image" },
      { name:"Photo Enhancer",      href:"/photo-enhancer" },
      { name:"Fake Data Generator", href:"/fake-data" },
      { name:"Email Signature Generator", href:"/email-signature" },
      { name:"GIF Maker",           href:"/gif-maker" },
      { name:"Collage Maker",       href:"/collage-maker" },
      { name:"Meme Generator",      href:"/meme-generator" },
      { name:"Image Annotator",     href:"/annotate-image" },
      { name:"Colorize Image",      href:"/colorize-image" },
      { name:"…and 66 more tools",  href:"/all-tools" },
    ],
  },
];

const CHANGELOG = [
  {
    date:"June 19, 2026",
    items:[
      "Added 12 new tools: JSON/JS to PPTX, Word to PDF, Passport & Visa Photo, Screenshot to Table, PNG↔SVG converters, Image + PDF size analyzers, Image Roast, Print Calculator",
      "Chatbot updated with all 219 tools — searches now match every tool correctly",
      "All-Tools directory now filterable with live search",
    ],
  },
  {
    date:"May 30, 2026",
    items:[
      "Launched Resume / CV Builder with 20+ ATS-optimized templates and PDF export",
      "AI Image Detector upgraded with CLIP neural network model — more accurate detection",
    ],
  },
  {
    date:"May 10, 2026",
    items:[
      "Added 4 developer tools: Bulk File Renamer, Folder Structure Visualizer, CSV Visual Debugger, Multi-Format Converter",
      "Tool Recommendation Chatbot launched on home, PDF, Image, and Dev tool pages",
    ],
  },
  {
    date:"April 25, 2026",
    items:[
      "Invoice Generator rewritten with 10 professional templates (Modern, Executive, Nordic, SaaS, Tech, Corporate…)",
      "Added PAID stamp, bank details, VAT fields, logo upload, and auto-save to Invoice Generator",
    ],
  },
  {
    date:"April 12, 2026",
    items:[
      "PDF Flipbook — interactive 3D page-turn reader for any PDF",
      "Smart PDF Cleaner — auto-normalize fonts, margins, and whitespace",
      "Code Screenshot Generator — 8 themes, custom padding, PNG/SVG export",
    ],
  },
  {
    date:"April 5, 2026",
    items:[
      "Barcode Generator — Code128, EAN-13, UPC-A, ITF-14, Codabar, MSI formats",
      "Compress to Exact Size — hit a precise KB/MB target, useful for passport/visa photo requirements",
    ],
  },
];

const CAT_COLOR: Record<string, string> = {
  "Developer": "bg-blue-50 text-blue-600 border-blue-100",
  "AI / ML":   "bg-violet-50 text-violet-600 border-violet-100",
  "Business":  "bg-indigo-50 text-indigo-600 border-indigo-100",
  "PDF":       "bg-red-50 text-red-600 border-red-100",
  "Image":     "bg-amber-50 text-amber-600 border-amber-100",
};

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id:"in-progress", label:"In Progress",  icon:Clock },
  { id:"planned",     label:"Planned",       icon:Lightbulb },
  { id:"completed",   label:"Completed",     icon:CheckCircle2 },
  { id:"changelog",   label:"Changelog",     icon:GitCommit },
];

export default function RoadmapPage() {
  const [tab, setTab] = useState<Tab>("in-progress");

  return (
    <div className="min-h-[calc(100vh-8rem)]">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors duration-150">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-linear-to-br from-indigo-50 to-violet-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                <Sparkles className="w-3 h-3" />
                Updated weekly — last update June 19, 2026
              </div>
              <h1 className="type-h1 font-display gradient-text mb-2">Public Product Roadmap</h1>
              <p className="text-foreground-secondary text-lg max-w-2xl leading-relaxed">
                Full transparency on what we&apos;ve shipped, what&apos;s being built right now, and what&apos;s coming next. Completely community-driven.
              </p>
            </div>
          </div>

          {/* Velocity stats */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { value:"219",        label:"Tools Shipped",          icon:Rocket,       color:"text-indigo-500" },
              { value:"5",          label:"In Progress Now",         icon:Clock,        color:"text-amber-500" },
              { value:"12",         label:"Shipped This Month",      icon:CheckCircle2, color:"text-green-500" },
              { value:"4,847",      label:"Community Requests",      icon:Users,        color:"text-violet-500" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2.5 bg-white border border-border rounded-xl px-4 py-2.5">
                <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{s.value}</p>
                  <p className="text-[11px] text-foreground-secondary mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 mt-8">
        <div className="flex gap-1 bg-surface border border-border rounded-2xl p-1 w-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-white text-primary shadow-sm border border-border"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-10">

        {/* IN PROGRESS */}
        {tab === "in-progress" && (
          <div>
            <h2 className="type-h2 font-display text-foreground mb-1">Currently Building</h2>
            <p className="text-foreground-secondary mb-8">These tools and features are in active development right now.</p>

            <div className="space-y-4">
              {IN_PROGRESS.map(item => (
                <div key={item.name} className="glass-card-premium p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.tag === "Tool"
                          ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {item.tag}
                      </div>
                      <h3 className="text-base font-bold text-foreground">{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-foreground-secondary" />
                      <span className="text-xs text-foreground-secondary font-medium">Est. {item.eta}</span>
                      <span className="text-xs font-bold text-primary ml-1">{item.pct}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground-secondary mb-4">{item.desc}</p>
                  <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
                    <div
                      className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                      style={{ width:`${item.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-foreground-secondary">Started</span>
                    <span className="text-[10px] text-foreground-secondary">Release</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="type-h3 font-display text-foreground mb-1">Feature Requests</h3>
              <p className="text-foreground-secondary mb-5">Non-tool improvements being tracked.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {FEATURES_PLANNED.map(f => (
                  <div key={f.name} className="glass-card-premium p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-foreground">{f.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        f.status === "In Progress" ? "bg-green-50 text-green-600 border-green-100" :
                        f.status === "Planned"     ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                     "bg-gray-50 text-gray-500 border-gray-100"
                      }`}>{f.status}</span>
                    </div>
                    <p className="text-xs text-foreground-secondary leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PLANNED */}
        {tab === "planned" && (
          <div>
            <h2 className="type-h2 font-display text-foreground mb-1">Coming Next</h2>
            <p className="text-foreground-secondary mb-8">
              Community-voted tools queued for development. More votes = higher priority.{" "}
              <Link href="/request-a-tool" className="text-primary font-semibold hover:underline">Vote or add your own →</Link>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLANNED.map((p, i) => (
                <div key={p.tool} className="glass-card-premium p-5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-xs font-bold text-amber-600">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-foreground">{p.tool}</p>
                      <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                        <ThumbsUp className="w-3 h-3" />
                        {p.votes}
                      </div>
                    </div>
                    <p className="text-xs text-foreground-secondary mb-2">{p.desc}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${CAT_COLOR[p.category] ?? ""}`}>
                      {p.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl bg-linear-to-br from-amber-50 via-white to-indigo-50 border border-amber-100/80 p-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="flex-1">
                <p className="text-base font-bold text-foreground mb-0.5">Don&apos;t see your tool?</p>
                <p className="text-sm text-foreground-secondary">Submit a new request — top-voted requests get built first.</p>
              </div>
              <Link href="/request-a-tool" className="btn btn-primary shrink-0 gap-2">
                Request a Tool <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* COMPLETED */}
        {tab === "completed" && (
          <div>
            <h2 className="type-h2 font-display text-foreground mb-1">Shipped</h2>
            <p className="text-foreground-secondary mb-8">219 tools released. New tools ship every few weeks.</p>

            <div className="space-y-8">
              {COMPLETED.map(section => (
                <div key={section.month}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-border" />
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border">
                      <Calendar className="w-3.5 h-3.5 text-foreground-secondary" />
                      <span className="text-xs font-bold text-foreground">{section.month}</span>
                      <span className="text-xs text-foreground-secondary">— {section.tools.length} tool{section.tools.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {section.tools.map(tool => (
                      <Link key={tool.name} href={tool.href} className="glass-card-premium p-3.5 flex items-center gap-3 group hover:border-primary/30 transition-all">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${tool.highlight ? "text-green-500" : "text-gray-300"}`} />
                        <span className={`text-sm font-semibold group-hover:text-primary transition-colors ${tool.highlight ? "text-foreground" : "text-foreground-secondary"}`}>
                          {tool.name}
                        </span>
                        {tool.highlight && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0 ml-auto" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHANGELOG */}
        {tab === "changelog" && (
          <div>
            <h2 className="type-h2 font-display text-foreground mb-1">Release Changelog</h2>
            <p className="text-foreground-secondary mb-8">Every notable release and what changed.</p>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-8 pl-10">
                {CHANGELOG.map((entry, i) => (
                  <div key={entry.date} className="relative">
                    {/* Dot */}
                    <div className={`absolute -left-[34px] w-3 h-3 rounded-full border-2 border-white ${i === 0 ? "bg-primary" : "bg-gray-300"} mt-1`} />

                    <div className="glass-card-premium p-5">
                      <div className="flex items-center gap-2 mb-3">
                        {i === 0 && (
                          <span className="text-[10px] font-bold bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">Latest</span>
                        )}
                        <span className="text-sm font-bold text-foreground">{entry.date}</span>
                      </div>
                      <ul className="space-y-2">
                        {entry.items.map(item => (
                          <li key={item} className="flex items-start gap-2 text-sm text-foreground-secondary">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-linear-to-br from-indigo-50 via-white to-violet-50 border border-indigo-100/80 p-6 flex flex-col">
            <Zap className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-base font-bold text-foreground mb-1">Request a Tool</h3>
            <p className="text-sm text-foreground-secondary leading-relaxed flex-1">
              Tell us what you need. Community requests with the most votes get built first.
            </p>
            <Link href="/request-a-tool" className="btn btn-primary mt-4 gap-2 w-fit">
              Submit Request <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-2xl bg-linear-to-br from-green-50 via-white to-teal-50 border border-green-100/80 p-6 flex flex-col">
            <Rocket className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="text-base font-bold text-foreground mb-1">Browse All 219 tools</h3>
            <p className="text-sm text-foreground-secondary leading-relaxed flex-1">
              219 Free online tools — PDF, image, developer, AI. No upload, no signup, no watermarks.
            </p>
            <Link href="/all-tools" className="btn btn-secondary mt-4 gap-2 w-fit">
              View All Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-sm text-foreground-secondary mb-3 font-medium">Explore more</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label:"Request a Tool",   href:"/request-a-tool" },
              { label:"All Tools",        href:"/all-tools" },
              { label:"PDF Tools",        href:"/pdf-tools" },
              { label:"Image Tools",      href:"/image-tools" },
              { label:"Developer Tools",  href:"/dev-tools" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
