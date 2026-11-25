"use client";
import { useEffect, useRef } from "react";
import { HMark } from "./Logo";
import { clamp, runWhileVisible, stickyProgress } from "@/lib/motion";
import { useTr } from "@/lib/i18n";

// [nội dung, độ lệch x (vw), độ lệch y (vh), góc xoay] ở trạng thái "hỗn loạn"
const PAINS: [string, string, number, number, number][] = [
  ["5 hãng thiết bị", "5 ứng dụng khác nhau để điều khiển", -26, -22, -14],
  ["Rò rỉ gas", "chỉ biết khi đã ngửi thấy mùi", 24, -26, 11],
  ["Hóa đơn điện", "tăng mà không rõ thiết bị nào gây ra", -30, 18, 9],
  ["Đi vắng", "không biết ở nhà đang ra sao", 28, 20, -12],
  ["Điều hòa hỏng", "mới bắt đầu đi tìm thợ", -6, 30, 6],
  ["Cả nhà dùng chung", "ai cũng có toàn quyền, không ai quản lý", 6, -32, -7],
];

export default function Problem() {
  const tr = useTr();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = ref.current!;
    const cards = [...sec.querySelectorAll<HTMLElement>(".pain")];
    const msg = sec.querySelector<HTMLElement>(".pain-msg")!;
    return runWhileVisible(sec, () => {
      const p = stickyProgress(sec), k = clamp((p - 0.08) / 0.55), e = 1 - (1 - k) ** 3;
      cards.forEach((el, i) => {
        const [, , dx, dy, rot] = PAINS[i];
        el.style.transform = `translate(${dx * (1 - e)}vw, ${dy * (1 - e)}vh) rotate(${rot * (1 - e)}deg)`;
        el.dataset.done = String(k >= 1);
      });
      msg.style.opacity = String(clamp((p - 0.62) / 0.2));
      msg.style.transform = `translateY(${(1 - clamp((p - 0.62) / 0.2)) * 20}px)`;
    });
  }, []);

  return (
    <section className="scrub problem" id="problem" ref={ref} style={{ height: "240vh" }}>
      <div className="sticky"><div className="wrap problem-inner">
        <div className="problem-head">
          <div className="eyebrow eyebrow-crit">{tr("Vấn đề")}</div>
          <h2>{tr("Nhà càng nhiều thiết bị, càng khó quản lý.")}</h2>
        </div>
        <div className="pains">
          {PAINS.map(([t, d]) => (
            <div className="pain" key={t}><b>{tr(t)}</b><span>{tr(d)}</span></div>
          ))}
        </div>
        <div className="pain-msg"><HMark className="pain-mark" /> {tr("HESTA gom tất cả về một nơi.")}</div>
      </div></div>
    </section>
  );
}
