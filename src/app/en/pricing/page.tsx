import type { Metadata } from "next";
import PricingPage from "@/components/PricingPage";
import { LangProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Device pricing · HESTA",
  description: "Reference prices and how each HESTA smart home device works. Estimate the device cost for your home.",
};

export default function PricingEn() {
  return <LangProvider lang="en"><PricingPage /></LangProvider>;
}
