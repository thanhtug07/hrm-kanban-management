@echo off
chcp 65001 >nul
title DB LIVE MONITOR - QUANLYNHANSU
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0DB_LIVE_MONITOR.ps1" %*
pause
