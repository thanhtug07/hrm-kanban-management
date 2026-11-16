# -*- coding: utf-8 -*-
"""
Sinh slide bao cao BTL CSDL - HRM Portal (ASP.NET Core 8 + SQL Server + React 19)
Chay: python make_slides.py
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
import copy

# ---------------------------------------------------------------- THEME
NAVY    = RGBColor(0x0E, 0x1B, 0x2E)   # Ocean Depths - Deep Navy
NAVY2   = RGBColor(0x16, 0x2A, 0x45)   # Navy nhe hon
INK     = RGBColor(0x14, 0x1B, 0x2D)
SLATE   = RGBColor(0x47, 0x55, 0x69)
MUTED   = RGBColor(0x7B, 0x87, 0x99)
LINE    = RGBColor(0xE7, 0xEC, 0xF4)   # vien mem, do dam thap
SOFT    = RGBColor(0xEE, 0xF2, 0xF9)   # nen phu nhe
CARD_SH = RGBColor(0x0B, 0x1F, 0x3A)  # mau bong do mem
BG      = RGBColor(0xF7, 0xF9, 0xFC)
WHITE   = RGBColor(0xFF, 0xFF, 0xFF)
ACCENT  = RGBColor(0x1F, 0x5F, 0xE0)   # Electric Blue
ACCENT2 = RGBColor(0xE8, 0x6E, 0x1C)   # orange
GREEN   = RGBColor(0x18, 0x9A, 0x5B)
RED     = RGBColor(0xD9, 0x3A, 0x3A)
PURPLE  = RGBColor(0x6D, 0x42, 0xC8)
TEAL    = RGBColor(0x1B, 0x8C, 0x8C)   # Ocean Teal
GOLD    = RGBColor(0xF2, 0xB0, 0x1B)

FONT = "Segoe UI"
FONT_H = "Segoe UI Semibold"

W, H = Inches(13.333), Inches(7.5)
prs = Presentation()
prs.slide_width, prs.slide_height = W, H
BLANK = prs.slide_layouts[6]


# ---------------------------------------------------------------- helpers
def rect(slide, x, y, w, h, fill=None, line=None, lw=1.0, shape=MSO_SHAPE.RECTANGLE,
         shadow=False, radius=None):
    s = slide.shapes.add_shape(shape, x, y, w, h)
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid(); s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line; s.line.width = Pt(lw)
    s.shadow.inherit = False
    if radius is not None and shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        # radius la ban kinh tuyet doi (EMU) khi >= 1 -> goc bo deu moi kich thuoc.
        # radius < 1 giu nghia la ti le tuong doi (dung cho pill).
        if radius >= 1:
            s.adjustments[0] = min(0.5, radius / float(min(w, h)))
        else:
            s.adjustments[0] = radius
    sp = s._element.spPr
    for el in sp.findall(qn('a:effectLst')):
        sp.remove(el)
    if shadow:
        # bong do rat mem (blur lon, alpha thap) - giu cam giac noi nhe
        sp.append(_soft_shadow())
    return s


def _soft_shadow(alpha=11000, blur=140000, dy=38000):
    from lxml import etree
    ns = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
    x = etree.fromstring(
        '<a:effectLst %s><a:outerShdw blurRad="%d" dist="%d" dir="5400000" '
        'rotWithShape="0"><a:srgbClr val="0B1F3A"><a:alpha val="%d"/></a:srgbClr>'
        '</a:outerShdw></a:effectLst>' % (ns, blur, dy, alpha))
    return x


def text(slide, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
         space_after=4, line_spacing=1.0, wrap=True):
    """runs: list of (text, size, color, bold, font) OR list of such lists (paragraphs)."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    if runs and not isinstance(runs[0], list):
        runs = [runs]
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(space_after)
        p.line_spacing = line_spacing
        for r in para:
            t, sz, col, bold = r[0], r[1], r[2], r[3]
            fnt = r[4] if len(r) > 4 else FONT
            run = p.add_run(); run.text = t
            run.font.size = Pt(sz); run.font.color.rgb = col
            run.font.bold = bold; run.font.name = fnt
            if len(r) > 5 and r[5]:  # italic
                run.font.italic = True
    return tb


def bullets(slide, x, y, w, h, items, size=15, color=INK, gap=10, bullet_col=ACCENT,
            line_spacing=1.12):
    """items: list of (bold_part, rest) or plain str."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(gap); p.line_spacing = line_spacing
        b = p.add_run(); b.text = "\u25AA  "
        b.font.size = Pt(size); b.font.color.rgb = bullet_col
        b.font.bold = True; b.font.name = FONT
        if isinstance(it, tuple):
            r1 = p.add_run(); r1.text = it[0]
            r1.font.size = Pt(size); r1.font.color.rgb = color
            r1.font.bold = True; r1.font.name = FONT_H
            if it[1]:
                r2 = p.add_run()
                r2.text = it[1] if it[1][:1] in (" ", "") else " " + it[1]
                r2.font.size = Pt(size); r2.font.color.rgb = SLATE
                r2.font.name = FONT
        else:
            r = p.add_run(); r.text = it
            r.font.size = Pt(size); r.font.color.rgb = SLATE; r.font.name = FONT
    return tb



def transition(slide, kind="fade", dur=700):
    """Hieu ung chuyen slide muot. PowerPoint khong ho tro qua python-pptx nen
    phai tu ghep XML. kind: fade | push | wipe | morph.  dur: ms."""
    from lxml import etree
    P = "http://schemas.openxmlformats.org/presentationml/2006/main"
    P14 = "http://schemas.microsoft.com/office/powerpoint/2010/main"
    P16 = "http://schemas.microsoft.com/office/powerpoint/2016/main"
    P159 = "http://schemas.microsoft.com/office/powerpoint/2015/09/main"
    MC = "http://schemas.openxmlformats.org/markup-compatibility/2006"
    E = etree.Element
    NS = {"p": P, "p14": P14, "p16": P16, "p159": P159, "mc": MC}

    def mk_trans(parent_nsmap, inner):
        t = E("{%s}transition" % P, nsmap=parent_nsmap)
        t.set("{%s}dur" % P14, str(dur))
        t.append(inner)
        return t

    if kind == "morph":
        # mc:AlternateContent: morph cho Office 2019+, fade cho ban cu.
        # Moi prefix dung trong Requires/Choice PHAI duoc khai bao.
        ac = E("{%s}AlternateContent" % MC, nsmap=NS)
        choice = E("{%s}Choice" % MC, nsmap=NS)
        choice.set("Requires", "p159")
        choice.append(mk_trans(NS, E("{%s}morph" % P16, nsmap=NS)))
        fb = E("{%s}Fallback" % MC, nsmap=NS)
        fb.append(mk_trans(NS, E("{%s}fade" % P, nsmap=NS)))
        ac.append(choice); ac.append(fb)
        child = ac
    else:
        inner = {"push": E("{%s}push" % P, nsmap=NS),
                 "wipe": E("{%s}wipe" % P, nsmap=NS),
                 "fade": E("{%s}fade" % P, nsmap=NS)}[kind]
        if kind in ("push", "wipe"):
            inner.set("dir", "u" if kind == "push" else "r")
        child = mk_trans(NS, inner)

    # <p:transition> chen ngay truoc <p:clrMapOvr> (khong co thi them vao cuoi).
    clr = slide._element.find(qn("p:clrMapOvr"))
    if clr is not None:
        clr.addprevious(child)
    else:
        slide._element.append(child)


def slide_base(title=None, kicker=None, num=None, bg=BG):
    s = prs.slides.add_slide(BLANK)
    rect(s, 0, 0, W, H, fill=bg)
    # dai mau tren cung, chuyen sac nhe cho de nhin
    rect(s, 0, 0, W, Inches(0.075), fill=ACCENT)
    rect(s, 0, Inches(0.075), W, Inches(0.03), fill=SOFT)
    if kicker:
        text(s, Inches(0.8), Inches(0.36), Inches(9), Inches(0.3),
             [(kicker.upper(), 11.5, ACCENT, True, FONT)])
    if title:
        text(s, Inches(0.8), Inches(0.62), Inches(11.6), Inches(0.7),
             [(title, 31, INK, True, FONT_H)])
        # gach chan mem: dai nhat dan + vien tron
        rect(s, Inches(0.82), Inches(1.30), Inches(1.35), Inches(0.06), fill=ACCENT2,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    if num is not None:
        # so trang trong vong tron mem
        rect(s, Inches(12.42), Inches(0.36), Inches(0.42), Inches(0.42),
             fill=SOFT, shape=MSO_SHAPE.OVAL)
        text(s, Inches(12.42), Inches(0.44), Inches(0.42), Inches(0.3),
             [(f"{num:02d}", 11, ACCENT, True, FONT)], align=PP_ALIGN.CENTER)
    transition(s)
    return s


def card(slide, x, y, w, h, title, body, accent=ACCENT, icon=None, tsize=15.5,
         bsize=13, fill=WHITE, center=True):
    """The noi dung can giua, chu to hon, vien mem + bong nhe.
    Tu dong thu nho chu neu doan van dai hon o -> khong tran khoi card."""
    # uoc luong bao thu (pessimistic): it ky tu/dong hon thuc te -> chu nho hon
    # mot chut nhung khong bao gio tran khoi card.
    avail_w = (w - Inches(0.7)) / 914400.0
    def _need_h(sz):
        per_line = max(1, int(avail_w * 96 * 1.55 / sz))
        lines = max(1, (len(body) + per_line - 1) // per_line)
        # 1.42: bu cho xuong dong that + chieu cao dong
        return lines * sz * 1.42 / 72.0
    box_h = (h - Inches(0.78)) / 914400.0
    while bsize > 9 and _need_h(bsize) > box_h:
        bsize -= 0.5
    rect(slide, x, y, w, h, fill=fill, line=LINE, lw=0.75, shadow=True,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
    # vach accent bo tron tren cung (mem hon vach doc)
    rect(slide, x + Inches(0.28), y, w - Inches(0.56), Inches(0.075),
         fill=accent, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    al = PP_ALIGN.CENTER if center else PP_ALIGN.LEFT
    pad = Inches(0.3)
    ty = y + Inches(0.2)
    if icon:
        text(slide, x, ty, w, Inches(0.34), [(icon, 17, accent, True)], align=al)
        ty += Inches(0.36)
    text(slide, x + pad, ty, w - 2 * pad, Inches(0.38),
         [(title, tsize, INK, True, FONT_H)], align=al)
    text(slide, x + pad, ty + Inches(0.4), w - 2 * pad, h - Inches(0.75),
         [(body, bsize, SLATE, False)], align=al, line_spacing=1.18)
    return


def pill(slide, x, y, w, h, label, fill, tcol=WHITE, size=11.5):
    rect(slide, x, y, w, h, fill=fill, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    text(slide, x, y + Emu(int(h * 0.16)), w, h, [(label, size, tcol, True)],
         align=PP_ALIGN.CENTER)


def foot(slide, txt="BTL Cơ sở dữ liệu  —  HRM Portal  —  thanhtug07"):
    rect(slide, 0, H - Inches(0.42), W, Inches(0.01), fill=LINE)
    text(slide, Inches(0.75), H - Inches(0.36), Inches(10), Inches(0.3),
         [(txt, 9.5, MUTED, False)])


def vlist(slide, x, y, w, h, items, size=13.5, gap=11, mark="\u2713",
          mark_col=GREEN, color=SLATE, align=PP_ALIGN.LEFT):
    """Danh sach co dau dau dong, chu to ro, de doc khi bao cao."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(gap); p.line_spacing = 1.15; p.alignment = align
        r0 = p.add_run(); r0.text = mark + "  "
        r0.font.size = Pt(size); r0.font.color.rgb = mark_col
        r0.font.bold = True; r0.font.name = FONT
        r1 = p.add_run(); r1.text = it
        r1.font.size = Pt(size); r1.font.color.rgb = color; r1.font.name = FONT
    return tb


