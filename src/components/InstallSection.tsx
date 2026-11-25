"use client";
import { useEffect, useRef, useState } from "react";
import { clamp, runWhileVisible } from "@/lib/motion";
import { useLang, useTr } from "@/lib/i18n";
import { getRuntimeApiBaseUrl, getRuntimeDashboardUrl } from "@/content/project";
import "./install.css";

interface PackageItem {
  code: string;
  name: string;
  nameEn: string;
  subtitle: string;
  subtitleEn: string;
  badge: string;
  badgeEn: string;
  estimatedPrice: number;
  installationFee: number;
  highlights: string[];
  highlightsEn: string[];
}

interface CreatedResult {
  contractId: string;
  code: string;
  claimToken: string;
  customerEmail: string;
  existingAccount: boolean;
}

interface CategoryDef {
  id: string;
  num: string;
  label: string;
  labelEn: string;
  desc: string;
  descEn: string;
  locations: string[];
  quantities: string[];
  purposes: string[];
}

interface CategorySelection {
  enabled: boolean;
  locations: string[];
  customLocation: string;
  estimatedQuantity: string;
  purposes: string[];
  note: string;
}

const UNKNOWN_QTY = "Chưa biết – Cần tư vấn";
const OTHER_LOC = "Khác";

const DEVICE_CATEGORIES: CategoryDef[] = [
  {
    id: "SMART_SWITCH",
    num: "01",
    label: "Công tắc thông minh",
    labelEn: "Smart Touch Switches",
    desc: "Điều khiển đèn, quạt, rèm qua điện thoại và giọng nói.",
    descEn: "Control lights, fans and curtains via app & voice.",
    locations: ["Phòng khách", "Phòng ngủ", "Nhà bếp", "Hành lang", "Ban công", OTHER_LOC],
    quantities: ["1–2 vị trí", "3–5 vị trí", "6–10 vị trí", UNKNOWN_QTY],
    purposes: ["Điều khiển đèn", "Điều khiển quạt", "Điều khiển rèm", "Điều khiển giọng nói"],
  },
  {
    id: "CAMERA_AI",
    num: "02",
    label: "Camera AI",
    labelEn: "Edge AI Camera",
    desc: "Giám sát cục bộ, nhận diện té ngã và bảo vệ gia đình.",
    descEn: "On-premise monitoring, fall detection & family safety.",
    locations: ["Phòng khách", "Phòng ngủ", "Sân trước", "Sân sau", "Hành lang", OTHER_LOC],
    quantities: ["1", "2", "3", "4", UNKNOWN_QTY],
    purposes: ["Nhận diện té ngã người lớn tuổi", "Giám sát thông thường", "Theo dõi người thân / trẻ nhỏ"],
  },
  {
    id: "SENSORS",
    num: "03",
    label: "Cảm biến thông minh",
    labelEn: "Smart Sensors",
    desc: "Cảm biến chuyển động PIR, nhiệt ẩm, khí gas, khói, cửa mở.",
    descEn: "PIR motion, climate, gas, smoke and door sensors.",
    locations: ["Nhà bếp", "Phòng khách", "Hành lang", "Phòng ngủ", "Cửa chính", OTHER_LOC],
    quantities: ["1–2 cảm biến", "3–5 cảm biến", "6+ cảm biến", UNKNOWN_QTY],
    purposes: ["Cảnh báo rò gas / khói", "Tự bật đèn khi có người (PIR)", "Đo nhiệt độ – độ ẩm", "Báo mở cửa ban đêm"],
  },
  {
    id: "GATE_MOTOR",
    num: "04",
    label: "Motor cổng & Cửa tự động",
    labelEn: "Smart Gate & Doors",
    desc: "Đóng mở cổng chính, cửa cuốn gara từ xa bằng điện thoại.",
    descEn: "Remote phone control for main gate and garage doors.",
    locations: ["Cổng chính", "Cửa cuốn gara", "Rèm phòng khách", OTHER_LOC],
    quantities: ["1", "2", UNKNOWN_QTY],
    purposes: ["Mở cổng từ xa qua điện thoại", "Cảnh báo quên đóng cổng", "Tự mở khi về nhà"],
  },
  {
    id: "LIGHTING_RGB",
    num: "05",
    label: "Đèn LED RGB & Chiếu sáng",
    labelEn: "RGB Ambient Lighting",
    desc: "Chiếu sáng theo ngữ cảnh thư giãn, tiếp khách, xem phim.",
    descEn: "Scene-based lighting for dining, cinema and relaxation.",
    locations: ["Phòng khách", "Phòng ngủ", "Phòng giải trí", "Hành lang", OTHER_LOC],
    quantities: ["1–2 bộ", "3–5 bộ", UNKNOWN_QTY],
    purposes: ["Đổi màu theo kịch bản", "Tự động bật/tắt theo giờ", "Giảm sáng ban đêm"],
  },
  {
    id: "AC_AI_HUB",
    num: "06",
    label: "Điều hòa IR & Trung tâm AI",
    labelEn: "AC Control & Voice AI Hub",
    desc: "Điều khiển điều hòa thông minh, giọng nói tiếng Việt & tiết kiệm điện.",
    descEn: "Smart AC control, Vietnamese voice & energy saving AI.",
    locations: ["Phòng khách", "Phòng ngủ chính", "Phòng ngủ 2", "Phòng làm việc", OTHER_LOC],
    quantities: ["1 phòng", "2 phòng", "3+ phòng", UNKNOWN_QTY],
    purposes: ["Điều khiển điều hòa IR", "Trợ lý giọng nói tiếng Việt", "Tối ưu tiền điện EVN"],
  },
];

