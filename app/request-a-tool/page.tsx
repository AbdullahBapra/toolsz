"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, ThumbsUp, CheckCircle2, Rocket, MessageSquare,
  ArrowRight, Send, Star, Sparkles, Check, Clock,
} from "lucide-react";

const CATEGORIES = ["PDF", "Image", "Developer", "AI / ML", "Business", "Document", "Other"];

const POPULAR = [
  { id:"excel-formula",  tool:"Excel Formula Generator",     category:"Developer", votes:312, desc:"Describe what you need in plain English, get the Excel formula" },
  { id:"pdf-to-pptx",    tool:"PDF to PowerPoint",            category:"PDF",       votes:287, desc:"Convert PDF slides back to fully editable PowerPoint files" },
  { id:"sql-formatter",  tool:"SQL Formatter & Beautifier",   category:"Developer", votes:241, desc:"Format messy SQL queries with proper indentation and aliases" },
  { id:"website-ss",     tool:"Website Screenshot Tool",      category:"Developer", votes:198, desc:"Capture full-page screenshots of any public URL — no install" },
  { id:"xml-to-json",    tool:"XML to JSON Converter",        category:"Developer", votes:176, desc:"Convert XML files and strings to clean JSON instantly" },
  { id:"text-to-speech", tool:"Text to Speech",               category:"AI / ML",   votes:143, desc:"Convert text to natural-sounding audio in 40+ languages" },
  { id:"email-builder",  tool:"HTML Email Builder",           category:"Business",  votes:119, desc:"Drag-and-drop email template builder with inbox preview" },
  { id:"contract-gen",   tool:"Contract Generator",           category:"Business",  votes:98,  desc:"Generate freelance contracts and NDAs from templates" },
  { id:"json-schema",    tool:"JSON Schema Validator",        category:"Developer", votes:87,  desc:"Validate JSON against a schema with detailed error paths" },
  { id:"css-minifier",   tool:"CSS Minifier / Beautifier",    category:"Developer", votes:74,  desc:"Minify CSS for production or beautify for debugging" },
];

const RECENT = [
  { tool:"Handwriting OCR",        category:"AI / ML",   time:"2h ago" },
  { tool:"PDF Annotation Tool",    category:"PDF",       time:"5h ago" },
  { tool:"Bulk Image Converter",   category:"Image",     time:"12h ago" },
  { tool:"HTML Email Builder",     category:"Business",  time:"1d ago" },
  { tool:"YAML to JSON",           category:"Developer", time:"1d ago" },
  { tool:"PDF Page Extractor",     category:"PDF",       time:"2d ago" },
  { tool:"CSS to Tailwind",        category:"Developer", time:"2d ago" },
  { tool:"Video Thumbnail Maker",  category:"Image",     time:"3d ago" },
];

const BUILT = [
  { tool:"AI Image Detector",    href:"/ai-detector",       when:"May 2026",  votes:203 },
  { tool:"Resume / CV Builder",  href:"/resume-builder",    when:"May 2026",  votes:289 },
  { tool:"JSON to PPTX",         href:"/json-to-pptx",      when:"Jun 2026",  votes:156 },
  { tool:"Invoice Generator",    href:"/invoice-generator", when:"Apr 2026",  votes:178 },
  { tool:"Fake Data Generator",  href:"/fake-data",         when:"Mar 2026",  votes:134 },
  { tool:"PDF OCR",              href:"/pdf-ocr",           when:"Feb 2026",  votes:167 },
];

const CAT_COLOR: Record<string, string> = {
  "PDF":       "bg-red-50 text-red-600 border-red-100",
  "Image":     "bg-amber-50 text-amber-600 border-amber-100",
  "Developer": "bg-blue-50 text-blue-600 border-blue-100",
  "AI / ML":   "bg-violet-50 text-violet-600 border-violet-100",
  "Business":  "bg-indigo-50 text-indigo-600 border-indigo-100",
  "Document":  "bg-green-50 text-green-600 border-green-100",
  "Other":     "bg-gray-50 text-gray-600 border-gray-100",
};

