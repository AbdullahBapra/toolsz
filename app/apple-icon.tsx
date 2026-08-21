import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "40px",
          background: "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)",
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m12.83 2 8.77 4.09a1 1 0 0 1 0 1.78l-8.77 4.09a2 2 0 0 1-1.66 0L2.4 7.87a1 1 0 0 1 0-1.78L11.17 2a2 2 0 0 1 1.66 0Z" />
          <path d="m2.4 12.09 8.77 4.09a2 2 0 0 0 1.66 0l8.77-4.09" />
          <path d="m2.4 17.09 8.77 4.09a2 2 0 0 0 1.66 0l8.77-4.09" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
