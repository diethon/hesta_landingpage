import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { LangProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "HESTA · Smart Home System",
  description: "HESTA brings sensors, devices and automations into one digital twin of your home: real-time monitoring, anomaly detection and automation.",
};

export default function HomeEn() {
  return <LangProvider lang="en"><Landing /></LangProvider>;
}
