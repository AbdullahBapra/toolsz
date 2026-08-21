"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Lock,
  Zap,
  Search,
  ExternalLink,
  Clock,
  FileText,
  Map,
  Bot,
  Image as ImageIcon,
  Link2,
  ScanLine,
  Share2,
  Copy,
  Check,
  History,
  Cpu,
  UserCheck,
  MessageSquare,
  Star,
  TrendingUp,
  Info,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";

interface CheckItem {
  id: string;
  name: string;
  passed: boolean;
  warning?: boolean;
  detail: string;
  points: number;
  earned: number;
}

interface TrustResult {
  url: string;
  score: number;
  level: "high" | "good" | "caution" | "risk";
  responseTime: number;
  redirectCount: number;
  checks: CheckItem[];
  suspiciousFlags: string[];
  tech: string[];
  meta: {
    title?: string;
    description?: string;
    favicon?: string;
    ogTitle?: string;
    ogImage?: string;
    ogDesc?: string;
    twitterCard?: string;
    lang?: string;
    canonical?: string;
  };
  error?: string;
}

const CHECK_ICONS: Record<string, React.ElementType> = {
  https: Lock,
  ssl: ShieldCheck,
  suspicious: TriangleAlert,
  "http-redirect": RefreshCw,
  hsts: Shield,
  xframe: ScanLine,
  xcto: Bot,
  csp: Shield,
  refpol: Link2,
  permissions: UserCheck,
  speed: Clock,
  title: FileText,
  description: FileText,
  viewport: Globe,
  lang: MessageSquare,
  favicon: ImageIcon,
  og: ImageIcon,
  twitter: Star,
  canonical: Link2,
  schema: Cpu,
  privacy: Shield,
  contact: UserCheck,
  robots: Bot,
  sitemap: Map,
};

function ScoreRing({ score, level }: { score: number; level: string }) {
  const color =
    level === "high" ? "#22c55e" : level === "good" ? "#84cc16" : level === "caution" ? "#f59e0b" : "#ef4444";
  const grade =
    score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
  const label =
    level === "high" ? "Highly Trusted" : level === "good" ? "Likely Trustworthy" : level === "caution" ? "Use Caution" : "High Risk";

  const r = 54;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-extrabold text-foreground leading-none">{score}</span>
          <span className="text-xs text-foreground-secondary font-medium mt-0.5">/100</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-display font-bold" style={{ color }}>{grade}</span>
        <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ color, background: color + "18", border: `1px solid ${color}33` }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function CheckRow({ check }: { check: CheckItem }) {
  const Icon = CHECK_ICONS[check.id] ?? Shield;
  const status = check.passed ? "pass" : check.warning ? "warn" : "fail";

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        status === "pass" ? "bg-success/10 text-success" : status === "warn" ? "bg-warning/10 text-warning" : "bg-error/10 text-error"
      }`}>
        {status === "pass" ? <CheckCircle2 className="w-4 h-4" /> : status === "warn" ? <AlertTriangle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{check.name}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            status === "pass" ? "bg-success/10 text-success" : status === "warn" ? "bg-warning/10 text-warning" : "bg-error/10 text-error"
          }`}>
            {check.earned}/{check.points} pts
          </span>
        </div>
        <p className="text-xs text-foreground-secondary mt-0.5 wrap-break-word">{check.detail}</p>
      </div>
      <Icon className="w-4 h-4 text-foreground-muted shrink-0 mt-1" />
    </div>
  );
}

function SectionScore({ checks }: { checks: CheckItem[] }) {
  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const total = checks.reduce((s, c) => s + c.points, 0);
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
  const color = pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-error";
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-foreground-secondary shrink-0">{earned}/{total} pts</span>
    </div>
  );
}

const STORAGE_KEY = "trust_checker_history";

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}

