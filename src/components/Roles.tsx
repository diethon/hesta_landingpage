"use client";
import { useState } from "react";
import { useTr } from "@/lib/i18n";

const ROLES = {
  OWNER: {
    label: "Chủ nhà",
    lead: "Toàn quyền với ngôi nhà của mình, yên tâm cả khi đi vắng.",
    items: ["Nhìn toàn bộ nhà trên một mặt bằng sống", "Nhận cảnh báo gas, rò nước, chuyển động lạ ngay lập tức", "Mời thành viên và chia sẻ đúng thiết bị cần thiết", "Tạo phiếu bảo trì, so sánh báo giá, theo dõi đến khi xong"],
  },
  MEMBER: {
    label: "Thành viên",
    lead: "Dùng nhà thông minh dễ như bật công tắc, không cần cài đặt gì.",
    items: ["Điều khiển các thiết bị được chủ nhà chia sẻ", "Chạy kịch bản có sẵn: đi ngủ, ra khỏi nhà, xem phim", "Nhận thông báo liên quan đến phòng của mình", "Không lo bấm nhầm vào thiết bị ngoài quyền"],
  },
  ADMIN: {
    label: "Quản trị nền tảng",
    lead: "Vận hành HESTA ổn định cho tất cả các ngôi nhà.",
    items: ["Quản lý người dùng, khóa hoặc mở tài khoản", "Quản lý danh mục thiết bị được hỗ trợ", "Theo dõi lịch sử an ninh và bất thường toàn hệ thống", "Phân quyền tách bạch với vai trò trong từng ngôi nhà"],
  },
} as const;
type Key = keyof typeof ROLES;

export default function Roles() {
  const tr = useTr();
  const [role, setRole] = useState<Key>("OWNER");
  const r = ROLES[role];
  return (
    <section className="wrap roles" id="benefits">
      <div className="sec-head">
        <div className="eyebrow">{tr("Bạn được gì")}</div>
        <h2>{tr("Mỗi người trong nhà, một trải nghiệm vừa vặn.")}</h2>
      </div>
      <div className="role-tabs" role="tablist" aria-label={tr("Vai trò")}>
        {(Object.keys(ROLES) as Key[]).map((k) => (
          <button key={k} role="tab" type="button" id={`tab-${k}`} aria-selected={role === k} aria-controls="role-panel" onClick={() => setRole(k)}>
            <small>{k}</small>{tr(ROLES[k].label)}
          </button>
        ))}
      </div>
      <div className="role-panel" id="role-panel" role="tabpanel" aria-labelledby={`tab-${role}`} key={role}>
        <p className="role-lead">{tr(r.lead)}</p>
        <ul>{r.items.map((it, i) => <li key={it} style={{ animationDelay: `${i * 70}ms` }}>{tr(it)}</li>)}</ul>
      </div>
      <div className="benefits">
        <div><b>{tr("An toàn hơn")}</b>{tr("Cảnh báo sớm thay vì phát hiện muộn.")}</div>
        <div><b>{tr("Tiết kiệm hơn")}</b>{tr("Biết thiết bị nào tốn điện, tắt khi không cần.")}</div>
        <div><b>{tr("Nhẹ đầu hơn")}</b>{tr("Nhà tự chạy theo kịch bản, sửa chữa có quy trình.")}</div>
      </div>
    </section>
  );
}
