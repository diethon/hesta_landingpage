"use client";
import { useEffect } from "react";
import { endIncident, useDemo } from "@/lib/demoStore";
import { useTr } from "@/lib/i18n";

// Lớp phủ khi người xem bấm "Mô phỏng rò gas": viền đỏ toàn trang + thông báo kiểu điện thoại.
export default function IncidentLayer() {
  const tr = useTr();
  const { incident } = useDemo();

  useEffect(() => {
    const root = document.documentElement;
    if (incident) root.dataset.alert = "gas";
    else delete root.dataset.alert;
  }, [incident]);

  useEffect(() => {
    if (!incident) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && endIncident();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [incident]);

  if (!incident) return null;
  return (
    <>
      <div className="alert-frame" aria-hidden="true" />
      <div className="toasts" role="status" aria-live="assertive">
        <div className="toast toast-crit">
          <small>{tr("HESTA · vừa xong · mô phỏng")}</small>
          <b>{tr("Phát hiện khí gas ở Bếp")}</b>
          <span>{tr("Đã tắt bếp từ, mở quạt hút và báo cho mọi người trong nhà.")}</span>
        </div>
        {incident.stage === "ticket" && (
          <div className="toast">
            <small>{tr("HESTA · bảo trì")}</small>
            <b>{tr("Đã tạo phiếu #MT-{n}", { n: incident.ticket })}</b>
            <span>{tr("Kiểm tra đường ống gas bếp · chờ kỹ thuật viên báo giá.")}</span>
          </div>
        )}
        <button type="button" className="toast-end" onClick={endIncident}>{tr("Kết thúc mô phỏng")}</button>
      </div>
    </>
  );
}
