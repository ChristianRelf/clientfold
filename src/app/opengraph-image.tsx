import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ClientFold — Do the work. ClientFold does the chasing.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f3f2ed", color: "#242620", padding: "68px 76px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, fontWeight: 700 }}>
        <div style={{ width: 34, height: 34, display: "flex", border: "2px solid #596453", background: "#e8e9e2" }} />
        ClientFold
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
        <div style={{ fontSize: 78, lineHeight: 0.98, letterSpacing: "-4px", fontWeight: 600 }}>Do the work.</div>
        <div style={{ marginTop: 12, fontSize: 78, lineHeight: 0.98, letterSpacing: "-4px", color: "#5d6857", fontStyle: "italic" }}>ClientFold does the chasing.</div>
        <div style={{ marginTop: 34, fontSize: 25, color: "#686a62" }}>Approvals, files and invoices—with polite follow-ups that send themselves.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #cbc9c0", paddingTop: 22, fontSize: 19, color: "#73766d" }}><span>The calm layer for client work</span><span>clientfold.com</span></div>
    </div>,
    size,
  );
}