const FALLBACK_PACKAGES: PackageItem[] = [
  {
    code: "STARTER_HOME",
    name: "Gói Khởi Đầu",
    nameEn: "Starter Smart Home",
    subtitle: "Cấu hình tham khảo cho căn hộ 1–2 phòng ngủ: chiếu sáng, điều hòa và theo dõi điện năng.",
    subtitleEn: "Reference setup for 1–2BR apartments: lighting, AC and energy tracking.",
    badge: "Tham khảo · Căn hộ",
    badgeEn: "Reference · Apartment",
    estimatedPrice: 4860000,
    installationFee: 800000,
    highlights: [
      "Nhóm Công tắc thông minh + Đèn LED RGB + Điều hòa IR",
      "Nhóm Cảm biến nhiệt ẩm & chuyển động tự động",
      "Bản sao số 2D/3D, kịch bản hẹn giờ & theo dõi hóa đơn EVN",
    ],
    highlightsEn: [
      "Smart Switches + RGB Lighting + IR AC Controller",
      "Climate & motion automation sensors",
      "2D/3D Digital Twin, smart schedules & EVN bill tracking",
    ],
  },
  {
    code: "SAFETY_EDGE_AI",
    name: "Gói An Toàn & Edge AI",
    nameEn: "Safety & Edge AI Suite",
    subtitle: "Cấu hình tham khảo cho gia đình có người lớn tuổi hoặc trẻ nhỏ: Camera AI té ngã, Motor cổng & cảm biến an toàn.",
    subtitleEn: "Reference setup for families with elders or kids: Edge AI fall camera, smart gate & hazard sensors.",
    badge: "Tham khảo · Phổ biến",
    badgeEn: "Reference · Popular",
    estimatedPrice: 9550000,
    installationFee: 1500000,
    highlights: [
      "Nhóm Camera Edge AI nhận diện té ngã cục bộ (bảo mật riêng tư)",
      "Nhóm Motor cổng tự động + Công tắc + Điều hòa IR",
      "Nhóm Cảm biến an toàn Gas/Khói/PIR & Trợ lý giọng nói tiếng Việt",
    ],
    highlightsEn: [
      "Local Edge AI fall-detection camera (private inference)",
      "Smart gate motor + switches + IR AC control",
      "Gas/Smoke/PIR safety sensors & Vietnamese voice assistant",
    ],
  },
  {
    code: "CUSTOM_HOME",
    name: "Tự chọn theo mặt bằng",
    nameEn: "Custom per Floorplan",
    subtitle: "Chưa rõ cần lắp gì? Chọn nhóm thiết bị quan tâm ở bên dưới, kỹ thuật viên HESTA sẽ khảo sát và lên phương án riêng.",
    subtitleEn: "Unsure what you need? Pick categories below and HESTA engineers will survey & design a tailored plan.",
    badge: "Linh hoạt nhất",
    badgeEn: "Most flexible",
    estimatedPrice: 0,
    installationFee: 1500000,
    highlights: [
      "Không cần biết trước mã sản phẩm hay số lượng chính xác",
      "Kỹ thuật viên khảo sát hạ tầng điện/Wi-Fi thực tế trước khi báo giá",
      "Chỉ lập hợp đồng chính thức sau khi 2 bên thống nhất phương án",
    ],
    highlightsEn: [
      "No need to know exact model codes or quantities upfront",
      "Engineers verify wiring & Wi-Fi before quoting",
      "Formal contract is issued only after both sides agree on the plan",
    ],
  },
];

