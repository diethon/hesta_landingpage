"use client";
import type { PointerEvent } from "react";
import { useTr } from "@/lib/i18n";

// Icon nét đơn giản (24×24, stroke) thay cho emoji.
const I = {
  twin: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z M9 21v-6h6v6",
  pulse: "M3 12h4l3-7 4 14 3-7h4",
  wrench: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7Z",
  shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z M9 12l2 2 4-4",
  users: "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 20v-2a4 4 0 0 0-3-3.9 M16 2.1a4 4 0 0 1 0 7.8",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a2 2 0 0 0 3.4 0",
  fall: "M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M10 8l-4 4 3 2-2 7 M10 8h4l3 5h4 M14 8l-1 6 4 3v4",
  mic: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3",
  bulb: "M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2Z",
  cam: "M23 7l-7 5 7 5V7Z M3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
};

const FEATURES: [keyof typeof I, string, string, string][] = [
  ["twin", "REAL-TIME", "Digital twin 2D & 3D", "Mặt bằng sống: thiết bị đổi màu theo trạng thái thật."],
  ["pulse", "ANOMALY", "Phát hiện bất thường", "Ngưỡng có vùng trễ, xác nhận nhiều lần đọc để tránh báo nhầm."],
  ["wrench", "MAINTENANCE", "Phiếu bảo trì", "Tạo phiếu từ cảnh báo, theo dõi báo giá đến khi hoàn tất."],
  ["spark", "AUTOMATION", "Kịch bản & ngữ cảnh", "Hẹn giờ, theo cảm biến, bật cả cụm thiết bị bằng một chạm."],
  ["bolt", "ENERGY", "Năng lượng", "Biết thiết bị nào đang tiêu tốn điện nhiều nhất."],
  ["shield", "SECURITY", "An ninh & khẩn cấp", "Nhật ký an ninh, cảnh báo xâm nhập, liên hệ khẩn cấp."],
  ["users", "HOME ROLES", "Chủ nhà & thành viên", "OWNER quản lý, MEMBER dùng đúng thiết bị được chia sẻ."],
  ["bell", "NOTIFY", "Thông báo tức thì", "Đẩy về web và điện thoại ngay khi có sự kiện."],
  ["fall", "AI CAMERA", "Phát hiện té ngã", "Nhận diện người ngã, SOS đếm ngược 30 giây rồi tự gọi hỗ trợ."],
  ["mic", "VOICE", "Trợ lý giọng nói", "Ra lệnh tiếng Việt, nhiều thiết bị trong một câu, có phản hồi bằng giọng nói."],
  ["bulb", "SMART", "Gợi ý thông minh", "Học thói quen theo giờ, đề xuất quy tắc tự động khi đủ tin cậy."],
  ["cam", "LIVE", "Camera trực tiếp", "Xem hình ảnh trong nhà ngay trên trang chủ."],
];

function tilt(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  el.style.setProperty("--mx", `${(x + 0.5) * 100}%`); el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
}

export default function Features() {
  const tr = useTr();
  return (
    <section className="wrap features" id="features">
      <div className="sec-head">
        <div className="eyebrow">{tr("Tính năng")}</div>
        <h2>{tr("Từ cảm biến đến phiếu bảo trì, trong một nền tảng.")}</h2>
      </div>
      <div className="feat-grid">
        {FEATURES.map(([icon, tag, title, desc]) => (
          <article className="feat" key={title} onPointerMove={tilt} onPointerLeave={(e) => (e.currentTarget.style.transform = "")}>
            <svg viewBox="0 0 24 24" className="feat-icon" aria-hidden="true"><path d={I[icon]} /></svg>
            <span className="feat-tag">{tag}</span>
            <h3>{tr(title)}</h3>
            <p>{tr(desc)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
