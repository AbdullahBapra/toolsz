"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Globe, Search, Copy, Download, Check, Clock, Hash, User,
  AlertCircle, BookOpen, Code, AlignLeft, Layers, FileSearch, Tag,
  ExternalLink, Image as ImageIcon, ChevronDown, ChevronUp, Link2,
  Shield, CheckCircle2, XCircle, AlertTriangle, Zap, BarChart3, Eye,
  ListTree, History, Cpu, Lock, Wifi, WifiOff, RefreshCw, FileCode,
  Share2, GraduationCap, X, FileText,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PageMetadata {
  title:string; description:string; keywords:string; author:string; canonical:string;
  robots:string; viewport:string; charset:string; favicon:string; language:string; generator:string;
  og:Record<string,string>; twitter:Record<string,string>; other:Record<string,string>;
}
interface Schema      { type:string; raw:string }
interface LinkItem    { url:string; text:string; domain?:string; nofollow?:boolean }
interface ImageItem   { src:string; alt:string; hasAlt:boolean; loading?:string; width?:string; height?:string }
interface Heading     { level:number; text:string }
interface SeoCheck    { id:string; name:string; passed:boolean; detail:string; points:number; earned:number }
interface TechItem    { category:string; name:string; confidence:"high"|"medium" }
interface IndexIssue  { type:string; severity:"error"|"warning"|"info"; message:string }
interface LinkStatus  { url:string; status:number|null; ok:boolean; redirectTo?:string; error?:string }

interface ExtractResult {
  title:string; byline:string; excerpt:string; content:string; textContent:string; markdown:string;
  wordCount:number; sentenceCount:number; paragraphCount:number; uniqueWords:number;
  avgWordsPerSentence:number; readabilityScore:number; readingGrade:string; readingTime:number;
  siteName:string; url:string; extractionMode?:"article"|"full-page";
  headings:Heading[]; links:{ internal:LinkItem[]; external:LinkItem[] };
  images:ImageItem[]; metadata:PageMetadata; schemas:Schema[];
  seoScore:{ total:number; checks:SeoCheck[] };
  potentialKeywords:Array<{ word:string; count:number }>;
  techStack:TechItem[];
  indexability:{ indexable:boolean; issues:IndexIssue[] };
  responseTime:number; pageSize:number;
}
interface HistoryEntry { url:string; title:string; ts:number; wordCount:number }
type Tab = "preview"|"markdown"|"text"|"links"|"images"|"social"|"meta";
type InputMode = "url"|"html";

// ── Utilities ─────────────────────────────────────────────────────────────────
function fmt(n:number){ return n.toLocaleString() }
function kb(b:number){ return b>1024?`${(b/1024).toFixed(1)} KB`:`${b} B` }

function CopyButton({ text, label, mini }:{ text:string; label:string; mini?:boolean }) {
  const [copied, setCopied] = useState(false);
  async function go() { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  const cls = mini
    ? "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors"
    : "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors";
  return (
    <button onClick={go} className={cls}>
      {copied?<Check className="w-3 h-3 text-success"/>:<Copy className="w-3 h-3"/>}
      {copied?"Copied!":label}
    </button>
  );
}

function dl(content:string, filename:string, mime:string) {
  const a = Object.assign(document.createElement("a"),{ href:URL.createObjectURL(new Blob([content],{type:mime})), download:filename });
  a.click(); URL.revokeObjectURL(a.href);
}

function exportPdf(title:string, content:string) {
  const win = window.open("","_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;line-height:1.7;color:#111}h1{font-size:28px}h2{font-size:22px}h3{font-size:18px}p{margin-bottom:14px}blockquote{border-left:3px solid #e5e7eb;padding-left:16px;color:#6b7280;margin:16px 0}li{margin-bottom:6px}@media print{body{padding:20px}}</style></head><body><h1>${title}</h1>${content}</body></html>`);
  win.document.close();
  setTimeout(()=>{win.print();win.close();},400);
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatPill({ icon:Icon, label, value }:{ icon:React.ElementType; label:string; value:string|number }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-primary-muted border border-primary-border min-w-0">
      <Icon className="w-4 h-4 text-primary"/>
      <span className="text-lg font-extrabold font-display text-foreground leading-none">{value}</span>
      <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wide">{label}</span>
    </div>
  );
}

function ReadabilityMeter({ score }:{ score:number }) {
  const label = score>=70?"Easy":score>=50?"Standard":score>=30?"Difficult":"Very Difficult";
  const color = score>=70?"#22c55e":score>=50?"#84cc16":score>=30?"#f59e0b":"#ef4444";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{width:`${score}%`,background:color}}/>
      </div>
      <span className="text-xs font-bold whitespace-nowrap" style={{color}}>{label}</span>
      <span className="text-xs text-foreground-muted">{score}/100</span>
    </div>
  );
}