const JOURNEY_STEPS = [
  ["01", "Đăng ký nhu cầu", "Nhập thông tin nhà & chọn nhóm thiết bị quan tâm (2 bước)."],
  ["02", "Tư vấn & Khảo sát", "Admin & kỹ thuật viên xác nhận vị trí, số lượng & hạ tầng điện."],
  ["03", "Báo giá & Hợp đồng", "Phát hành bảng kê mã thiết bị, đơn giá & ký điện tử chuẩn A4."],
  ["04", "Đặt cọc & Đối soát", "Chuyển khoản tài khoản công ty HESTA, Admin đối soát xác nhận."],
  ["05", "Bàn giao chìa khóa", "Admin tạo sẵn Nhà, Phòng & add trực tiếp thiết bị vào tài khoản."],
];

const formatVnd = (n: number) =>
  `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} đ`;

function createDefaultSelections(): Record<string, CategorySelection> {
  const init: Record<string, CategorySelection> = {};
  for (const cat of DEVICE_CATEGORIES) {
    init[cat.id] = {
      enabled: cat.id === "SMART_SWITCH" || cat.id === "CAMERA_AI",
      locations: cat.id === "CAMERA_AI" ? ["Phòng khách"] : cat.id === "SMART_SWITCH" ? ["Phòng khách", "Phòng ngủ"] : [],
      customLocation: "",
      estimatedQuantity: UNKNOWN_QTY,
      purposes: cat.id === "CAMERA_AI" ? ["Nhận diện té ngã người lớn tuổi"] : [],
      note: "",
    };
  }
  return init;
}

function resolveLocations(sel: CategorySelection): string[] {
  const result: string[] = [];
  for (const loc of sel.locations) {
    if (loc === OTHER_LOC) {
      const custom = sel.customLocation.trim();
      if (custom) {
        for (const part of custom.split(",").map((s) => s.trim()).filter(Boolean)) {
          result.push(part);
        }
      } else {
        result.push("Khác (cần khảo sát)");
      }
    } else {
      result.push(loc);
    }
  }
  return result;
}

