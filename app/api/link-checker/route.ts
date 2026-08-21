export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface LinkResult {
  url: string;
  status: number | null;
  ok: boolean;
  redirectTo?: string;
  error?: string;
}

async function checkOne(url: string): Promise<LinkResult> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Toolsz LinkChecker/1.0)",
        Accept: "*/*",
      },
    });
    return {
      url,
      status: res.status,
      ok: res.ok,
      redirectTo: res.url !== url ? res.url : undefined,
    };
  } catch (err) {
    return { url, status: null, ok: false, error: err instanceof Error ? err.message : "Error" };
  }
}

// Process with concurrency limit
async function checkBatch(urls: string[], concurrency = 8): Promise<LinkResult[]> {
  const results: LinkResult[] = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const settled = await Promise.allSettled(batch.map(checkOne));
    settled.forEach((s, j) => {
      results.push(s.status === "fulfilled" ? s.value : { url: batch[j], status: null, ok: false, error: "Failed" });
    });
  }
  return results;
}

export async function POST(req: Request) {
  const body = await req.json();
  const urls: string[] = (body.urls ?? []).slice(0, 100); // max 100 links

  if (!urls.length) return Response.json({ results: [] });

  const results = await checkBatch(urls);
  return Response.json({ results });
}
