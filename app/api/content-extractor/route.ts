import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const READABILITY_MIN_WORDS = 120;
const CONTENT_TAGS = "h1,h2,h3,h4,h5,h6,p,li,td,th,dt,dd,blockquote,figcaption";
const NOISE_SELECTORS = [
  "script","style","noscript","head","iframe","svg","canvas","template","nav",
  "header","footer","[aria-hidden='true']","[class*='cookie']","[id*='cookie']",
  "[class*='banner']","[class*='popup']","[class*='modal']","[class*='overlay']",
].join(",");

// ── Types ─────────────────────────────────────────────────────────────────────
interface LinkItem  { url:string; text:string; domain?:string; nofollow?:boolean }
interface ImageItem { src:string; alt:string; hasAlt:boolean; loading?:string; width?:string; height?:string }
interface Heading   { level:number; text:string }
interface SeoCheck  { id:string; name:string; passed:boolean; detail:string; points:number; earned:number }
interface TechItem  { category:string; name:string; confidence:"high"|"medium" }
interface IndexIssue{ type:string; severity:"error"|"warning"|"info"; message:string }

// ── Meta extraction ───────────────────────────────────────────────────────────
function extractPageMeta(html: string, pageUrl: string) {
  const $ = cheerio.load(html);

  const title       = $("title").text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const keywords    = $('meta[name="keywords"]').attr("content")?.trim() ?? "";
  const author      = $('meta[name="author"]').attr("content")?.trim() ?? "";
  const canonical   = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
  const robots      = $('meta[name="robots"]').attr("content")?.trim() ?? "";
  const viewport    = $('meta[name="viewport"]').attr("content")?.trim() ?? "";
  const charset     = $("meta[charset]").attr("charset")?.trim() ??
    ($('meta[http-equiv="Content-Type"]').attr("content") ?? "").match(/charset=([^;]+)/i)?.[1]?.trim() ?? "";
  const language    = $("html").attr("lang")?.trim() ?? "";
  const generator   = $('meta[name="generator"]').attr("content")?.trim() ?? "";

  const rawFavicon = $('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]').first().attr("href")?.trim() ?? "";
  let favicon = rawFavicon;
  if (rawFavicon && !rawFavicon.startsWith("http")) {
    try { favicon = new URL(rawFavicon, pageUrl).href; } catch { /**/ }
  }

  const og: Record<string,string> = {};
  $("meta[property^='og:']").each((_, el) => {
    const prop = $(el).attr("property")?.replace("og:","") ?? "";
    const content = $(el).attr("content")?.trim() ?? "";
    if (prop && content) og[prop] = content;
  });

  const twitter: Record<string,string> = {};
  $("meta[name^='twitter:']").each((_, el) => {
    const name = $(el).attr("name")?.replace("twitter:","") ?? "";
    const content = $(el).attr("content")?.trim() ?? "";
    if (name && content) twitter[name] = content;
  });

  const known = new Set(["description","keywords","author","robots","viewport","generator"]);
  const other: Record<string,string> = {};
  $("meta[name]").each((_, el) => {
    const name = $(el).attr("name")?.trim() ?? "";
    const content = $(el).attr("content")?.trim() ?? "";
    if (name && content && !known.has(name) && !name.startsWith("twitter:")) other[name] = content;
  });

  const schemas: Array<{ type:string; raw:string }> = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html()?.trim() ?? "";
      const parsed = JSON.parse(raw);
      const resolveType = (o: Record<string,unknown>) => { const t=o["@type"]; return Array.isArray(t)?t.join(", "):typeof t==="string"?t:"Unknown"; };
      const type = Array.isArray(parsed) ? parsed.map((p:Record<string,unknown>)=>resolveType(p)).join(" + ") : resolveType(parsed as Record<string,unknown>);
      schemas.push({ type, raw: JSON.stringify(parsed,null,2) });
    } catch { /**/ }
  });

  return { metadata: { title,description,keywords,author,canonical,robots,viewport,charset,favicon,language,generator,og,twitter,other }, schemas };
}

