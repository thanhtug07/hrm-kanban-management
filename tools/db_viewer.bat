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
python db_viewer.py %*
pause
