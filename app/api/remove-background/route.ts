import { NextRequest, NextResponse } from "next/server";

// This route must run on the Node.js runtime (not Edge) — it depends on
// onnxruntime-node and sharp, both native addons that Edge can't execute.
export const runtime = "nodejs";
// Give slow cold starts (first-time model download + ONNX session init on a
// fresh serverless instance) room to finish. Vercel caps this per-plan —
// this just requests the max we're allowed.
export const maxDuration = 60;

// @imgly/background-removal-node doesn't ship the ONNX model/wasm files in the
// npm package itself (they're too large for the registry). By default it looks
// for them on the local filesystem next to the package, which doesn't exist
// unless you vendor them yourself. Pointing publicPath at IMG.LY's CDN makes it
// fetch them over plain server-side fetch() instead — no browser CORS/COEP
// concerns here since this runs in Node, not a browser sandbox.
const MODEL_PUBLIC_PATH =
  "https://staticimgly.com/@imgly/background-removal-node/1.4.5/dist/";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Image is too large (max 20MB)." },
        { status: 413 }
      );
    }

    // Dynamic import keeps the (fairly heavy) native deps out of routes that
    // don't need them, and out of any build step that doesn't touch this file.
    const { removeBackground } = await import("@imgly/background-removal-node");

    // Pass the File itself (it's a Blob subclass and already carries the
    // correct .type, e.g. "image/webp"). Passing a bare ArrayBuffer instead
    // makes the library wrap it as `new Blob([data])` with NO mime type,
    // which fails format detection with "Unsupported format: " (empty).
    //
    // NOTE: We tried adding a pre-resize step here using a direct
    // `import("sharp")` call (to speed up large images — see git history/
    // conversation if resurrecting this). It broke sharp's native binary
    // loading on Windows dev (ERR_DLOPEN_FAILED) even though the library's
    // own internal use of the same sharp package works fine — a bundler/
    // native-addon interaction bug, not a config problem with sharp itself.
    // Reverted. Don't re-add a second top-level sharp import without solving
    // that first.
    const resultBlob = await removeBackground(file, {
      publicPath: MODEL_PUBLIC_PATH,
      // "small" (~44MB) — good balance of quality vs. cold-start/inference time
      // for a request/response API route. "medium" (~88MB) is available if
      // quality complaints outweigh the latency cost.
      model: "small",
      output: { format: "image/png", quality: 1 },
    });

    const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        // Never cache/store — this is a transient per-request computation.
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Server-side background removal failed:", err);
    return NextResponse.json(
      { error: "Failed to remove background on the server." },
      { status: 500 }
    );
  }
}
  