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
| Nền tối | `NAVY` | `#0E1B2E` | bìa, slide cảm ơn, khối code SQL |
| Nền tối nhạt | `NAVY2` | `#162A45` | badge số, header dự phòng (KHÔNG dùng cho panel lớn) |
| Xanh da trời | `SKY` | `#2F7DD1` | viền/nhấn cho ô số liệu, panel sáng |
| Xanh rất nhạt | `SKY_LT` | `#E8F1FC` | nền ô số liệu, mảng phụ nền slide |
| Màu chữ chính | `INK` | `#141B2D` | tiêu đề, chữ đậm |
| Chữ phụ | `SLATE` | `#475569` | nội dung thường |
| Chữ mờ | `MUTED` | `#7B8799` | chú thích, footer |
| Viền mềm | `LINE` | `#D3DCE8` | viền box thường |
| Viền đậm | `LINE2` | `#B9C6D8` | khung chính cần nổi |
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
| `card(...)` | Box nội dung: **viền đậm màu theo accent**, **dải nhấn trên đầu dày** (`0.11"`), **icon ở góc trên-phải**, tiêu đề đậm (16.5pt), chữ nội dung to (13.5pt), **căn giữa**, tự **thu nhỏ chữ** nếu văn bản dài hơn ô (không bao giờ tràn). |
| `col_header(...)` | Tiêu đề cột trong box: nền đặc màu, bo góc trên, chữ trắng căn giữa. |
| `vlist(...)` | Danh sách dấu đầu dòng (mặc định `✓`), chữ to rõ, giãn dòng 1.15. |
| `bullets(...)` | Danh sách nhấn mạnh (đậm + thường) — dùng cho phần giải thích. |
| `pill(...)` | Nhãn bo tròn hoàn toàn. |
| `slide_base(...)` | Khung slide chuẩn: dải màu trên dày (`0.11"` ACCENT + `0.03"` ACCENT2), mảng `SKY_LT` bên phải (bớt trống), kicker, tiêu đề, gạch chân, badge số trang, transition. |
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

## Quy tắc màu nhấn (đúc kết sau review)

**Không xoay vòng cầu vồng màu accent cho các danh sách chỉ mang tính thứ tự.**
Màu chỉ được mang nghĩa, không được chỉ để "cho đẹp":

| Được phép nhiều màu khi… | Ví dụ |
|---|---|
| Màu là **chú giải (legend)** cho một thuộc tính | ERD: teal = danh mục, xanh = nhân sự, tím = nghiệp vụ, lục = Kanban |
| Màu là **trạng thái/loại có nghĩa cố định** | Kanban: Todo/InProgress/Review/Done; SQL: INSERT/UPDATE/DELETE/SELECT |

**Mọi trường hợp khác → một màu trung tính + đúng MỘT ACCENT** cho phần tử cần nhấn.
Đã áp dụng cho: slide 2 (agenda), 8 (1NF/2NF/3NF + 3 bước phân rã), 16 (10 truy vấn).
Card ở slide 13 dùng màu **theo nhóm chức năng** (màu mang nghĩa phân loại), viền card
trùng màu đó.

**Nhấn số liệu quan trọng**: dùng "number hero" — ô số lớn nhất + nền `GOLD`,
các ô còn lại nền **`SKY_LT`** + viền `SKY`, số màu `SKY` (tông sáng, không dùng
panel navy đậm). Ô hero đặt **đầu tiên** + dải trắng trên đỉnh. (slide 14: `269 test case`.)

**Icon trên card**: đặt ở **góc trên-phải** (tuyệt đối, không đẩy tiêu đề/nội dung
xuống). Góc trái dễ đè chữ khi tiêu đề căn giữa và dài (vd `1NF — Nguyên tố`).
Icon là ô vuông bo góc màu accent + glyph trắng 14pt.

**Panel lớn (ô số liệu, panel phụ) không dùng `NAVY2`** — đó là màu gần như đen,
khó đọc khi chiếu. Dùng `SKY_LT` (nền) + `SKY` (viền/nhấn). `NAVY2` chỉ còn cho
badge số nhỏ chưa đổi. Khối **code SQL** vẫn giữ nền `NAVY` (đúng ngữ nghĩa code).

**Dấu đầu dòng**: `✓` chỉ dùng khi nghĩa là "đạt/được phép" (ma trận RBAC). Với danh sách tính năng trung tính, dùng `▪`. Không dùng `⚠` kiểu cảnh báo lặp lại cùng loại nội dung — thay bằng số thứ tự ①②③.

## Sơ đồ ERD (crow's foot)

- `ent()` lưu hình học vào `geo[name] = (x, y, w, h)`; `rel(a, b)` vẽ đường nối sau khi mọi box đã dựng.
- `_ln()` dùng `add_connector` (đường thẳng, không mũi tên); `_foot()` vẽ 3 nhánh crow's foot chạm cạnh thực thể.
- Mỗi quan hệ lệch kênh dọc một chút (`_lane`) để các đường không trùng nhau.
- **Không vẽ đường dài cắt qua box khác.** Nếu quan hệ nhảy qua ≥ 2 cột, thay bằng **panel liệt kê quan hệ khoá ngoại** ở cột phải — đọc nhanh trong 5 giây và không rối.
- Nhãn đúng ký pháp: "một → nhiều (1 : n)".

## Căn số trang

Badge số trang (`num=`) phải khớp **thứ tự dựng slide**, không phải thứ tự hàm trong file.
Thứ tự dựng: `s_title, s_agenda, s_problem, s_stack, s_arch, s_erd, s_tables, s_normalize, s_sqlprog, s_payroll, s_security, s_frontend, s_features, s_testing, s_dml, s_queries, s_limits, s_thanks`.

## Checklist trước khi bàn giao

- [ ] 18 slide, không tràn/đè chữ ở bất kỳ slide nào.
- [ ] Badge số trang khớp vị trí slide (1–18).
- [ ] Màu accent có nghĩa; không còn "cầu vồng" cho danh sách thứ tự.
- [ ] Số liệu quan trọng nhất là ô hero lớn nhất.
- [ ] Chuyển slide mượt (morph bìa + fade nội dung), file mở được bằng PowerPoint.
- [ ] Bo góc đều nhau, viền mảnh, bóng mềm.
- [ ] Chữ đủ to để đọc khi chiếu; nội dung dưới footer (đáy ≤ 7.0in).
- [ ] Nội dung khớp báo cáo Word (`BTL_CSDL_HOÀN_CHỈNH.docx`).
