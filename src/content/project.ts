// Nội dung về đồ án. Sửa trực tiếp ở đây, các section tự cập nhật.

// Các mốc báo cáo Capstone FPTU. status: done | doing | next
export const TIMELINE: { title: string; desc: string; status: "done" | "doing" | "next" }[] = [
  { title: "Report 1 · Giới thiệu dự án", desc: "Bài toán, phạm vi, ý tưởng HESTA", status: "done" },
  { title: "Report 2 · Kế hoạch dự án", desc: "Phân công, mốc thời gian, rủi ro", status: "done" },
  { title: "Report 3 · Đặc tả yêu cầu", desc: "Use case, context diagram, yêu cầu chức năng", status: "done" },
  { title: "Report 4 · Thiết kế phần mềm", desc: "Kiến trúc, ERD, thiết kế chi tiết", status: "done" },
  { title: "Report 5 · Kiểm thử", desc: "Kế hoạch và kết quả kiểm thử", status: "done" },
  { title: "Bảo vệ đồ án", desc: "Demo hệ thống trước hội đồng", status: "done" },
];

export const FAQ: [string, string][] = [
  ["Ai được điều khiển thiết bị trong nhà?", "Chủ nhà (OWNER) có toàn quyền và chia sẻ từng thiết bị cho thành viên (MEMBER). Quyền được kiểm tra ở máy chủ, không chỉ ẩn nút trên giao diện."],
  ["HESTA hỗ trợ những thiết bị nào?", "Thiết bị trong danh mục do quản trị viên quản lý, giao tiếp qua MQTT theo 3 kênh cố định: lệnh, xác nhận và trạng thái."],
  ["Lỡ báo nhầm thì sao?", "Ngưỡng cảnh báo có vùng trễ và cần nhiều lần đọc liên tiếp mới xác nhận. Bạn vẫn có thể bỏ qua hoặc đánh dấu đã xử lý từng cảnh báo."],
  ["Té ngã mà không ai trả lời thì sao?", "HESTA đếm ngược 30 giây. Không ai xác nhận “Tôi ổn” thì hệ thống bật còi và kích hoạt gọi khẩn cấp."],
  ["Có dùng trên điện thoại được không?", "Có. Bản web chạy trên trình duyệt điện thoại, và có app mobile viết bằng Flutter."],
];

// Web dashboard (React app), served separately from this landing page.
export const DASHBOARD_URL = "https://dashboard.hesta.homes";
