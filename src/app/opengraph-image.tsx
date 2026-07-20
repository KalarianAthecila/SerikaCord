import { ImageResponse } from "next/og";

export const alt = "SerikaCord";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a103c 50%, #0a0a0a 100%)",
          color: "white",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glows */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "28px",
            background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #6d28d9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
            boxShadow: "0 0 60px rgba(139, 92, 246, 0.4)",
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "80px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            margin: 0,
            marginBottom: "16px",
            background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          SerikaCord
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "32px",
            color: "#a5a5a5",
            margin: 0,
            fontWeight: 500,
          }}
        >
          A modern Discord-like chat application
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
