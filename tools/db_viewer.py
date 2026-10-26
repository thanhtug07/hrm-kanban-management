"""
DB VIEWER — Giao diện web xem CSDL QUANLYNHANSU (kieu phpMyAdmin / XAMPP).

Chay:  python db_viewer.py
Mo:    http://localhost:8000
"""
import os
import sys
import webbrowser
import threading

from flask import Flask, render_template, request, redirect, url_for, jsonify
import pyodbc

# ---- Cau hinh ket noi (co the sua / dat qua bien moi truong) ----
SERVER = os.environ.get("DB_SERVER", r"(localdb)\MSSQLLocalDB")
DATABASE = os.environ.get("DB_NAME", "QUANLYNHANSU")
DRIVER = os.environ.get("DB_DRIVER", "ODBC Driver 17 for SQL Server")
PORT = int(os.environ.get("DB_VIEWER_PORT", "8000"))

CONN_STR = (
    f"DRIVER={{{DRIVER}}};"
    f"SERVER={SERVER};"
    f"DATABASE={DATABASE};"
    "Trusted_Connection=yes;"
    "TrustServerCertificate=yes;"
)

app = Flask(__name__)


def get_conn():
    return pyodbc.connect(CONN_STR, timeout=10)


def list_tables():
    with get_conn() as cn:
        cur = cn.cursor()
        cur.execute(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES "
            "WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME"
        )
        return [r[0] for r in cur.fetchall()]


def list_views():
    with get_conn() as cn:
        cur = cn.cursor()
        cur.execute(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS ORDER BY TABLE_NAME"
        )
        return [r[0] for r in cur.fetchall()]


def count_rows(table):
    with get_conn() as cn:
        cur = cn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM dbo.[{table}]")
        return cur.fetchone()[0]


@app.route("/")
def index():
    try:
        tables = list_tables()
        views = list_views()
        overview = [{"name": t, "count": count_rows(t)} for t in tables]
        total = sum(o["count"] for o in overview)
        return render_template(
            "index.html",
            tables=overview,
            views=views,
            total=total,
            db=DATABASE,
            server=SERVER,
        )
    except Exception as e:
        return render_template("error.html", error=str(e), db=DATABASE, server=SERVER)


@app.route("/table/<name>")
def table_detail(name):
    try:
        page = max(1, int(request.args.get("page", 1)))
        page_size = int(request.args.get("size", 50))
        offset = (page - 1) * page_size

        with get_conn() as cn:
            cur = cn.cursor()
            cur.execute(f"SELECT COUNT(*) FROM dbo.[{name}]")
            total = cur.fetchone()[0]

            cur.execute(
                f"SELECT * FROM dbo.[{name}] "
                f"ORDER BY (SELECT NULL) "
                f"OFFSET {offset} ROWS FETCH NEXT {page_size} ROWS ONLY"
            )
            columns = [d[0] for d in cur.description]
            rows = [list(r) for r in cur.fetchall()]

        total_pages = max(1, (total + page_size - 1) // page_size)
        return render_template(
            "table.html",
            name=name,
            columns=columns,
            rows=rows,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            db=DATABASE,
        )
    except Exception as e:
        return render_template("error.html", error=str(e), db=DATABASE, server=SERVER)


@app.route("/api/counts")
def api_counts():
    """Tra ve so dong moi bang dang JSON (dung cho auto-refresh)."""
    try:
        tables = list_tables()
        data = {t: count_rows(t) for t in tables}
        return jsonify({"ok": True, "data": data})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)})


def main():
    # Kiem tra ket noi truoc khi chay
    try:
        with get_conn() as cn:
            pass
        print(f"[OK] Ket noi thanh cong '{DATABASE}' tren '{SERVER}'")
    except Exception as e:
        print(f"[LOI] Khong ket noi duoc '{DATABASE}' tren '{SERVER}':")
        print("   ", e)
        print("   Kiem tra: SQL Server dang chay? Ten DB dung? Driver ODBC da cai?")
        sys.exit(1)

    url = f"http://localhost:{PORT}"
    print(f"[OK] Mo trinh duyet: {url}")
    print("     Nhan Ctrl+C de dung.")
    threading.Timer(1.2, lambda: webbrowser.open(url)).start()
    app.run(host="127.0.0.1", port=PORT, debug=False)


if __name__ == "__main__":
    main()
