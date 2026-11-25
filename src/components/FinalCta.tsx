"use client";
import Particles from "./Particles";
import { useTr } from "@/lib/i18n";

export default function FinalCta() {
  const tr = useTr();
  return (
    <section className="final" id="start">
      <Particles className="final-canvas" shapes={["logo"]} count={5000} />
      <div className="wrap final-copy">
        <div className="eyebrow">Web · Mobile · IoT</div>
        <h2>{tr("Thắp lửa cho ngôi nhà số của bạn.")}</h2>
        <p className="lead">{tr("Thêm ngôi nhà đầu tiên, kết nối thiết bị và để HESTA làm phần còn lại.")}</p>
        <div className="cta-row center">
          <a className="btn btn-ink" href="#top">{tr("Tạo tài khoản")}</a>
          <a className="btn btn-glass" href="#features">{tr("Xem tính năng")}</a>
        </div>
      </div>
    </section>
  );
}
