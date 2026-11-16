---
name: slide-design-system
description: >-
  Hệ thống thiết kế slide PowerPoint (PPTX) cho báo cáo BTL CSDL / HRM Portal.
  Dùng khi cần tạo, chỉnh sửa hoặc redesign deck báo cáo: bảng màu, phông chữ,
  bố cục, hiệu ứng chuyển slide, quy tắc card/box, căn giữa, nhấn mạnh.
  Trigger: "thiết kế slide", "redesign deck", "make_slides", "làm báo cáo PPTX",
  "slide báo cáo cao cấp", "đổi theme slide".
---

# Slide Design System — Báo cáo BTL CSDL (HRM Portal)

Bộ quy chuẩn để sinh deck `.pptx` chuyên nghiệp bằng `make_slides.py`
(python-pptx). Mọi slide đều dựng từ các helper trong file này — **không** dựng
shape rời rạc, để giữ nhận diện đồng nhất.

## Nền tảng kỹ thuật

- Thư viện: `python-pptx` (đã cài). Chạy: `python make_slides.py`.
- Khổ slide: 16:9, `W = 13.333in`, `H = 7.5in`.
- python-pptx **không có API chuyển slide** → hiệu ứng được bơm XML
  `<p:transition>` trực tiếp (xem `transition()`).
- Lỗi hay gặp: prefix trong `Requires="p159"` của `mc:Choice` **phải** được khai
  báo namespace, nếu không PowerPoint báo `BadImageFormatException` khi mở.
  Vì vậy transition được dựng bằng `lxml` với `nsmap` đầy đủ, không nối chuỗi.

## Bảng màu (theme "Ocean Depths" chuẩn hóa)

| Vai trò | Hằng số | Hex | Dùng cho |
|---|---|---|---|
| Nền tối | `NAVY` | `#0E1B2E` | bìa, slide cảm ơn |
| Nền tối nhạt | `NAVY2` | `#162A45` | panel, ô số liệu lớn |
| Màu chữ chính | `INK` | `#141B2D` | tiêu đề, chữ đậm |
| Chữ phụ | `SLATE` | `#475569` | nội dung thường |
| Chữ mờ | `MUTED` | `#7B8799` | chú thích, footer |
| Viền mềm | `LINE` | `#E7ECF4` | viền box mảnh |
| Nền phụ | `SOFT` | `#EEF2F9` | badge, dải phụ |
| Nền slide | `BG` | `#F7F9FC` | nền toàn slide |
| Nhấn chính | `ACCENT` | `#1F5FE0` | link, tiêu đề mục |
| Nhấn phụ | `ACCENT2` | `#E86E1C` | gạch chân, nhấn 2 |
| Trạng thái | `GREEN/TEAL/RED/PURPLE/GOLD` | — | phân nhóm, mã màu |

Nguyên tắc: nền sáng + chữ đậm để **dễ đọc khi chiếu**; mỗi slide tối đa 2–3 màu
nhấn; màu nhấn chỉ dùng cho tiêu đề mục và dấu đầu dòng.

## Phông chữ

- Tiêu đề: `Segoe UI Semibold` (`FONT_H`), 29–31pt.
- Nội dung: `Segoe UI` (`FONT`), 11.5–13.5pt.
- Code / SQL: monospace, nền `NAVY`, chữ sáng.

## Helper cốt lõi (bắt buộc tái sử dụng)

| Hàm | Nhiệm vụ |
|---|---|
| `rect(...)` | Hình chữ nhật. `radius >= 1` = bán kính **tuyệt đối (EMU)** → góc bo đều mọi kích thước (dùng `Inches(0.14)`). `radius < 1` = tỉ lệ (dùng cho pill/badge). `shadow=True` = bóng mềm. |
| `card(...)` | Box nội dung: bo góc đều, dải nhấn trên đầu, **căn giữa**, tự **thu nhỏ chữ** nếu văn bản dài hơn ô (không bao giờ tràn). |
| `col_header(...)` | Tiêu đề cột trong box: nền đặc màu, bo góc trên, chữ trắng căn giữa. |
| `vlist(...)` | Danh sách dấu đầu dòng (mặc định `✓`), chữ to rõ, giãn dòng 1.15. |
| `bullets(...)` | Danh sách nhấn mạnh (đậm + thường) — dùng cho phần giải thích. |
| `pill(...)` | Nhãn bo tròn hoàn toàn. |
| `slide_base(...)` | Khung slide chuẩn: dải màu trên, kicker, tiêu đề, gạch chân, badge số trang, transition. |
| `transition(slide, kind, dur)` | `fade` (mặc định, 700ms) / `morph` (900ms cho bìa & cảm ơn). |

## Quy tắc bố cục

- **Lề an toàn**: trái/phải `0.75in`, trên `1.6in`, dưới `6.9in` (footer ở 7.08in).
- **Lưới cột**: 3 cột `cw=3.87in, gap=0.3in`; 4 cột `cw=2.87in, gap=0.28in`.
- **Căn giữa**: mọi tiêu đề/nội dung trong `card`, `col_header`, module đều căn
  giữa để cột thẳng hàng. Danh sách dài giữ căn trái cho dễ đọc.
- **Bo góc**: thống nhất `Inches(0.14)` (~12.6pt) cho box lớn → nhìn chuyên
  nghiệp, không bo kiểu "viên thuốc" trên box cao.
- **Chữ**: ưu tiên to (≥11.5pt nội dung, ≥13pt cho ý chính). Không nhồi quá 7
  dòng/bullet mỗi box.
- **Nhấn mạnh**: dùng `bullets()` (phần đậm) hoặc `pill`/`col_header` màu; không
  lạm dụng in đậm toàn bộ.

## Quy trình redesign an toàn

1. Sửa `make_slides.py`, **giữ nguyên nội dung tiếng Việt** người dùng đã sửa.
2. `python -c "import ast,io; ast.parse(io.open('make_slides.py',encoding='utf-8').read())"` để bắt lỗi cú pháp.
3. `python make_slides.py` → sinh `BaoCao_BTL_CSDL_HRM_Portal.pptx`.
4. Export PNG để kiểm tra trực quan (PowerPoint COM, xem `tools/`), rà **tràn
   chữ / đè chữ / cột lệch**.
5. Với mọi slide có `card`: kiểm tra text không tràn đáy ô (card tự shrink, nhưng
   vẫn phải xem ảnh vì ước lượng là gần đúng).

## Checklist trước khi bàn giao

- [ ] 18 slide, không tràn/đè chữ ở bất kỳ slide nào.
- [ ] Chuyển slide mượt (morph bìa + fade nội dung), file mở được bằng PowerPoint.
- [ ] Bo góc đều nhau, viền mảnh, bóng mềm.
- [ ] Chữ đủ to để đọc khi chiếu; số liệu quan trọng được nhấn.
- [ ] Nội dung khớp báo cáo Word (`BTL_CSDL_HOÀN_CHỈNH.docx`).
