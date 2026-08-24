import type { Metadata } from "next";
import LabApp from "./research-lab";
import "./lab.css";

export const metadata: Metadata = {
  title: "Research Lab | Coding Intelligence Field Study",
  description: "The applications, harnesses, audit tooling, and evidence system behind the coding intelligence field study.",
};

export default function ResearchLabPage() {
  return <LabApp />;
}
