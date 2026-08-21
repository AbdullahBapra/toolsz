import { ImageResponse } from "next/og";

export const alt = "Toolsz — Free Online File Utilities";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #8B5CF6 100%)",
          padding: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            marginBottom: "32px",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12.83 2 8.77 4.09a1 1 0 0 1 0 1.78l-8.77 4.09a2 2 0 0 1-1.66 0L2.4 7.87a1 1 0 0 1 0-1.78L11.17 2a2 2 0 0 1 1.66 0Z" />
            <path d="m2.4 12.09 8.77 4.09a2 2 0 0 0 1.66 0l8.77-4.09" />
            <path d="m2.4 17.09 8.77 4.09a2 2 0 0 0 1.66 0l8.77-4.09" />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          Toolsz
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          219 Free Online Tools — PDF, Images &amp; Dev
        </div>

        {/* Sub-tagline */}
        <div
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            marginTop: "12px",
            letterSpacing: "0.02em",
          }}
        >
          No uploads · No watermarks · No signup · 100% private
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "18px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.04em",
          }}
        >
          toolsz.co
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
