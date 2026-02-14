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
          background: "linear-gradient(135deg, #0e7490, #6d28d9)",
          borderRadius: "36px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {/* Five dots representing the 5 AI models */}
          <div style={{ display: "flex", gap: "6px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.95)",
                display: "flex",
              }}
            />
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.85)",
                display: "flex",
              }}
            />
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
                display: "flex",
              }}
            />
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.55)",
                display: "flex",
              }}
            />
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.4)",
                display: "flex",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1,
              display: "flex",
            }}
          >
            AI
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