// ── Tech stack detection ──────────────────────────────────────────────────────
function detectTechStack(html: string, headers: Headers): TechItem[] {
  const $ = cheerio.load(html);
  const tech: TechItem[] = [];
  const h = html.toLowerCase();
  const scripts = $("script[src]").map((_,el)=>$(el).attr("src")||"").get().join(" ").toLowerCase();
  const generator = $('meta[name="generator"]').attr("content") || "";

  const add = (category:string, name:string, confidence:"high"|"medium") => {
    if (!tech.some(t=>t.name===name)) tech.push({ category, name, confidence });
  };

  // CMS
  if (/wordpress/i.test(generator)||h.includes("/wp-content/")||h.includes("/wp-includes/")) add("CMS","WordPress","high");
  if (/ghost/i.test(generator)||h.includes("ghost.io")||scripts.includes("ghost")) add("CMS","Ghost","high");
  if (/joomla/i.test(generator)||h.includes("/components/com_")) add("CMS","Joomla","high");
  if (/drupal/i.test(generator)||h.includes("drupal.js")||h.includes("/sites/default/files/")) add("CMS","Drupal","high");
  if (/wix/i.test(generator)||h.includes("wixsite.com")||h.includes("_wix_")||h.includes("wix-")) add("Site Builder","Wix","high");
  if (/squarespace/i.test(generator)||h.includes("squarespace.com")||h.includes("squarespace-cdn")) add("Site Builder","Squarespace","high");
  if (/webflow/i.test(generator)||h.includes("webflow.io")||h.includes('data-wf-')) add("Site Builder","Webflow","high");
  if (h.includes("framer.com")||h.includes("framer-motion")||h.includes("framerstatic")) add("Site Builder","Framer","high");

  // Ecommerce
  if (h.includes("cdn.shopify.com")||h.includes("shopify.theme")||scripts.includes("shopify")) add("Ecommerce","Shopify","high");
  if (h.includes("woocommerce")||h.includes("/wc-blocks/")) add("Ecommerce","WooCommerce","high");
  if (h.includes("magento")||h.includes("var mage_")||h.includes("magentoVersion")) add("Ecommerce","Magento","high");
  if (h.includes("bigcommerce")||h.includes("cdn11.bigcommerce.com")) add("Ecommerce","BigCommerce","high");

  // JS Frameworks / Meta-frameworks
  if (h.includes("__next_data__")||h.includes("/_next/static")||scripts.includes("/_next/")) add("Framework","Next.js","high");
  if (h.includes("__nuxt")||h.includes("/_nuxt/")||scripts.includes("nuxt")) add("Framework","Nuxt.js","high");
  if (h.includes("data-reactroot")||h.includes("__react")||scripts.includes("react.production")) add("Framework","React","high");
  if (h.includes("ng-version=")||h.includes("ng-app")||scripts.includes("angular")) add("Framework","Angular","high");
  if (h.includes("data-v-")||h.includes("__vue")||scripts.includes("vue.")) add("Framework","Vue.js","medium");
  if (h.includes("astro-island")||scripts.includes("astro")) add("Framework","Astro","high");
  if (h.includes("__svelte")||scripts.includes("svelte")) add("Framework","Svelte","high");
  if (h.includes("remix-dev-tools")||scripts.includes("remix")) add("Framework","Remix","high");
  if (h.includes("gatsby-")||scripts.includes("gatsby")) add("Framework","Gatsby","high");

  // CSS Frameworks
  if (h.includes("tailwind")||scripts.includes("tailwind")) add("CSS","Tailwind CSS","high");
  if (scripts.includes("bootstrap")||h.includes('class="container"')&&h.includes('class="row"')) add("CSS","Bootstrap","medium");

  // Analytics
  if (h.includes("google-analytics.com/analytics.js")||h.includes("gtag(")||h.includes("ga('send")) add("Analytics","Google Analytics","high");
  if (h.includes("googletagmanager.com")||h.includes("gtm-")) add("Analytics","Google Tag Manager","high");
  if (h.includes("plausible.io")) add("Analytics","Plausible","high");
  if (h.includes("hotjar.com")||h.includes("_hjsettings")) add("Analytics","Hotjar","high");
  if (h.includes("mixpanel.com")||h.includes("mixpanel.init")) add("Analytics","Mixpanel","high");
  if (h.includes("segment.com")||h.includes("analytics.load(")) add("Analytics","Segment","high");
  if (h.includes("clarity.ms")||h.includes("microsoft clarity")) add("Analytics","Microsoft Clarity","high");
  if (h.includes("amplitude.com")||h.includes("amplitude.init")) add("Analytics","Amplitude","high");

  // Chat / Support
  if (h.includes("intercom.io")||h.includes("intercomsettings")) add("Chat","Intercom","high");
  if (h.includes("crisp.chat")||h.includes("$crisp")) add("Chat","Crisp","high");
  if (h.includes("tawk.to")) add("Chat","Tawk.to","high");
  if (h.includes("zendesk.com")||scripts.includes("zopim")) add("Chat","Zendesk","high");
  if (h.includes("drift.com")||h.includes("drift.load")) add("Chat","Drift","high");

  // Payments
  if (h.includes("js.stripe.com")||h.includes("stripe.elements")) add("Payments","Stripe","high");
  if (h.includes("paypal.com/sdk")||h.includes("paypalobjects.com")) add("Payments","PayPal","high");
  if (h.includes("paddle.com")||h.includes("paddlejs")) add("Payments","Paddle","high");

  // Maps
  if (h.includes("maps.googleapis.com")||h.includes("google.maps")) add("Maps","Google Maps","high");
  if (h.includes("api.mapbox.com")) add("Maps","Mapbox","high");

  // CDN / Hosting
  const server = headers.get("server") || "";
  const poweredBy = headers.get("x-powered-by") || "";
  if (h.includes("cloudflareinsights.com")||server.toLowerCase().includes("cloudflare")) add("CDN","Cloudflare","high");
  if (headers.get("x-vercel-id")||headers.get("x-vercel-cache")) add("Hosting","Vercel","high");
  if (server.toLowerCase().includes("netlify")||headers.get("x-netlify")) add("Hosting","Netlify","high");
  if (headers.get("x-github-request-id")) add("Hosting","GitHub Pages","high");
  if (poweredBy.toLowerCase().includes("express")) add("Server","Express.js","high");
  if (poweredBy.toLowerCase().includes("php")||server.toLowerCase().includes("php")) add("Server","PHP","high");

  // SEO Tools
  if (h.includes("yoast")||h.includes("rank math")||h.includes("rankmath")) add("SEO Plugin","Yoast SEO","high");
  if (h.includes("rank-math")||h.includes("rank_math")) add("SEO Plugin","Rank Math","high");

  return tech;
}

