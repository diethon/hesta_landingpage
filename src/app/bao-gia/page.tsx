import type { Metadata } from "next";
import PricingPage from "@/components/PricingPage";
import { LangProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Bảng giá thiết bị · HESTA",
  description: "Giá tham khảo và giải thích cách hoạt động của từng thiết bị nhà thông minh HESTA. Tự tính chi phí thiết bị cho ngôi nhà của bạn.",
};

export default function Pricing() {
  return <LangProvider lang="vi"><PricingPage /></LangProvider>;
}
