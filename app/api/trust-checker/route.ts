import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

interface Check {
  id: string;
  name: string;
  passed: boolean;
  warning?: boolean;
  detail: string;
  points: number;
  earned: number;
}

function extractDomain(url: string) {
  try { return new URL(url).hostname; } catch { return url; }
}

function isSuspiciousUrl(url: string): string[] {
  const flags: string[] = [];
  try {
    const u = new URL(url);
    const host = u.hostname;
    // IP-based URL
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) flags.push("URL uses an IP address instead of a domain name (common phishing pattern)");
    // Excessive hyphens
    if ((host.match(/-/g) || []).length >= 4) flags.push("Domain contains many hyphens — often a sign of a spam or phishing domain");
    // Very long domain
    if (host.length > 50) flags.push("Unusually long domain name — may be a disguised phishing URL");
    // Lots of subdomains
    if (host.split(".").length > 4) flags.push("Too many subdomain levels — check the actual registered domain carefully");
    // Lookalike TLDs
    if (/\.(xyz|top|click|loan|gq|tk|ml|cf|ga|pw)$/i.test(host)) flags.push("High-risk TLD — this domain extension is frequently used for spam or phishing");
  } catch { /* ignore */ }
  return flags;
}

function detectTech(headers: Headers, html: string): string[] {
  const tech: string[] = [];
  const server = headers.get("server") ?? "";
  const powered = headers.get("x-powered-by") ?? "";
  const via = headers.get("via") ?? "";
  const cf = headers.get("cf-ray");
  const vercel = headers.get("x-vercel-id");
  const netlify = headers.get("x-nf-request-id");

  if (cf) tech.push("Cloudflare");
  if (vercel) tech.push("Vercel");
  if (netlify) tech.push("Netlify");
  if (/nginx/i.test(server)) tech.push("Nginx");
  if (/apache/i.test(server)) tech.push("Apache");
  if (/litespeed/i.test(server)) tech.push("LiteSpeed");
  if (/iis/i.test(server)) tech.push("IIS");
  if (/PHP/i.test(powered)) tech.push("PHP");
  if (/express/i.test(powered)) tech.push("Express.js");
  if (/next/i.test(powered) || html.includes("__NEXT_DATA__")) tech.push("Next.js");
  if (html.includes("wp-content") || html.includes("wp-includes")) tech.push("WordPress");
  if (html.includes("Shopify.theme") || html.includes("shopify")) tech.push("Shopify");
  if (/drupal/i.test(html.slice(0, 5000))) tech.push("Drupal");
  if (html.includes("sites/all/") || html.includes("sites/default/")) tech.push("Drupal");
  if (html.includes("squarespace")) tech.push("Squarespace");
  if (html.includes("wix.com") || html.includes("_wixCIDX")) tech.push("Wix");
  if (via && !tech.includes("Cloudflare")) tech.push("CDN (" + via.split(" ")[0] + ")");

  return [...new Set(tech)];
}

