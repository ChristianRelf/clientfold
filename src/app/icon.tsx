import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#242620",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "#f3f2ed",
          clipPath: "polygon(0 0, 68% 0, 100% 28%, 100% 100%, 0 100%)",
          display: "flex",
          flexDirection: "column",
          height: 42,
          justifyContent: "flex-end",
          paddingBottom: 9,
          position: "relative",
          width: 34,
        }}
      >
        <div style={{ background: "#5d6857", display: "flex", height: 3, width: 19 }} />
        <div style={{ background: "#5d6857", display: "flex", height: 3, marginTop: 5, width: 13 }} />
        <div
          style={{
            borderBottom: "2px solid #9ba394",
            borderLeft: "2px solid #9ba394",
            display: "flex",
            height: 12,
            position: "absolute",
            right: 0,
            top: 0,
            width: 11,
          }}
        />
      </div>
    </div>,
    size,
  );
}
