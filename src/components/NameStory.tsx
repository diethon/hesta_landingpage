"use client";
import { useEffect, useRef } from "react";
import { HMark } from "./Logo";
import { clamp, runWhileVisible, stickyProgress } from "@/lib/motion";
import { useTr } from "@/lib/i18n";

const ACRO = [
  ["H", "Home", "Ngôi nhà là trung tâm, mọi thứ bắt đầu từ mặt bằng thật của bạn."],
  ["E", "Environment", "Nhiệt độ, độ ẩm, khí gas, ánh sáng: môi trường sống được đo liên tục."],
  ["S", "System", "Một hệ thống duy nhất cho thiết bị, phòng, thành viên và kịch bản."],
  ["T", "Technology", "IoT, MQTT, digital twin và phát hiện bất thường chạy phía sau."],
  ["A", "Assistant", "Một trợ lý tự vận hành, nhắc bạn đúng lúc và xử lý thay bạn."],
];

export default function NameStory() {
  const tr = useTr();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = ref.current!;
    const l = sec.querySelector<SVGElement>(".h-l")!, r = sec.querySelector<SVGElement>(".h-r")!, c = sec.querySelector<SVGElement>(".h-c")!;
    const labels = [...sec.querySelectorAll<HTMLElement>(".ns-label")];
    const rows = [...sec.querySelectorAll<HTMLElement>(".acro li")];
    return runWhileVisible(sec, () => {
      const p = stickyProgress(sec), k = clamp(p / 0.4), e = 1 - (1 - k) ** 3;
      l.style.transform = `translate(${-(1 - e) * 160}px, ${(1 - e) * 90}px)`;
      r.style.transform = `translate(${(1 - e) * 160}px, ${-(1 - e) * 90}px)`;
      c.style.opacity = String(clamp((k - 0.55) / 0.45));
      labels.forEach((el, i) => (el.style.opacity = String(clamp((k - 0.3 - i * 0.2) / 0.25))));
      rows.forEach((el, i) => el.classList.toggle("on", p > 0.42 + i * 0.1));
    });
  }, []);

  return (
    <section className="scrub" id="name" ref={ref} style={{ height: "300vh" }}>
      <div className="sticky"><div className="wrap split">
        <div className="ns-visual">
          <HMark className="ns-mark" title={tr("Logo HESTA")} />
          <span className="ns-label" style={{ left: "2%", top: "8%" }}>{tr("Khối trái · thiết bị trong nhà")}</span>
          <span className="ns-label" style={{ left: "38%", top: "52%" }}>{tr("Bậc nối · dòng dữ liệu")}</span>
          <span className="ns-label" style={{ right: "0%", bottom: "6%" }}>{tr("Khối phải · hệ thống & bạn")}</span>
        </div>
        <div className="ns-text">
          <div className="eyebrow">{tr("Tên & biểu tượng")}</div>
          <h2>{tr("HESTA, ngọn lửa giữ ấm ngôi nhà số.")}</h2>
          <p className="lead">{tr("Tên lấy cảm hứng từ Hestia, nữ thần giữ lửa của mái ấm trong thần thoại Hy Lạp. Logo là hai mảng tường lệch tầng, nối với nhau bằng một bậc thang: dữ liệu đi lên từ thiết bị tới hệ thống, và HESTA đứng đúng ở chỗ nối đó.")}</p>
          <ol className="acro">
            {ACRO.map(([ch, en, vi]) => (
              <li key={ch}><b>{ch}</b><span><strong>{en}</strong>{tr(vi)}</span></li>
            ))}
          </ol>
        </div>
      </div></div>
    </section>
  );
}