// ── Indexability check ────────────────────────────────────────────────────────
function checkIndexability(html: string, headers: Headers, canonical: string, pageUrl: string): { indexable:boolean; issues:IndexIssue[] } {
  const $ = cheerio.load(html);
  const issues: IndexIssue[] = [];

  const robotsMeta = ($('meta[name="robots"]').attr("content") || $('meta[name="googlebot"]').attr("content") || "").toLowerCase();
  const xRobotsTag = (headers.get("x-robots-tag") || "").toLowerCase();

  if (robotsMeta.includes("noindex") || xRobotsTag.includes("noindex"))
    issues.push({ type:"noindex", severity:"error", message:`noindex directive found ${xRobotsTag.includes("noindex")?"(X-Robots-Tag header)":"(meta robots tag)"} — search engines will not index this page` });

  if (robotsMeta.includes("nofollow") || xRobotsTag.includes("nofollow"))
    issues.push({ type:"nofollow", severity:"warning", message:"nofollow directive — links on this page won't pass link equity to other pages" });

  if (!canonical)
    issues.push({ type:"no-canonical", severity:"warning", message:"No canonical URL set — may cause duplicate content issues" });
  else {
    try {
      const canon = new URL(canonical);
      const page  = new URL(pageUrl);
      if (canon.hostname !== page.hostname || canon.pathname !== page.pathname)
        issues.push({ type:"canonical-mismatch", severity:"error", message:`Canonical points elsewhere: ${canonical.slice(0,80)}` });
    } catch { /**/ }
  }

  if (robotsMeta.includes("noimageindex"))
    issues.push({ type:"noimageindex", severity:"info", message:"noimageindex — Google will not index images from this page" });

  if (robotsMeta.includes("noarchive"))
    issues.push({ type:"noarchive", severity:"info", message:"noarchive — search engines will not store a cached copy" });

  const h1Count = $("h1").length;
  if (h1Count === 0) issues.push({ type:"no-h1", severity:"warning", message:"No H1 tag — a clear H1 helps search engines understand the page topic" });
  if (h1Count > 1)  issues.push({ type:"multi-h1", severity:"warning", message:`${h1Count} H1 tags found — pages should have exactly one H1` });

  const indexable = !issues.some(i=>i.severity==="error"&&i.type==="noindex");
  return { indexable, issues };
}

