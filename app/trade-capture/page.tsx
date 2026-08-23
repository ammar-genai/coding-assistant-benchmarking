import type { Metadata } from "next";
import { TradeCaptureApp } from "./trade-capture-app.tsx";
import "./trade-capture.css";

export const metadata: Metadata = {
  title: "Securitized Products Trade Capture | Synthetic Operations Lab",
  description: "A local-only mock trade capture workspace for securitized products.",
};

export default function TradeCapturePage() {
  return <TradeCaptureApp />;
}