export default function RequestAToolPage() {
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [voted, setVoted]           = useState<Set<string>>(new Set());
  const [form, setForm]             = useState({ name:"", problem:"", category:"PDF", email:"" });
  const [submitted, setSubmitted]   = useState(false);
  const [formError, setFormError]   = useState("");

  useEffect(() => {
    const init: Record<string, number> = {};
    POPULAR.forEach(r => { init[r.id] = r.votes; });
    setVoteCounts(init);
    try {
      const raw = localStorage.getItem("toolsz-req-votes");
      if (raw) setVoted(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  function castVote(id: string) {
    if (voted.has(id)) return;
    const next = new Set(voted).add(id);
    setVoted(next);
    setVoteCounts(p => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
    try { localStorage.setItem("toolsz-req-votes", JSON.stringify([...next])); } catch {}
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.problem.trim()) {
      setFormError("Please fill in the tool name and describe the problem.");
      return;
    }
    setFormError("");
    setSubmitted(true);
  }

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
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200/60 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                <Check className="w-3 h-3" />
                47 tools built directly from community requests
              </div>
              <h1 className="type-h1 font-display gradient-text mb-2">
                Can't Find the Tool You Need?
              </h1>
              <p className="text-foreground-secondary text-lg max-w-2xl leading-relaxed">
                We build free tools. You tell us what to build next. Submit a request, vote on others&apos; ideas, and watch your tool go from request to live — we review every week.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { value:"4,847",  label:"Requests Submitted",    icon:MessageSquare, color:"text-indigo-500" },
              { value:"12,390", label:"Community Votes Cast",  icon:ThumbsUp,      color:"text-violet-500" },
              { value:"47",     label:"Tools Built This Way",  icon:CheckCircle2,  color:"text-green-500" },
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

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-10">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="glass-card-premium p-8 sm:p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="type-h2 font-display text-foreground mb-2">Request Received!</h2>
                <p className="text-foreground-secondary leading-relaxed mb-2 max-w-sm">
                  We review all requests every week. If your tool gets enough votes, it moves straight onto our roadmap.
                </p>
                <p className="text-sm text-foreground-secondary mb-8 max-w-sm">
                  Share the <strong>Most Requested</strong> list with others who need this tool — more votes = faster build.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/roadmap" className="btn btn-primary gap-2">
                    View Roadmap <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name:"", problem:"", category:"PDF", email:"" }); }}
                    className="btn btn-secondary"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card-premium p-6 sm:p-8">
                <h2 className="type-h2 font-display text-foreground mb-1">Request a Tool</h2>
                <p className="type-small text-foreground-secondary mb-6">The more specific you are, the faster we can build it.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      Tool Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Excel Formula Generator"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-foreground-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      What problem are you trying to solve? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. I need to convert Excel tables to PDF without installing Excel. I want to paste the CSV and download a formatted PDF table..."
                      value={form.problem}
                      onChange={e => setForm(p => ({ ...p, problem: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-foreground-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
                      <select
                        value={form.category}
                        onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                      >
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Email <span className="text-foreground-secondary font-normal text-xs">(optional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-foreground-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{formError}</p>
                  )}

                  <p className="text-xs text-foreground-secondary">
                    We&apos;ll email you only when your requested tool goes live. No newsletters. No spam.
                  </p>

                  <button type="submit" className="btn btn-primary w-full gap-2 justify-center">
                    <Send className="w-4 h-4" />
                    Submit Request
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Popular Requests Sidebar */}
          <div className="lg:col-span-2">
            <div className="glass-card-premium p-5 sticky top-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <h2 className="text-base font-bold text-foreground">Most Requested</h2>
              </div>
              <p className="text-xs text-foreground-secondary mb-4">Upvote to move a tool up the build queue.</p>

              <div className="space-y-1.5">
                {POPULAR.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-surface/60 transition-colors group">
                    <span className="text-xs font-bold text-foreground-secondary/60 w-4 shrink-0 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate leading-tight">{r.tool}</p>
                      <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border mt-0.5 ${CAT_COLOR[r.category] ?? CAT_COLOR.Other}`}>
                        {r.category}
                      </span>
                    </div>
                    <button
                      onClick={() => castVote(r.id)}
                      title={voted.has(r.id) ? "You voted for this" : "Vote for this tool"}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        voted.has(r.id)
                          ? "bg-indigo-100 text-primary border border-indigo-200 cursor-default"
                          : "bg-surface text-foreground-secondary border border-border hover:bg-indigo-50 hover:text-primary hover:border-indigo-200"
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${voted.has(r.id) ? "fill-primary" : ""}`} />
                      {voteCounts[r.id] ?? r.votes}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-foreground-secondary text-center">
                  Don&apos;t see yours? <button onClick={() => document.querySelector("form")?.scrollIntoView({ behavior:"smooth" })} className="text-primary font-semibold hover:underline">Submit a new request ↑</button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Requests ──────────────────────────────────────────────────── */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-foreground-secondary" />
            <h2 className="type-h2 font-display text-foreground">Recently Requested</h2>
          </div>
          <p className="text-foreground-secondary mb-6">New ideas from the community this week.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {RECENT.map(r => (
              <div key={r.tool} className="glass-card-premium p-4">
                <p className="text-sm font-semibold text-foreground mb-2 leading-snug">{r.tool}</p>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${CAT_COLOR[r.category] ?? CAT_COLOR.Other}`}>
                    {r.category}
                  </span>
                  <span className="text-[10px] text-foreground-secondary shrink-0">{r.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Built From Requests ──────────────────────────────────────────────── */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="type-h2 font-display text-foreground">Tools We Built From Your Requests</h2>
          </div>
          <p className="text-foreground-secondary mb-6">
            When a tool crosses the vote threshold it goes onto the roadmap — and we build it. These tools exist because people asked.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {BUILT.map(b => (
              <Link key={b.href} href={b.href} className="glass-card-premium p-4 group flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-all">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{b.tool}</p>
                  <p className="text-xs text-foreground-secondary mt-1">{b.when} · {b.votes} votes</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <div className="mt-14 rounded-2xl bg-linear-to-br from-indigo-50 via-white to-violet-50 border border-indigo-100/80 p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="type-h3 font-display text-foreground mb-1">Track Your Request on the Roadmap</h3>
            <p className="text-foreground-secondary text-sm leading-relaxed max-w-md">
              See what&apos;s 80% done, what ships next week, and which community-requested tools are in the build queue.
            </p>
          </div>
          <Link href="/roadmap" className="btn btn-primary shrink-0 gap-2">
            View Roadmap <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer links */}
        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-sm text-foreground-secondary mb-3 font-medium">Explore more</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label:"All Tools",            href:"/all-tools" },
              { label:"PDF Tools",            href:"/pdf-tools" },
              { label:"Image Tools",          href:"/image-tools" },
              { label:"Developer Tools",      href:"/dev-tools" },
              { label:"Public Roadmap",       href:"/roadmap" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
