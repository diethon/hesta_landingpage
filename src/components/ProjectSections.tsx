"use client";
import { useEffect, useRef } from "react";
import { FAQ, TIMELINE } from "@/content/project";
import { clamp, runWhileVisible } from "@/lib/motion";
import { useTr } from "@/lib/i18n";

export function Timeline() {
  const tr = useTr();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = ref.current!, line = sec.querySelector<HTMLElement>(".tl-fill")!, items = [...sec.querySelectorAll<HTMLElement>(".tl li")];
    return runWhileVisible(sec, () => {
      const r = sec.querySelector(".tl")!.getBoundingClientRect();
      const p = clamp((innerHeight * 0.65 - r.top) / r.height);
      line.style.transform = `scaleY(${p})`;
      items.forEach((li, i) => li.classList.toggle("in", p >= (i + 0.2) / items.length));
    });
  }, []);
  return (
    <section className="wrap timeline" id="journey" ref={ref}>
      <div className="sec-head"><div className="eyebrow">{tr("Hành trình")}</div><h2>{tr("Từ ý tưởng đến buổi bảo vệ.")}</h2></div>
      <ol className="tl">
        <span className="tl-line"><i className="tl-fill" /></span>
        {TIMELINE.map((t) => (
          <li key={t.title} data-status={t.status}>
            <span className="tl-dot" />
            <b>{tr(t.title)}</b>
            <span>{tr(t.desc)}</span>
            {t.status === "doing" && <em>{tr("Đang thực hiện")}</em>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Faq() {
  const tr = useTr();
  return (
    <section className="wrap faq" id="faq">
      <div className="sec-head"><div className="eyebrow">{tr("Câu hỏi thường gặp")}</div><h2>{tr("Bạn có thể đang thắc mắc.")}</h2></div>
      <div className="faq-list">
        {FAQ.map(([q, a]) => (
          <details key={q}><summary>{tr(q)}</summary><p>{tr(a)}</p></details>
        ))}
      </div>
    </section>
  );
}