export default function InstallSection() {
  const tr = useTr();
  const lang = useLang();
  const ref = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [packages, setPackages] = useState<PackageItem[]>(FALLBACK_PACKAGES);
  const [selectedPkgCode, setSelectedPkgCode] = useState<string>("CUSTOM_HOME");
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1/2: Project & Customer Info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [installAddress, setInstallAddress] = useState("");
  const [homeName, setHomeName] = useState("");
  const [homeType, setHomeType] = useState("TOWNHOUSE");
  const [floorCount, setFloorCount] = useState(2);
  const [bedroomCount, setBedroomCount] = useState(3);
  const [buildingCondition, setBuildingCondition] = useState("FINISHING");
  const [desiredTimeline, setDesiredTimeline] = useState("WITHIN_1_MONTH");

  // Step 2/2: Structured Device Needs
  const [selections, setSelections] = useState<Record<string, CategorySelection>>(createDefaultSelections);
  const [customerNote, setCustomerNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [created, setCreated] = useState<CreatedResult | null>(null);

  useEffect(() => {
    let active = true;
    const base = getRuntimeApiBaseUrl();
    fetch(`${base}/api/v1/public/installation-packages`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!active || !json?.result?.packages?.length) return;
        setPackages(json.result.packages);
      })
      .catch(() => {
        // Fallback when backend offline
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const sec = ref.current;
    if (!sec) return;
    const cards = [...sec.querySelectorAll<HTMLElement>(".inst-reveal")];
    return runWhileVisible(sec, () => {
      const r = sec.getBoundingClientRect();
      const p = clamp((innerHeight * 0.88 - r.top) / Math.max(220, innerHeight * 0.55));
      cards.forEach((el, i) => el.classList.toggle("in", p >= i * 0.1));
    });
  }, []);

  // Selecting a reference package pre-ticks suggested categories in Step 2 (NOT locking prices/quantities!)
  const handlePickReferencePackage = (code: string) => {
    setSelectedPkgCode(code);
    setSelections((prev) => {
      const next = { ...prev };
      const presetCats =
        code === "STARTER_HOME"
          ? ["SMART_SWITCH", "SENSORS", "LIGHTING_RGB", "AC_AI_HUB"]
          : code === "SAFETY_EDGE_AI"
          ? ["SMART_SWITCH", "CAMERA_AI", "SENSORS", "GATE_MOTOR", "AC_AI_HUB"]
          : ["SMART_SWITCH", "CAMERA_AI"];
      for (const cat of DEVICE_CATEGORIES) {
        const enable = presetCats.includes(cat.id);
        next[cat.id] = {
          ...prev[cat.id],
          enabled: enable,
          locations: enable && prev[cat.id].locations.length === 0 ? [cat.locations[0]] : prev[cat.id].locations,
        };
      }
      return next;
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const toggleCategory = (id: string) => {
    setSelections((prev) => {
      const cur = prev[id];
      const cat = DEVICE_CATEGORIES.find((c) => c.id === id);
      return {
        ...prev,
        [id]: {
          ...cur,
          enabled: !cur.enabled,
          locations: !cur.enabled && cur.locations.length === 0 && cat ? [cat.locations[0]] : cur.locations,
        },
      };
    });
  };

  const toggleChip = (id: string, field: "locations" | "purposes", val: string) => {
    setSelections((prev) => {
      const cur = prev[id];
      const exists = cur[field].includes(val);
      return {
        ...prev,
        [id]: {
          ...cur,
          [field]: exists ? cur[field].filter((x) => x !== val) : [...cur[field], val],
        },
      };
    });
  };

  const selectedCategories = DEVICE_CATEGORIES.filter((c) => selections[c.id]?.enabled);

  const handleGoStep2 = () => {
    setErrorMsg("");
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim() || !installAddress.trim()) {
      setErrorMsg(tr("Vui lòng điền đầy đủ họ tên, số điện thoại, email và địa chỉ công trình trước khi sang Bước 2."));
      return;
    }
    setStep(2);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (selectedCategories.length === 0) {
      setErrorMsg(tr("Vui lòng chọn ít nhất 1 nhóm thiết bị bạn đang quan tâm (hoặc giữ 1 nhóm và chọn 'Chưa biết – Cần tư vấn')."));
      return;
    }

    const requestedDevices = selectedCategories.map((cat) => {
      const sel = selections[cat.id];
      const resolvedLocs = resolveLocations(sel);
      return {
        category: cat.id,
        label: cat.label,
        locations: resolvedLocs.length > 0 ? resolvedLocs : ["Cần khảo sát thực tế"],
        estimatedQuantity: sel.estimatedQuantity || UNKNOWN_QTY,
        purposes: sel.purposes,
        needsConsultation:
          sel.estimatedQuantity === UNKNOWN_QTY ||
          resolvedLocs.length === 0 ||
          (sel.locations.includes(OTHER_LOC) && !sel.customLocation.trim()),
        note: sel.note.trim() || undefined,
      };
    });

    setSubmitting(true);
    try {
      const base = getRuntimeApiBaseUrl();
      const res = await fetch(`${base}/api/v1/public/installation-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          installAddress: installAddress.trim(),
          homeName: homeName.trim() || undefined,
          homeType,
          floorCount,
          bedroomCount,
          roomCount: Math.max(1, bedroomCount + 2),
          buildingCondition,
          desiredTimeline,
          packageCode: selectedPkgCode,
          customerNote: customerNote.trim() || undefined,
          requestedDevices,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.result) {
        throw new Error(json?.message || tr("Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau."));
      }
      setCreated(json.result as CreatedResult);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : tr("Không thể kết nối máy chủ HESTA."));
    } finally {
      setSubmitting(false);
    }
  };

  const buildPortalLink = (mode: "register" | "login") => {
    if (!created) return `${getRuntimeDashboardUrl()}/${mode}`;
    const params = new URLSearchParams({
      contractToken: created.claimToken,
      email: created.customerEmail,
    });
    if (mode === "register") {
      if (customerName.trim()) params.set("name", customerName.trim());
      if (customerPhone.trim()) params.set("phone", customerPhone.trim());
    }
    return `${getRuntimeDashboardUrl()}/${mode}?${params.toString()}`;
  };

  return (
    <section className="install-sec" id="install" ref={ref}>
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow">{tr("Triển khai · Khảo sát & Lập hợp đồng")}</div>
          <h2>{tr("Khảo sát đúng nhu cầu. Báo giá minh bạch rồi mới ký.")}</h2>
          <p className="lead">
            {tr("Bạn chưa cần biết mã sản phẩm hay số lượng chính xác. Hãy gửi thông tin công trình và nhóm thiết bị quan tâm — đội ngũ HESTA sẽ khảo sát, lên phương án chi tiết và chỉ lập hợp đồng khi hai bên đã thống nhất.")}
          </p>
        </div>

        {/* 5-step real-world journey strip */}
        <ol className="inst-steps">
          {JOURNEY_STEPS.map(([num, title, desc]) => (
            <li key={num} className="inst-reveal">
              <span>{num}</span>
              <b>{tr(title)}</b>
              <small>{tr(desc)}</small>
            </li>
          ))}
        </ol>

        {/* Reference packages (pre-fill categories, never force un-surveyed pricing!) */}
        <div className="inst-grid">
          {packages.map((pkg) => {
            const isSelected = pkg.code === selectedPkgCode;
            const isRec = pkg.code === "SAFETY_EDGE_AI";
            const title = lang === "en" ? pkg.nameEn : pkg.name;
            const subtitle = lang === "en" ? pkg.subtitleEn : pkg.subtitle;
            const badge = lang === "en" ? pkg.badgeEn : pkg.badge;
            const points = lang === "en" ? pkg.highlightsEn : pkg.highlights;
            return (
              <article
                key={pkg.code}
                className={`inst-card inst-reveal ${isRec ? "featured" : ""} ${isSelected ? "selected" : ""}`}
              >
                <div className="inst-card-top">
                  <span className="inst-badge">{badge}</span>
                  <h3>{title}</h3>
                  <p>{subtitle}</p>
                </div>
                <div className="inst-price">
                  {pkg.estimatedPrice > 0 ? (
                    <>
                      <small>{tr("Mức đầu tư tham khảo")}</small>
                      <b>~ {formatVnd(pkg.estimatedPrice)}</b>
                      <span>{tr("Giá chính thức chốt sau khi khảo sát mặt bằng")}</span>
                    </>
                  ) : (
                    <>
                      <small>{tr("Khảo sát & bóc tách riêng")}</small>
                      <b>{tr("Theo thực tế")}</b>
                      <span>{tr("Không cố định gói · Chọn đúng thiết bị cần dùng")}</span>
                    </>
                  )}
                </div>
                <ul className="inst-list">
                  {points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handlePickReferencePackage(pkg.code)}
                  className={`btn ${isSelected ? "btn-ink" : "btn-glass"} inst-btn`}
                >
                  {isSelected ? tr("Đang gợi ý theo cấu hình này") : tr("Gợi ý nhóm thiết bị & Khảo sát")}
                </button>
              </article>
            );
          })}
        </div>

        {/* 2-Step Structured Consultation Form */}
        <div className="inst-box inst-reveal" ref={formRef}>
          {created ? (
            <div className="inst-done" role="status">
              <div className="eyebrow">{tr("Đã tiếp nhận phiếu yêu cầu tư vấn")}</div>
              <h3>
                {tr("Mã yêu cầu khảo sát")}: <span className="inst-code">{created.code}</span>
              </h3>
              <p className="lead">
                {tr("Hồ sơ công trình và danh sách thiết bị bạn quan tâm đã được gửi tới đội ngũ kỹ thuật HESTA ở trạng thái Chờ tư vấn. Sau khi khảo sát và thống nhất phương án, HESTA sẽ phát hành Báo giá & Hợp đồng chính thức ngay trên Cổng khách hàng.")}
              </p>
              <div className="cta-row">
                <a
                  className="btn btn-ink"
                  href={buildPortalLink(created.existingAccount ? "login" : "register")}
                >
                  {created.existingAccount
                    ? tr("Đăng nhập Portal để theo dõi khảo sát →")
                    : tr("Tạo tài khoản & Theo dõi hồ sơ →")}
                </a>
                <a
                  className="btn btn-glass"
                  href={buildPortalLink(created.existingAccount ? "register" : "login")}
                >
                  {created.existingAccount ? tr("Tạo tài khoản mới") : tr("Đã có tài khoản? Đăng nhập")}
                </a>
                <button
                  type="button"
                  className="btn btn-glass"
                  onClick={() => {
                    setCreated(null);
                    setStep(1);
                    setCustomerNote("");
                  }}
                >
                  {tr("Gửi yêu cầu khác")}
                </button>
              </div>
            </div>
          ) : (
            <div className="inst-form-grid">
              <form className="inst-form" onSubmit={handleSubmit}>
                {/* Step Header Indicator */}
                <div className="inst-step-bar">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`inst-step-pill ${step === 1 ? "active" : "done"}`}
                  >
                    <span>1/2</span> {tr("Thông tin công trình")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 2) return;
                      handleGoStep2();
                    }}
                    className={`inst-step-pill ${step === 2 ? "active" : ""}`}
                  >
                    <span>2/2</span> {tr("Khảo sát nhu cầu thiết bị")}
                  </button>
                </div>

                {errorMsg && (
                  <p className="inst-err" role="alert">
                    {errorMsg}
                  </p>
                )}

                {/* STEP 1/2: PROJECT & CONTACT INFO */}
                {step === 1 && (
                  <>
                    <div>
                      <div className="eyebrow">{tr("Bước 1/2 · Thông tin cơ bản về công trình")}</div>
                      <h3>{tr("Cho HESTA biết sơ lược về ngôi nhà của bạn")}</h3>
                    </div>

                    <div className="inst-row-2">
                      <label>
                        <span>{tr("Họ và tên")} *</span>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder={tr("Nguyễn Văn An")}
                        />
                      </label>
                      <label>
                        <span>{tr("Số điện thoại")} *</span>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="0901 234 567"
                        />
                      </label>
                    </div>

                    <div className="inst-row-2">
                      <label>
                        <span>Email *</span>
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="ban@email.com"
                        />
                      </label>
                      <label>
                        <span>{tr("Tên công trình / Ngôi nhà")}</span>
                        <input
                          type="text"
                          value={homeName}
                          onChange={(e) => setHomeName(e.target.value)}
                          placeholder={tr("VD: FPT Home, Căn hộ Vinhomes")}
                        />
                      </label>
                    </div>

                    <label>
                      <span>{tr("Địa chỉ lắp đặt")} *</span>
                      <input
                        type="text"
                        required
                        value={installAddress}
                        onChange={(e) => setInstallAddress(e.target.value)}
                        placeholder={tr("Số nhà, đường, phường/xã, quận/huyện, TP...")}
                      />
                    </label>

                    <div className="inst-row-3">
                      <label>
                        <span>{tr("Loại công trình")}</span>
                        <select value={homeType} onChange={(e) => setHomeType(e.target.value)}>
                          <option value="APARTMENT">{tr("Căn hộ chung cư")}</option>
                          <option value="TOWNHOUSE">{tr("Nhà phố")}</option>
                          <option value="LEVEL_4_HOUSE">{tr("Nhà cấp 4")}</option>
                          <option value="VILLA">{tr("Biệt thự")}</option>
                          <option value="OFFICE">{tr("Văn phòng / Shophouse")}</option>
                        </select>
                      </label>
                      <label>
                        <span>{tr("Số tầng")}</span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={floorCount}
                          onChange={(e) => setFloorCount(Math.max(1, Number(e.target.value) || 1))}
                        />
                      </label>
                      <label>
                        <span>{tr("Số phòng / khu vực")}</span>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={bedroomCount}
                          onChange={(e) => setBedroomCount(Math.max(1, Number(e.target.value) || 1))}
                        />
                      </label>
                    </div>

                    <div className="inst-row-2">
                      <label>
                        <span>{tr("Tình trạng công trình")}</span>
                        <select value={buildingCondition} onChange={(e) => setBuildingCondition(e.target.value)}>
                          <option value="UNDER_CONSTRUCTION">{tr("Đang xây thô (chưa đi dây)")}</option>
                          <option value="FINISHING">{tr("Đang hoàn thiện nội thất")}</option>
                          <option value="OCCUPIED">{tr("Nhà đang ở (hạn chế đục phá)")}</option>
                        </select>
                      </label>
                      <label>
                        <span>{tr("Thời gian mong muốn lắp đặt")}</span>
                        <select value={desiredTimeline} onChange={(e) => setDesiredTimeline(e.target.value)}>
                          <option value="URGENT_2_WEEKS">{tr("Càng sớm càng tốt (1–2 tuần)")}</option>
                          <option value="WITHIN_1_MONTH">{tr("Trong 1 tháng tới")}</option>
                          <option value="WITHIN_3_MONTHS">{tr("Trong 2–3 tháng tới")}</option>
                          <option value="FLEXIBLE">{tr("Chưa cố định – Cần tư vấn")}</option>
                        </select>
                      </label>
                    </div>

                    <div className="cta-row" style={{ marginTop: 8 }}>
                      <button type="button" onClick={handleGoStep2} className="btn btn-ink inst-submit">
                        {tr("Tiếp tục: Chọn nhóm thiết bị quan tâm (2/2) →")}
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 2/2: STRUCTURED DEVICE CATEGORIES & FOLLOW-UP QUESTIONS */}
                {step === 2 && (
                  <>
                    <div>
                      <div className="eyebrow">{tr("Bước 2/2 · Khảo sát nhu cầu thiết bị")}</div>
                      <h3>{tr("Chọn nhóm thiết bị bạn quan tâm (chưa cần biết mã sản phẩm)")}</h3>
                    </div>

                    {/* Clean 2x3 selectable category tiles */}
                    <div className="inst-cat-grid">
                      {DEVICE_CATEGORIES.map((cat) => {
                        const sel = selections[cat.id];
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            aria-pressed={sel.enabled}
                            className={`inst-cat-tile ${sel.enabled ? "on" : ""}`}
                          >
                            <span className="inst-cat-num">{cat.num}</span>
                            <span className="inst-cat-copy">
                              <b>{lang === "en" ? cat.labelEn : cat.label}</b>
                              <small>{lang === "en" ? cat.descEn : cat.desc}</small>
                            </span>
                            <span className="inst-cat-check">
                              {sel.enabled ? "✓" : "+"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Follow-up detail cards ONLY for enabled categories */}
                    {selectedCategories.length > 0 && (
                      <div className="inst-detail-stack">
                        {selectedCategories.map((cat) => {
                          const sel = selections[cat.id];
                          return (
                            <div key={cat.id} className="inst-detail-card">
                              <div className="inst-detail-head">
                                <div className="inst-detail-title">
                                  <span className="inst-cat-num">{cat.num}</span>
                                  <b>{lang === "en" ? cat.labelEn : cat.label}</b>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleCategory(cat.id)}
                                  className="inst-detail-remove"
                                >
                                  {tr("Bỏ chọn")}
                                </button>
                              </div>

                              <div className="inst-q">
                                <span>{tr("Vị trí dự kiến lắp đặt:")}</span>
                                <div className="inst-chips">
                                  {cat.locations.map((loc) => (
                                    <button
                                      key={loc}
                                      type="button"
                                      onClick={() => toggleChip(cat.id, "locations", loc)}
                                      className={`inst-chip ${sel.locations.includes(loc) ? "on" : ""}`}
                                    >
                                      {loc === OTHER_LOC ? tr("Khác") : loc}
                                    </button>
                                  ))}
                                </div>
                                {sel.locations.includes(OTHER_LOC) && (
                                  <input
                                    type="text"
                                    className="inst-custom-loc"
                                    value={sel.customLocation}
                                    onChange={(e) =>
                                      setSelections((prev) => ({
                                        ...prev,
                                        [cat.id]: { ...prev[cat.id], customLocation: e.target.value },
                                      }))
                                    }
                                    placeholder={tr("Nhập vị trí/khu vực khác (VD: Sân vườn, Gara, Tầng thượng, Phòng thờ...)")}
                                  />
                                )}
                              </div>

                              <div className="inst-q">
                                <span>{tr("Số lượng dự kiến:")}</span>
                                <div className="inst-chips">
                                  {cat.quantities.map((qty) => (
                                    <button
                                      key={qty}
                                      type="button"
                                      onClick={() =>
                                        setSelections((prev) => ({
                                          ...prev,
                                          [cat.id]: { ...prev[cat.id], estimatedQuantity: qty },
                                        }))
                                      }
                                      className={`inst-chip ${sel.estimatedQuantity === qty ? "on" : ""} ${
                                        qty === UNKNOWN_QTY ? "soft" : ""
                                      }`}
                                    >
                                      {qty}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="inst-q">
                                <span>{tr("Mục đích sử dụng:")}</span>
                                <div className="inst-chips">
                                  {cat.purposes.map((p) => (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => toggleChip(cat.id, "purposes", p)}
                                      className={`inst-chip ${sel.purposes.includes(p) ? "on" : ""}`}
                                    >
                                      {p}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <label>
                      <span>{tr("Mô tả thêm nhu cầu gia đình (tùy chọn)")}</span>
                      <textarea
                        rows={2}
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        placeholder={tr("VD: Muốn theo dõi người lớn tuổi, điều khiển đèn qua điện thoại và bảo vệ nhà khi đi vắng.")}
                      />
                    </label>

                    <div className="cta-row" style={{ marginTop: 4 }}>
                      <button type="button" onClick={() => setStep(1)} className="btn btn-glass">
                        ← {tr("Quay lại Bước 1")}
                      </button>
                      <button type="submit" disabled={submitting} className="btn btn-ink inst-submit">
                        {submitting ? tr("Đang gửi hồ sơ khảo sát...") : tr("Gửi yêu cầu tư vấn & Khảo sát")}
                      </button>
                    </div>
                  </>
                )}
              </form>

              {/* Right Live Structured Summary */}
              <aside className="inst-summary">
                <div className="eyebrow">{tr("Tóm tắt hồ sơ gửi kỹ thuật viên")}</div>
                <h4>{homeName.trim() || tr("Công trình nhà thông minh HESTA")}</h4>
                <p className="inst-sum-sub">
                  {floorCount} {tr("tầng")} · {bedroomCount} {tr("phòng / khu vực")} ·{" "}
                  {buildingCondition === "UNDER_CONSTRUCTION"
                    ? tr("Đang xây thô")
                    : buildingCondition === "FINISHING"
                    ? tr("Đang hoàn thiện")
                    : tr("Nhà đang ở")}
                </p>

                <div className="inst-picked">
                  <small>{tr("Thiết bị đang quan tâm")} ({selectedCategories.length})</small>
                  {selectedCategories.length === 0 ? (
                    <p className="inst-sum-sub">{tr("Chưa chọn nhóm thiết bị nào.")}</p>
                  ) : (
                    <ul>
                      {selectedCategories.map((c) => {
                        const s = selections[c.id];
                        const locs = resolveLocations(s);
                        return (
                          <li key={c.id}>
                            <b>{lang === "en" ? c.labelEn : c.label}</b>
                            <span>
                              {locs.length > 0 ? locs.join(", ") : tr("Cần khảo sát vị trí")} ·{" "}
                              <em>{s.estimatedQuantity}</em>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <dl className="inst-meta">
                  <div>
                    <dt>{tr("Nguyên tắc minh bạch")}</dt>
                    <dd>{tr("Số lượng bạn chọn chỉ là dự kiến ban đầu. HESTA không áp đặt thiết bị hay tự tạo hợp đồng trước khi khảo sát thực tế.")}</dd>
                  </div>
                  <div>
                    <dt>{tr("Quy trình sau khi gửi")}</dt>
                    <dd>{tr("Admin tiếp nhận → Khảo sát xác nhận vị trí & dây điện → Phát hành Báo giá & Hợp đồng chuẩn A4 → Ký & Đặt cọc 30% → Bàn giao chìa khóa trao tay.")}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
