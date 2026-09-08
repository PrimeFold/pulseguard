import { Metadata } from "next";
import { DocsClientView } from "@/components/docs/DocsClientView";

export const metadata: Metadata = {
  title: "Documentation & API Reference | PulseGuard",
  description:
    "System architecture, telemetry ingestion endpoint specifications, deterministic anomaly clustering, and autonomous SRE agent documentation.",
};

export default function DocsPage() {
  return <DocsClientView />;
}