// ── Links extraction ──────────────────────────────────────────────────────────
function extractLinks(html:string, pageUrl:string) {
  const $ = cheerio.load(html);
  $("script,style,noscript").remove();
  const pageHost = (() => { try { return new URL(pageUrl).hostname; } catch { return ""; } })();
  const seen = new Set<string>();
  const internal: LinkItem[] = [], external: LinkItem[] = [];

  $("a[href]").each((_, el) => {
    const raw = $(el).attr("href")?.trim() ?? "";
    if (!raw||raw.startsWith("#")||raw.startsWith("mailto:")||raw.startsWith("tel:")||raw.startsWith("javascript:")) return;
    let resolved = raw;
    try { resolved = new URL(raw, pageUrl).href; } catch { return; }
    if (seen.has(resolved)) return;
    seen.add(resolved);
    const text = $(el).text().replace(/\s+/g," ").trim().slice(0,100);
    const rel = $(el).attr("rel") ?? "";
    let host = "";
    try { host = new URL(resolved).hostname; } catch { return; }
    if (host===pageHost||host===`www.${pageHost}`||`www.${host}`===pageHost) internal.push({ url:resolved, text:text||resolved, nofollow:rel.includes("nofollow") });
    else external.push({ url:resolved, text:text||resolved, domain:host, nofollow:rel.includes("nofollow") });
  });
  return { internal, external };
}

// ── Images extraction ─────────────────────────────────────────────────────────
function extractImages(html:string, pageUrl:string): ImageItem[] {
  const $ = cheerio.load(html);
  $("script,style,noscript").remove();
  const seen = new Set<string>();
  const images: ImageItem[] = [];

  $("img[src],img[data-src],img[data-lazy-src]").each((_, el) => {
    const raw = ($(el).attr("src")||$(el).attr("data-src")||$(el).attr("data-lazy-src")||"").trim();
    if (!raw||raw.startsWith("data:")) return;
    let src = raw;
    try { src = new URL(raw, pageUrl).href; } catch { src = raw; }
    if (seen.has(src)) return;
    seen.add(src);
    images.push({ src, alt:$(el).attr("alt")?.trim()??"", hasAlt:$(el).attr("alt")!==undefined, loading:$(el).attr("loading"), width:$(el).attr("width"), height:$(el).attr("height") });
  });
  return images;
}

// ── Heading TOC extraction ────────────────────────────────────────────────────
function extractHeadings(html:string): Heading[] {
  const $ = cheerio.load(html);
  $("script,style,noscript,nav,header,footer").remove();
  const headings: Heading[] = [];
  $("h1,h2,h3,h4,h5,h6").each((_, el) => {
    const level = parseInt((el as {tagName?:string}).tagName?.replace("h","")??"1", 10);
    const text = $(el).text().replace(/\s+/g," ").trim();
    if (text) headings.push({ level, text });
  });
  return headings;
}

// ── Keyword extraction ────────────────────────────────────────────────────────
const STOPWORDS = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","was","are","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","this","that","these","those","it","its","we","you","he","she","they","them","their","there","here","when","where","what","which","who","how","all","any","each","every","more","most","also","just","can","not","no","so","if","as","up","out","about","into","than","then","now","even","only","well","very","get","our","my","your","his","her","us","me","him","i","s","t","ve","re","ll","d","m","don","let","use","used","using","make","made","making","one","two","three","new","like","need","want","know","see","look","come","go","take","give","first","page","site","web","click","free","sign","help","search","view","read","using"]);