function addToHistory(url: string) {
  try {
    const existing = getHistory().filter((u) => u !== url);
    const updated = [url, ...existing].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

export default function WebsiteTrustChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrustResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(getHistory());
    // Load from URL params on mount
    const params = new URLSearchParams(window.location.search);
    const u = params.get("url");
    if (u) { setUrl(u); }
  }, []);

  async function handleCheck(targetUrl?: string) {
    const trimmed = (targetUrl ?? url).trim();
    if (!trimmed) return;
    if (targetUrl) setUrl(targetUrl);
    setLoading(true);
    setResult(null);
    setError("");
    setShowHistory(false);

    try {
      const res = await fetch("/api/trust-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data: TrustResult = await res.json();
      setResult(data);
      addToHistory(trimmed.startsWith("http") ? trimmed : "https://" + trimmed);
      setHistory(getHistory());
      // Update URL in address bar for sharing
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("url", trimmed);
      window.history.replaceState(null, "", newUrl.toString());
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyShareLink() {
    const link = window.location.href;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const passCount = result?.checks.filter((c) => c.passed).length ?? 0;
  const warnCount = result?.checks.filter((c) => !c.passed && c.warning).length ?? 0;
  const failCount = result?.checks.filter((c) => !c.passed && !c.warning).length ?? 0;
  const totalCount = result?.checks.length ?? 0;

  const domainChecks = result?.checks.filter((c) => ["https", "ssl", "suspicious", "http-redirect"].includes(c.id)) ?? [];
  const headerChecks = result?.checks.filter((c) => ["hsts", "xframe", "xcto", "csp", "refpol", "permissions"].includes(c.id)) ?? [];
  const pageChecks = result?.checks.filter((c) => ["title", "description", "viewport", "lang", "favicon", "canonical", "schema"].includes(c.id)) ?? [];
  const socialChecks = result?.checks.filter((c) => ["og", "twitter", "contact", "privacy"].includes(c.id)) ?? [];
  const infraChecks = result?.checks.filter((c) => ["speed", "robots", "sitemap"].includes(c.id)) ?? [];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Website Trust Checker",
            url: "https://www.toolsz.co/website-trust-checker",
            description:
              "Check any website trust score. Analyzes 24 signals including SSL, security headers, domain safety, page quality, social tags, and more. Free, no signup.",
            applicationCategory: "SecurityApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Hero */}
      <div className="max-w-300 mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <Link
            href="/dev-tools"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Developer Tools
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="type-h1 font-display gradient-text mb-2">Website Trust Checker</h1>
              <p className="text-foreground-secondary text-lg leading-relaxed max-w-2xl">
                The only website trust checker you need. Runs 24 checks across security, headers, domain safety, SEO, social signals, and infrastructure — generates a 0-100 trust score with an A-F grade.
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl relative">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground-muted pointer-events-none" />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => history.length > 0 && setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              {showHistory && history.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-border">
                    <History className="w-3.5 h-3.5 text-foreground-muted" />
                    <span className="text-xs text-foreground-muted font-medium">Recent checks</span>
                  </div>
                  {history.map((h) => (
                    <button
                      key={h}
                      onMouseDown={() => handleCheck(h)}
                      className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors truncate flex items-center gap-2"
                    >
                      <Globe className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleCheck()}
              disabled={loading || !url.trim()}
              className="btn btn-primary gap-2 px-6 py-3 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking…</>
              ) : (
                <><Search className="w-4 h-4" /> Check Trust</>
              )}
            </button>
          </div>
          <p className="text-xs text-foreground-muted mt-2">
            Only the URL is sent to our server — no personal data collected.
          </p>
        </div>
      </div>

      <div className="max-w-300 mx-auto px-5 md:px-6 lg:px-8 py-8">

        {/* Loading */}
        {loading && (
          <div className="glass-card-premium p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div>
              <p className="font-semibold text-foreground">Running 24 checks…</p>
              <p className="text-sm text-foreground-secondary mt-1">
                Checking SSL, security headers, domain safety, SEO, social tags, robots.txt, sitemap, and more
              </p>
            </div>
          </div>
        )}

        {/* Network Error */}
        {error && !loading && (
          <div className="glass-panel rounded-2xl p-5 border border-error/20 bg-error/5 flex items-start gap-3">
            <ShieldX className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-error">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-5">

            {/* Suspicious URL Warning */}
            {result.suspiciousFlags && result.suspiciousFlags.length > 0 && (
              <div className="rounded-2xl p-4 border border-error/30 bg-error/5 flex items-start gap-3">
                <TriangleAlert className="w-5 h-5 text-error shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-error mb-1">Suspicious URL Detected</p>
                  {result.suspiciousFlags.map((flag, i) => (
                    <p key={i} className="text-xs text-error/80">{flag}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Score + Summary */}
            <div className="glass-card-premium p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <ScoreRing score={result.score} level={result.level} />

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-2 truncate max-w-xs sm:max-w-md"
                  >
                    {result.url.replace(/^https?:\/\//, "")}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>

                  {result.meta.title && (
                    <p className="text-base font-semibold text-foreground mb-1">{result.meta.title}</p>
                  )}
                  {result.meta.description && (
                    <p className="text-sm text-foreground-secondary mb-4 leading-relaxed line-clamp-2">
                      {result.meta.description}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm font-semibold text-foreground">{passCount} passed</span>
                    </div>
                    {warnCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <span className="text-sm font-semibold text-warning">{warnCount} warnings</span>
                      </div>
                    )}
                    {failCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-error" />
                        <span className="text-sm font-semibold text-error">{failCount} failed</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm text-foreground-secondary">{result.responseTime}ms</span>
                    </div>
                    {result.redirectCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4 text-foreground-muted" />
                        <span className="text-sm text-foreground-secondary">{result.redirectCount} redirect</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm text-foreground-secondary">{totalCount} checks</span>
                    </div>
                  </div>

                  {/* Tech stack badges */}
                  {result.tech && result.tech.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs text-foreground-muted font-medium">Tech detected:</span>
                      {result.tech.map((t) => (
                        <span key={t} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-hover border border-border text-foreground-secondary">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Share button */}
                  <button
                    onClick={copyShareLink}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    {copied ? "Link copied!" : "Copy shareable link"}
                  </button>

                  {result.error && (
                    <div className="mt-4 p-3 rounded-xl bg-error/5 border border-error/20">
                      <p className="text-sm font-medium text-error">{result.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Google SERP Preview */}
            {(result.meta.title || result.meta.description) && (
              <div className="glass-card-premium p-5">
                <h2 className="text-sm font-bold text-foreground-secondary mb-3 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  Google Search Preview
                </h2>
                <div className="bg-white border border-border rounded-xl p-4 max-w-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {result.meta.favicon && (
                      <img
                        src={result.meta.favicon.startsWith("http") ? result.meta.favicon : result.url.replace(/\/$/, "") + result.meta.favicon}
                        alt=""
                        className="w-4 h-4 rounded-sm"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <span className="text-xs text-foreground-muted truncate">{result.url.replace(/^https?:\/\//, "")}</span>
                  </div>
                  {result.meta.title && (
                    <p className="text-base font-medium text-blue-700 hover:underline cursor-pointer line-clamp-1 mb-1">
                      {result.meta.title}
                    </p>
                  )}
                  {result.meta.description && (
                    <p className="text-sm text-foreground-secondary line-clamp-2 leading-relaxed">
                      {result.meta.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* OG / Social Preview */}
            {(result.meta.ogTitle || result.meta.ogImage) && (
              <div className="glass-card-premium p-5">
                <h2 className="text-sm font-bold text-foreground-secondary mb-3 flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5" />
                  Social Media Preview (Open Graph)
                </h2>
                <div className="bg-white border border-border rounded-xl overflow-hidden max-w-lg">
                  {result.meta.ogImage && (
                    <img
                      src={result.meta.ogImage}
                      alt="OG image"
                      className="w-full h-40 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="p-3">
                    <p className="text-xs uppercase text-foreground-muted font-semibold mb-1 tracking-wide">
                      {result.url.replace(/^https?:\/\//, "").split("/")[0]}
                    </p>
                    {result.meta.ogTitle && (
                      <p className="text-sm font-bold text-foreground line-clamp-2 mb-1">{result.meta.ogTitle}</p>
                    )}
                    {result.meta.ogDesc && (
                      <p className="text-xs text-foreground-secondary line-clamp-2">{result.meta.ogDesc}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Checks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Domain Safety */}
              <div className="glass-card-premium p-5">
                <h2 className="type-h3 font-display font-semibold text-foreground flex items-center gap-2 mb-1">
                  <TriangleAlert className="w-4 h-4 text-primary" />
                  Domain Safety
                </h2>
                <SectionScore checks={domainChecks} />
                {domainChecks.map((c) => <CheckRow key={c.id} check={c} />)}
              </div>

              {/* Security Headers */}
              <div className="glass-card-premium p-5">
                <h2 className="type-h3 font-display font-semibold text-foreground flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Security Headers
                </h2>
                <SectionScore checks={headerChecks} />
                {headerChecks.map((c) => <CheckRow key={c.id} check={c} />)}
              </div>

              {/* Page Quality & SEO */}
              <div className="glass-card-premium p-5">
                <h2 className="type-h3 font-display font-semibold text-foreground flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-primary" />
                  Page Quality & SEO
                </h2>
                <SectionScore checks={pageChecks} />
                {pageChecks.map((c) => <CheckRow key={c.id} check={c} />)}
              </div>

              {/* Social & Trust Signals */}
              <div className="glass-card-premium p-5">
                <h2 className="type-h3 font-display font-semibold text-foreground flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-primary" />
                  Social & Trust Signals
                </h2>
                <SectionScore checks={socialChecks} />
                {socialChecks.map((c) => <CheckRow key={c.id} check={c} />)}
              </div>

              {/* Infrastructure */}
              <div className="glass-card-premium p-5 lg:col-span-2">
                <h2 className="type-h3 font-display font-semibold text-foreground flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-primary" />
                  Infrastructure & Crawlability
                </h2>
                <SectionScore checks={infraChecks} />
                <div className="grid sm:grid-cols-3 gap-0">
                  {infraChecks.map((c) => <CheckRow key={c.id} check={c} />)}
                </div>
              </div>
            </div>

            {/* Grade scale */}
            <div className="glass-panel rounded-2xl p-5 border border-primary-border bg-primary-muted">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">How to read this score</h3>
                  <p className="text-xs text-foreground-secondary leading-relaxed mb-2">
                    Each of the 24 checks is weighted by security importance. SSL and HTTPS carry the most weight. Grades: A+ (90-100), A (80-89), B (70-79), C (60-69), D (40-59), F (below 40).
                  </p>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    This tool checks publicly available technical signals. A high score means the site follows security and quality best practices. It does not verify the site content, business legitimacy, or ownership. Always use judgment when sharing personal information with any website.
                  </p>
                </div>
              </div>
            </div>

            {/* Check another */}
            <div className="text-center pt-2">
              <button
                onClick={() => { setResult(null); setUrl(""); inputRef.current?.focus(); window.history.replaceState(null, "", window.location.pathname); }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <RefreshCw className="w-4 h-4" />
                Check another website
              </button>
            </div>
          </div>
        )}

        {/* Info cards — shown before any check */}
        {!result && !loading && (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: Lock,
                  title: "SSL & Domain Safety",
                  desc: "Verifies HTTPS, SSL certificate validity, HTTP-to-HTTPS redirect, HSTS enforcement, and flags suspicious domain patterns like IP-based URLs or high-risk TLDs.",
                },
                {
                  icon: ShieldCheck,
                  title: "6 Security Headers",
                  desc: "Checks X-Frame-Options, X-Content-Type-Options, Content-Security-Policy, Referrer-Policy, HSTS, and Permissions-Policy — the same checks as securityheaders.com.",
                },
                {
                  icon: FileText,
                  title: "Page Quality & SEO",
                  desc: "Inspects title length, meta description, viewport tag, HTML language, favicon, canonical URL, and Schema.org structured data — everything that affects search ranking.",
                },
                {
                  icon: Star,
                  title: "Social & Trust Signals",
                  desc: "Checks Open Graph tags for Facebook/LinkedIn, Twitter Card meta for X, plus presence of a privacy policy link and contact page — key legitimacy signals.",
                },
                {
                  icon: Globe,
                  title: "Infrastructure",
                  desc: "Tests robots.txt and sitemap.xml accessibility, measures server response time, and detects your tech stack — Cloudflare, Vercel, WordPress, Next.js, and more.",
                },
                {
                  icon: ShieldAlert,
                  title: "A-F Grade + Score",
                  desc: "Generates a 0-100 trust score across 24 checks weighted by security importance, with an A+ to F letter grade and a shareable link to results.",
                },
              ].map((card) => (
                <div key={card.title} className="glass-card-premium p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-muted border border-primary-border flex items-center justify-center">
                    <card.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{card.title}</h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent history */}
            {history.length > 0 && (
              <div className="glass-card-premium p-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  Recent Checks
                </h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <button
                      key={h}
                      onClick={() => handleCheck(h)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-surface-hover hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      {h.replace(/^https?:\/\//, "")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
