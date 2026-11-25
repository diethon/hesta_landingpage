"use client";
import { useTr } from "@/lib/i18n";
// Các điểm đã xác minh trong backend_hesta: BCrypt (AuthServiceImpl), JWT cho REST + WebSocket
// (SecurityConfig, RealtimeWebSocketChannelInterceptor), OTP, giới hạn tần suất MQTT (MqttMessageReceiver).
const POINTS: [string, string][] = [
  ["Quyền do máy chủ quyết định", "Vai trò nền tảng (ADMIN/USER) tách bạch với vai trò trong nhà (OWNER/MEMBER). Mọi lệnh đều được kiểm tra quyền ở backend."],
  ["Đăng nhập an toàn", "Mật khẩu được băm bằng BCrypt, phiên đăng nhập dùng JWT, có xác thực OTP và đăng nhập Google."],
  ["Kênh realtime có xác thực", "Kết nối WebSocket phải mang token hợp lệ mới nhận được sự kiện của ngôi nhà."],
  ["Chống spam từ thiết bị", "Tin nhắn MQTT bị giới hạn tần suất; tin lỗi được đưa vào hàng đợi riêng để kiểm tra."],
];

export default function Security() {
  const tr = useTr();
  return (
    <section className="security-band" id="security"><div className="wrap security">
      <div className="sec-shield" aria-hidden="true">
        <svg viewBox="0 0 120 140"><path d="M60 6 10 24v40c0 34 22 58 50 70 28-12 50-36 50-70V24Z" /><path className="tick" d="M38 70l16 16 30-32" /></svg>
      </div>
      <div>
        <div className="eyebrow">{tr("Bảo mật & quyền riêng tư")}</div>
        <h2>{tr("Ngôi nhà của bạn, chỉ bạn mở được.")}</h2>
        <ul className="sec-points">
          {POINTS.map(([t, d]) => <li key={t}><b>{tr(t)}</b>{tr(d)}</li>)}
        </ul>
      </div>
    </div></section>
  );
}
