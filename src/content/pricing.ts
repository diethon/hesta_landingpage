// Nội dung giải thích cho trang Bảng giá, theo deviceType của catalog. Giá luôn lấy từ backend.
import type { Lang } from "@/lib/i18n";

type Text = { vi: string; en: string };
export interface DeviceGuide {
  label: Text;
  image?: string;
  what: Text;
  how: Text[];
  uses: Text[];
}

const t = (vi: string, en: string): Text => ({ vi, en });

const GUIDES: Record<string, DeviceGuide> = {
  LED_RGB: {
    label: t("Đèn LED RGB", "RGB LED bulb"),
    image: "/products/led-rgb.jpg",
    what: t("Bóng đèn LED đổi màu, chỉnh được độ sáng và màu sắc từ ứng dụng HESTA thay cho bóng đèn thường.",
      "A colour-changing LED bulb whose brightness and colour you set from the HESTA app, replacing a regular bulb."),
    how: [
      t("Lắp vào đui đèn có sẵn, đèn kết nối Wi-Fi về bộ điều khiển HESTA.", "Screw it into an existing socket; it joins the HESTA controller over Wi-Fi."),
      t("Khi bạn bấm trên app hoặc ra lệnh giọng nói, máy chủ HESTA gửi lệnh qua MQTT tới đèn trong khoảng 1 giây.", "Tap in the app or use your voice: the HESTA server sends the command over MQTT in about a second."),
      t("Đèn phối 3 kênh đỏ, xanh lá, xanh dương để tạo màu và độ sáng mong muốn.", "The bulb mixes red, green and blue channels to reach the colour and brightness you chose."),
    ],
    uses: [t("Ánh sáng ấm buổi tối, sáng trắng khi làm việc", "Warm light at night, cool white for work"), t("Kịch bản \"Xem phim\", \"Đi ngủ\" chỉ với 1 chạm", "One-tap \"Movie\" or \"Bedtime\" scenes"), t("Tự bật khi cảm biến phát hiện có người", "Turns on when a sensor detects someone")],
  },
  LIGHT: {
    label: t("Công tắc / Đèn relay", "Switch / relay light"),
    image: "/products/light-switch.jpg",
    what: t("Công tắc cảm ứng thay thế công tắc tường cũ, bật/tắt đèn tại chỗ hoặc từ xa qua ứng dụng.",
      "A touch switch that replaces your old wall switch, so lights work by hand or remotely from the app."),
    how: [
      t("Lắp vào đế âm tường thay công tắc cơ, dùng rơ-le để đóng ngắt nguồn cho đèn.", "Fits the existing wall box and switches the light with a relay."),
      t("Trạng thái bật/tắt được đồng bộ liên tục lên HESTA, nên app luôn hiển thị đúng thực tế.", "Its on/off state syncs to HESTA continuously, so the app always shows reality."),
      t("Vẫn dùng tay bình thường khi mất Internet.", "Still works by hand when the Internet is down."),
    ],
    uses: [t("Tắt toàn bộ đèn khi ra khỏi nhà", "Turn every light off when you leave"), t("Hẹn giờ bật đèn cổng lúc chiều tối", "Schedule the porch light at dusk"), t("Kiểm tra đèn quên tắt từ xa", "Check for lights left on, from anywhere")],
  },
  SMART_PLUG: {
    label: t("Ổ cắm đo điện", "Energy-metering plug"),
    image: "/products/smart-plug.jpg",
    what: t("Ổ cắm có đo điện năng, biến thiết bị điện thông thường thành thiết bị thông minh.",
      "A plug with an energy meter that turns ordinary appliances into smart ones."),
    how: [
      t("Cắm vào ổ điện, rồi cắm thiết bị cần điều khiển vào ổ HESTA.", "Plug it into the wall, then plug the appliance into it."),
      t("Chip đo liên tục điện áp, dòng điện, công suất và gửi về HESTA để vẽ biểu đồ tiêu thụ.", "A metering chip reads voltage, current and power and sends them to HESTA for usage charts."),
      t("Tự ngắt khi quá tải hoặc theo lịch, theo kịch bản bạn đặt.", "Cuts power on overload, on a schedule or from your automations."),
    ],
    uses: [t("Tìm thiết bị \"ngốn điện\"", "Find power-hungry appliances"), t("Hẹn giờ tắt bình nóng lạnh", "Schedule the water heater off"), t("Cảnh báo khi thiết bị chạy bất thường", "Alert when an appliance behaves oddly")],
  },
  TEMP_HUMID_SENSOR: {
    label: t("Cảm biến nhiệt ẩm", "Temperature & humidity sensor"),
    image: "/products/temp-humid-sensor.jpg",
    what: t("Cảm biến đo nhiệt độ và độ ẩm trong phòng, chạy pin, đặt ở bất kỳ đâu.", "A battery-powered sensor for room temperature and humidity that goes anywhere."),
    how: [
      t("Đo định kỳ và gửi số liệu về HESTA, lưu thành lịch sử để xem theo ngày/tuần.", "Measures periodically and sends readings to HESTA, kept as daily and weekly history."),
      t("Dữ liệu dùng làm điều kiện cho tự động hóa, ví dụ nóng quá thì bật quạt hoặc điều hòa.", "Readings drive automations, e.g. too hot turns on the fan or AC."),
    ],
    uses: [t("Tự bật điều hòa khi phòng trên 30°C", "Start the AC above 30°C"), t("Cảnh báo phòng quá ẩm", "Warn when a room is too humid"), t("Theo dõi phòng em bé, người già", "Watch a nursery or an elder's room")],
  },
  MOTION_SENSOR: {
    label: t("Cảm biến chuyển động", "Motion sensor"),
    image: "/products/motion-sensor.jpg",
    what: t("Cảm biến phát hiện có người trong phòng, kết hợp hồng ngoại và radar nên nhận ra cả người ngồi yên.",
      "Detects people in a room; infrared plus radar means it even notices someone sitting still."),
    how: [
      t("Hồng ngoại bắt chuyển động, radar bắt cử động nhỏ như hơi thở để biết phòng còn người.", "Infrared catches movement, radar catches tiny motion like breathing."),
      t("Mỗi khi trạng thái thay đổi, cảm biến báo về HESTA để kích hoạt kịch bản hoặc cảnh báo an ninh.", "Each change is reported to HESTA to trigger scenes or security alerts."),
    ],
    uses: [t("Đèn hành lang tự bật khi có người", "Hallway light on when someone passes"), t("Tự tắt đèn, quạt khi phòng trống", "Lights and fan off in empty rooms"), t("Báo động khi vắng nhà", "Alarm while you are away")],
  },
  CAMERA_AI: {
    label: t("Camera AI", "AI camera"),
    image: "/products/camera-ai.jpg",
    what: t("Camera trong nhà có AI nhận diện tư thế, phát hiện té ngã và gửi cảnh báo khẩn cấp cho người thân.",
      "An indoor camera with pose-detecting AI that spots falls and alerts family right away."),
    how: [
      t("Camera phát hình về máy chủ AI của HESTA để phân tích tư thế người trong khung hình.", "The camera streams to HESTA's AI server, which analyses body pose."),
      t("Khi phát hiện té ngã, hệ thống gửi thông báo ngay lên app của các thành viên trong nhà.", "When a fall is detected, every home member gets an instant notification."),
      t("Có thể xem lại sự kiện trong mục An ninh.", "Events can be reviewed in the Security section."),
    ],
    uses: [t("Chăm sóc ông bà, người sống một mình", "Care for elders or people living alone"), t("Giám sát nhà khi đi vắng", "Watch the house while away"), t("Ghi nhận sự kiện bất thường", "Record unusual events")],
  },
  AC_REMOTE: {
    label: t("Điều khiển điều hòa", "AC controller"),
    what: t("Bộ điều khiển điều hòa qua hồng ngoại, biến điều hòa thường thành điều hòa thông minh.", "An infrared AC controller that makes any air conditioner smart."),
    how: [t("Học và phát lại tín hiệu remote hồng ngoại theo lệnh từ HESTA.", "Learns your remote's infrared codes and replays them on HESTA's command.")],
    uses: [t("Bật điều hòa trước khi về nhà", "Cool the room before you get home"), t("Tự tắt khi phòng trống", "Off when the room is empty")],
  },
  FAN: {
    label: t("Quạt thông minh", "Smart fan"),
    what: t("Quạt điều khiển bật/tắt và tốc độ từ xa.", "A fan you switch and speed-control remotely."),
    how: [t("Nhận lệnh từ HESTA qua MQTT; có thể chạy theo nhiệt độ phòng.", "Takes commands from HESTA over MQTT and can follow room temperature.")],
    uses: [t("Tự bật khi nóng", "On when it gets hot"), t("Hẹn giờ tắt ban đêm", "Night-time off timer")],
  },
  WATER_PUMP: {
    label: t("Máy bơm nước", "Water pump"),
    what: t("Máy bơm nước bật/tắt và hẹn giờ từ xa.", "A water pump you can switch and schedule remotely."),
    how: [t("Đóng ngắt nguồn máy bơm theo lệnh, lịch hoặc kịch bản trong HESTA.", "Power is switched by command, schedule or HESTA automation.")],
    uses: [t("Hẹn giờ bơm nước lên bồn", "Schedule tank filling"), t("Tưới cây tự động", "Automatic garden watering")],
  },
  GATE_MOTOR: {
    label: t("Motor cổng tự động", "Gate motor"),
    what: t("Motor cổng tự động, đóng mở cổng ngay trên điện thoại.", "An automatic gate motor you open and close from your phone."),
    how: [t("Nhận lệnh đóng/mở từ HESTA và báo trạng thái cổng về app.", "Receives open/close commands from HESTA and reports gate state to the app.")],
    uses: [t("Mở cổng khi về tới nhà", "Open the gate as you arrive"), t("Kiểm tra cổng đã đóng chưa", "Check the gate is closed")],
  },
  SMOKE_SENSOR: {
    label: t("Cảm biến báo khói", "Smoke sensor"),
    what: t("Cảm biến báo khói, phát hiện sớm nguy cơ cháy.", "A smoke sensor for early fire warning."),
    how: [t("Vượt ngưỡng khói thì hú còi tại chỗ và gửi cảnh báo khẩn qua HESTA.", "Above the smoke threshold it sounds a siren and sends an urgent HESTA alert.")],
    uses: [t("Cảnh báo cháy khi vắng nhà", "Fire alerts while away"), t("Ngắt ổ cắm bếp khi có khói", "Cut kitchen plugs on smoke")],
  },
};