function TocPanel({ headings }:{ headings:Heading[] }) {
  const [open, setOpen] = useState(true);
  if (!headings.length) return null;
  return (
    <div className="mb-4 rounded-xl border border-border overflow-hidden">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-4 py-2.5 bg-primary-muted text-sm font-semibold text-foreground">
        <span className="flex items-center gap-2"><ListTree className="w-4 h-4 text-primary"/>Table of Contents</span>
        {open?<ChevronUp className="w-4 h-4 text-foreground-muted"/>:<ChevronDown className="w-4 h-4 text-foreground-muted"/>}
      </button>
      {open && (
        <div className="p-3 max-h-52 overflow-y-auto">
          {headings.map((h,i)=>(
            <div key={i} className="text-sm text-foreground-secondary py-0.5 hover:text-primary transition-colors truncate" style={{paddingLeft:`${(h.level-1)*16}px`}}>
              <span className="text-foreground-muted text-xs mr-2">H{h.level}</span>{h.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SeoScoreRing({ score }:{ score:number }) {
  const color = score>=80?"#22c55e":score>=60?"#84cc16":score>=40?"#f59e0b":"#ef4444";
  const label = score>=80?"Excellent":score>=60?"Good":score>=40?"Needs Work":"Poor";
  const r=40, circ=2*Math.PI*r;
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 shrink-0">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8"/>
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${(score/100)*circ} ${circ}`} style={{transition:"stroke-dasharray .8s ease"}}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold font-display text-foreground leading-none">{score}</span>
          <span className="text-[10px] text-foreground-muted">/100</span>
        </div>
      </div>
      <div><p className="text-base font-bold" style={{color}}>{label} SEO</p><p className="text-xs text-foreground-secondary mt-0.5">Based on 10 on-page signals</p></div>
    </div>
  );
}

function SeoCheckRow({ check }:{ check:SeoCheck }) {
  const Icon = check.passed?CheckCircle2:check.earned>0?AlertTriangle:XCircle;
  const color = check.passed?"text-success":check.earned>0?"text-warning":"text-error";
  const bg    = check.passed?"bg-success/10":check.earned>0?"bg-warning/10":"bg-error/10";
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}><Icon className={`w-3.5 h-3.5 ${color}`}/></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-foreground">{check.name}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${bg} ${color}`}>{check.earned}/{check.points}</span>
        </div>
        <p className="text-[11px] text-foreground-secondary mt-0.5 wrap-break-word">{check.detail}</p>
      </div>
    </div>
  );
}

function MetaRow({ label, value }:{ label:string; value:string }) {
  if (!value) return null;
  const isUrl = value.startsWith("http");
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2 pr-4 text-xs font-semibold text-foreground-secondary w-36 align-top shrink-0 whitespace-nowrap">{label}</td>
      <td className="py-2 text-xs text-foreground leading-relaxed wrap-break-word">
        {isUrl?<a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 wrap-break-word">{value.length>80?value.slice(0,80)+"…":value}<ExternalLink className="w-3 h-3 shrink-0"/></a>:value}
      </td>
    </tr>
  );
}

function SchemaBlock({ schema }:{ schema:Schema }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-4 py-3 bg-primary-muted hover:bg-primary/10 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">{schema.type}</span>
          <span className="text-xs text-foreground-secondary">JSON-LD</span>
        </div>
        <div className="flex items-center gap-2" onClick={e=>e.stopPropagation()}>
          <CopyButton text={schema.raw} label="Copy" mini/>
          {open?<ChevronUp className="w-4 h-4 text-foreground-muted"/>:<ChevronDown className="w-4 h-4 text-foreground-muted"/>}
        </div>
      </button>
      {open&&<pre className="p-4 text-xs font-mono text-foreground-secondary bg-white overflow-x-auto leading-relaxed max-h-72 overflow-y-auto">{schema.raw}</pre>}
    </div>
  );
}

function WordFreqBar({ keywords }:{ keywords:Array<{word:string;count:number}> }) {
  if (!keywords.length) return null;
  const max = keywords[0]?.count || 1;
  const top = keywords.slice(0,15);
  return (
    <div className="space-y-2">
      {top.map((k,i)=>(
        <div key={i} className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-foreground-secondary w-28 shrink-0 truncate">{k.word}</span>
          <div className="flex-1 h-4 bg-border rounded overflow-hidden">
            <div className="h-full rounded transition-all duration-500" style={{width:`${(k.count/max)*100}%`,background:`hsl(${220+i*5},70%,${55-i*2}%)`}}/>
          </div>
          <span className="text-[10px] font-bold text-foreground-muted w-5 text-right shrink-0">{k.count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Social preview cards ──────────────────────────────────────────────────────
function GoogleCard({ title, description, url }:{ title:string; description:string; url:string }) {
  const hostname = (() => { try { const u=new URL(url); return `${u.hostname}${u.pathname!=="/"?u.pathname:""}`; } catch { return url; } })();
  return (
    <div className="rounded-xl border border-border bg-white p-4 max-w-xl font-sans">
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-4 h-4 rounded-full bg-border flex items-center justify-center overflow-hidden">
          <Globe className="w-2.5 h-2.5 text-foreground-muted"/>
        </div>
        <span className="text-xs text-foreground-secondary truncate">{hostname}</span>
      </div>
      <p className="text-[20px] text-[#1a0dab] leading-snug hover:underline cursor-pointer truncate">{title||"(No title)"}</p>
      <p className="text-sm text-[#4d5156] leading-relaxed line-clamp-2 mt-0.5">{description||"No description available."}</p>
    </div>
  );
}

function TwitterCard({ og, twitter, url }:{ og:Record<string,string>; twitter:Record<string,string>; url:string }) {
  const image = twitter["image"]||og["image"];
  const title = twitter["title"]||og["title"]||"";
  const desc  = twitter["description"]||og["description"]||"";
  const hostname = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  const cardType = twitter["card"]||"summary";
  const isLarge = cardType==="summary_large_image";

  return (
    <div className="rounded-2xl border border-[#cfd9de] bg-white overflow-hidden max-w-sm font-sans">
      {image && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={image} alt="" className={`w-full object-cover ${isLarge?"h-52":"h-28"}`} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
      )}
      <div className="p-3 flex gap-3">
        {!isLarge && image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
        )}
        <div className="min-w-0">
          <p className="text-[12px] text-[#536471]">{hostname}</p>
          <p className="text-sm font-semibold text-[#0f1419] leading-snug truncate">{title||"(No title)"}</p>
          <p className="text-[12px] text-[#536471] line-clamp-2">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function FacebookCard({ og, url }:{ og:Record<string,string>; url:string }) {
  const image = og["image"];
  const title = og["title"]||"";
  const desc  = og["description"]||"";
  const hostname = (() => { try { return new URL(url).hostname.toUpperCase(); } catch { return url.toUpperCase(); } })();
  return (
    <div className="rounded-none border border-[#dddfe2] bg-[#f2f3f5] overflow-hidden max-w-sm font-sans">
      {image
        ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={image} alt="" className="w-full h-48 object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
        : <div className="w-full h-32 bg-[#bec3c9] flex items-center justify-center"><ImageIcon className="w-8 h-8 text-white"/></div>}
      <div className="px-3 py-2.5 bg-[#f2f3f5] border-t border-[#dddfe2]">
        <p className="text-[11px] text-[#606770] uppercase tracking-wide">{hostname}</p>
        <p className="text-[14px] font-semibold text-[#1c1e21] leading-snug line-clamp-2 mt-0.5">{title||"(No title)"}</p>
        <p className="text-[12px] text-[#606770] line-clamp-1">{desc}</p>
      </div>
    </div>
  );
}

function LinkedInCard({ og, url }:{ og:Record<string,string>; url:string }) {
  const image = og["image"];
  const title = og["title"]||"";
  const hostname = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  return (
    <div className="rounded-sm border border-[#e0e0e0] bg-white overflow-hidden max-w-sm font-sans shadow-sm">
      {image
        ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={image} alt="" className="w-full h-40 object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
        : <div className="w-full h-24 bg-[#e9e9e9] flex items-center justify-center"><ImageIcon className="w-8 h-8 text-[#a0aec0]"/></div>}
      <div className="p-3">
        <p className="text-[14px] font-semibold text-[#000000e6] leading-snug line-clamp-2">{title||"(No title)"}</p>
        <p className="text-[12px] text-[#00000099] mt-1">{hostname}</p>
      </div>
    </div>
  );
}

// ── Tech stack badge ──────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string,string> = {
  CMS:"bg-purple-50 text-purple-700 border-purple-200",
  "Site Builder":"bg-pink-50 text-pink-700 border-pink-200",
  Ecommerce:"bg-green-50 text-green-700 border-green-200",
  Framework:"bg-blue-50 text-blue-700 border-blue-200",
  CSS:"bg-cyan-50 text-cyan-700 border-cyan-200",
  Analytics:"bg-orange-50 text-orange-700 border-orange-200",
  Chat:"bg-violet-50 text-violet-700 border-violet-200",
  Payments:"bg-emerald-50 text-emerald-700 border-emerald-200",
  Maps:"bg-teal-50 text-teal-700 border-teal-200",
  CDN:"bg-yellow-50 text-yellow-700 border-yellow-200",
  Hosting:"bg-sky-50 text-sky-700 border-sky-200",
  Server:"bg-slate-50 text-slate-700 border-slate-200",
  "SEO Plugin":"bg-rose-50 text-rose-700 border-rose-200",
};

function TechBadge({ item }:{ item:TechItem }) {
  const cls = CATEGORY_COLORS[item.category]??"bg-border text-foreground-secondary border-border";
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${cls}`}>
      <span>{item.name}</span>
      <span className="text-[9px] opacity-60 font-normal uppercase">{item.category}</span>
    </div>
  );
}

// ── Find in preview ───────────────────────────────────────────────────────────
function highlightInHtml(html:string, term:string): { html:string; count:number } {
  if (!term||term.length<2) return { html, count:0 };
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  let count = 0;
  const result = html.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, text) => {
    if (tag) return tag;
    if (text) {
      const r = new RegExp(escaped,"gi");
      return text.replace(r,(m:string)=>{ count++; return `<mark style="background:#fef08a;border-radius:2px;padding:0 1px">${m}</mark>`; });
    }
    return match;
  });
  return { html:result, count };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WebsiteContentExtractor() {
  const [inputMode,   setInputMode]   = useState<InputMode>("url");
  const [url,         setUrl]         = useState("");
  const [htmlPaste,   setHtmlPaste]   = useState("");
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState<ExtractResult|null>(null);
  const [error,       setError]       = useState("");
  const [activeTab,   setActiveTab]   = useState<Tab>("preview");
  const [history,     setHistory]     = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [linkFilter,  setLinkFilter]  = useState<"all"|"internal"|"external">("all");
  const [imgSearch,   setImgSearch]   = useState("");
  const [findText,    setFindText]    = useState("");
  const [linkStatuses,setLinkStatuses]= useState<Record<string,LinkStatus>>({});
  const [checkingLinks, setCheckingLinks] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("ce-history")??"[]")); } catch {/**/}
    function handler(e:MouseEvent) {
      if (historyRef.current&&!historyRef.current.contains(e.target as Node)) setShowHistory(false);
    }
    document.addEventListener("mousedown",handler);
    return ()=>document.removeEventListener("mousedown",handler);
  },[]);

  function saveHistory(r:ExtractResult) {
    const entry: HistoryEntry = { url:r.url, title:r.title.slice(0,60), ts:Date.now(), wordCount:r.wordCount };
    const next = [entry,...history.filter(h=>h.url!==r.url)].slice(0,8);
    setHistory(next);
    try { localStorage.setItem("ce-history",JSON.stringify(next)); } catch {/**/}
  }

  async function handleExtract(inputUrl?:string) {
    const trimmedUrl = (inputUrl??url).trim();
    if (inputMode==="url"&&!trimmedUrl) return;
    if (inputMode==="html"&&!htmlPaste.trim()) return;
    if (inputUrl) setUrl(inputUrl);
    setLoading(true); setResult(null); setError(""); setShowHistory(false); setLinkStatuses({});

    try {
      const payload = inputMode==="html"
        ? { mode:"html", html:htmlPaste, url:trimmedUrl||"about:blank" }
        : { mode:"url",  url:trimmedUrl };

      const res = await fetch("/api/content-extractor",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok||data.error) setError(data.error??"Failed.");
      else { setResult(data); setActiveTab("preview"); saveHistory(data); }
    } catch { setError("Network error — please try again."); }
    finally { setLoading(false); }
  }

  async function checkAllLinks() {
    if (!result) return;
    setCheckingLinks(true);
    const allUrls = [...result.links.internal,...result.links.external].map(l=>l.url);
    try {
      const res = await fetch("/api/link-checker",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ urls:allUrls }),
      });
      const data = await res.json();
      const map: Record<string,LinkStatus> = {};
      for (const r of (data.results??[])) map[r.url] = r;
      setLinkStatuses(map);
    } catch {/**/}
    finally { setCheckingLinks(false); }
  }

  const slug = result ? result.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"page" : "page";
  const allLinks  = result ? [...result.links.internal,...result.links.external] : [];
  const filteredLinks  = result ? (linkFilter==="internal"?result.links.internal:linkFilter==="external"?result.links.external:allLinks) : [];
  const filteredImages = result ? (imgSearch?result.images.filter(i=>i.src.toLowerCase().includes(imgSearch.toLowerCase())||i.alt.toLowerCase().includes(imgSearch.toLowerCase())):result.images) : [];
  const missingAlts = result ? result.images.filter(i=>!i.hasAlt).length : 0;

  const { html:highlightedContent, count:findCount } = result&&findText ? highlightInHtml(result.content,findText) : { html:result?.content??"", count:0 };

  const TABS = result ? [
    { id:"preview" as Tab,  label:"Preview",                   icon:Eye },
    { id:"markdown" as Tab, label:"Markdown",                  icon:Code },
    { id:"text" as Tab,     label:"Plain Text",                icon:AlignLeft },
    { id:"links" as Tab,    label:`Links (${result.links.internal.length+result.links.external.length})`, icon:Link2 },
    { id:"images" as Tab,   label:`Images (${result.images.length})`, icon:ImageIcon },
    { id:"social" as Tab,   label:"Social Preview",            icon:Share2 },
    { id:"meta" as Tab,     label:`Meta & SEO`,                icon:Tag },
  ] : [];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"WebApplication",name:"Website Content Extractor",url:"https://www.toolsz.co/website-content-extractor",description:"Extract content, links, images, schemas, SEO score & tech stack from any URL.",applicationCategory:"UtilitiesApplication",operatingSystem:"Any",offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}})}}/>

      {/* Hero */}
      <div className="max-w-300 mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <Link href="/dev-tools" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4"/>Developer Tools
          </Link>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-primary"/>
            </div>
            <div>
              <h1 className="type-h1 font-display gradient-text mb-2">Website Content Extractor</h1>
              <p className="text-foreground-secondary text-lg leading-relaxed max-w-2xl">Extract content, links, images, schemas, SEO score, tech stack & social previews from any URL — or paste raw HTML. No other tool needed.</p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-3">
            {(["url","html"] as InputMode[]).map(m=>(
              <button key={m} onClick={()=>setInputMode(m)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${inputMode===m?"bg-primary text-white border-primary":"border-border text-foreground-secondary hover:border-primary/40 hover:text-primary"}`}>
                {m==="url"?<span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5"/>URL</span>:<span className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5"/>Paste HTML</span>}
              </button>
            ))}
          </div>

          {/* URL input */}
          {inputMode==="url" && (
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1" ref={historyRef}>
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground-muted z-10"/>
                <input type="url" value={url} onChange={e=>setUrl(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleExtract()}
                  onFocus={()=>history.length>0&&setShowHistory(true)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"/>
                {history.length>0&&(
                  <button onClick={()=>setShowHistory(o=>!o)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary transition-colors">
                    <History className="w-4 h-4"/>
                  </button>
                )}
                {showHistory&&history.length>0&&(
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground-secondary">Recent</span>
                      <button onClick={()=>{setHistory([]);localStorage.removeItem("ce-history");setShowHistory(false);}} className="text-[11px] text-error hover:underline">Clear</button>
                    </div>
                    {history.map((h,i)=>(
                      <button key={i} onClick={()=>handleExtract(h.url)} className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-primary-muted transition-colors text-left border-b border-border last:border-0">
                        <Globe className="w-3.5 h-3.5 text-foreground-muted shrink-0 mt-0.5"/>
                        <div className="min-w-0"><p className="text-xs font-semibold text-foreground truncate">{h.title||h.url}</p><p className="text-[10px] text-foreground-muted truncate">{h.url}</p></div>
                        <span className="text-[10px] text-foreground-muted shrink-0 ml-auto">{fmt(h.wordCount)}w</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={()=>handleExtract()} disabled={loading||!url.trim()}
                className="btn btn-primary gap-2 px-6 py-3 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Extracting…</>:<><Search className="w-4 h-4"/>Extract</>}
              </button>
            </div>
          )}

          {/* HTML paste input */}
          {inputMode==="html" && (
            <div className="flex flex-col gap-3 max-w-2xl">
              <textarea value={htmlPaste} onChange={e=>setHtmlPaste(e.target.value)}
                placeholder="Paste raw HTML here…"
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-xs font-mono text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-y"/>
              <div className="flex gap-3 items-center">
                <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Optional: source URL (for relative link resolution)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"/>
                <button onClick={()=>handleExtract()} disabled={loading||!htmlPaste.trim()}
                  className="btn btn-primary gap-2 px-6 py-3 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Analyzing…</>:<><FileSearch className="w-4 h-4"/>Analyze</>}
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-foreground-muted mt-2">Works on articles, homepages, and SSR web apps. Login-gated pages and pure client-side SPAs are not supported.</p>
        </div>
      </div>

      <div className="max-w-300 mx-auto px-5 md:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading&&(
          <div className="glass-card-premium p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin"/>
            <div><p className="font-semibold text-foreground">Extracting…</p><p className="text-sm text-foreground-secondary mt-1">Fetching · extracting content · scanning links, images, schemas, SEO & tech stack</p></div>
          </div>
        )}

        {/* Error */}
        {error&&!loading&&(
          <div className="glass-panel rounded-2xl p-5 border border-error/20 bg-error/5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5"/>
            <div><p className="text-sm font-semibold text-error mb-1">Could not extract</p><p className="text-sm text-error/80">{error}</p></div>
          </div>
        )}

        {/* Results */}
        {result&&!loading&&(
          <div className="space-y-5">
            {/* Stats bar */}
            <div className="glass-card-premium p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                {result.metadata.favicon&&(
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={result.metadata.favicon} alt="" className="w-5 h-5 rounded" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
                )}
                <h2 className="type-h2 font-display font-bold text-foreground wrap-break-word">{result.title}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-foreground-secondary">
                {result.byline&&<span className="flex items-center gap-1"><User className="w-3.5 h-3.5"/>{result.byline}</span>}
                {result.siteName&&<span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5"/>{result.siteName}</span>}
                {result.responseTime>0&&<span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{result.responseTime}ms</span>}
                <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5"/>{kb(result.pageSize)}</span>
                {result.metadata.language&&<span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5"/>lang: {result.metadata.language}</span>}
                {result.metadata.generator&&<span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5"/>{result.metadata.generator.slice(0,30)}</span>}
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${result.extractionMode==="article"?"bg-success/10 text-success border-success/20":"bg-primary-muted text-primary border-primary-border"}`}>
                  {result.extractionMode==="article"?<><FileSearch className="w-3.5 h-3.5"/>Article</>:<><Layers className="w-3.5 h-3.5"/>Full-page</>}
                </span>
                {/* Indexability badge */}
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${result.indexability.indexable?"bg-success/10 text-success border-success/20":"bg-error/10 text-error border-error/20"}`}>
                  {result.indexability.indexable?<><Lock className="w-3.5 h-3.5"/>Indexable</>:<><Lock className="w-3.5 h-3.5"/>Not Indexable</>}
                </span>
              </div>

              {result.excerpt&&<p className="text-sm text-foreground-secondary leading-relaxed border-l-2 border-primary/30 pl-3 italic mb-5">{result.excerpt}</p>}

              {/* Stat pills */}
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                <StatPill icon={Hash}         label="Words"         value={fmt(result.wordCount)}/>
                <StatPill icon={AlignLeft}    label="Sentences"     value={fmt(result.sentenceCount)}/>
                <StatPill icon={FileText}     label="Paragraphs"    value={fmt(result.paragraphCount)}/>
                <StatPill icon={Clock}        label="Read time"     value={`${result.readingTime}m`}/>
                <StatPill icon={Zap}          label="Unique words"  value={fmt(result.uniqueWords)}/>
                <StatPill icon={BarChart3}    label="Words/sentence"value={result.avgWordsPerSentence}/>
                <StatPill icon={GraduationCap}label="Grade level"   value={result.readingGrade.split(" ").slice(-1)[0]}/>
              </div>

              {/* Readability meter */}
              <div className="mt-4 p-3 rounded-xl bg-primary-muted border border-primary-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">Readability (Flesch)</p>
                  <span className="text-xs text-foreground-muted">{result.readingGrade}</span>
                </div>
                <ReadabilityMeter score={result.readabilityScore}/>
              </div>

              {/* Tech stack quick view */}
              {result.techStack.length>0&&(
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.techStack.slice(0,8).map((t,i)=><TechBadge key={i} item={t}/>)}
                  {result.techStack.length>8&&<span className="text-xs text-foreground-muted self-center">+{result.techStack.length-8} more</span>}
                </div>
              )}
            </div>

            {/* Tab panel */}
            <div className="glass-card-premium overflow-hidden">
              {/* Scrollable tab bar */}
              <div className="border-b border-border px-4 py-2 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {TABS.map(tab=>(
                    <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab===tab.id?"bg-primary text-white":"text-foreground-secondary hover:text-foreground hover:bg-primary-muted"}`}>
                      <tab.icon className="w-3.5 h-3.5"/>{tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Per-tab toolbar */}
              {activeTab==="preview"&&(
                <div className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-muted"/>
                    <input value={findText} onChange={e=>setFindText(e.target.value)} placeholder="Find in page…"
                      className="pl-8 pr-8 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary w-44"/>
                    {findText&&(
                      <button onClick={()=>setFindText("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground">
                        <X className="w-3 h-3"/>
                      </button>
                    )}
                  </div>
                  {findText&&<span className="text-xs text-foreground-muted">{findCount} result{findCount!==1?"s":""}</span>}
                  <div className="ml-auto flex gap-2">
                    <CopyButton text={result.textContent} label="Copy Text"/>
                    <button onClick={()=>exportPdf(result.title, result.content)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors">
                      <Download className="w-3.5 h-3.5"/>PDF
                    </button>
                    <button onClick={()=>dl(JSON.stringify(result,null,2),`${slug}.json`,"application/json")} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors">
                      <Download className="w-3.5 h-3.5"/>JSON
                    </button>
                  </div>
                </div>
              )}
              {activeTab==="markdown"&&(
                <div className="flex gap-2 px-4 pt-3 pb-1 border-b border-border">
                  <CopyButton text={result.markdown} label="Copy Markdown"/>
                  <button onClick={()=>dl(result.markdown,`${slug}.md`,"text/markdown")} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors"><Download className="w-3.5 h-3.5"/>Download .md</button>
                </div>
              )}
              {activeTab==="text"&&(
                <div className="flex gap-2 px-4 pt-3 pb-1 border-b border-border">
                  <CopyButton text={result.textContent} label="Copy Text"/>
                  <button onClick={()=>dl(result.textContent,`${slug}.txt`,"text/plain")} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors"><Download className="w-3.5 h-3.5"/>Download .txt</button>
                </div>
              )}

              {/* Tab content */}
              <div className={activeTab==="meta"||activeTab==="social"?"":"p-5 sm:p-6 max-h-160 overflow-y-auto"}>

                {/* Preview */}
                {activeTab==="preview"&&(
                  <>
                    <TocPanel headings={result.headings}/>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{__html:highlightedContent||result.content}}/>
                  </>
                )}

                {/* Markdown */}
                {activeTab==="markdown"&&(
                  <pre className="text-xs font-mono text-foreground-secondary whitespace-pre-wrap wrap-break-word leading-relaxed">{result.markdown}</pre>
                )}

                {/* Plain text */}
                {activeTab==="text"&&(
                  <pre className="text-sm font-sans text-foreground-secondary whitespace-pre-wrap wrap-break-word leading-relaxed">{result.textContent}</pre>
                )}

                {/* Links */}
                {activeTab==="links"&&(
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {(["all","internal","external"] as const).map(f=>(
                          <button key={f} onClick={()=>setLinkFilter(f)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${linkFilter===f?"bg-primary text-white border-primary":"border-border text-foreground-secondary hover:border-primary/40 hover:text-primary"}`}>
                            {f==="all"?`All (${allLinks.length})`:f==="internal"?`Internal (${result.links.internal.length})`:`External (${result.links.external.length})`}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={checkAllLinks} disabled={checkingLinks}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors disabled:opacity-50">
                          {checkingLinks?<><RefreshCw className="w-3.5 h-3.5 animate-spin"/>Checking…</>:<><Wifi className="w-3.5 h-3.5"/>Check Status</>}
                        </button>
                        <CopyButton text={filteredLinks.map(l=>l.url).join("\n")} label="Copy URLs"/>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-130 overflow-y-auto">
                      {filteredLinks.length===0&&<p className="text-sm text-foreground-muted">No links found.</p>}
                      {filteredLinks.map((l,i)=>{
                        const isExt = result.links.external.includes(l);
                        const status = linkStatuses[l.url];
                        return (
                          <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border hover:border-primary/30 hover:bg-primary-muted transition-colors">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${isExt?"bg-amber-50 border border-amber-200":"bg-primary-muted border border-primary-border"}`}>
                              {isExt?<ExternalLink className="w-3 h-3 text-amber-600"/>:<Link2 className="w-3 h-3 text-primary"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{l.text||"(no text)"}</p>
                              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-foreground-muted hover:text-primary transition-colors truncate block">{l.url}</a>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {l.nofollow&&<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-border text-foreground-muted">nofollow</span>}
                              {isExt&&l.domain&&<span className="text-[10px] text-foreground-muted hidden sm:block">{l.domain}</span>}
                              {status&&(
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${status.ok?"bg-success/10 text-success border-success/20":status.status===null?"bg-border text-foreground-muted border-border":"bg-error/10 text-error border-error/20"}`}>
                                  {status.status??<WifiOff className="w-3 h-3"/>}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {Object.keys(linkStatuses).length>0&&(
                      <div className="mt-3 flex gap-4 text-xs text-foreground-secondary">
                        <span className="text-success font-semibold">{Object.values(linkStatuses).filter(s=>s.ok).length} OK</span>
                        <span className="text-error font-semibold">{Object.values(linkStatuses).filter(s=>!s.ok&&s.status!==null).length} Broken</span>
                        <span className="text-foreground-muted">{Object.values(linkStatuses).filter(s=>s.status===null).length} Error</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Images */}
                {activeTab==="images"&&(
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{result.images.length} images</span>
                        {missingAlts>0&&<span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-warning/10 text-warning border border-warning/20"><AlertTriangle className="w-3 h-3"/>{missingAlts} missing alt</span>}
                        {missingAlts===0&&result.images.length>0&&<span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-success/10 text-success border border-success/20"><CheckCircle2 className="w-3 h-3"/>All have alt</span>}
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-muted"/>
                        <input value={imgSearch} onChange={e=>setImgSearch(e.target.value)} placeholder="Search…"
                          className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"/>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-130 overflow-y-auto">
                      {filteredImages.length===0&&<p className="text-sm text-foreground-muted">No images found.</p>}
                      {filteredImages.map((img,i)=>(
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border hover:border-primary/30 transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-primary-muted border border-primary-border overflow-hidden shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" onError={e=>{const t=e.target as HTMLImageElement;t.style.display="none";t.parentElement!.innerHTML='<svg class="w-5 h-5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';}}/>
                          </div>
                          <div className="flex-1 min-w-0">
                            {img.hasAlt
                              ?<p className="text-xs font-medium text-foreground wrap-break-word">{img.alt||<span className="italic text-foreground-muted">empty alt (decorative)</span>}</p>
                              :<p className="text-xs font-medium text-warning flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Missing alt attribute</p>}
                            <p className="text-[10px] text-foreground-muted mt-0.5 truncate">{img.src}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {img.width&&img.height&&<span className="text-[10px] text-foreground-muted">{img.width}×{img.height}</span>}
                              {img.loading&&<span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-muted text-primary border border-primary-border">{img.loading}</span>}
                            </div>
                          </div>
                          <a href={img.src} target="_blank" rel="noopener noreferrer" className="shrink-0 text-foreground-muted hover:text-primary transition-colors">
                            <ExternalLink className="w-3.5 h-3.5"/>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Preview */}
                {activeTab==="social"&&(
                  <div className="p-5 sm:p-6 space-y-8 max-h-175 overflow-y-auto">
                    <div>
                      <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3 flex items-center gap-2"><Search className="w-3.5 h-3.5"/>Google Search Result</p>
                      <GoogleCard title={result.metadata.og["title"]||result.title} description={result.metadata.description||result.metadata.og["description"]||result.excerpt} url={result.url}/>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3 flex items-center gap-2"><Share2 className="w-3.5 h-3.5"/>Twitter / X Card</p>
                      {result.metadata.twitter["card"]||result.metadata.og["image"]
                        ? <TwitterCard og={result.metadata.og} twitter={result.metadata.twitter} url={result.url}/>
                        : <div className="text-sm text-foreground-secondary p-4 rounded-xl border border-border bg-primary-muted">No Twitter Card or OG image found — add <code className="text-xs bg-border px-1 rounded">twitter:card</code> and <code className="text-xs bg-border px-1 rounded">og:image</code> meta tags to enable rich previews.</div>}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3 flex items-center gap-2"><Share2 className="w-3.5 h-3.5"/>Facebook / Open Graph</p>
                      {result.metadata.og["title"]||result.metadata.og["image"]
                        ? <FacebookCard og={result.metadata.og} url={result.url}/>
                        : <div className="text-sm text-foreground-secondary p-4 rounded-xl border border-border bg-primary-muted">No Open Graph tags found — add <code className="text-xs bg-border px-1 rounded">og:title</code>, <code className="text-xs bg-border px-1 rounded">og:description</code> and <code className="text-xs bg-border px-1 rounded">og:image</code> tags to enable rich link previews.</div>}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3 flex items-center gap-2"><Share2 className="w-3.5 h-3.5"/>LinkedIn</p>
                      {result.metadata.og["title"]||result.metadata.og["image"]
                        ? <LinkedInCard og={result.metadata.og} url={result.url}/>
                        : <div className="text-sm text-foreground-secondary p-4 rounded-xl border border-border bg-primary-muted">No OG tags found — LinkedIn uses Open Graph data for link previews.</div>}
                    </div>
                  </div>
                )}

                {/* Meta & SEO */}
                {activeTab==="meta"&&(
                  <div className="p-5 sm:p-6 space-y-6 max-h-175 overflow-y-auto">

                    {/* SEO Score */}
                    <div>
                      <h3 className="type-h4 font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary"/>SEO Score</h3>
                      <div className="rounded-xl border border-border p-4 mb-4"><SeoScoreRing score={result.seoScore.total}/></div>
                      <div className="rounded-xl border border-border overflow-hidden">{result.seoScore.checks.map(c=><SeoCheckRow key={c.id} check={c}/>)}</div>
                    </div>

                    {/* Indexability */}
                    {result.indexability.issues.length>0&&(
                      <div>
                        <h3 className="type-h4 font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-primary"/>Indexability
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${result.indexability.indexable?"bg-success/10 text-success border-success/20":"bg-error/10 text-error border-error/20"}`}>
                            {result.indexability.indexable?"Indexable":"Not Indexable"}
                          </span>
                        </h3>
                        <div className="rounded-xl border border-border overflow-hidden">
                          {result.indexability.issues.map((issue,i)=>{
                            const Icon = issue.severity==="error"?XCircle:issue.severity==="warning"?AlertTriangle:CheckCircle2;
                            const color = issue.severity==="error"?"text-error":issue.severity==="warning"?"text-warning":"text-foreground-muted";
                            const bg    = issue.severity==="error"?"bg-error/10":issue.severity==="warning"?"bg-warning/10":"bg-border";
                            return (
                              <div key={i} className="flex items-start gap-3 p-3 border-b border-border last:border-0">
                                <div className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}><Icon className={`w-3.5 h-3.5 ${color}`}/></div>
                                <p className="text-xs text-foreground-secondary leading-relaxed">{issue.message}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tech Stack */}
                    {result.techStack.length>0&&(
                      <div>
                        <h3 className="type-h4 font-semibold text-foreground mb-3 flex items-center gap-2"><Cpu className="w-4 h-4 text-primary"/>Tech Stack<span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{result.techStack.length}</span></h3>
                        {Object.entries(
                          result.techStack.reduce((acc,t)=>{ (acc[t.category]??=[]).push(t); return acc; },{} as Record<string,TechItem[]>)
                        ).map(([cat,items])=>(
                          <div key={cat} className="mb-3">
                            <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wide mb-2">{cat}</p>
                            <div className="flex flex-wrap gap-2">{items.map((t,i)=><TechBadge key={i} item={t}/>)}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Keywords */}
                    <div>
                      <h3 className="type-h4 font-semibold text-foreground mb-2 flex items-center gap-2"><Hash className="w-4 h-4 text-primary"/>Keywords</h3>
                      {result.metadata.keywords?(
                        <div className="mb-3">
                          <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wide mb-2">Meta Keywords Tag</p>
                          <div className="flex flex-wrap gap-1.5">{result.metadata.keywords.split(",").map(k=>k.trim()).filter(Boolean).map((k,i)=><span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{k}</span>)}</div>
                        </div>
                      ):<p className="text-xs text-foreground-muted mb-3 italic">No meta keywords tag (Google ignores it — most modern sites omit it).</p>}
                      {result.potentialKeywords?.length>0&&(
                        <>
                          <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wide mb-3">Potential Keywords (from content)</p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {result.potentialKeywords.map((k,i)=>(
                              <button key={i} onClick={()=>navigator.clipboard.writeText(k.word)} title={`${k.count} occurrences — click to copy`}
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-border hover:bg-primary/10 hover:text-primary hover:border-primary/20 border border-transparent text-foreground-secondary transition-colors group">
                                {k.word}<span className="text-[10px] font-bold text-foreground-muted group-hover:text-primary/60">{k.count}</span>
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wide mb-2">Word Frequency Chart</p>
                          <WordFreqBar keywords={result.potentialKeywords}/>
                        </>
                      )}
                    </div>

                    {/* Basic meta */}
                    <div>
                      <h3 className="type-h4 font-semibold text-foreground mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-primary"/>Basic Meta Tags</h3>
                      <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full"><tbody>
                          {([["Title",result.metadata.title],["Description",result.metadata.description],["Keywords",result.metadata.keywords],["Author",result.metadata.author],["Generator",result.metadata.generator],["Canonical",result.metadata.canonical],["Robots",result.metadata.robots],["Viewport",result.metadata.viewport],["Charset",result.metadata.charset],["Language",result.metadata.language],["Favicon",result.metadata.favicon]] as [string,string][]).map(([l,v])=><MetaRow key={l} label={l} value={v}/>)}
                        </tbody></table>
                      </div>
                    </div>

                    {/* Open Graph */}
                    {Object.keys(result.metadata.og).length>0&&(
                      <div>
                        <h3 className="type-h4 font-semibold text-foreground mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-primary"/>Open Graph</h3>
                        {result.metadata.og["image"]&&(
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={result.metadata.og["image"]} alt="OG" className="rounded-xl border border-border max-h-36 object-cover mb-3" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
                        )}
                        <div className="rounded-xl border border-border overflow-hidden">
                          <table className="w-full"><tbody>{Object.entries(result.metadata.og).map(([k,v])=><MetaRow key={k} label={`og:${k}`} value={v}/>)}</tbody></table>
                        </div>
                      </div>
                    )}

                    {/* Twitter */}
                    {Object.keys(result.metadata.twitter).length>0&&(
                      <div>
                        <h3 className="type-h4 font-semibold text-foreground mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary"/>Twitter Card</h3>
                        <div className="rounded-xl border border-border overflow-hidden">
                          <table className="w-full"><tbody>{Object.entries(result.metadata.twitter).map(([k,v])=><MetaRow key={k} label={`twitter:${k}`} value={v}/>)}</tbody></table>
                        </div>
                      </div>
                    )}

                    {/* Other meta */}
                    {Object.keys(result.metadata.other).length>0&&(
                      <div>
                        <h3 className="type-h4 font-semibold text-foreground mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-foreground-muted"/>Other Meta</h3>
                        <div className="rounded-xl border border-border overflow-hidden">
                          <table className="w-full"><tbody>{Object.entries(result.metadata.other).map(([k,v])=><MetaRow key={k} label={k} value={v}/>)}</tbody></table>
                        </div>
                      </div>
                    )}

                    {/* JSON-LD */}
                    <div>
                      <h3 className="type-h4 font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary"/>JSON-LD Structured Data
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{result.schemas.length}</span>
                      </h3>
                      {result.schemas.length===0?<p className="text-sm text-foreground-secondary">No JSON-LD schemas found.</p>
                        :<div className="space-y-3">{result.schemas.map((s,i)=><SchemaBlock key={i} schema={s}/>)}</div>}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* Landing info cards */}
        {!result&&!loading&&(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {[
              { icon:FileSearch, title:"Article + Full-page",    desc:"Mozilla Readability for articles. Cheerio full-page fallback for homepages, tool sites, and SSR web apps." },
              { icon:Cpu,        title:"Tech Stack Detector",    desc:"Detects CMS, JS frameworks, CSS libraries, analytics, payment providers, chat tools, and hosting platform." },
              { icon:Share2,     title:"Social Preview Cards",   desc:"See exactly how your page looks when shared on Google, Twitter/X, Facebook, and LinkedIn before publishing." },
              { icon:Wifi,       title:"Broken Link Checker",    desc:"Check every link on the page. Status codes per link — spot 404s and broken external links instantly." },
            ].map(c=>(
              <div key={c.title} className="glass-card-premium p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-muted border border-primary-border flex items-center justify-center"><c.icon className="w-4.5 h-4.5 text-primary"/></div>
                <div><h3 className="font-semibold text-foreground text-sm mb-1">{c.title}</h3><p className="text-xs text-foreground-secondary leading-relaxed">{c.desc}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
