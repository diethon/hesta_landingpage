import Landing from "@/components/Landing";
import { LangProvider } from "@/lib/i18n";

export default function Home() {
  return <LangProvider lang="vi"><Landing /></LangProvider>;
}