function extractKeywords(text:string, topN=30): Array<{ word:string; count:number }> {
  const words = text.toLowerCase().replace(/[^a-z\s-]/g," ").split(/\s+/).filter(w=>w.length>3&&!STOPWORDS.has(w)&&!/^\d+$/.test(w));
  const freq: Record<string,number> = {};
  for (const w of words) freq[w]=(freq[w]||0)+1;
  const bigrams: Record<string,number> = {};
  for (let i=0;i<words.length-1;i++) {
    const a=words[i], b=words[i+1];
    if (a.length>3&&b.length>3&&!STOPWORDS.has(a)&&!STOPWORDS.has(b)) { const bg=`${a} ${b}`; bigrams[bg]=(bigrams[bg]||0)+1; }
  }
  const singles = Object.entries(freq).filter(([,c])=>c>=2).sort((a,b)=>b[1]-a[1]).slice(0,topN).map(([word,count])=>({word,count}));
  const phrases = Object.entries(bigrams).filter(([,c])=>c>=2).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([word,count])=>({word,count}));
  return [...phrases,...singles].sort((a,b)=>b.count-a.count).slice(0,topN);
}

// ── Content stats ─────────────────────────────────────────────────────────────
function calcStats(text:string) {
  const words = text.split(/\s+/).filter(w=>w.length>0);
  const sentences = text.split(/[.!?]+/).filter(s=>s.trim().length>0);
  const paragraphs = text.split(/\n{2,}/).filter(p=>p.trim().length>0);
  const uniqueWords = new Set(words.map(w=>w.toLowerCase().replace(/[^a-z]/g,""))).size;
  const avgWordsPerSentence = sentences.length?Math.round(words.length/sentences.length):0;
  const syllables = words.reduce((n,w)=>n+Math.max(1,w.replace(/[^aeiou]/gi,"").length),0);

  // Flesch Reading Ease
  const fre = sentences.length&&words.length ? Math.round(206.835-1.015*(words.length/sentences.length)-84.6*(syllables/words.length)) : 0;
  const readabilityScore = Math.max(0,Math.min(100,fre));

  // Flesch-Kincaid Grade Level
  const fkRaw = sentences.length&&words.length ? 0.39*(words.length/sentences.length)+11.8*(syllables/words.length)-15.59 : 0;
  const fkGrade = Math.max(1,Math.min(18,Math.round(fkRaw)));
  const gradeLabels = ["","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","College Freshman","College Sophomore","College Junior","College Senior","Graduate","Post-Graduate"];
  const readingGrade = gradeLabels[fkGrade] ?? "Post-Graduate";

  return { wordCount:words.length, sentenceCount:sentences.length, paragraphCount:paragraphs.length, uniqueWords, avgWordsPerSentence, readabilityScore, readingGrade };
}