def col_header(slide, x, y, w, h, label, color, size=14.5):
    """Tieu de cot trong box: nen dac, bo goc tren, chu can giua."""
    rect(slide, x, y, w, h, fill=color, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.12))
    rect(slide, x, y + h - Inches(0.16), w, Inches(0.16), fill=color)
    text(slide, x, y, w, h, [(label.upper(), size, WHITE, True, FONT_H)],
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


# ================================================================ 1. TITLE
def s_title():
    s = prs.slides.add_slide(BLANK)
    rect(s, 0, 0, W, H, fill=NAVY)
    transition(s, "morph", 900)
    # decorative gradient-ish blocks
    rect(s, W - Inches(4.9), 0, Inches(4.9), H, fill=NAVY2)
    rect(s, W - Inches(4.9), 0, Inches(0.06), H, fill=ACCENT)
    for i, (yy, hh, col) in enumerate([
        (Inches(0.0), Inches(2.5), ACCENT), (Inches(2.5), Inches(2.5), ACCENT2),
        (Inches(5.0), Inches(2.5), TEAL)]):
        rect(s, W - Inches(0.55), yy, Inches(0.18), hh, fill=col)
    text(s, Inches(0.9), Inches(0.72), Inches(7.5), Inches(0.4),
         [("TRƯỜNG ĐẠI HỌC ĐẠI NAM  •  KHOA CÔNG NGHỆ THÔNG TIN", 11.5, RGBColor(0xC9,0xD6,0xE8), True)])
    text(s, Inches(0.9), Inches(1.2), Inches(7.4), Inches(0.4),
         [("BÀI TẬP LỚN  •  HỌC PHẦN: CƠ SỞ DỮ LIỆU", 13.5, ACCENT, True)])
    text(s, Inches(0.9), Inches(1.78), Inches(7.6), Inches(1.1),
         [("QUẢN LÝ NHÂN SỰ", 44, WHITE, True, FONT_H)], line_spacing=0.95)
    text(s, Inches(0.9), Inches(2.7), Inches(7.4), Inches(1.05),
         [[("Thiết kế & xây dựng cơ sở dữ liệu", 19, RGBColor(0xC9,0xD6,0xE8), False, FONT_H)],
          [("hệ thống Quản lý Nhân sự (HRM)", 19, RGBColor(0xC9,0xD6,0xE8), False, FONT_H)]],
         space_after=2, line_spacing=1.0)
    rect(s, Inches(0.93), Inches(3.78), Inches(1.4), Inches(0.05), fill=ACCENT2)
    text(s, Inches(0.9), Inches(4.0), Inches(7.5), Inches(0.8),
         [("12 bảng  ·  14 quan hệ khóa ngoại  ·  6 view  ·  3 stored procedure  ·  3 trigger", 12,
           RGBColor(0x9F,0xB2,0xCC), False)])
    text(s, Inches(0.9), Inches(4.38), Inches(7.5), Inches(0.5),
         [("Ứng dụng demo:  ASP.NET Core 8  ·  SQL Server 2022  ·  React 19", 12,
           RGBColor(0x9F,0xB2,0xCC), False)])
    text(s, Inches(0.9), Inches(5.2), Inches(7.5), Inches(0.4),
         [("GVHD:  ThS. Nguyễn Ngọc Ân", 13, WHITE, True)])
    text(s, Inches(0.9), Inches(5.68), Inches(7.5), Inches(1.0),
         [[("SVTH:  Đoàn Thanh Tùng (1971040034)  ·  Trương Hoàng Phong (1971040022)", 11,
            RGBColor(0xC9,0xD6,0xE8), False)],
          [("Trần Hữu Phước (1971070006)             Hà Nội, 2026", 11,
            RGBColor(0x9F,0xB2,0xCC), False)]], space_after=3)
    # right panel stat block
    stats = [("12", "bảng dữ liệu"), ("14", "quan hệ khóa ngoại"), ("26", "câu lệnh DML")]
    yy = Inches(2.15)
    for v, lb in stats:
        text(s, W - Inches(4.25), yy, Inches(3.3), Inches(0.8),
             [(v, 40, WHITE, True, FONT_H)], align=PP_ALIGN.CENTER)
        text(s, W - Inches(4.25), yy + Inches(0.72), Inches(3.3), Inches(0.3),
             [(lb, 12, RGBColor(0x9F,0xB2,0xCC), False)], align=PP_ALIGN.CENTER)
        yy += Inches(1.45)


# ================================================================ 2. AGENDA
def s_agenda():
    s = slide_base("Nội dung trình bày", kicker="Agenda", num=2)
    items = [
        ("01", "Lý do chọn đề tài & Yêu cầu", "Phân tích yêu cầu, xác định 12 thực thể và thuộc tính", ACCENT),
        ("02", "Mô hình ER (Crow's foot)", "Ký pháp, sơ đồ tổng thể, 14 mối quan hệ", PURPLE),
        ("03", "Chuyển ER → Mô hình quan hệ", "7 quy tắc, 12 lược đồ, đặc tả chi tiết bảng", TEAL),
        ("04", "Chuẩn hóa 3NF / BCNF", "Phân tích phụ thuộc hàm, 3 bước phân rã", GREEN),
        ("05", "Cài đặt trên SQL Server", "DDL, 26 câu lệnh, 10 truy vấn, view/SP/trigger", ACCENT2),
        ("06", "Kiểm thử hệ thống", "78 test backend (xUnit) + 191 test E2E (Playwright)", RED),
        ("07", "Kết luận & Hướng phát triển", "Kết quả đạt được, bài học kinh nghiệm, roadmap", GOLD),
        ("08", "Tài liệu tham khảo", "5 tài liệu giáo trình & nguồn tham khảo", SLATE),
    ]
    x0, y0 = Inches(0.75), Inches(1.75)
    cw, ch, gx, gy = Inches(3.85), Inches(1.18), Inches(0.3), Inches(0.26)
    for i, (n, t, d, c) in enumerate(items):
        cx = x0 + (i % 3) * (cw + gx)
        cy = y0 + (i // 3) * (ch + gy)
        rect(s, cx, cy, cw, ch, fill=WHITE, line=LINE, shadow=True, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, cx, cy, Inches(0.5), ch, fill=c, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.16)
        rect(s, cx + Inches(0.25), cy, Inches(0.25), ch, fill=c)
        text(s, cx, cy + Inches(0.3), Inches(0.5), Inches(0.5),
             [(n, 18, WHITE, True, FONT_H)], align=PP_ALIGN.CENTER)
        text(s, cx + Inches(0.66), cy + Inches(0.2), cw - Inches(0.85), Inches(0.4),
             [(t, 15, INK, True, FONT_H)])
        text(s, cx + Inches(0.66), cy + Inches(0.58), cw - Inches(0.85), Inches(0.5),
             [(d, 11.5, SLATE, False)], line_spacing=1.05)
    foot(s)


# ================================================================ 3. PROBLEM
def s_problem():
    s = slide_base("Lý do chọn đề tài & Mục tiêu", kicker="01  •  Lý do & Yêu cầu", num=3)
    text(s, Inches(0.75), Inches(1.6), Inches(5.9), Inches(0.4),
         [("Vấn đề thực tế", 15, INK, True, FONT_H)])
    card(s, Inches(0.75), Inches(1.98), Inches(5.9), Inches(1.52),
         "Dữ liệu nhân sự phân tán",
         "Hồ sơ, hợp đồng, chấm công, nghỉ phép, lương nằm rải rác trên giấy và nhiều tệp Excel rời nhau — "
         "đối chiếu mất thời gian và dễ sai.", accent=RED, icon="\u26A0")
    card(s, Inches(0.75), Inches(3.62), Inches(5.9), Inches(1.42),
         "Thiết kế sai gây dư thừa",
         "Không chuẩn hóa thì dữ liệu trùng lặp, sửa chỗ này lệch chỗ kia, "
         "thông tin thất lạc và chi phí bảo trì về sau rất cao.", accent=ACCENT2, icon="\u26A0")
    card(s, Inches(0.75), Inches(5.16), Inches(5.9), Inches(1.36),
         "Cần kiểm chứng bằng thực nghiệm",
         "Không chỉ vẽ thiết kế: toàn bộ CSDL phải chạy thật trên SQL Server "
         "với dữ liệu mẫu lớn và các nghiệp vụ tự động.", accent=GOLD, icon="\u26A0")

    text(s, Inches(7.05), Inches(1.6), Inches(5.5), Inches(0.4),
         [("Ba lý do chọn đề tài", 15, INK, True, FONT_H)])
    goals = [
        ("Gần gũi, dễ kiểm chứng", " — phòng ban, chức vụ, hợp đồng, chấm công, lương, nghỉ phép ai cũng từng thấy."),
        ("Đủ phức tạp để thể hiện kiến thức học phần", " — đủ loại quan hệ: 1–N, 1–1 và quan hệ tự thân."),
        ("Kiểm chứng được bằng thực nghiệm", " — 100 nhân viên, gần 4.000 dòng chấm công, trigger & SP tự động."),
        ("Tập trung hóa dữ liệu", " thành một CSDL quan hệ chuẩn hóa 3NF."),
        ("Ràng buộc toàn vẹn ở tầng CSDL", " — khoá ngoại và CHECK không thể thay bằng kiểm tra ở tầng ứng dụng."),
        ("Ứng dụng demo", " để thử nghiệm: ASP.NET Core 8 + React 19 dùng chính CSDL này."),
    ]
    bullets(s, Inches(7.05), Inches(2.05), Inches(5.55), Inches(4.3), goals,
            size=13, gap=13, bullet_col=GREEN)
    foot(s)


def s_stack():
    s = slide_base("Ngăn xếp công nghệ", kicker="01  •  Giới thiệu", num=4)
    groups = [
        ("BACKEND", ACCENT, [
            "ASP.NET Core 8 Web API",
            "Entity Framework Core 8 (Database-First)",
            "JWT Bearer Authentication",
            "BCrypt.Net — hash mật khẩu (cost 11)",
            "FluentValidation — kiểm tra đầu vào",
            "Serilog — ghi log có cấu trúc",
            "Swagger / OpenAPI 3",
        ]),
        ("CƠ SỞ DỮ LIỆU", TEAL, [
            "Microsoft SQL Server 2022",
            "Collation Vietnamese_CI_AS",
            "3 Stored Procedure  ·  3 Trigger",
            "6 View báo cáo",
            "Index + ràng buộc CHECK/UNIQUE/FK",
            "Transaction & khóa khoảng (UPDLOCK)",
        ]),
        ("FRONTEND", PURPLE, [
            "React 19 + TypeScript 6",
            "Vite 8 — build & dev server",
            "Ant Design 6 — thư viện UI",
            "Zustand 5 — quản lý state",
            "Axios — HTTP client",
            "@hello-pangea/dnd — kéo thả Kanban",
            "Recharts — biểu đồ dashboard",
        ]),
    ]
    x0 = Inches(0.75); cw = Inches(3.87); gx = Inches(0.3)
    for i, (t, c, lst) in enumerate(groups):
        x = x0 + i * (cw + gx)
        rect(s, x, Inches(1.7), cw, Inches(5.0), fill=WHITE, line=LINE, shadow=True,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        col_header(s, x, Inches(1.7), cw, Inches(0.68), t, c, size=15)
        vlist(s, x + Inches(0.3), Inches(2.62), cw - Inches(0.6), Inches(3.9),
              lst, size=13.5, gap=11, mark="\u2713", mark_col=c)
    foot(s)


# ================================================================ 5. ARCHITECTURE
def s_arch():
    s = slide_base("Kiến trúc hệ thống — Clean Architecture", kicker="02  •  Kiến trúc", num=5)
    layers = [
        ("HRM.API", "Presentation", "Controllers · Middleware · Program.cs",
         "44 endpoint REST, xử lý JWT, CORS, Swagger", ACCENT),
        ("HRM.Application", "Application", "Services · Validators",
         "Nghiệp vụ + phân quyền + FluentValidation", PURPLE),
        ("HRM.Infrastructure", "Data Access", "AppDbContext · EF Configurations · PasswordHasher",
         "Ánh xạ entity lên CSDL có sẵn (Database-First)", TEAL),
        ("HRM.Core", "Domain", "Entities · DTOs · Interfaces · Constants",
         "Thuần domain, KHÔNG phụ thuộc framework", GREEN),
    ]
    y = Inches(1.75)
    for i, (name, role, comps, desc, c) in enumerate(layers):
        x = Inches(0.75) + Inches(i * 0.22)
        w = Inches(7.4) - Inches(i * 0.44)
        rect(s, x, y, w, Inches(0.86), fill=WHITE, line=LINE,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.12)
        rect(s, x, y, Inches(0.09), Inches(0.86), fill=c)
        rect(s, x + Inches(0.2), y + Inches(0.17), Inches(2.35), Inches(0.52), fill=c,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.2)
        text(s, x + Inches(0.2), y + Inches(0.29), Inches(2.35), Inches(0.35),
             [(name, 12, WHITE, True, FONT_H)], align=PP_ALIGN.CENTER)
        text(s, x + Inches(2.7), y + Inches(0.11), w - Inches(2.9), Inches(0.3),
             [(role, 11.5, c, True), ("   " + comps, 11.5, SLATE, False)])
        text(s, x + Inches(2.7), y + Inches(0.44), w - Inches(2.9), Inches(0.35),
             [(desc, 11, MUTED, False)])
        y += Inches(1.02)
        if i < 3:
            text(s, x + Inches(0.35), y - Inches(0.28), Inches(5), Inches(0.28),
                 [("\u25BC  phụ thuộc", 9.5, MUTED, False, FONT, True)])
    # request flow on the right
    rx = Inches(8.6)
    text(s, rx, Inches(1.62), Inches(4.0), Inches(0.35),
         [("Luồng xử lý một request", 15, INK, True, FONT_H)])
    flow = [("React SPA", "Gửi HTTP + JWT Bearer", ACCENT),
            ("Controller", "Xác thực & phân quyền theo vai trò", PURPLE),
            ("Service", "Nghiệp vụ + kiểm tra quyền sở hữu", TEAL),
            ("EF Core / SP", "Truy vấn có tham số, transaction", GREEN),
            ("SQL Server", "Bảng · View · Trigger · SP", GOLD)]
    fy = Inches(2.08)
    for i, (t, d, c) in enumerate(flow):
        rect(s, rx, fy, Inches(4.0), Inches(0.72), fill=WHITE, line=LINE,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.14)
        rect(s, rx, fy, Inches(0.07), Inches(0.72), fill=c)
        text(s, rx + Inches(0.22), fy + Inches(0.1), Inches(3.7), Inches(0.3),
             [(t, 12.5, INK, True, FONT_H)])
        text(s, rx + Inches(0.22), fy + Inches(0.38), Inches(3.7), Inches(0.3),
             [(d, 10.5, MUTED, False)])
        if i < 4:
            text(s, rx + Inches(1.9), fy + Inches(0.7), Inches(0.3), Inches(0.24),
                 [("\u25BC", 11, MUTED, True)], align=PP_ALIGN.CENTER)
        fy += Inches(0.9)
    foot(s)


# ================================================================ 6. ERD
def s_erd():
    s = slide_base("Sơ đồ quan hệ thực thể (ERD)", kicker="03  •  Cơ sở dữ liệu", num=6)
    text(s, Inches(0.75), Inches(1.55), Inches(11.8), Inches(0.35),
         [("12 bảng — nhóm danh mục, nhóm nhân sự/nghiệp vụ, nhóm Kanban", 12.5, MUTED, False)])

    def ent(x, y, w, name, fields, c, hdr=0.34):
        hh = Inches(hdr) + Inches(0.215) * len(fields)
        rect(s, x, y, w, hh, fill=WHITE, line=LINE, shadow=True, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, x, y, w, Inches(hdr), fill=c, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, x, y + Inches(hdr) - Inches(0.08), w, Inches(0.08), fill=c)
        text(s, x, y + Inches(0.055), w, Inches(0.27), [(name, 11, WHITE, True, FONT_H)],
             align=PP_ALIGN.CENTER)
        fy = y + Inches(hdr) + Inches(0.05)
        for f in fields:
            text(s, x + Inches(0.13), fy, w - Inches(0.22), Inches(0.2),
                 [(f, 9.2, SLATE, False)])
            fy += Inches(0.215)
        return hh

    # Danh muc
    ent(Inches(0.75), Inches(1.98), Inches(2.15), "PhongBan",
        ["PK MaPB", "TenPB", "MaNV_QL  (FK)"], TEAL)
    ent(Inches(0.75), Inches(3.6), Inches(2.15), "ChucVu",
        ["PK MaCV", "TenCV", "LuongCoBan"], TEAL)
    ent(Inches(0.75), Inches(5.12), Inches(2.15), "CauHinhChamCong",
        ["PK MaCH", "GioVao / GioRa", "NguongTre"], TEAL)

    # Core
    ent(Inches(3.22), Inches(1.98), Inches(2.35), "NhanVien",
        ["PK MaNV", "HoTen, CCCD, Email", "MaPB (FK), MaCV (FK)", "TrangThai"], ACCENT)
    ent(Inches(3.22), Inches(3.72), Inches(2.35), "HopDong",
        ["PK MaHD", "MaNV (FK)", "LoaiHD, Luong", "NgayBatDau/KetThuc"], ACCENT)
    ent(Inches(3.22), Inches(5.52), Inches(2.35), "TaiKhoan",
        ["PK MaTK", "TenDangNhap (UQ)", "VaiTro (CHECK)", "MaNV (FK)"], ACCENT2)

    # Nghiep vu
    ent(Inches(5.92), Inches(1.98), Inches(2.3), "ChamCong",
        ["PK MaCC", "MaNV (FK)", "Ngay (UQ+)", "TrangThai, SoLanTre"], PURPLE)
    ent(Inches(5.92), Inches(3.42), Inches(2.3), "NghiPhep",
        ["PK MaNP", "MaNV (FK)", "TuNgay/DenNgay", "TrangThai"], PURPLE)
    ent(Inches(5.92), Inches(4.86), Inches(2.3), "BangLuong",
        ["PK MaBL", "MaNV+Thang+Nam (UQ)", "ThucLinh (PERSISTED)"], PURPLE)
    ent(Inches(5.92), Inches(5.98), Inches(2.3), "ChiPhiPhatSinh",
        ["PK MaPS", "MaNV (FK)", "Loai, SoTien"], PURPLE)

    # Kanban
    ent(Inches(8.62), Inches(1.98), Inches(2.4), "CongViec",
        ["PK MaTask", "MaNV_PhuTrach (FK)", "TrangThai (CHECK)", "ViTri (gap 1000)", "Deadline"], GREEN)
    ent(Inches(8.62), Inches(4.2), Inches(2.4), "BinhLuan",
        ["PK MaBL", "MaTask (FK)", "MaNV (FK)", "NoiDung"], GREEN)

    # legend
    rect(s, Inches(11.35), Inches(1.98), Inches(1.28), Inches(2.64), fill=WHITE, line=LINE,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.07)
    text(s, Inches(11.47), Inches(2.08), Inches(1.05), Inches(0.3), [("Nh\u00f3m b\u1ea3ng", 10.5, INK, True)])
    legs = [("Danh m\u1ee5c", TEAL), ("Nh\u00e2n s\u1ef1", ACCENT), ("Nghi\u1ec7p v\u1ee5", PURPLE),
            ("Kanban", GREEN), ("T\u00e0i kho\u1ea3n", ACCENT2)]
    ly = Inches(2.45)
    for t, c in legs:
        rect(s, Inches(11.47), ly + Inches(0.04), Inches(0.15), Inches(0.15), fill=c)
        text(s, Inches(11.7), ly, Inches(0.9), Inches(0.25), [(t, 9.2, SLATE, False)])
        ly += Inches(0.4)
    foot(s)


# ================================================================ 7. TABLES DETAIL
def s_tables():
    s = slide_base("Chi tiết các bảng & ràng buộc", kicker="03  •  Cơ sở dữ liệu", num=7)
    rows = [
        ("PhongBan", "Mã phòng, tên, trưởng phòng", "PK · FK → NhanVien"),
        ("ChucVu", "Chức danh, lương cơ bản", "PK"),
        ("NhanVien", "Hồ sơ nhân viên, giới tính, trạng thái", "PK · FK PB/CV"),
        ("HopDong", "Hợp đồng: loại, lương, thời hạn", "PK · FK · CHECK ngày"),
        ("ChamCong", "Chấm công theo ngày, số lần trễ", "PK · FK · UQ(MaNV,Ngay)"),
        ("NghiPhep", "Đơn nghỉ phép, khoảng ngày, trạng thái", "PK · FK · CHECK"),
        ("BangLuong", "Bảng lương tháng, ThucLinh (cột PERSISTED)", "PK · FK · UQ (MaNV,Thang,Nam)"),
        ("ChiPhiPhatSinh", "Thưởng / công tác phí / phạt / ứng lương", "PK · FK · CHECK loại"),
        ("CongViec", "Task Kanban, vị trí gap 1000, độ ưu tiên", "PK · FK ×2 · CHECK ×3"),
        ("TaiKhoan", "Đăng nhập, vai trò, hash mật khẩu", "PK · UQ · FK · CHECK vai trò"),
        ("BinhLuan", "Bình luận trên task", "PK · FK ×2"),
        ("CauHinhChamCong", "Cấu hình khung giờ để xác định đi trễ", "PK"),
    ]
    x, y = Inches(0.75), Inches(1.72)
    cw = Inches(11.85)
    hdr_h = Inches(0.42)
    rect(s, x, y, cw, hdr_h, fill=NAVY, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
    rect(s, x, y + Inches(0.2), cw, Inches(0.22), fill=NAVY)
    text(s, x + Inches(0.2), y + Inches(0.09), Inches(2.2), Inches(0.3), [("BẢNG", 11, WHITE, True)])
    text(s, x + Inches(2.6), y + Inches(0.09), Inches(5.2), Inches(0.3), [("MÔ TẢ", 11, WHITE, True)])
    text(s, x + Inches(8.2), y + Inches(0.09), Inches(3.5), Inches(0.3), [("RÀNG BUỘC CHÍNH", 11, WHITE, True)])
    ry = y + hdr_h
    rh = Inches(0.352)
    for i, (n, d, c) in enumerate(rows):
        if i % 2 == 0:
            rect(s, x, ry, cw, rh, fill=WHITE)
        else:
            rect(s, x, ry, cw, rh, fill=RGBColor(0xF0,0xF4,0xFA))
        text(s, x + Inches(0.2), ry + Inches(0.06), Inches(2.3), Inches(0.3),
             [(n, 11, INK, True, FONT_H)])
        text(s, x + Inches(2.6), ry + Inches(0.06), Inches(5.4), Inches(0.3),
             [(d, 11, SLATE, False)])
        text(s, x + Inches(8.2), ry + Inches(0.06), Inches(3.6), Inches(0.3),
             [(c, 10.5, ACCENT, False)])
        ry += rh
    foot(s)


# ================================================================ 8. NORMALIZATION
def s_normalize():
    s = slide_base("Chuẩn hóa lược đồ quan hệ (3NF / BCNF)", kicker="04  •  Chuẩn hóa", num=8)
    card(s, Inches(0.75), Inches(1.62), Inches(3.87), Inches(1.72),
         "1NF — Nguyên tố",
         "Mọi thuộc tính là nguyên tố, không cột nào chứa giá trị đa trị. "
         "Danh sách đa trị (ví dụ nhiều số điện thoại) đều đã tách sang bảng riêng.", accent=ACCENT, icon="\u2460")
    card(s, Inches(4.73), Inches(1.62), Inches(3.87), Inches(1.72),
         "2NF — Phụ thuộc đầy đủ",
         "Không có phụ thuộc bộ phận. Các bảng đều dùng khoá chính một cột nên "
         "phụ thuộc hàm vốn đã đầy đủ → tất cả đạt 2NF.", accent=PURPLE, icon="\u2461")
    card(s, Inches(8.71), Inches(1.62), Inches(3.87), Inches(1.72),
         "3NF — Không bắc cầu",
         "Không thuộc tính không khoá nào phụ thuộc vào thuộc tính không khoá khác. "
         "3NF là mức chuẩn mục tiêu của đề cương học phần.", accent=TEAL, icon="\u2462")

    # three decomposition steps
    text(s, Inches(0.75), Inches(3.5), Inches(11.8), Inches(0.35),
         [("Ba bước phân rã đến 3NF", 14.5, INK, True, FONT_H)])
    steps = [
        ("Bước 1", "Đạt 1NF",
         "Bỏ thuộc tính lặp: tách “danh sách phòng ban” thành bảng PhongBan riêng, thay bằng khoá ngoại MaPB.", ACCENT),
        ("Bước 2", "Đạt 2NF",
         "Bỏ phụ thuộc bộ phận: đưa TenPB về PhongBan, đưa TenCV và LuongCoBan về ChucVu; NhanVien chỉ giữ MaPB, MaCV.", PURPLE),
        ("Bước 3", "Đạt 3NF",
         "Bỏ phụ thuộc bắc cầu MaNV → MaPB → TenPB và MaNV → MaCV → LuongCoBan bằng cách tách bảng.", TEAL),
    ]
    x0, cw, gx = Inches(0.75), Inches(3.87), Inches(0.3)
    for i, (n, t, d, c) in enumerate(steps):
        x = x0 + i * (cw + gx)
        rect(s, x, Inches(3.92), cw, Inches(1.28), fill=WHITE, line=LINE, shadow=True,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, x, Inches(3.92), Inches(0.07), Inches(1.28), fill=c)
        text(s, x + Inches(0.18), Inches(4.02), Inches(2.0), Inches(0.3),
             [(n, 11.5, c, True, FONT_H), ("  —  " + t, 11.5, INK, True, FONT_H)])
        text(s, x + Inches(0.18), Inches(4.38), cw - Inches(0.36), Inches(0.8),
             [(d, 11, SLATE, False)], line_spacing=1.08)

    # BCNF + denormalization
    card(s, Inches(0.75), Inches(5.34), Inches(5.75), Inches(1.62),
         "Kiểm tra BCNF",
         "Chỉ xét bảng có ≥ 2 khoá ứng viên chồng lấn. NhanVien có MaNV (PK) và CCCD (UNIQUE); "
         "TaiKhoan có MaTK và TenDangNhap — mọi phụ thuộc hàm đều có vế trái là siêu khoá. "
         "Tất cả bảng đạt BCNF.", accent=GREEN, icon="\u2714", bsize=11.5)
    card(s, Inches(6.85), Inches(5.34), Inches(5.75), Inches(1.62),
         "Phi chuẩn hóa có kiểm soát",
         "Ngoại lệ cố ý: cột ThucLinh trong BangLuong là thuộc tính dẫn xuất. Dùng cột "
         "PERSISTED để SQL Server tự tính và lưu — đổi chút dung lượng lấy tốc độ truy vấn.", accent=ACCENT2, icon="\u2699", bsize=11.5)
    foot(s)


# ================================================================ 9. SQL PROGRAMMING
def s_sqlprog():
    s = slide_base("Lập trình phía CSDL", kicker="04  •  View · SP · Trigger", num=9)

    def block(x, y, w, h, title, color, items):
        rect(s, x, y, w, h, fill=WHITE, line=LINE, shadow=True, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, x, y, w, Inches(0.55), fill=color, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, x, y + Inches(0.35), w, Inches(0.2), fill=color)
        text(s, x, y + Inches(0.12), w, Inches(0.35), [(title, 14, WHITE, True, FONT_H)],
             align=PP_ALIGN.CENTER)
        tb = s.shapes.add_textbox(x + Inches(0.25), y + Inches(0.68), w - Inches(0.5), h - Inches(0.78))
        tf = tb.text_frame; tf.word_wrap = True
        for j, it in enumerate(items):
            p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
            p.space_after = Pt(6); p.line_spacing = 1.0
            r = p.add_run(); r.text = it
            r.font.size = Pt(10.5); r.font.color.rgb = SLATE; r.font.name = FONT
            r.font.bold = "—" in it and it.split("—")[0].strip() != ""

    block(Inches(0.75), Inches(1.68), Inches(3.87), Inches(3.1), "6 VIEW", TEAL,
          ["VW_DanhSachNhanVien — hồ sơ kèm phòng ban, chức vụ",
           "VW_ChamCongThang — tổng hợp công theo tháng",
           "VW_BangLuongChiTiet — phiếu lương chi tiết",
           "VW_BoardKanban — dữ liệu bảng Kanban",
           "VW_TaskQuaHan — các task đã quá hạn",
           "VW_NangSuatNhanVien — năng suất theo nhân viên"])
    block(Inches(4.73), Inches(1.68), Inches(3.87), Inches(3.1), "3 STORED PROCEDURE", GREEN,
          ["SP_ThemNhanVien — sinh mã tự động (UPDLOCK, HOLDLOCK)",
           "SP_DiChuyenTask — di chuyển task + re-index vị trí",
           "SP_TinhLuongThang — tính lương theo kỳ trong transaction"])
    block(Inches(8.71), Inches(1.68), Inches(3.87), Inches(3.1), "3 TRIGGER", PURPLE,
          ["TR_CongViec_Update — tự set/xóa NgayHoanThanh theo cột Done",
           "TR_NghiPhep_Update — duyệt đơn thì tự thêm ngày nghỉ vào chấm công",
           "TR_HopDong_Update — tự đánh dấu hợp đồng hết hạn"])

    # code snippet
    text(s, Inches(0.75), Inches(4.85), Inches(11.8), Inches(0.32),
         [("Trích đoạn — công thức tính lương trong SP_TinhLuongThang", 13.5, INK, True, FONT_H)])
    rect(s, Inches(0.75), Inches(5.2), Inches(11.85), Inches(1.75), fill=NAVY)
    code = [
        [("ThucLinh = LuongCoBan/22 * SoNgayCong", RGBColor(0x9F,0xD8,0x8F)),
         ("   -- lương theo ngày công thực tế (22 công chuẩn)", MUTED)],
        [("        + (500000 + TienThuong)", RGBColor(0xFF,0xD9,0x8A)),
         ("            -- phụ cấp cứng + thưởng từ ChiPhiPhatSinh", MUTED)],
        [("        - (SoLanTre*50000 + TienPhat)", RGBColor(0xFF,0x9C,0x9C)),
         ("      -- phạt đi trễ + phạt khác", MUTED)],
        [("LuongCoBan = FLOOR((cv.LuongCoBan/22.0)*SoNgayCong + 0.5)", RGBColor(0x9C,0xD0,0xFF)),
         ("  -- làm tròn nửa lên", MUTED)],
        [("DELETE kỳ cũ  →  INSERT lại   (1 transaction, UPDLOCK/HOLDLOCK)", RGBColor(0xC9,0xD6,0xE8)),
         ("  -- idempotent", MUTED)],
    ]
    ty = Inches(5.31)
    for line in code:
        text(s, Inches(1.0), ty, Inches(11.4), Inches(0.28),
             [[(t, 11, c, False, "Consolas", f) for (t, c, *f) in line]], line_spacing=1.0)
        ty += Inches(0.32)
    foot(s)


# ================================================================ 10. PAYROLL FLOW
def s_payroll():
    s = slide_base("Nghiệp vụ tính lương — luồng tự động", kicker="04  •  Stored Procedure", num=10)
    steps = [
        ("Chấm công", "Nhân viên check-in/out mỗi ngày vào bảng ChamCong", ACCENT),
        ("Tổng hợp", "SP đếm SoNgayCong (Đủ công) và SoLanTre (Trễ)", PURPLE),
        ("Chi phí", "Cộng Thưởng/Công tác phí, trừ Phạt/Ứng lương (ChiPhiPhatSinh)", ACCENT2),
        ("Tính toán", "ThucLinh = LuongCoBan/22 × ngày công + (500k + thưởng) − (trễ×50k + phạt)", GREEN),
        ("Ghi bảng", "DELETE kỳ cũ → INSERT lại (idempotent), trong 1 transaction", TEAL),
    ]
    x0, cw, gx = Inches(0.75), Inches(2.15), Inches(0.28)
    for i, (t, d, c) in enumerate(steps):
        x = x0 + i * (cw + gx)
        rect(s, x, Inches(1.85), cw, Inches(2.35), fill=WHITE, line=LINE,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.07)
        rect(s, x, Inches(1.85), cw, Inches(0.1), fill=c)
        rect(s, x + Inches(0.28), Inches(2.15), Inches(0.5), Inches(0.5), fill=c,
             shape=MSO_SHAPE.OVAL)
        text(s, x + Inches(0.28), Inches(2.24), Inches(0.5), Inches(0.35),
             [(str(i + 1), 16, WHITE, True, FONT_H)], align=PP_ALIGN.CENTER)
        text(s, x + Inches(0.22), Inches(2.85), cw - Inches(0.44), Inches(0.4),
             [(t, 14, INK, True, FONT_H)], align=PP_ALIGN.CENTER)
        text(s, x + Inches(0.22), Inches(3.25), cw - Inches(0.44), Inches(0.85),
             [(d, 11, SLATE, False)], align=PP_ALIGN.CENTER, line_spacing=1.08)
        if i < 4:
            text(s, x + cw, Inches(2.85), gx, Inches(0.4),
                 [("\u25B6", 15, MUTED, True)], align=PP_ALIGN.CENTER)

    # formula strip
    rect(s, Inches(0.75), Inches(4.55), Inches(11.85), Inches(0.95), fill=NAVY,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1)
    text(s, Inches(1.0), Inches(4.72), Inches(11.4), Inches(0.6),
         [[("Thực lĩnh  =  ", 16, WHITE, True),
           ("Lương cơ bản", 16, RGBColor(0x9F,0xD8,0x8F), True),
           ("  +  ", 16, WHITE, False), ("Phụ cấp", 16, RGBColor(0xFF,0xD9,0x8A), True),
           ("  −  ", 16, WHITE, False), ("Khấu trừ", 16, RGBColor(0xFF,0x9C,0x9C), True)]],
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    bullets(s, Inches(0.75), Inches(5.75), Inches(11.8), Inches(1.2), [
        ("Idempotent:", " chạy lại cùng kỳ cho kết quả giống nhau — không nhân đôi dữ liệu."),
        ("Toàn vẹn:", " SP là nguồn dữ liệu duy nhất, tính lại sẽ đồng bộ với ChiPhiPhatSinh."),
        ("An toàn:", " kiểm tra tháng/năm hợp lệ, dùng transaction + khóa khoảng tránh chèn trùng."),
    ], size=12.5, gap=8, bullet_col=GREEN)
    foot(s)


# ================================================================ 11. BACKEND/SECURITY
def s_security():
    s = slide_base("Backend & Bảo mật", kicker="05  •  Backend", num=11)
    left = [
        ("JWT Bearer", "token ký HMAC, secret đọc từ biến môi trường JWT_SECRET_KEY (bắt buộc ≥ 32 ký tự)."),
        ("BCrypt cost 11", "mật khẩu chỉ lưu dạng hash; không thể đảo ngược."),
        ("RBAC 4 vai trò", "Admin / HR / Trưởng phòng / Nhân viên — kiểm tra bằng [Authorize(Roles=...)]."),
        ("Chống leo thang đặc quyền", "chỉ Admin được gán vai trò Admin; không thể tự xóa/khóa chính mình."),
        ("FluentValidation", "kiểm tra đầu vào tự động cho mọi DTO thay đổi dữ liệu."),
        ("Middleware lỗi toàn cục", "không rò rỉ stack trace hay câu SQL ra client."),
    ]
    text(s, Inches(0.75), Inches(1.65), Inches(5.6), Inches(0.4),
         [("Cơ chế bảo mật", 15, INK, True, FONT_H)])
    bullets(s, Inches(0.75), Inches(2.1), Inches(5.7), Inches(4.6), left,
            size=13, gap=13, bullet_col=ACCENT)

    text(s, Inches(6.85), Inches(1.65), Inches(5.7), Inches(0.4),
         [("Ma trận phân quyền", 15, INK, True, FONT_H)])
    x, y = Inches(6.6), Inches(2.15)
    cw2 = Inches(5.98)
    cols = [Inches(2.78), Inches(0.8), Inches(0.8), Inches(0.9), Inches(0.7)]
    heads = ["Chức năng", "Admin", "HR", "Trưởng phòng", "NV"]
    rect(s, x, y, cw2, Inches(0.4), fill=NAVY)
    cx = x
    for i, hd in enumerate(heads):
        text(s, cx + Inches(0.08), y + Inches(0.08), cols[i] - Inches(0.16), Inches(0.3),
             [(hd, 9.5, WHITE, True)], align=PP_ALIGN.CENTER if i else PP_ALIGN.LEFT)
        cx += cols[i]
    rows = [
        ("Xem bảng lương toàn công ty", "OK", "✖ 403", "✖ 403", "✖ 403"),
        ("Xem phiếu lương của mình", "OK", "OK", "OK", "OK"),
        ("Quản lý nhân viên (CRUD)", "OK", "OK", "—", "—"),
        ("Tạo / giao task Kanban", "OK", "OK", "OK", "—"),
        ("Duyệt đơn nghỉ phép", "OK", "OK", "OK", "—"),
        ("Chấm công của mình", "OK", "OK", "OK", "OK"),
        ("Quản lý tài khoản & vai trò", "OK", "—", "—", "—"),
    ]
    ry = y + Inches(0.4)
    rh = Inches(0.4)
    for i, row in enumerate(rows):
        if i % 2 == 0:
            rect(s, x, ry, cw2, rh, fill=WHITE)
        else:
            rect(s, x, ry, cw2, rh, fill=RGBColor(0xF0,0xF4,0xFA))
        cx = x
        for j, cell in enumerate(row):
            if j == 0:
                text(s, cx + Inches(0.1), ry + Inches(0.09), cols[j] - Inches(0.16), Inches(0.3),
                     [(cell, 9.5, INK, False)])
            elif cell == "OK":
                text(s, cx, ry + Inches(0.07), cols[j], Inches(0.3),
                     [("\u2714", 12, GREEN, True)], align=PP_ALIGN.CENTER)
            elif cell.startswith("\u2716"):
                text(s, cx, ry + Inches(0.09), cols[j], Inches(0.3),
                     [("403", 10, RED, True)], align=PP_ALIGN.CENTER)
            else:
                text(s, cx, ry + Inches(0.09), cols[j], Inches(0.3),
                     [("\u2014", 10, RGBColor(0xC0,0xC8,0xD4), False)], align=PP_ALIGN.CENTER)
            cx += cols[j]
        ry += rh
    rect(s, x, y, cw2, ry - y, fill=None, line=LINE, lw=1)
    text(s, x, ry + Inches(0.12), cw2, Inches(0.5),
         [("Ví dụ: chỉ Admin xem bảng lương toàn công ty; HR và Nhân viên đều bị trả về HTTP 403. Quyền kiểm tra ở tầng server.", 9.5, MUTED, False, FONT, True)])
    foot(s)


# ================================================================ 12. FRONTEND
def s_frontend():
    s = slide_base("Giao diện & Bảng Kanban", kicker="06  •  Frontend", num=12)
    # Kanban mock
    text(s, Inches(0.75), Inches(1.6), Inches(7.4), Inches(0.35),
         [("Bảng Kanban 4 cột — kéo thả gap-based", 15, INK, True, FONT_H)])
    cols = [("Todo", ACCENT, 3), ("InProgress", ACCENT2, 2), ("Review", PURPLE, 2), ("Done", GREEN, 2)]
    bx, by = Inches(0.75), Inches(2.05)
    cwd = Inches(1.82); gxx = Inches(0.06)
    for i, (name, c, n) in enumerate(cols):
        x = bx + i * (cwd + gxx)
        rect(s, x, by, cwd, Inches(0.42), fill=c, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.16)
        text(s, x, by + Inches(0.08), cwd, Inches(0.3), [(name, 10.5, WHITE, True)], align=PP_ALIGN.CENTER)
        cy = by + Inches(0.5)
        for k in range(n):
            rect(s, x, cy, cwd, Inches(0.62), fill=WHITE, line=LINE,
                 shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1)
            rect(s, x, cy, Inches(0.06), Inches(0.62),
                 fill=[RED, GOLD, GREEN][k % 3])
            rect(s, x + Inches(0.14), cy + Inches(0.12), cwd - Inches(0.3), Inches(0.12),
                 fill=LINE)
            rect(s, x + Inches(0.14), cy + Inches(0.31), cwd - Inches(0.6), Inches(0.1), fill=LINE)
            text(s, x + Inches(0.14), cy + Inches(0.44), cwd - Inches(0.3), Inches(0.16),
                 [("NV00" + str(k + 1), 7.5, MUTED, False)])
            cy += Inches(0.7)
    text(s, Inches(0.75), Inches(4.9), Inches(7.4), Inches(0.3),
         [("Thẻ task: viền màu theo độ ưu tiên, cảnh báo đỏ khi quá hạn", 10.5, MUTED, False, FONT, True)])

    # features
    text(s, Inches(8.6), Inches(1.6), Inches(4.0), Inches(0.35),
         [("Tính năng nổi bật", 15, INK, True, FONT_H)])
    feats = [
        ("Kéo thả mượt", "thứ tự gap 1000, tự rebalance khi cạn khoảng trống"),
        ("Tạo nhanh task", "ngay tại cột, không cần mở form"),
        ("Drawer chi tiết", "bình luận, đổi trạng thái, cảnh báo quá hạn"),
        ("Lọc & tìm kiếm", "theo ưu tiên, theo nhân viên, theo từ khóa"),
        ("Phân quyền UI", "menu và nút tự thay đổi theo vai trò"),
        ("Code splitting", "lazy-load từng trang, tối ưu bundle"),
    ]
    bullets(s, Inches(8.6), Inches(2.05), Inches(4.05), Inches(4.6), feats,
            size=12, gap=11, bullet_col=PURPLE)
    foot(s)


# ================================================================ 13. FEATURES MAP
def s_features():
    s = slide_base("Bản đồ chức năng theo vai trò", kicker="06  •  Giao diện", num=13)
    mods = [
        ("Tổng quan", "KPI, biểu đồ theo vai trò", ACCENT, "Admin · HR · NV"),
        ("Kanban", "4 cột, kéo thả, bình luận", GREEN, "Tất cả"),
        ("Nhân viên", "CRUD, lọc, phân trang", TEAL, "Admin · HR"),
        ("Chấm công", "Check-in/out, lịch sử công", PURPLE, "Tất cả"),
        ("Nghỉ phép", "Gửi & duyệt đơn, đồng bộ công", ACCENT2, "Tất cả / duyệt: QL"),
        ("Bảng lương", "Tính lương, thưởng/phạt", GOLD, "Admin · xem riêng"),
        ("Tài khoản", "Tạo, khóa, đổi vai trò", RED, "Chỉ Admin"),
        ("Trang cá nhân", "Hồ sơ, đổi mật khẩu", SLATE, "Tất cả"),
    ]
    x0, y0 = Inches(0.75), Inches(1.8)
    cw, ch, gx, gy = Inches(2.87), Inches(1.55), Inches(0.28), Inches(0.28)
    for i, (t, d, c, role) in enumerate(mods):
        cx = x0 + (i % 4) * (cw + gx)
        cy = y0 + (i // 4) * (ch + gy)
        rect(s, cx, cy, cw, ch, fill=WHITE, line=LINE, shadow=True, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, cx, cy, cw, Inches(0.08), fill=c)
        rect(s, cx + Inches(0.22), cy + Inches(0.28), Inches(0.42), Inches(0.42), fill=c,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.25)
        text(s, cx + Inches(0.22), cy + Inches(0.33), Inches(0.42), Inches(0.35),
             [(t[0], 15, WHITE, True, FONT_H)], align=PP_ALIGN.CENTER)
        text(s, cx + Inches(0.78), cy + Inches(0.32), cw - Inches(0.95), Inches(0.35),
             [(t, 14, INK, True, FONT_H)])
        text(s, cx + Inches(0.22), cy + Inches(0.86), cw - Inches(0.42), Inches(0.4),
             [(d, 11, SLATE, False)], line_spacing=1.05)
        rect(s, cx + Inches(0.22), cy + ch - Inches(0.42), cw - Inches(0.44), Inches(0.28),
             fill=RGBColor(0xF0,0xF4,0xFA), shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.3)
        text(s, cx + Inches(0.22), cy + ch - Inches(0.38), cw - Inches(0.44), Inches(0.25),
             [(role, 9.5, c, True)], align=PP_ALIGN.CENTER)
    foot(s)


# ================================================================ 14. TESTING
def s_testing():
    s = slide_base("Kiểm thử & Độ tin cậy", kicker="07  •  Kiểm thử", num=14)
    layers = [
        ("Backend — xUnit (78 test)", ACCENT, [
            "5 nhóm: ChamCongServiceTests,",
            "NghiPhepServiceTests, ValidatorTests,",
            "ValidatorCoverageTests,",
            "PayrollSqlIntegrationTests",
            "Chạy bằng lệnh: dotnet test",
        ]),
        ("Frontend & E2E — Playwright (191 test)", PURPLE, [
            "6 bộ: SMOKE, UI LAYOUT,",
            "API FUZZ, RBAC, E2E, CLICK-ALL",
            "Kiểm thử từ giao diện đến API thực tế",
            "RBAC: chỉ Admin xem lương toàn công ty,",
            "HR/NV nhận HTTP 403",
        ]),
        ("Kết quả", GREEN, [
            "Tất cả test đều vượt qua",
            "78 test backend (xUnit)",
            "191 test E2E (Playwright)",
            "Tổng: 269 test case",
            "Kiểm chứng trên DB thật",
        ]),
    ]
    x0 = Inches(0.75); cw = Inches(3.87); gx = Inches(0.3)
    for i, (t, c, lst) in enumerate(layers):
        x = x0 + i * (cw + gx)
        rect(s, x, Inches(1.72), cw, Inches(2.75), fill=WHITE, line=LINE, shadow=True,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        col_header(s, x, Inches(1.72), cw, Inches(0.6), t, c, size=13)
        vlist(s, x + Inches(0.26), Inches(2.48), cw - Inches(0.52), Inches(1.9),
              lst, size=12, gap=7, mark="\u25AA", mark_col=c)

    text(s, Inches(0.75), Inches(4.75), Inches(11.8), Inches(0.35),
         [("Dữ liệu mẫu đã nạp (Chương 5.3)", 14, INK, True, FONT_H)])
    stats = [("100", "nhân viên"), ("50", "tài khoản"), ("~4.000", "bản ghi chấm công"),
             ("12", "bảng dữ liệu"), ("6", "khung nhìn"), ("269", "test case")]
    sx = Inches(0.75); sw = Inches(1.9); sgx = Inches(0.09)
    for i, (v, lb) in enumerate(stats):
        x = sx + i * (sw + sgx)
        rect(s, x, Inches(5.2), sw, Inches(1.25), fill=NAVY2,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        text(s, x, Inches(5.42), sw, Inches(0.5), [(v, 22, WHITE, True, FONT_H)], align=PP_ALIGN.CENTER)
        text(s, x, Inches(5.98), sw, Inches(0.35), [(lb, 10.5, RGBColor(0x9F,0xB2,0xCC), False)],
             align=PP_ALIGN.CENTER)
    foot(s)


# ================================================================ 15. LIMITATIONS
def s_limits():
    s = slide_base("Kết luận & Hướng phát triển", kicker="07  •  Kết luận", num=15)
    text(s, Inches(0.75), Inches(1.58), Inches(5.9), Inches(0.4),
         [("Kết quả đạt được", 14.5, GREEN, True, FONT_H)])
    done = [
        ("Phân tích yêu cầu", " — xác định 12 thực thể, hàng chục thuộc tính và 14 quan hệ."),
        ("Mô hình ER Crow's foot", " với đầy đủ bản số và ràng buộc tham gia."),
        ("12 lược đồ quan hệ", " giữ toàn vẹn khóa chính – khóa ngoại."),
        ("Chuẩn hóa 3NF", " và kiểm tra BCNF cho bảng nhiều khóa ứng viên."),
        ("Cài đặt thật trên SQL Server", ": 26 câu lệnh DML, 10 truy vấn, 6 view, 3 SP, 3 trigger."),
        ("Kiểm thử: 78 test backend + 191 test E2E", " — tất cả đều vượt qua."),
    ]
    bullets(s, Inches(0.75), Inches(2.02), Inches(5.9), Inches(2.6), done,
            size=12.5, gap=11, bullet_col=GREEN)

    card(s, Inches(0.75), Inches(4.75), Inches(5.9), Inches(1.75),
         "Bài học kinh nghiệm",
         "Thiết kế CSDL là cả một quá trình: khảo sát → xác định thực thể/quan hệ → chuẩn hóa → cài đặt → kiểm thử. "
         "Ràng buộc toàn vẹn ở tầng CSDL giữ vai trò then chốt — không thể thay bằng kiểm tra ở tầng ứng dụng.",
         accent=ACCENT2, icon="\u2714", bsize=11)

    text(s, Inches(7.05), Inches(1.58), Inches(5.5), Inches(0.4),
         [("Hướng phát triển", 14.5, ACCENT, True, FONT_H)])
    road = [
        ("Mở rộng nghiệp vụ nâng cao", " — khen thưởng – kỷ luật, đào tạo, tuyển dụng, KPI theo quý."),
        ("Phân quyền chi tiết hơn", " — row-level security cho quản lý theo phòng ban."),
        ("Tối ưu hiệu năng", " — index có chọn lọc cho các truy vấn thống kê nặng."),
        ("Xuất báo cáo", " lương / chấm công ra Excel hoặc PDF."),
        ("Sao lưu & audit log", " tự động cho các thao tác nhạy cảm."),
    ]
    bullets(s, Inches(7.05), Inches(2.02), Inches(5.55), Inches(4.5), road,
            size=12.5, gap=13, bullet_col=ACCENT)
    foot(s)


# ================================================================ 16a. DML CATALOG (Ch.5.4)
def s_dml():
    s = slide_base("26 c\u00e2u l\u1ec7nh thao t\u00e1c d\u1eef li\u1ec7u (\u2265 25)", kicker="05  \u2022  SQL Server", num=16)
    groups = [
        ("INSERT \u2014 10 c\u00e2u", ACCENT, ["PhongBan, ChucVu, NhanVien", "HopDong, ChamCong, NghiPhep",
                                               "CongViec (Kanban), BinhLuan", "ChiPhiPhatSinh, TaiKhoan"]),
        ("UPDATE \u2014 10 c\u00e2u", ACCENT2, ["S\u1eeda l\u01b0\u01a1ng c\u01a1 b\u1ea3n ch\u1ee9c v\u1ee5; S\u0110T/email NV",
                                                "Chuy\u1ec3n ph\u00f2ng ban; ngh\u1ec9 vi\u1ec7c",
                                                "G\u00e1n tr\u01b0\u1edfng ph\u00f2ng; gia h\u1ea1n H\u0110",
                                                "Duy\u1ec7t ngh\u1ec9 ph\u00e9p; s\u1eeda task, c\u1ea5u h\u00ecnh c\u00f4ng"]),
        ("DELETE \u2014 3 c\u00e2u", RED, ["X\u00f3a chi ph\u00ed nh\u1eadp sai", "X\u00f3a b\u00ecnh lu\u1eadn spam",
                                          "X\u00f3a t\u00e0i kho\u1ea3n v\u00f4 hi\u1ec7u h\u00f3a"]),
        ("SELECT \u2014 3 c\u00e2u", GREEN, ["NV \u0111ang l\u00e0m vi\u1ec7c", "10 NV v\u00e0o l\u00e0m s\u1edbm nh\u1ea5t",
                                             "\u0110\u1ebfm t\u1ed5ng NV theo tr\u1ea1ng th\u00e1i"]),
    ]
    x0 = Inches(0.75); cw = Inches(2.92); gx = Inches(0.22)
    for i, (t, c, lst) in enumerate(groups):
        x = x0 + i * (cw + gx)
        rect(s, x, Inches(1.75), cw, Inches(3.05), fill=WHITE, line=LINE, shadow=True,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, x, Inches(1.75), cw, Inches(0.55), fill=c, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, x, Inches(2.1), cw, Inches(0.2), fill=c)
        text(s, x, Inches(1.87), cw, Inches(0.35), [(t, 12.5, WHITE, True, FONT_H)], align=PP_ALIGN.CENTER)
        tb = s.shapes.add_textbox(x + Inches(0.2), Inches(2.48), cw - Inches(0.4), Inches(2.2))
        tf = tb.text_frame; tf.word_wrap = True
        for j, it in enumerate(lst):
            p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
            p.space_after = Pt(7); p.line_spacing = 1.05
            r = p.add_run(); r.text = "\u25aa  " + it
            r.font.size = Pt(10.5); r.font.color.rgb = SLATE; r.font.name = FONT
    card(s, Inches(0.75), Inches(5.05), Inches(11.85), Inches(1.45),
         "Ki\u1ec3m ch\u1ee9ng r\u00e0ng bu\u1ed9c",
         "C\u00e1c c\u00e2u l\u1ec7nh tr\u00ean \u0111\u1ec1u ch\u1ea1y th\u00e0nh c\u00f4ng tr\u00ean SQL Server. R\u00e0ng bu\u1ed9c CHECK v\u00e0 FOREIGN KEY ch\u1eb7n \u0111\u01b0\u1ee3c thao t\u00e1c sai: "
         "th\u00eam nh\u00e2n vi\u00ean tr\u00f9ng CCCD, ho\u1eb7c g\u00e1n nh\u00e2n vi\u00ean v\u00e0o ph\u00f2ng ban kh\u00f4ng t\u1ed3n t\u1ea1i \u2014 SQL Server b\u00e1o l\u1ed7i v\u00e0 t\u1eeb ch\u1ed1i ngay.",
         accent=TEAL, icon="\u2714", bsize=11.5)
    foot(s)


# ================================================================ 16b. QUERIES (Ch.5.5)
def s_queries():
    s = slide_base("10 truy v\u1ea5n t\u00ecm ki\u1ebfm \u2013 th\u1ed1ng k\u00ea (\u2265 10)", kicker="05  \u2022  SQL Server", num=17)
    qs = [
        ("01", "Th\u1ed1ng k\u00ea NV \u0111ang l\u00e0m theo t\u1eebng ph\u00f2ng ban", ACCENT),
        ("02", "T\u1ed5ng l\u01b0\u01a1ng th\u1ef1c l\u0129nh theo th\u00e1ng v\u00e0 n\u0103m", ACCENT),
        ("03", "NV c\u00f3 m\u1ee9c l\u01b0\u01a1ng th\u1ef1c l\u0129nh cao nh\u1ea5t", GREEN),
        ("04", "\u0110\u1ebfm s\u1ed1 l\u1ea7n \u0111i tr\u1ec5 c\u1ee7a t\u1eebng nh\u00e2n vi\u00ean", ACCENT2),
        ("05", "Th\u1ed1ng k\u00ea ng\u00e0y c\u00f4ng theo th\u00e1ng c\u1ee7a m\u1ed9t NV", PURPLE),
        ("06", "Li\u1ec7t k\u00ea c\u00e1c task qu\u00e1 h\u1ea1n ch\u01b0a ho\u00e0n th\u00e0nh", RED),
        ("07", "T\u00ecm nh\u00e2n vi\u00ean theo t\u00ean (t\u00ecm g\u1ea7n \u0111\u00fang)", TEAL),
        ("08", "T\u1ed5ng h\u1ee3p chi ph\u00ed ph\u00e1t sinh theo lo\u1ea1i", ACCENT2),
        ("09", "\u0110\u1ebfm s\u1ed1 task theo tr\u1ea1ng th\u00e1i tr\u00ean Kanban", GREEN),
        ("10", "Th\u1ed1ng k\u00ea n\u0103ng su\u1ea5t NV (task ho\u00e0n th\u00e0nh / qu\u00e1 h\u1ea1n)", PURPLE),
    ]
    x0, y0 = Inches(0.75), Inches(1.8)
    cw, ch, gx, gy = Inches(5.78), Inches(0.82), Inches(0.3), Inches(0.24)
    for i, (n, t, c) in enumerate(qs):
        cx = x0 + (i % 2) * (cw + gx)
        cy = y0 + (i // 2) * (ch + gy)
        rect(s, cx, cy, cw, ch, fill=WHITE, line=LINE, shadow=True, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=Inches(0.14))
        rect(s, cx, cy, Inches(0.62), ch, fill=c, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.18)
        rect(s, cx + Inches(0.31), cy, Inches(0.31), ch, fill=c)
        text(s, cx, cy + Inches(0.24), Inches(0.62), Inches(0.4),
             [(n, 15, WHITE, True, FONT_H)], align=PP_ALIGN.CENTER)
        text(s, cx + Inches(0.8), cy + Inches(0.22), cw - Inches(1.0), Inches(0.5),
             [(t, 12.5, INK, False)], line_spacing=1.05)
    foot(s)


# ================================================================ 16. THANK YOU
def s_thanks():
    s = prs.slides.add_slide(BLANK)
    rect(s, 0, 0, W, H, fill=NAVY)
    transition(s, "morph", 900)
    rect(s, 0, 0, W, Inches(0.12), fill=ACCENT)
    rect(s, W - Inches(4.9), 0, Inches(4.9), H, fill=NAVY2)
    rect(s, W - Inches(4.9), 0, Inches(0.06), H, fill=ACCENT2)
    text(s, Inches(0.9), Inches(2.1), Inches(7.4), Inches(0.5),
         [("CẢM ƠN THẦY/CÔ VÀ CÁC BẠN ĐÃ THEO DÕI", 15, ACCENT, True)])
    text(s, Inches(0.9), Inches(2.7), Inches(7.6), Inches(1.4),
         [("Xin tiếp nhận\ncâu hỏi & góp ý", 44, WHITE, True, FONT_H)], line_spacing=1.0)
    rect(s, Inches(0.93), Inches(4.45), Inches(1.4), Inches(0.05), fill=ACCENT2)
    text(s, Inches(0.9), Inches(4.8), Inches(7.4), Inches(1.0),
         [[("Thiết kế CSDL hệ thống Quản lý Nhân sự (HRM)", 14, RGBColor(0xC9,0xD6,0xE8), False)],
          [("Demo:  admin / Admin@123   |   github.com/thanhtug07/hrm-kanban-management", 12.5,
            RGBColor(0x9F,0xB2,0xCC), False)]], space_after=6)
    text(s, W - Inches(4.25), Inches(3.35), Inches(3.3), Inches(0.5),
         [("Q & A", 40, WHITE, True, FONT_H)], align=PP_ALIGN.CENTER)


# ---------------------------------------------------------------- build
s_title(); s_agenda(); s_problem(); s_stack(); s_arch(); s_erd(); s_tables()
s_normalize(); s_sqlprog(); s_payroll(); s_security(); s_frontend(); s_features()
s_testing(); s_dml(); s_queries(); s_limits(); s_thanks()

out = "BaoCao_BTL_CSDL_HRM_Portal.pptx"
import os
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), out)
prs.save(out)
print("SAVED:", out)
print("Slides:", len(prs.slides._sldIdLst))