const FALLBACK: DeviceGuide = {
  label: t("Thiết bị khác", "Other device"),
  what: t("Thiết bị thông minh tương thích hệ sinh thái HESTA, điều khiển và theo dõi qua ứng dụng.", "A smart device in the HESTA ecosystem, controlled and monitored from the app."),
  how: [t("Kết nối về HESTA qua Wi-Fi/MQTT để nhận lệnh và báo trạng thái theo thời gian thực.", "Connects to HESTA over Wi-Fi/MQTT to take commands and report state in real time.")],
  uses: [t("Điều khiển từ xa", "Remote control"), t("Đưa vào kịch bản tự động", "Use in automations")],
};

export const guideFor = (deviceType: string) => GUIDES[deviceType] ?? FALLBACK;
export const pick = (x: Text, lang: Lang) => x[lang];

/** Ảnh minh họa từ Wikimedia Commons; giấy phép yêu cầu ghi nguồn. */
export const IMAGE_CREDITS = [
  { item: t("Bóng LED", "LED bulb"), author: "Jiří Sedláček", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Verbatim_LED_light_bulb.jpg" },
  { item: t("Công tắc cảm ứng", "Touch switch"), author: "Carl-Johan Sveningsson", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Yoga_Home_Control_Panel_and_the_Smart_Switch_prototype.jpg" },
  { item: t("Ổ cắm", "Plug"), author: "Harborsparrow", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Wemo_smart_plugs_and_switches.jpg" },
  { item: t("Cảm biến nhiệt ẩm", "Climate sensor"), author: "Shixart1985", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Smart_indoor_climate_monitor_showing_humidity.jpg" },
  { item: t("Cảm biến chuyển động", "Motion sensor"), author: "Dmitry G", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Legrand_048944.JPG" },
  { item: t("Camera", "Camera"), author: "Nolimetangere777", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Home_Spy_Camera.jpg" },
];
