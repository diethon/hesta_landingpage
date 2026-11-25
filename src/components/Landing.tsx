"use client";
import Intro from "./Intro";
import IncidentLayer from "./IncidentLayer";
import Hero from "./Hero";
import NameStory from "./NameStory";
import Problem from "./Problem";
import BeforeAfter from "./BeforeAfter";
import PlanSection from "./PlanSection";
import AnomalySection from "./AnomalySection";
import DaySection from "./DaySection";
import AiSection from "./AiSection";
import Playground from "./Playground";
import Features from "./Features";
import Roles from "./Roles";
import EnergySection from "./EnergySection";
import Security from "./Security";
import Platforms from "./Platforms";
import TechFlow from "./TechFlow";
import { Faq, Timeline } from "./ProjectSections";
import InstallSection from "./InstallSection";
import FinalCta from "./FinalCta";
import SectionDivider from "./SectionDivider";
import BackToTop from "./BackToTop";
import Presenter from "./Presenter";
import { Logo } from "./Logo";
import { DASHBOARD_URL } from "@/content/project";
import { useLang, useTr } from "@/lib/i18n";

// Màu nền 2 phía của mỗi đường phân cách phải khớp với section liền trên/dưới.
const BG = "#f8fcff", SKY = "#eef7fb", DAY = "#cfe6f3", INK = "#0f1b26";

export default function Landing() {
  const tr = useTr(), lang = useLang();
  return (
    <>
      <Intro />
      <IncidentLayer />
      <Presenter />
      <BackToTop />
      <header className="site-header">
        <div className="wrap">
          <a href="#top" aria-label={tr("HESTA, về đầu trang")}><Logo tagline={false} /></a>
          <nav aria-label={tr("Mục lục")}>
            <a href="#name">{tr("Câu chuyện")}</a>
            <a href="#twin">{tr("Làm gì")}</a>
            <a href="#playground">{tr("Thử ngay")}</a>
            <a href="#energy">{tr("Tiết kiệm")}</a>
            <a href="#install">{tr("Lắp đặt")}</a>
            <a href="#journey">{tr("Đồ án")}</a>
          </nav>
          <div className="head-actions">
            <a className="lang-switch" href={lang === "vi" ? "/en" : "/"} hrefLang={lang === "vi" ? "en" : "vi"} aria-label={lang === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}>
              <span data-on={lang === "vi"}>VI</span><span data-on={lang === "en"}>EN</span>
            </a>
            <a className="btn btn-ink btn-sm" href={`${DASHBOARD_URL}/login`}>{tr("Vào Dashboard")}</a>
          </div>
        </div>
      </header>
      <main>
        <Hero />
        <SectionDivider top={BG} bottom={BG} />
        <NameStory />
        <Problem />
        <BeforeAfter />
        <SectionDivider top={BG} bottom={SKY} />
        <PlanSection />
        <SectionDivider top={SKY} bottom={BG} />
        <AnomalySection />
        <SectionDivider top={BG} bottom={DAY} />
        <DaySection />
        <SectionDivider top={DAY} bottom={BG} />
        <AiSection />
        <Playground />
        <Features />
        <Roles />
        <EnergySection />
        <SectionDivider top={BG} bottom={SKY} />
        <Security />
        <SectionDivider top={SKY} bottom={BG} />
        <Platforms />
        <TechFlow />
        <Timeline />
        <Faq />
        <SectionDivider top={BG} bottom={SKY} />
        <InstallSection />
        <SectionDivider top={SKY} bottom={BG} />
        <FinalCta />
        <SectionDivider top={BG} bottom={INK} />
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <Logo tone="light" />
          <p>Home · Environment · System · Technology · Assistant</p>
          <p className="muted">{tr("Đồ án Capstone FPTU · Dữ liệu trên trang là minh họa.")}</p>
          <p className="muted">{tr("Mẹo: nhấn P để vào chế độ trình chiếu.")}</p>
        </div>
      </footer>
    </>
  );
}
