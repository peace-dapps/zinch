import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Zinch — Trust infrastructure for crypto work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle grid pattern via radial gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(196, 255, 62, 0.08) 0%, transparent 50%)",
            display: "flex",
          }}
        />

        {/* Top row — brand + version */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                display: "flex",
                width: 60,
                height: 60,
                background: "#C4FF3E",
                clipPath:
                  "polygon(0% 0%, 55% 0%, 100% 100%, 45% 100%, 0% 40%, 40% 40%)",
              }}
            />
            <div
              style={{
                color: "#FAFAFA",
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: "-2px",
              }}
            >
              zinch
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
              color: "#C4FF3E",
              fontSize: 18,
              letterSpacing: "3px",
              fontFamily: "monospace",
            }}
          >
            <span>[V1]</span>
            <span style={{ color: "#A0A0A0" }}>LIVE ON DEVNET</span>
          </div>
        </div>

        {/* Middle — headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            position: "relative",
          }}
        >
          <div
            style={{
              color: "#FAFAFA",
              fontSize: 82,
              fontWeight: 700,
              letterSpacing: "-3px",
              lineHeight: 1.05,
              maxWidth: "900px",
            }}
          >
            Trust infrastructure for crypto work.
          </div>
          <div
            style={{
              color: "#A0A0A0",
              fontSize: 30,
              letterSpacing: "-0.5px",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            Lock funds in escrow on Solana. Complete the work. Get paid — even if
            the client ghosts.
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            paddingTop: "24px",
            borderTop: "1px solid #2A2A2A",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#A0A0A0",
              fontSize: 20,
              letterSpacing: "3px",
              fontFamily: "monospace",
            }}
          >
            <span>BUILT ON</span>
            <span style={{ color: "#C4FF3E" }}>SOLANA</span>
          </div>
          <div
            style={{
              color: "#606060",
              fontSize: 18,
              letterSpacing: "3px",
              fontFamily: "monospace",
            }}
          >
            ZINCH.APP
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}