export async function POST(req: Request) {
  const body = await req.json();
  let url: string = (body.url ?? "").trim();
  if (!url.startsWith("http")) url = "https://" + url;

  const checks: Check[] = [];
  const startTime = Date.now();
  const suspiciousFlags = isSuspiciousUrl(url);

  // ── Fetch the target URL ─────────────────────────────────────────────────
  let html = "";
  let responseTime = 0;
  let responseHeaders: Headers = new Headers();
  let fetchOk = false;
  let sslError = false;
  let finalUrl = url;
  let redirectCount = 0;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Toolsz-TrustChecker/1.0; +https://www.toolsz.co)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    responseTime = Date.now() - startTime;
    responseHeaders = res.headers;
    html = await res.text();
    fetchOk = res.ok;
    finalUrl = res.url;
    // Count redirects by comparing initial vs final URL
    if (res.url !== url) {
      redirectCount = res.url.replace(/\/$/, "") === url.replace(/\/$/, "") ? 0 : 1;
    }
  } catch (err) {
    responseTime = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : "";
    sslError = msg.includes("SSL") || msg.includes("certificate") || msg.includes("self-signed") || msg.includes("CERT");
  }

  // ── Check HTTP → HTTPS redirect ──────────────────────────────────────────
  let httpRedirectsToHttps = false;
  if (url.startsWith("https://")) {
    const httpUrl = url.replace("https://", "http://");
    try {
      const httpRes = await fetch(httpUrl, {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Toolsz-TrustChecker/1.0)" },
        redirect: "follow",
      });
      httpRedirectsToHttps = httpRes.url.startsWith("https://");
    } catch { /* ignore */ }
  }

  // ── HTTPS ────────────────────────────────────────────────────────────────
  const isHttps = url.startsWith("https://");
  checks.push({
    id: "https",
    name: "HTTPS Enabled",
    passed: isHttps,
    detail: isHttps ? "Site uses HTTPS — data encrypted in transit" : "Site uses HTTP — data sent unencrypted",
    points: 15,
    earned: isHttps ? 15 : 0,
  });

  // ── SSL Valid ────────────────────────────────────────────────────────────
  checks.push({
    id: "ssl",
    name: "SSL Certificate Valid",
    passed: fetchOk && !sslError,
    detail: sslError
      ? "SSL certificate is invalid or self-signed"
      : fetchOk
      ? "SSL certificate is valid and trusted"
      : "Could not verify SSL — server unreachable",
    points: 10,
    earned: fetchOk && !sslError ? 10 : 0,
  });

  // ── Suspicious URL ───────────────────────────────────────────────────────
  checks.push({
    id: "suspicious",
    name: "Clean Domain Name",
    passed: suspiciousFlags.length === 0,
    detail: suspiciousFlags.length === 0
      ? `Domain "${extractDomain(url)}" looks clean — no suspicious patterns detected`
      : suspiciousFlags[0],
    points: 10,
    earned: suspiciousFlags.length === 0 ? 10 : 0,
  });

  if (fetchOk) {
    // ── HTTP → HTTPS Redirect ────────────────────────────────────────────
    checks.push({
      id: "http-redirect",
      name: "HTTP to HTTPS Redirect",
      passed: httpRedirectsToHttps,
      detail: httpRedirectsToHttps
        ? "HTTP automatically redirects to HTTPS"
        : "HTTP version does not redirect to HTTPS — users may land on unencrypted version",
      points: 5,
      earned: httpRedirectsToHttps ? 5 : 0,
    });

    // ── HSTS ─────────────────────────────────────────────────────────────
    const hsts = responseHeaders.get("strict-transport-security");
    checks.push({
      id: "hsts",
      name: "HSTS Enforced",
      passed: !!hsts,
      detail: hsts
        ? `Strict-Transport-Security: ${hsts.slice(0, 70)}`
        : "HSTS missing — browsers may downgrade to HTTP",
      points: 5,
      earned: hsts ? 5 : 0,
    });

    // ── X-Frame-Options ───────────────────────────────────────────────────
    const xframe = responseHeaders.get("x-frame-options");
    checks.push({
      id: "xframe",
      name: "Clickjacking Protection",
      passed: !!xframe,
      detail: xframe
        ? `X-Frame-Options: ${xframe}`
        : "X-Frame-Options missing — site may be vulnerable to clickjacking",
      points: 5,
      earned: xframe ? 5 : 0,
    });

    // ── X-Content-Type-Options ────────────────────────────────────────────
    const xcto = responseHeaders.get("x-content-type-options");
    checks.push({
      id: "xcto",
      name: "MIME Sniffing Protection",
      passed: xcto === "nosniff",
      detail: xcto ? `X-Content-Type-Options: ${xcto}` : "X-Content-Type-Options missing",
      points: 5,
      earned: xcto === "nosniff" ? 5 : 0,
    });

    // ── CSP ───────────────────────────────────────────────────────────────
    const csp = responseHeaders.get("content-security-policy");
    checks.push({
      id: "csp",
      name: "Content Security Policy",
      passed: !!csp,
      detail: csp ? "CSP header present — XSS attacks mitigated" : "Content-Security-Policy missing — higher XSS risk",
      points: 5,
      earned: csp ? 5 : 0,
    });

    // ── Referrer Policy ───────────────────────────────────────────────────
    const refpol = responseHeaders.get("referrer-policy");
    checks.push({
      id: "refpol",
      name: "Referrer Policy",
      passed: !!refpol,
      detail: refpol ? `Referrer-Policy: ${refpol}` : "Referrer-Policy missing",
      points: 5,
      earned: refpol ? 5 : 0,
    });

    // ── Permissions Policy ────────────────────────────────────────────────
    const permpol = responseHeaders.get("permissions-policy");
    checks.push({
      id: "permissions",
      name: "Permissions Policy",
      passed: !!permpol,
      detail: permpol
        ? `Permissions-Policy: ${permpol.slice(0, 70)}${permpol.length > 70 ? "…" : ""}`
        : "Permissions-Policy missing — camera, mic, and geolocation not restricted",
      points: 5,
      earned: permpol ? 5 : 0,
    });

    // ── Response Speed ────────────────────────────────────────────────────
    const timeScore = responseTime < 800 ? 10 : responseTime < 2000 ? 7 : responseTime < 4000 ? 3 : 0;
    checks.push({
      id: "speed",
      name: "Response Speed",
      passed: responseTime < 2000,
      warning: responseTime >= 800 && responseTime < 2000,
      detail: `Server responded in ${responseTime}ms — ${responseTime < 800 ? "fast" : responseTime < 2000 ? "acceptable" : responseTime < 4000 ? "slow" : "very slow"}`,
      points: 10,
      earned: timeScore,
    });

    // ── Parse HTML ────────────────────────────────────────────────────────
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim();
    const titleLen = title.length;
    checks.push({
      id: "title",
      name: "Page Title",
      passed: titleLen >= 10 && titleLen <= 70,
      warning: titleLen > 0 && (titleLen < 10 || titleLen > 70),
      detail: title
        ? `"${title.slice(0, 60)}${title.length > 60 ? "…" : ""}" (${titleLen} chars${titleLen > 70 ? ", too long" : titleLen < 10 ? ", too short" : ""})`
        : "No <title> tag found",
      points: 5,
      earned: title ? (titleLen >= 10 && titleLen <= 70 ? 5 : 3) : 0,
    });

    const metaDesc = $('meta[name="description"]').attr("content")?.trim() ?? "";
    const descLen = metaDesc.length;
    checks.push({
      id: "description",
      name: "Meta Description",
      passed: descLen >= 50 && descLen <= 160,
      warning: descLen > 0 && (descLen < 50 || descLen > 160),
      detail: metaDesc
        ? `${descLen} chars${descLen > 160 ? " (too long, Google will truncate)" : descLen < 50 ? " (too short)" : " (good length)"}`
        : "No meta description found",
      points: 5,
      earned: metaDesc ? (descLen >= 50 && descLen <= 160 ? 5 : 3) : 0,
    });

    const viewportMeta = $('meta[name="viewport"]').attr("content") ?? "";
    checks.push({
      id: "viewport",
      name: "Mobile Viewport Tag",
      passed: !!viewportMeta,
      detail: viewportMeta
        ? `Viewport: ${viewportMeta}`
        : "No viewport meta tag — site may not be mobile-friendly",
      points: 5,
      earned: viewportMeta ? 5 : 0,
    });

    const langAttr = $("html").attr("lang") ?? "";
    checks.push({
      id: "lang",
      name: "HTML Language Attribute",
      passed: !!langAttr,
      detail: langAttr
        ? `Language declared: "${langAttr}" — helps search engines and screen readers`
        : "No lang attribute on <html> — search engines and accessibility tools can't detect page language",
      points: 5,
      earned: langAttr ? 5 : 0,
    });

    const favicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').first().attr("href") ?? "";
    checks.push({
      id: "favicon",
      name: "Favicon",
      passed: !!favicon,
      detail: favicon ? `Favicon: ${favicon.slice(0, 70)}` : "No favicon link tag found",
      points: 5,
      earned: favicon ? 5 : 0,
    });

    const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
    const ogImage = $('meta[property="og:image"]').attr("content") ?? "";
    const ogDesc = $('meta[property="og:description"]').attr("content") ?? "";
    checks.push({
      id: "og",
      name: "Open Graph Tags",
      passed: !!(ogTitle && ogImage),
      warning: !!(ogTitle || ogImage) && !(ogTitle && ogImage),
      detail: ogTitle && ogImage
        ? `OG title + image found — good social media previews`
        : ogTitle || ogImage
        ? `Partial OG tags — missing ${!ogTitle ? "title" : "image"}`
        : "No Open Graph tags found — poor social media sharing previews",
      points: 5,
      earned: ogTitle && ogImage ? 5 : ogTitle || ogImage ? 3 : 0,
    });

    const twitterCard = $('meta[name="twitter:card"]').attr("content") ?? "";
    checks.push({
      id: "twitter",
      name: "Twitter / X Card Tags",
      passed: !!twitterCard,
      detail: twitterCard
        ? `Twitter card type: ${twitterCard}`
        : "No Twitter Card meta tags — links won't show rich previews on X",
      points: 5,
      earned: twitterCard ? 5 : 0,
    });

    const canonical = $('link[rel="canonical"]').attr("href") ?? "";
    checks.push({
      id: "canonical",
      name: "Canonical URL",
      passed: !!canonical,
      detail: canonical
        ? `Canonical: ${canonical.slice(0, 70)}`
        : "No canonical URL tag — duplicate content risk",
      points: 5,
      earned: canonical ? 5 : 0,
    });

    // Schema.org / structured data
    const hasJsonLd = $('script[type="application/ld+json"]').length > 0;
    const hasMicrodata = html.includes('itemtype="https://schema.org') || html.includes("itemtype='https://schema.org");
    checks.push({
      id: "schema",
      name: "Structured Data (Schema.org)",
      passed: hasJsonLd || hasMicrodata,
      detail: hasJsonLd
        ? `JSON-LD structured data found (${$('script[type="application/ld+json"]').length} block${$('script[type="application/ld+json"]').length > 1 ? "s" : ""})`
        : hasMicrodata
        ? "Microdata schema.org markup found"
        : "No structured data found — missing rich results eligibility",
      points: 5,
      earned: hasJsonLd || hasMicrodata ? 5 : 0,
    });

    // Privacy Policy link
    const privacyLink = $('a[href*="privacy"], a[href*="datenschutz"]').first().attr("href") ?? "";
    const privacyText = $("a").filter((_, el) => {
      const t = $(el).text().toLowerCase();
      return t.includes("privacy") || t.includes("datenschutz") || t.includes("privacy policy");
    }).length > 0;
    checks.push({
      id: "privacy",
      name: "Privacy Policy Link",
      passed: !!(privacyLink || privacyText),
      detail: privacyLink || privacyText
        ? "Privacy policy link found on page"
        : "No privacy policy link detected — potential GDPR/compliance concern",
      points: 5,
      earned: privacyLink || privacyText ? 5 : 0,
    });

    // Contact page link
    const contactLink = $('a[href*="contact"], a[href*="kontakt"]').first().attr("href") ?? "";
    const contactText = $("a").filter((_, el) => {
      const t = $(el).text().toLowerCase();
      return t.includes("contact") || t.includes("kontakt") || t.includes("get in touch");
    }).length > 0;
    checks.push({
      id: "contact",
      name: "Contact Information",
      passed: !!(contactLink || contactText),
      detail: contactLink || contactText
        ? "Contact link found — site appears reachable by users"
        : "No contact link detected — lower trust signal",
      points: 5,
      earned: contactLink || contactText ? 5 : 0,
    });

    // ── Robots.txt ────────────────────────────────────────────────────────
    try {
      const robotsRes = await fetch(new URL("/robots.txt", url).href, {
        signal: AbortSignal.timeout(4000),
        headers: { "User-Agent": "Toolsz-TrustChecker/1.0" },
      });
      const robotsOk = robotsRes.ok && robotsRes.status === 200;
      const robotsBody = robotsOk ? await robotsRes.text() : "";
      checks.push({
        id: "robots",
        name: "Robots.txt",
        passed: robotsOk,
        detail: robotsOk
          ? `robots.txt found (${robotsBody.length} bytes)`
          : "No robots.txt at /robots.txt",
        points: 5,
        earned: robotsOk ? 5 : 0,
      });
    } catch {
      checks.push({ id: "robots", name: "Robots.txt", passed: false, detail: "Could not fetch robots.txt", points: 5, earned: 0 });
    }

    // ── Sitemap ───────────────────────────────────────────────────────────
    try {
      const smRes = await fetch(new URL("/sitemap.xml", url).href, {
        signal: AbortSignal.timeout(4000),
        headers: { "User-Agent": "Toolsz-TrustChecker/1.0" },
      });
      checks.push({
        id: "sitemap",
        name: "Sitemap.xml",
        passed: smRes.ok,
        detail: smRes.ok ? "sitemap.xml found and accessible" : "No sitemap.xml at /sitemap.xml",
        points: 5,
        earned: smRes.ok ? 5 : 0,
      });
    } catch {
      checks.push({ id: "sitemap", name: "Sitemap.xml", passed: false, detail: "Could not fetch sitemap.xml", points: 5, earned: 0 });
    }

    const tech = detectTech(responseHeaders, html);
    const earned = checks.reduce((s, c) => s + c.earned, 0);
    const total = checks.reduce((s, c) => s + c.points, 0);
    const score = Math.round((earned / total) * 100);
    const level = score >= 80 ? "high" : score >= 60 ? "good" : score >= 40 ? "caution" : "risk";

    return Response.json({
      url: finalUrl,
      score,
      level,
      responseTime,
      redirectCount,
      checks,
      suspiciousFlags,
      tech,
      meta: {
        title,
        description: metaDesc,
        favicon,
        ogTitle,
        ogImage,
        ogDesc,
        twitterCard,
        lang: langAttr,
        canonical,
      },
    });
  }

  // Add placeholder "could not verify" entries for all checks that require a live fetch
  const unreachableDetail = sslError
    ? "Could not verify — SSL certificate error"
    : "Could not verify — site was unreachable";

  const placeholders: Array<{ id: string; name: string; points: number }> = [
    { id: "http-redirect", name: "HTTP to HTTPS Redirect", points: 5 },
    { id: "hsts", name: "HSTS Enforced", points: 5 },
    { id: "xframe", name: "Clickjacking Protection", points: 5 },
    { id: "xcto", name: "MIME Sniffing Protection", points: 5 },
    { id: "csp", name: "Content Security Policy", points: 5 },
    { id: "refpol", name: "Referrer Policy", points: 5 },
    { id: "permissions", name: "Permissions Policy", points: 5 },
    { id: "speed", name: "Response Speed", points: 10 },
    { id: "title", name: "Page Title", points: 5 },
    { id: "description", name: "Meta Description", points: 5 },
    { id: "viewport", name: "Mobile Viewport Tag", points: 5 },
    { id: "lang", name: "HTML Language Attribute", points: 5 },
    { id: "favicon", name: "Favicon", points: 5 },
    { id: "og", name: "Open Graph Tags", points: 5 },
    { id: "twitter", name: "Twitter / X Card Tags", points: 5 },
    { id: "canonical", name: "Canonical URL", points: 5 },
    { id: "schema", name: "Structured Data (Schema.org)", points: 5 },
    { id: "privacy", name: "Privacy Policy Link", points: 5 },
    { id: "contact", name: "Contact Information", points: 5 },
    { id: "robots", name: "Robots.txt", points: 5 },
    { id: "sitemap", name: "Sitemap.xml", points: 5 },
  ];

  for (const p of placeholders) {
    checks.push({ ...p, passed: false, detail: unreachableDetail, earned: 0 });
  }

  const failedEarned = checks.reduce((s, c) => s + c.earned, 0);
  const failedTotal = checks.reduce((s, c) => s + c.points, 0);
  const score = failedTotal > 0 ? Math.round((failedEarned / failedTotal) * 100) : 0;

  return Response.json({
    url,
    score,
    level: "risk",
    responseTime,
    redirectCount: 0,
    checks,
    suspiciousFlags,
    tech: [],
    meta: {},
    error: sslError
      ? "SSL certificate error — this site may not be safe to visit"
      : "Could not reach this website",
  });
}