// ── SEO score ─────────────────────────────────────────────────────────────────
function calcSeoScore(meta:ReturnType<typeof extractPageMeta>["metadata"], schemas:Array<{type:string;raw:string}>, headings:Heading[], images:ImageItem[]): { total:number; checks:SeoCheck[] } {
  const checks: SeoCheck[] = [];
  const tl = meta.title.length;
  checks.push({ id:"title",    name:"Page Title",       passed:tl>0,          points:15, earned:tl===0?0:tl>=30&&tl<=65?15:8,   detail:tl===0?"No title tag":`${tl} chars (ideal 30–65)` });
  const dl = meta.description.length;
  checks.push({ id:"desc",     name:"Meta Description", passed:dl>0,          points:15, earned:dl===0?0:dl>=120&&dl<=165?15:8, detail:dl===0?"No meta description":`${dl} chars (ideal 120–165)` });
  checks.push({ id:"canonical",name:"Canonical URL",    passed:!!meta.canonical, points:5, earned:meta.canonical?5:0, detail:meta.canonical?`Set to ${meta.canonical.slice(0,60)}`:"Missing canonical URL" });
  const ogFull=!!meta.og["title"]&&!!meta.og["description"]&&!!meta.og["image"], ogPart=!!meta.og["title"]||!!meta.og["description"]||!!meta.og["image"];
  checks.push({ id:"og",       name:"Open Graph Tags",  passed:ogFull,        points:15, earned:ogFull?15:ogPart?8:0, detail:`og:title ${meta.og["title"]?"✓":"✗"} · og:description ${meta.og["description"]?"✓":"✗"} · og:image ${meta.og["image"]?"✓":"✗"}` });
  checks.push({ id:"twitter",  name:"Twitter Card",     passed:!!meta.twitter["card"], points:5, earned:meta.twitter["card"]?5:0, detail:meta.twitter["card"]?`Card: ${meta.twitter["card"]}`:"No twitter:card tag" });
  checks.push({ id:"schema",   name:"JSON-LD Schema",   passed:schemas.length>0, points:10, earned:schemas.length>0?10:0, detail:schemas.length>0?`${schemas.length} schema(s): ${schemas.map(s=>s.type).join(", ")}`:"No structured data found" });
  const h1s=headings.filter(h=>h.level===1);
  checks.push({ id:"h1",       name:"Single H1",        passed:h1s.length===1, points:10, earned:h1s.length===1?10:h1s.length>0?5:0, detail:h1s.length===0?"No H1 found":h1s.length===1?`H1: "${h1s[0].text.slice(0,50)}"`:`${h1s.length} H1 tags (should be 1)` });
  checks.push({ id:"favicon",  name:"Favicon",          passed:!!meta.favicon, points:5, earned:meta.favicon?5:0, detail:meta.favicon?"Favicon found":"No favicon link tag" });
  const imgsWithAlt=images.filter(i=>i.hasAlt).length, altPct=images.length>0?imgsWithAlt/images.length:1;
  checks.push({ id:"alt",      name:"Image Alt Text",   passed:altPct>=0.9,  points:10, earned:images.length===0?10:altPct>=0.9?10:altPct>=0.5?5:0, detail:images.length===0?"No images found":`${imgsWithAlt}/${images.length} have alt (${Math.round(altPct*100)}%)` });
  checks.push({ id:"charset",  name:"Charset Declared", passed:!!meta.charset, points:5, earned:meta.charset?5:0, detail:meta.charset?`charset="${meta.charset}"`:"No charset meta tag" });
  const earned=checks.reduce((s,c)=>s+c.earned,0), total=checks.reduce((s,c)=>s+c.points,0);
  return { total:Math.round((earned/total)*100), checks };
}

