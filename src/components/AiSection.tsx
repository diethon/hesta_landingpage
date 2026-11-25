"use client";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { Story } from "./Story";
import { useTr } from "@/lib/i18n";

// Nội dung bám theo tính năng thật trong hesta_frontend:
// té ngã = EmergencyFallModal (SOS đếm ngược 30s), giọng nói = VoiceAssistant (vi-VN, lệnh ghép, TTS),
// gợi ý = RecommendationsPage (học thói quen theo giờ, duyệt thành quy tắc).
const TABS = [
  { id: "fall", tag: "AI CAMERA", title: "Phát hiện té ngã", desc: "Camera nhận diện tư thế. Có người ngã, HESTA bật SOS và đếm ngược 30 giây trước khi tự gọi hỗ trợ." },
  { id: "voice", tag: "VOICE", title: "Ra lệnh bằng giọng nói", desc: "Nói tiếng Việt tự nhiên, kể cả nhiều lệnh trong một câu. HESTA làm xong và trả lời bằng giọng nói." },
  { id: "suggest", tag: "SMART", title: "Gợi ý từ thói quen", desc: "HESTA để ý việc bạn hay làm vào cùng một giờ và đề xuất tự động hóa. Bạn chỉ cần bấm đồng ý." },
] as const;
type TabId = (typeof TABS)[number]["id"];
const CYCLE = 9000;

function FallDemo() {
  const tr = useTr();
  const [n, setN] = useState(30);
  useEffect(() => {
    let ticks = 0; // SOS hiện sau ~2.6s, bắt đầu đếm từ giây thứ 3
    const id = setInterval(() => { if (++ticks >= 3) setN((v) => Math.max(0, v - 1)); }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="ai-fall">
      <div className="cam-hud"><span className="rec">● REC</span> {tr("CAM · Phòng khách")}</div>
      <svg className="cam-scene" viewBox="0 0 400 250" aria-hidden="true">
        <rect x="0" y="190" width="400" height="60" className="cam-floor" />
        <rect x="250" y="120" width="120" height="70" rx="10" className="cam-sofa" />
        <g className="pose">
          <rect className="bbox" x="150" y="52" width="70" height="140" rx="6" />
          <circle cx="185" cy="72" r="12" />
          <path d="M185 84V138M185 98l-24 22M185 98l24 22M185 138l-16 50M185 138l16 50" />
        </g>
      </svg>
      <span className="pose-tag">{tr("Đang theo dõi tư thế")}</span>
      <span className="pose-tag alert">{tr("Phát hiện té ngã")}</span>
      <div className="sos">
        <svg viewBox="0 0 44 44" className="sos-ring" aria-hidden="true"><circle cx="22" cy="22" r="19" /><circle cx="22" cy="22" r="19" style={{ strokeDashoffset: 1 - n / 30 }} pathLength={1} /></svg>
        <div><b>SOS · {String(n).padStart(2, "0")}s</b><span>{tr("Không xác nhận sẽ bật còi và gọi hỗ trợ")}</span></div>
        <div className="sos-btns"><span>{tr("Tôi ổn")}</span><span className="danger">{tr("Gọi ngay")}</span></div>
      </div>
    </div>
  );
}

const SPOKEN = "Tắt đèn phòng khách và bật điều hòa 26 độ";
function VoiceDemo() {
  const tr = useTr(), spoken = tr(SPOKEN);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) { const t = setTimeout(() => setChars(spoken.length), 0); return () => clearTimeout(t); }
    const id = setInterval(() => setChars((c) => (c >= spoken.length ? c : c + 1)), 55);
    return () => clearInterval(id);
  }, [spoken]);
  const done = chars >= spoken.length;
  return (
    <div className={`ai-voice ${done ? "done" : ""}`}>
      <div className="mic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3" /></svg></div>
      <div className="wave" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 6) * 0.09}s` }} />)}</div>
      <p className="said"><small>{tr("Bạn vừa nói")}</small>“{spoken.slice(0, chars)}<span className="caret" />”</p>
      <div className="subcmds">
        <span>✓ {tr("Đèn phòng khách · TẮT")}</span>
        <span>✓ {tr("Điều hòa · BẬT 26°C")}</span>
      </div>
      <p className="reply"><small>{tr("HESTA trả lời")}</small>{tr("Đã tắt đèn phòng khách và bật điều hòa 26 độ.")}</p>
    </div>
  );
}

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const OFFS = [-6, 4, -2, 7, -4, 2, -1]; // lệch phút quanh 22:30
function SuggestDemo() {
  const tr = useTr();
  return (
    <div className="ai-suggest">
      <div className="habit">
        <div className="habit-axis"><span>21:00</span><span>22:00</span><span>23:00</span><span>24:00</span></div>
        {DAYS.map((d, i) => (
          <div className="habit-row" key={d}>
            <b>{tr(d)}</b>
            <span className="habit-track"><i style={{ left: `${((90 + OFFS[i]) / 180) * 100}%`, animationDelay: `${0.15 + i * 0.18}s` }} /></span>
          </div>
        ))}
        <span className="habit-line" />
      </div>
      <div className="sg-card">
        <small>{tr("Gợi ý mới · độ tin cậy cao")}</small>
        <b>{tr("Tắt đèn phòng khách lúc 22:30 mỗi ngày?")}</b>
        <span className="sg-bar"><i /></span>
        <div className="sg-btns"><span className="ok">{tr("Tạo quy tắc")}</span><span>{tr("Để sau")}</span></div>
        <span className="sg-toast">{tr("Đã tạo quy tắc tự động")}</span>
      </div>
    </div>
  );
}

export default function AiSection() {
  const tr = useTr();
  const [tab, setTab] = useState<TabId>("fall");
  const [round, setRound] = useState(0); // đổi key để chạy lại animation
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 });
    io.observe(ref.current!);
    const id = setInterval(() => {
      if (!visible || document.hidden) return;
      setTab((t) => TABS[(TABS.findIndex((x) => x.id === t) + 1) % TABS.length].id);
      setRound((r) => r + 1);
    }, CYCLE);
    return () => { clearInterval(id); io.disconnect(); };
  }, [round]);

  const pick = (id: TabId) => { setTab(id); setRound((r) => r + 1); };

  return (
    <section className="wrap ai" id="ai" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">{tr("Làm gì · 04 · Trợ lý AI")}</div>
        <h2>{tr("Một trợ lý biết nhìn, biết nghe và biết học.")}</h2>
        <Story time="21:40">{tr("Có người trượt chân ở phòng khách. Camera nhận ra, SOS bắt đầu đếm ngược.")}</Story>
      </div>
      <div className="ai-grid">
        <div className="ai-tabs" role="tablist" aria-label={tr("Tính năng AI")}>
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" id={`ai-${t.id}`} aria-selected={tab === t.id} aria-controls="ai-stage" onClick={() => pick(t.id)}>
              <small>{t.tag}</small>
              <b>{tr(t.title)}</b>
              <span>{tr(t.desc)}</span>
              {tab === t.id && <i className="ai-progress" key={round} style={{ animationDuration: `${CYCLE}ms` }} />}
            </button>
          ))}
        </div>
        <div className="ai-stage" id="ai-stage" role="tabpanel" aria-labelledby={`ai-${tab}`} key={`${tab}-${round}`}>
          {tab === "fall" && <FallDemo />}
          {tab === "voice" && <VoiceDemo />}
          {tab === "suggest" && <SuggestDemo />}
          <span className="demo-note">{tr("Minh họa")}</span>
        </div>
      </div>
    </section>
  );
}
