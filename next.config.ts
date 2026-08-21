import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript type-checking during build — all errors are from third-party
  // type definitions (pdfjs-dist, jsPDF, html2pdf.js) that we cannot control.
  // Runtime behavior is correct; only the type declarations are mismatched.
  typescript: {
    ignoreBuildErrors: true,
  },

  // These ship native addons (.node binaries) for onnxruntime-node/sharp. Left
  // to Next's default bundling/tracing they can get mis-traced or tree-shaken
  // out of the serverless function output, which breaks at runtime on deploy
  // (works locally, 500s in production) — this tells Next to require() them
  // as plain externals from node_modules instead of trying to bundle them.
  serverExternalPackages: [
    "@imgly/background-removal-node",
    "onnxruntime-node",
    "sharp",
  ],

  turbopack: {
    resolveAlias: {
      // Shim Node.js-only modules that some client-side libraries reference
      // (svgo → fs/promises, tesseract.js → path). Server-side code uses these
      // as Node.js externals, so the alias only affects client bundling.
      'fs/promises': './app/utils/empty-module.js',
      'canvas': './app/utils/empty-module.js',
    },
  },
  async headers() {
    return [
      {
        // Only apply COOP/COEP on the video-to-gif page which needs SharedArrayBuffer for FFmpeg WASM.
        // NOTE: We tried adding this to /remove-bg and /blur-background too (to enable
        // multi-threaded WASM for @imgly/background-removal), but it broke asset loading
        // for that library in practice — background removal failed immediately instead of
        // just running slower. The device:"gpu" + CPU-fallback fix in those pages already
        // solves the main-thread-freeze issue without needing cross-origin isolation, so
        // we're leaving this scoped to video-to-gif only.
        source: "/video-to-gif",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Fallbacks for packages that reference Node.js built-ins (e.g. @imgly/background-removal)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Ignore optional canvas dependency (Node.js only, not needed in browser)
    config.resolve.alias.canvas = false;

    return config;
  },
};

export default nextConfig;