// ── Full-page Cheerio extraction ──────────────────────────────────────────────
function fullPageExtract(html:string, pageUrl:string) {
  const $ = cheerio.load(html);
  $(NOISE_SELECTORS).remove();
  const hostname = (() => { try { return new URL(pageUrl).hostname; } catch { return ""; } })();
  const pageTitle = $("title").text().trim()||$("h1").first().text().trim()||"Extracted Page";
  const metaDesc = $('meta[name="description"]').attr("content")||$('meta[property="og:description"]').attr("content")||"";
  const siteName = $('meta[property="og:site_name"]').attr("content")||hostname;
  const seen = new Set<string>();
  const lines: string[] = [];

  $(CONTENT_TAGS).each((_, el) => {
    const node = el as { type:string; name:string };
    if (node.type !== "tag") return;
    const tag = node.name;
    const raw = $(el).text().replace(/\s+/g," ").trim();
    if (!raw||raw.length<8||seen.has(raw)) return;
    seen.add(raw);
    if      (tag==="h1") lines.push(`# ${raw}`);
    else if (tag==="h2") lines.push(`## ${raw}`);
    else if (tag==="h3") lines.push(`### ${raw}`);
    else if (tag==="h4"||tag==="h5"||tag==="h6") lines.push(`#### ${raw}`);
    else if (tag==="li") lines.push(`- ${raw}`);
    else if (tag==="th") lines.push(`**${raw}**`);
    else if (tag==="blockquote") lines.push(`> ${raw}`);
    else lines.push(raw);
  });

  const markdown = `# ${pageTitle}\n\n${lines.join("\n\n")}`;
  const textContent = lines.map(l=>l.replace(/^[#\->*]+\s*/,"").replace(/^\*\*(.+)\*\*$/,"$1")).join("\n");
  const contentHtml = lines.map(line => {
    if (line.startsWith("# "))   return `<h1>${line.slice(2)}</h1>`;
    if (line.startsWith("## "))  return `<h2>${line.slice(3)}</h2>`;
    if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
    if (line.startsWith("#### "))return `<h4>${line.slice(5)}</h4>`;
    if (line.startsWith("- "))   return `<li>${line.slice(2)}</li>`;
    if (line.startsWith("> "))   return `<blockquote>${line.slice(2)}</blockquote>`;
    if (line.startsWith("**")&&line.endsWith("**")) return `<strong>${line.slice(2,-2)}</strong>`;
    return `<p>${line}</p>`;
  }).join("\n");

  const words = textContent.split(/\s+/).filter(w=>w.length>0);
  return { title:pageTitle, byline:"", excerpt:metaDesc, content:contentHtml, textContent, markdown, siteName, url:pageUrl, extractionMode:"full-page" as const, wordCount:words.length, readingTime:Math.max(1,Math.ceil(words.length/200)) };
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json();
  const mode: string = body.mode ?? "url";
  let url: string = (body.url ?? "").trim();
  const rawHtml: string = body.html ?? "";

  if (mode === "url") {
    if (!url.startsWith("http")) url = "https://" + url;
  }

  const t0 = Date.now();

  try {
    let html = "";
    let responseHeaders = new Headers();
    let finalUrl = url;
    let pageSize = 0;
    let responseTime = 0;

    if (mode === "html") {
      // Paste HTML mode — no fetch needed
      html = rawHtml;
      pageSize = Buffer.byteLength(html, "utf8");
      finalUrl = url || "about:blank";
      responseTime = 0;
    } else {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(12000),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
      });

      responseTime = Date.now() - t0;
      if (!res.ok) return Response.json({ error:`Server returned ${res.status} ${res.statusText}` }, { status:422 });
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("html")) return Response.json({ error:"URL does not return an HTML page" }, { status:422 });

      html = await res.text();
      responseHeaders = res.headers;
      pageSize = Buffer.byteLength(html, "utf8");
      finalUrl = res.url || url;
    }

    // Always-run extractions
    const { metadata, schemas } = extractPageMeta(html, finalUrl);
    const links      = extractLinks(html, finalUrl);
    const images     = extractImages(html, finalUrl);
    const headings   = extractHeadings(html);
    const seoScore   = calcSeoScore(metadata, schemas, headings, images);
    const techStack  = detectTechStack(html, responseHeaders);
    const indexability = checkIndexability(html, responseHeaders, metadata.canonical, finalUrl);

    // ── Strategy 1: Readability ───────────────────────────────────────────────
    try {
      const { JSDOM } = await import("jsdom");
      const { Readability } = await import("@mozilla/readability");
      const TurndownService = (await import("turndown")).default;

      const dom = new JSDOM(html, { url: finalUrl });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      const wc = (article?.textContent ?? "").split(/\s+/).filter(Boolean).length;

      if (article && wc >= READABILITY_MIN_WORDS) {
        const td = new TurndownService({ headingStyle:"atx", codeBlockStyle:"fenced", bulletListMarker:"-" });
        const markdownBody = td.turndown(article.content ?? "");
        const markdown = `# ${article.title}\n\n${markdownBody}`;
        const textContent = (article.textContent ?? "").replace(/\s+/g," ").trim();
        const stats = calcStats(textContent);
        const potentialKeywords = extractKeywords(textContent);

        return Response.json({
          title:article.title??"", byline:article.byline??"", excerpt:article.excerpt??"",
          content:article.content??"", textContent, markdown, siteName:article.siteName??"",
          url:finalUrl, extractionMode:"article",
          ...stats, readingTime:Math.max(1,Math.ceil(stats.wordCount/200)),
          headings, links, images, metadata, schemas, seoScore, potentialKeywords,
          techStack, indexability, responseTime, pageSize,
        });
      }
    } catch { /**/ }

    // ── Strategy 2: Full-page Cheerio ─────────────────────────────────────────
    const result = fullPageExtract(html, finalUrl);
    if (result.wordCount < 10) return Response.json({ error:"This page is fully client-side rendered — content requires JavaScript and cannot be extracted server-side." }, { status:422 });

    const stats = calcStats(result.textContent);
    const potentialKeywords = extractKeywords(result.textContent);
    return Response.json({ ...result, ...stats, wordCount:stats.wordCount, readingTime:result.readingTime, headings, links, images, metadata, schemas, seoScore, potentialKeywords, techStack, indexability, responseTime, pageSize });

  } catch (err) {
    return Response.json({ error:`Failed: ${err instanceof Error ? err.message : "Unknown error"}` }, { status:422 });
  }
}
