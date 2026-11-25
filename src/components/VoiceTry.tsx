"use client";
import { useEffect, useRef, useState } from "react";
import { demo, setLight, type Room } from "@/lib/demoStore";
import { useLang, useTr } from "@/lib/i18n";

type Rec = { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void };
type RecCtor = new () => Rec;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

// Tên phòng (đã bỏ dấu), tiếng Việt + tiếng Anh.
const ROOM_WORDS: [Room, RegExp][] = [
  ["living", /phong khach|living/], ["bed", /phong ngu|bedroom/], ["kitchen", /bep|kitchen/], ["wc", /wc|nha tam|ve sinh|bathroom/],
];

/** Hiểu vài lệnh đơn giản (Việt/Anh); trả về danh sách việc đã làm (câu tiếng Việt gốc để dịch). Lệnh ghép tách theo "và/rồi/and/then". */
export function runCommand(text: string): string[] {
  const parts = norm(text).split(/\s+(?:va|roi|and|then)\s+|,/).filter(Boolean);
  const done: string[] = [];
  for (const p of parts) {
    const room = ROOM_WORDS.find(([, re]) => re.test(p))?.[0];
    const on = /\b(bat|mo|turn on|switch on)\b/.test(p), off = /\b(tat|turn off|switch off)\b/.test(p);
    if (/dieu hoa|may lanh|\bac\b|air ?con/.test(p) && (on || off)) { demo.set({ ac: on }); done.push(on ? "đã bật điều hòa" : "đã tắt điều hòa"); }
    else if (/den|light/.test(p) && (on || off)) { setLight(on, room); done.push(on ? "đã bật đèn" : "đã tắt đèn"); }
    else if (/mo khoa|mo cua|unlock|open the door/.test(p)) { demo.set({ locked: false }); done.push("đã mở khóa cửa"); }
    else if (/khoa|lock/.test(p)) { demo.set({ locked: true }); done.push("đã khóa cửa chính"); }
    else if (/tu dong|mac dinh|auto/.test(p)) { demo.set({ lights: "auto" }); done.push("đèn trở lại chế độ tự động"); }
  }
  return done;
}

function speak(text: string, lang: string) {
  try {
    const v = speechSynthesis.getVoices().find((x) => x.lang?.toLowerCase().startsWith(lang));
    if (!v) return; // không có giọng phù hợp thì chỉ hiện chữ
    const u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch {}
}

export default function VoiceTry({ id = "vt" }: { id?: string }) {
  const tr = useTr(), lang = useLang();
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [text, setText] = useState("");
  const [supported, setSupported] = useState(false);
  const recRef = useRef<Rec | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
    const t = setTimeout(() => setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition)), 0);
    return () => { clearTimeout(t); recRef.current?.stop(); };
  }, []);

  const handle = (said: string) => {
    if (!said.trim()) return;
    setHeard(said);
    const done = runCommand(said).map((d) => tr(d));
    const r = done.length ? done.join(", ").replace(/^./, (c) => c.toUpperCase()) + "." : tr("Mình chưa hiểu. Thử: “bật đèn phòng ngủ”, “tắt điều hòa và khóa cửa”.");
    setReply(r); speak(r, lang);
  };

  const listen = () => {
    if (listening) { recRef.current?.stop(); return; }
    const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = lang === "en" ? "en-US" : "vi-VN"; rec.interimResults = false;
    rec.onresult = (e) => handle(e.results[0][0].transcript);
    rec.onerror = () => setReply(tr("Không nghe rõ hoặc micro bị chặn. Bạn có thể gõ lệnh bên dưới."));
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true); setReply(tr("Đang nghe…"));
    rec.start();
  };

  return (
    <div className="voice-try">
      <div className="vt-row">
        {supported && (
          <button type="button" className={`vt-mic ${listening ? "on" : ""}`} onClick={listen} aria-pressed={listening} aria-label={listening ? tr("Dừng nghe") : tr("Nói lệnh")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3" /></svg>
          </button>
        )}
        <form className="vt-form" onSubmit={(e) => { e.preventDefault(); handle(text); setText(""); }}>
          <label htmlFor={`${id}-input`} className="sr-only">{tr("Lệnh cho ngôi nhà")}</label>
          <input id={`${id}-input`} className="vt-input" value={text} onChange={(e) => setText(e.target.value)} placeholder={tr("Ví dụ: bật đèn và khóa cửa")} autoComplete="off" />
          <button type="submit">{tr("Gửi")}</button>
        </form>
      </div>
      <p className="vt-out" aria-live="polite">{heard && <><b>“{heard}”</b> · </>}{reply || tr("Bấm micro rồi nói, hoặc gõ lệnh.")}</p>
    </div>
  );
}
