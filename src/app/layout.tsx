import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ variable: "--font-sans", subsets: ["latin", "vietnamese"] });
const brand = Montserrat({ variable: "--font-brand", subsets: ["latin", "vietnamese"], weight: ["500", "800"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "HESTA · Smart Home System",
  description: "HESTA gom cảm biến, thiết bị và kịch bản vào một bản sao số của ngôi nhà: theo dõi realtime, phát hiện bất thường, tự động hóa.",
  icons: { icon: "/brand/hesta-mark.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${sans.variable} ${brand.variable} ${mono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
