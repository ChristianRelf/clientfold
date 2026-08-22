import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ClientFold — Stop chasing your clients";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Restrained, recognisable branded OG image. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0c0e12",
          color: "#f5f6f8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f5f6f8" }} />
          ClientFold
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -2, lineHeight: 1.02 }}>
            Stop chasing
            <br />
            your clients.
          </div>
          <div style={{ fontSize: 32, color: "#9aa0aa" }}>
            Approvals, files, invoices and feedback in one clean client portal.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, color: "#9aa0aa" }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#f59e0b" }} />
          clientfold.com
        </div>
      </div>
    ),
    size,
  );
}
