@echo off
chcp 65001 >nul
title DB Viewer - QUANLYNHANSU
echo ============================================
echo    DB VIEWER - QUANLYNHANSU
echo ============================================
echo.
echo Dang khoi dong... (trinh duyet se tu mo)
echo Nhan Ctrl+C de dung.
echo.
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
    echo [X] Chua cai Python. Tai: https://www.python.org/downloads/
    echo     Hoac cai: pip install flask pyodbc
    pause
    exit /b 1
)
python db_viewer.py %*
pause
